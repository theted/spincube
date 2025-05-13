import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
// Remove RGBELoader if no longer using HDRI for fallback
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js"; // For rendering shader to target
import { snoise } from "./snoise.glsl.js"; // Import the noise function

let scene, camera, renderer, cube, controls;
let clock = new THREE.Clock(); // For time uniform

// --- Skybox Shader Material ---
let skyShaderMaterial,
  envMapRenderTarget,
  pmremGenerator,
  processedEnvMap,
  rtQuad;
const envMapSize = 1024; // Quality of the generated environment map (power of 2)

// --- Cube interaction ---
let initialSpinSpeed = new THREE.Vector2(0.001, 0.0015);
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let baseSpinAccumulator = new THREE.Vector2(0, 0);
let targetUserSpinOffset = new THREE.Vector2(0, 0);
let currentUserSpinOffset = new THREE.Vector2(0, 0);
let currentUserSpinVelocity = new THREE.Vector2(0, 0);
const kSpring = 0.035;
const kDamping = 0.3;
const mouseDragSensitivity = 0.008;
const targetOffsetDampingFactor = 0.92;

// --- Parallax for the SHADER generated background (optional, can be subtle) ---
// This will affect the u_uvOffset uniform in the sky shader
const cubeInteractionParallaxFactor = 0.01; // How much cube interaction shifts the shader's UVs

let lastEnvMapUpdateTime = 0;
const envMapUpdateInterval = 1 / 30; // Update env map at 30 FPS, or less if not much changes

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3.5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0; // Adjust as needed with shader bg
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.5;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);

  // --- Initialize PMREMGenerator and Render Target for Sky Shader ---
  pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader(); // Pre-compile shader used by PMREMGenerator

  envMapRenderTarget = new THREE.WebGLRenderTarget(envMapSize, envMapSize / 2, {
    // Equirectangular is 2:1
    format: THREE.RGBAFormat, // Or RGBFormat if alpha not needed
    type: THREE.FloatType, // Or HalfFloatType for better precision if supported well
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false, // PMREMGenerator will handle mipmaps
  });
  // The texture from this render target will be equirectangular
  envMapRenderTarget.texture.mapping = THREE.EquirectangularReflectionMapping;

  // --- Sky Shader Material ---
  const skyVertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv; // Comes from FullScreenQuad
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
  // Use this vertex shader if FullScreenQuad sets position to NDC directly
  const skyVertexShaderFSQ = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0); // position is already in NDC for FullScreenQuad
        }
    `;

  const skyFragmentShader = `
        uniform float u_time;
        uniform vec2 u_resolution; // Resolution of the render target
        uniform float u_checkerScale;
        uniform float u_warpAmount;
        uniform float u_warpFrequency;
        uniform float u_warpSpeed;
        uniform vec2 u_uvOffset; // For parallax driven by cube interaction

        varying vec2 vUv; // UV coords from [0,1]

        // Define PI constant
        #define PI 3.1415926535897932384626433832795

        ${snoise} // Injects the Simplex Noise GLSL code

        // Function to convert equirectangular UVs to a 3D direction
        vec3 equirectToDirection(vec2 uv) {
            float phi = (uv.x - 0.5) * 2.0 * PI; // Longitude
            float theta = (uv.y - 0.5) * PI;     // Latitude
            return normalize(vec3(cos(theta) * cos(phi), sin(theta), cos(theta) * sin(phi)));
        }
        
        // Simpler checkerboard directly on UVs (will have polar distortion but can be ok)
        float checker(vec2 uv, float scale) {
            vec2 S = vec2(1.0,-1.0); // Flip Y for typical texture coords if needed, but vUv is often fine
            vec2 p = mod(uv * scale, 2.0);
            return (p.x > 1.0 ^^ p.y > 1.0) ? 1.0 : 0.0;
        }

        void main() {
            vec2 currentUv = vUv + u_uvOffset; // Apply parallax offset

            // Warp the UV coordinates using simplex noise
            vec2 warpedUv = currentUv;
            float noiseVal = snoise(vec3(currentUv * u_warpFrequency, u_time * u_warpSpeed));
            warpedUv.x += noiseVal * u_warpAmount;
            
            float noiseValY = snoise(vec3(currentUv.yx * u_warpFrequency * 1.2 + 5.0, u_time * u_warpSpeed * 0.8));
            warpedUv.y += noiseValY * u_warpAmount * 0.7;


            // Calculate checkerboard pattern on warped UVs
            float pattern = checker(warpedUv, u_checkerScale);

            vec3 color1 = vec3(0.05, 0.05, 0.1); // Darker part of checker
            vec3 color2 = vec3(0.15, 0.15, 0.25); // Lighter part of checker
            
            vec3 finalColor = mix(color1, color2, pattern);
            
            // Add a subtle glow or atmospheric effect based on view direction (optional)
            // vec3 viewDir = equirectToDirection(vUv); // original vUv for direction
            // float horizonFactor = smoothstep(0.0, 0.3, viewDir.y); // Stronger effect near horizon
            // finalColor = mix(finalColor, vec3(0.2, 0.25, 0.35) * 0.5, horizonFactor * 0.3);


            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

  skyShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(envMapSize, envMapSize / 2) },
      u_checkerScale: { value: 20.0 }, // How many checkers across
      u_warpAmount: { value: 0.05 }, // Strength of warping
      u_warpFrequency: { value: 5.0 }, // Spatial frequency of warp pattern
      u_warpSpeed: { value: 0.1 }, // How fast the warp animates
      u_uvOffset: { value: new THREE.Vector2(0, 0) }, // For parallax
    },
    vertexShader: skyVertexShaderFSQ, // Use FSQ version with FullScreenQuad
    fragmentShader: skyFragmentShader,
  });

  // Helper to render the shader to the full target
  rtQuad = new FullScreenQuad(skyShaderMaterial);

  // Initial render of the skybox shader to the render target
  updateEnvironmentMap();

  // Lights (will be mostly PBR reflections from the shader environment)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Low, as env provides most light
  scene.add(ambientLight);

  // Cube
  const cubeSize = 1.5;
  const cornerRadius = 0.15;
  const segments = 10;
  const geometry = new RoundedBoxGeometry(
    cubeSize,
    cubeSize,
    cubeSize,
    segments,
    cornerRadius
  );
  const material = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 1.0,
    roughness: 0.05, // Even shinier
    envMapIntensity: 1.0, // Make sure it uses the env map strongly
  });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Event Listeners
  window.addEventListener("resize", onWindowResize, false);
  renderer.domElement.addEventListener("pointerdown", onPointerDown, false);
  renderer.domElement.addEventListener("pointermove", onPointerMove, false);
  renderer.domElement.addEventListener("pointerup", onPointerUp, false);
  renderer.domElement.addEventListener("pointerout", onPointerUp, false);
}

