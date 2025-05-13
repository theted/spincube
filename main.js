import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js"; // For rendering shader to target

// Import constants
import * as CONST from "./constants.js";

// Import shaders
import {
  skyVertexShader,
  skyVertexShaderFSQ,
} from "./shaders/skyVertexShader.js";
import { skyFragmentShader } from "./shaders/skyFragmentShader.js";

let scene, camera, renderer, cube, controls;
let clock = new THREE.Clock(); // For time uniform

// --- Skybox Shader Material ---
let skyShaderMaterial,
  envMapRenderTarget,
  pmremGenerator,
  processedEnvMap,
  rtQuad;

// --- Cube interaction ---
let initialSpinSpeed = new THREE.Vector2(
  CONST.INITIAL_SPIN_SPEED.x,
  CONST.INITIAL_SPIN_SPEED.y
);
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let baseSpinAccumulator = new THREE.Vector2(0, 0);
let targetUserSpinOffset = new THREE.Vector2(0, 0);
let currentUserSpinOffset = new THREE.Vector2(0, 0);
let currentUserSpinVelocity = new THREE.Vector2(0, 0);

// --- Bounce animation parameters ---
let isBouncing = false;
let isBouncingIn = false; // True when bouncing in (mouse down), false when bouncing out (mouse up)
let bounceStartTime = 0;
let cubeBaseScale = 1.0; // Base scale of the cube
let skyboxBounceAmount = 0.0; // Current skybox bounce amount
let originalCubeColor = new THREE.Color(CONST.ORIGINAL_CUBE_COLOR);
let bounceCubeColor = new THREE.Color(CONST.BOUNCE_CUBE_COLOR);
let currentBounceScale = 1.0; // Track the current bounce scale