function updateEnvironmentMap() {
  // 1. Render the shader to our equirectangular render target
  renderer.setRenderTarget(envMapRenderTarget);
  rtQuad.render(renderer);
  renderer.setRenderTarget(null);

  // 2. Process this texture with PMREMGenerator
  // Dispose of old processed map if it exists to free GPU memory
  if (processedEnvMap) {
    processedEnvMap.dispose();
  }
  processedEnvMap = pmremGenerator.fromEquirectangular(
    envMapRenderTarget.texture
  ).texture;

  // 3. Apply to scene
  scene.background = processedEnvMap; // Use processed for background too for consistency
  scene.environment = processedEnvMap;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // If env map size is dependent on screen, update it here (but fixed size is common)
}

function onPointerDown(event) {
  isDragging = true;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

function onPointerMove(event) {
  if (!isDragging) return;
  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };
  targetUserSpinOffset.y += deltaMove.x * mouseDragSensitivity;
  targetUserSpinOffset.x += deltaMove.y * mouseDragSensitivity;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

function onPointerUp() {
  isDragging = false;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  // Update time uniform for sky shader
  skyShaderMaterial.uniforms.u_time.value = elapsedTime;

  // --- Update Cube Rotation & Springiness ---
  baseSpinAccumulator.x += initialSpinSpeed.x;
  baseSpinAccumulator.y += initialSpinSpeed.y;
  if (!isDragging) {
    targetUserSpinOffset.x *= targetOffsetDampingFactor;
    targetUserSpinOffset.y *= targetOffsetDampingFactor;
    const targetEpsilon = 0.00001;
    if (Math.abs(targetUserSpinOffset.x) < targetEpsilon)
      targetUserSpinOffset.x = 0;
    if (Math.abs(targetUserSpinOffset.y) < targetEpsilon)
      targetUserSpinOffset.y = 0;
  }
  let forceX = (targetUserSpinOffset.x - currentUserSpinOffset.x) * kSpring;
  let forceY = (targetUserSpinOffset.y - currentUserSpinOffset.y) * kSpring;
  let dampingForceX = currentUserSpinVelocity.x * kDamping;
  let dampingForceY = currentUserSpinVelocity.y * kDamping;
  currentUserSpinVelocity.x += forceX - dampingForceX;
  currentUserSpinVelocity.y += forceY - dampingForceY;
  currentUserSpinOffset.x += currentUserSpinVelocity.x;
  currentUserSpinOffset.y += currentUserSpinVelocity.y;
  if (cube) {
    cube.rotation.x = baseSpinAccumulator.x + currentUserSpinOffset.x;
    cube.rotation.y = baseSpinAccumulator.y + currentUserSpinOffset.y;
  }

  // Parallax for sky shader based on cube's interactive spin
  skyShaderMaterial.uniforms.u_uvOffset.value.x =
    -currentUserSpinOffset.y * cubeInteractionParallaxFactor;
  skyShaderMaterial.uniforms.u_uvOffset.value.y =
    -currentUserSpinOffset.x * cubeInteractionParallaxFactor;

  // Optimization: Update the environment map only periodically or when significant changes occur
  // For a continuously animating shader, you might update it every frame or at a fixed rate.
  if (elapsedTime - lastEnvMapUpdateTime > envMapUpdateInterval) {
    updateEnvironmentMap();
    lastEnvMapUpdateTime = elapsedTime;
  }

  // Clamp small interactive motions
  const motionEpsilon = 0.00001;
  if (
    !isDragging &&
    Math.abs(targetUserSpinOffset.x) < motionEpsilon &&
    Math.abs(targetUserSpinOffset.y) < motionEpsilon &&
    Math.abs(currentUserSpinOffset.x) < motionEpsilon &&
    Math.abs(currentUserSpinOffset.y) < motionEpsilon &&
    Math.abs(currentUserSpinVelocity.x) < motionEpsilon &&
    Math.abs(currentUserSpinVelocity.y) < motionEpsilon
  ) {
    currentUserSpinOffset.set(0, 0);
    currentUserSpinVelocity.set(0, 0);
    targetUserSpinOffset.set(0, 0);
    skyShaderMaterial.uniforms.u_uvOffset.value.set(0, 0); // Reset parallax too
  }

  renderer.render(scene, camera);
}