// --- Parallax for the SHADER generated background ---
let lastEnvMapUpdateTime = 0;

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
  renderer.toneMappingExposure = 1.5; // Increased exposure for brighter scene
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1; // Increased for smoother movement
  controls.minDistance = 3.0; // Increased minimum distance
  controls.maxDistance = 6.0; // Decreased maximum distance for less extreme zoom
  controls.zoomSpeed = 0.5; // Slower zoom for smoother experience
  controls.rotateSpeed = 0.7; // Adjusted rotation speed
  controls.target.set(0, 0, 0);

  // --- Initialize PMREMGenerator and Render Target for Sky Shader ---
  pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader(); // Pre-compile shader used by PMREMGenerator

  envMapRenderTarget = new THREE.WebGLRenderTarget(
    CONST.ENV_MAP_SIZE,
    CONST.ENV_MAP_SIZE / 2,
    {
      // Equirectangular is 2:1
      format: THREE.RGBAFormat, // Or RGBFormat if alpha not needed
      type: THREE.FloatType, // Or HalfFloatType for better precision if supported well
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false, // PMREMGenerator will handle mipmaps
    }
  );
  // The texture from this render target will be equirectangular
  envMapRenderTarget.texture.mapping = THREE.EquirectangularReflectionMapping;

  // --- Sky Shader Material ---
  skyShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0.0 },
      u_resolution: {
        value: new THREE.Vector2(CONST.ENV_MAP_SIZE, CONST.ENV_MAP_SIZE / 2),
      },
      u_checkerScale: { value: CONST.CHECKER_SCALE },
      u_warpAmount: { value: CONST.WARP_AMOUNT },
      u_warpFrequency: { value: CONST.WARP_FREQUENCY },
      u_warpSpeed: { value: CONST.WARP_SPEED },
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Increased ambient light intensity
  scene.add(ambientLight);

  // Add directional lights for enhanced reflections
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(1, 1, 1);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xccccff, 0.5); // Slightly blue light from another angle
  directionalLight2.position.set(-1, 0.5, -1);
  scene.add(directionalLight2);

  // Cube
  const geometry = new RoundedBoxGeometry(
    CONST.CUBE_SIZE,
    CONST.CUBE_SIZE,
    CONST.CUBE_SIZE,
    CONST.SEGMENTS,
    CONST.CORNER_RADIUS
  );
  const material = new THREE.MeshPhysicalMaterial({
    color: CONST.MATERIAL_COLOR,
    metalness: CONST.METALNESS,
    roughness: CONST.ROUGHNESS,
    envMapIntensity: CONST.ENV_MAP_INTENSITY,
    clearcoat: CONST.CLEARCOAT,
    clearcoatRoughness: CONST.CLEARCOAT_ROUGHNESS,
    reflectivity: CONST.REFLECTIVITY,
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

  // Apply blur to the environment map for better performance and aesthetics
  // Create a temporary render target for the blur pass
  const blurredRenderTarget = new THREE.WebGLRenderTarget(
    CONST.ENV_MAP_SIZE,
    CONST.ENV_MAP_SIZE / 2,
    {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
    }
  );

  // Create a simple blur shader material
  const blurMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: envMapRenderTarget.texture },
      resolution: {
        value: new THREE.Vector2(CONST.ENV_MAP_SIZE, CONST.ENV_MAP_SIZE / 2),
      },
      blurSize: { value: CONST.BACKGROUND_BLUR * 0.01 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float blurSize;
      varying vec2 vUv;
      
      void main() {
        vec4 sum = vec4(0.0);
        vec2 texelSize = vec2(blurSize, blurSize);
        
        // 9-tap Gaussian blur
        sum += texture2D(tDiffuse, vUv + vec2(-texelSize.x, -texelSize.y)) * 0.0625;
        sum += texture2D(tDiffuse, vUv + vec2(0.0, -texelSize.y)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(texelSize.x, -texelSize.y)) * 0.0625;
        
        sum += texture2D(tDiffuse, vUv + vec2(-texelSize.x, 0.0)) * 0.125;
        sum += texture2D(tDiffuse, vUv) * 0.25;
        sum += texture2D(tDiffuse, vUv + vec2(texelSize.x, 0.0)) * 0.125;
        
        sum += texture2D(tDiffuse, vUv + vec2(-texelSize.x, texelSize.y)) * 0.0625;
        sum += texture2D(tDiffuse, vUv + vec2(0.0, texelSize.y)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(texelSize.x, texelSize.y)) * 0.0625;
        
        gl_FragColor = sum;
      }
    `,
  });

  // Render the blur pass
  const blurQuad = new FullScreenQuad(blurMaterial);
  renderer.setRenderTarget(blurredRenderTarget);
  blurQuad.render(renderer);
  renderer.setRenderTarget(null);

  // Clean up the blur quad
  blurQuad.dispose();

  // Process the blurred texture with PMREMGenerator
  processedEnvMap = pmremGenerator.fromEquirectangular(
    blurredRenderTarget.texture
  ).texture;

  // Clean up the temporary render target
  blurredRenderTarget.dispose();

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

// Raycaster for cube click detection
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerDown(event) {
  isDragging = true;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;

  // Check if cube was clicked
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(cube);

  if (intersects.length > 0 && !isBouncing) {
    // Cube was clicked, trigger bounce-in animation
    triggerBounceAnimation(true); // true for bounce in
  }
}

function triggerBounceAnimation(bounceIn) {
  isBouncing = true;
  isBouncingIn = bounceIn;
  bounceStartTime = clock.getElapsedTime();
}

function onPointerMove(event) {
  if (!isDragging) return;
  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };
  targetUserSpinOffset.y += deltaMove.x * CONST.MOUSE_DRAG_SENSITIVITY;
  targetUserSpinOffset.x += deltaMove.y * CONST.MOUSE_DRAG_SENSITIVITY;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

function onPointerUp(event) {
  isDragging = false;

  // If we're currently in a bounced-in state, trigger the bounce-out animation
  if (!isBouncing && currentBounceScale > 1.0) {
    triggerBounceAnimation(false); // false for bounce out
  }
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
    targetUserSpinOffset.x *= CONST.TARGET_OFFSET_DAMPING_FACTOR;
    targetUserSpinOffset.y *= CONST.TARGET_OFFSET_DAMPING_FACTOR;
    const targetEpsilon = 0.00001;
    if (Math.abs(targetUserSpinOffset.x) < targetEpsilon)
      targetUserSpinOffset.x = 0;
    if (Math.abs(targetUserSpinOffset.y) < targetEpsilon)
      targetUserSpinOffset.y = 0;
  }
  let forceX =
    (targetUserSpinOffset.x - currentUserSpinOffset.x) * CONST.K_SPRING;
  let forceY =
    (targetUserSpinOffset.y - currentUserSpinOffset.y) * CONST.K_SPRING;
  let dampingForceX = currentUserSpinVelocity.x * CONST.K_DAMPING;
  let dampingForceY = currentUserSpinVelocity.y * CONST.K_DAMPING;
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
    -currentUserSpinOffset.y * CONST.CUBE_INTERACTION_PARALLAX_FACTOR;
  skyShaderMaterial.uniforms.u_uvOffset.value.y =
    -currentUserSpinOffset.x * CONST.CUBE_INTERACTION_PARALLAX_FACTOR;

  // Optimization: Update the environment map only periodically or when significant changes occur
  // For a continuously animating shader, you might update it every frame or at a fixed rate.
  if (elapsedTime - lastEnvMapUpdateTime > CONST.ENV_MAP_UPDATE_INTERVAL) {
    updateEnvironmentMap();
    lastEnvMapUpdateTime = elapsedTime;
  }

  // Handle bounce animation
  if (isBouncing) {
    const bounceTime = elapsedTime - bounceStartTime;
    if (bounceTime < CONST.BOUNCE_DURATION) {
      // Calculate bounce progress (0 to 1)
      const progress = bounceTime / CONST.BOUNCE_DURATION;

      // Use a sine wave for smooth bounce effect
      let bounceScale;

      if (isBouncingIn) {
        // Bounce in: Start at 1.0, go to max scale
        bounceScale = THREE.MathUtils.lerp(
          1.0,
          CONST.BOUNCE_MAX_SCALE,
          Math.sin(progress * Math.PI * 0.5) // Use half sine wave for smooth in
        );
      } else {
        // Bounce out: Start at current scale, go to 1.0 with a slight undershoot
        bounceScale = THREE.MathUtils.lerp(
          currentBounceScale,
          CONST.BOUNCE_MIN_SCALE,
          Math.sin(progress * Math.PI * 0.5)
        );

        // Then lerp back to 1.0 for the second half
        if (progress > 0.5) {
          const secondHalfProgress = (progress - 0.5) * 2; // 0 to 1 for second half
          bounceScale = THREE.MathUtils.lerp(
            CONST.BOUNCE_MIN_SCALE,
            1.0,
            Math.sin(secondHalfProgress * Math.PI * 0.5)
          );
        }
      }

      // Store current scale for bounce out reference
      currentBounceScale = bounceScale;

      // Apply scale to cube
      cube.scale.set(bounceScale, bounceScale, bounceScale);

      // Apply color change to cube during bounce
      const colorProgress = Math.sin(progress * Math.PI);
      const currentColor = new THREE.Color();
      currentColor.lerpColors(
        originalCubeColor,
        bounceCubeColor,
        colorProgress
      );
      cube.material.color.copy(currentColor);

      // Add a slight rotation effect during bounce
      cube.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;

      // Calculate skybox bounce effect (inverse of cube scale for contrast)
      skyboxBounceAmount = (bounceScale - 1.0) * 0.3; // Increased effect

      // Apply skybox bounce effect to shader
      skyShaderMaterial.uniforms.u_warpAmount.value =
        CONST.WARP_AMOUNT + skyboxBounceAmount;
      skyShaderMaterial.uniforms.u_checkerScale.value =
        CONST.CHECKER_SCALE * (1.0 - skyboxBounceAmount * 2);
      skyShaderMaterial.uniforms.u_warpSpeed.value =
        CONST.WARP_SPEED + Math.abs(skyboxBounceAmount) * 2; // Speed up animation during bounce

      // Force environment map update during bounce
      updateEnvironmentMap();
    } else {
      // Animation complete
      isBouncing = false;

      if (!isBouncingIn) {
        // If we were bouncing out, reset everything
        currentBounceScale = 1.0;
        cube.scale.set(1, 1, 1);
        cube.rotation.z = 0; // Reset z rotation
        cube.material.color.copy(originalCubeColor); // Reset color
        skyShaderMaterial.uniforms.u_warpAmount.value = CONST.WARP_AMOUNT;
        skyShaderMaterial.uniforms.u_checkerScale.value = CONST.CHECKER_SCALE;
        skyShaderMaterial.uniforms.u_warpSpeed.value = CONST.WARP_SPEED; // Reset warp speed
      }
      // If we were bouncing in, keep the expanded state until mouse up
    }
  }

  // Clamp small interactive motions
  const motionEpsilon = 0.00001;
  if (
    !isDragging &&
    !isBouncing &&
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
