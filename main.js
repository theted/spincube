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
import { blurVertexShader } from "./shaders/blurVertexShader.js";
import { blurFragmentShader } from "./shaders/blurFragmentShader.js";

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
let mouseDown = false; // Track if mouse is down, separate from dragging
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

// --- Scroll animation parameters ---
let targetScrollScale = 1.0; // Target scale from scroll wheel
let currentScrollScale = 1.0; // Current scale from scroll wheel
let scrollVelocity = 0.0; // Velocity for spring animation
const SCROLL_SPRING = 0.1; // Spring constant for scroll animation
const SCROLL_DAMPING = 0.6; // Damping for scroll animation
const SCROLL_SENSITIVITY = 0.1; // How much each scroll event affects the scale
const MIN_SCROLL_SCALE = 0.7; // Minimum scale from scrolling
const MAX_SCROLL_SCALE = 1.5; // Maximum scale from scrolling

// --- Background zoom parameters ---
let backgroundZoomFactor = 1.0; // Current zoom factor for background

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

  // Create material based on the USE_GLASS_MATERIAL setting
  let material;
  if (CONST.USE_GLASS_MATERIAL) {
    // Glass material
    material = new THREE.MeshPhysicalMaterial({
      color: CONST.GLASS_COLOR,
      metalness: CONST.GLASS_METALNESS,
      roughness: CONST.GLASS_ROUGHNESS,
      transmission: CONST.GLASS_TRANSMISSION, // Transmission for transparency
      thickness: CONST.GLASS_THICKNESS, // Thickness of the glass
      ior: CONST.GLASS_IOR, // Index of refraction
      envMapIntensity: CONST.GLASS_ENV_MAP_INTENSITY,
      transparent: true, // Enable transparency
      side: THREE.DoubleSide, // Render both sides for glass effect
    });
  } else {
    // Metallic material
    material = new THREE.MeshPhysicalMaterial({
      color: CONST.MATERIAL_COLOR,
      metalness: CONST.METALNESS,
      roughness: CONST.ROUGHNESS,
      envMapIntensity: CONST.ENV_MAP_INTENSITY,
      clearcoat: CONST.CLEARCOAT,
      clearcoatRoughness: CONST.CLEARCOAT_ROUGHNESS,
      reflectivity: CONST.REFLECTIVITY,
    });
  }

  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Event Listeners
  window.addEventListener("resize", onWindowResize, false);
  renderer.domElement.addEventListener("pointerdown", onPointerDown, false);
  renderer.domElement.addEventListener("pointermove", onPointerMove, false);
  renderer.domElement.addEventListener("pointerup", onPointerUp, false);
  renderer.domElement.addEventListener("pointerout", onPointerUp, false);
  renderer.domElement.addEventListener("wheel", onWheel, false);
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

  // Create a blur shader material using imported shaders
  const blurMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: envMapRenderTarget.texture },
      resolution: {
        value: new THREE.Vector2(CONST.ENV_MAP_SIZE, CONST.ENV_MAP_SIZE / 2),
      },
      blurSize: { value: CONST.BACKGROUND_BLUR * 0.01 },
    },
    vertexShader: blurVertexShader,
    fragmentShader: blurFragmentShader,
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
  mouseDown = true;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;

  // Trigger bounce-in animation regardless of where the user clicks
  if (!isBouncing) {
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

  // Calculate velocity for "throwing" effect
  const moveSpeed = Math.sqrt(
    deltaMove.x * deltaMove.x + deltaMove.y * deltaMove.y
  );
  const throwFactor = moveSpeed * CONST.THROW_VELOCITY_FACTOR;

  targetUserSpinOffset.y +=
    deltaMove.x * CONST.MOUSE_DRAG_SENSITIVITY * (1 + throwFactor * 0.1);
  targetUserSpinOffset.x +=
    deltaMove.y * CONST.MOUSE_DRAG_SENSITIVITY * (1 + throwFactor * 0.1);

  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

function onPointerUp(event) {
  isDragging = false;
  mouseDown = false;

  // If we're currently in a bounced-in state, trigger the bounce-out animation
  if (!isBouncing && currentBounceScale > 1.0) {
    triggerBounceAnimation(false); // false for bounce out
  }
}

function onWheel(event) {
  // Prevent default scrolling behavior
  event.preventDefault();

  // Update target scale based on scroll direction
  if (event.deltaY < 0) {
    // Scrolling up - increase scale
    targetScrollScale += SCROLL_SENSITIVITY;
  } else {
    // Scrolling down - decrease scale
    targetScrollScale -= SCROLL_SENSITIVITY;
  }

  // Clamp target scale to min/max values
  targetScrollScale = Math.max(
    MIN_SCROLL_SCALE,
    Math.min(MAX_SCROLL_SCALE, targetScrollScale)
  );

  // Update background zoom factor - inverse relationship to create depth effect
  backgroundZoomFactor = 1.0 / (0.7 + 0.3 * targetScrollScale);
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

  // Only apply damping when not dragging - this allows the cube to keep spinning when "thrown"
  if (!isDragging) {
    // Apply damping to the target offset (slower decay for more "throw" effect)
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

  // Parallax for sky shader based on cube's interactive spin - enhanced effect
  skyShaderMaterial.uniforms.u_uvOffset.value.x =
    -currentUserSpinOffset.y *
    CONST.CUBE_INTERACTION_PARALLAX_FACTOR *
    (1 + Math.abs(currentUserSpinVelocity.y) * 2);
  skyShaderMaterial.uniforms.u_uvOffset.value.y =
    -currentUserSpinOffset.x *
    CONST.CUBE_INTERACTION_PARALLAX_FACTOR *
    (1 + Math.abs(currentUserSpinVelocity.x) * 2);

  // Apply background zoom effect to shader with enhanced effect based on velocity
  skyShaderMaterial.uniforms.u_checkerScale.value =
    CONST.CHECKER_SCALE *
    backgroundZoomFactor *
    (1 + Math.abs(currentUserSpinVelocity.x + currentUserSpinVelocity.y) * 0.1);

  // Optimization: Update the environment map only periodically or when significant changes occur
  // For a continuously animating shader, you might update it every frame or at a fixed rate.
  if (elapsedTime - lastEnvMapUpdateTime > CONST.ENV_MAP_UPDATE_INTERVAL) {
    updateEnvironmentMap();
    lastEnvMapUpdateTime = elapsedTime;
  }

  // Handle scroll animation with spring physics
  const scrollForce = (targetScrollScale - currentScrollScale) * SCROLL_SPRING;
  scrollVelocity += scrollForce;
  scrollVelocity *= SCROLL_DAMPING; // Apply damping
  currentScrollScale += scrollVelocity;

  // Apply scroll scale to cube (combined with bounce scale if active)
  if (!isBouncing) {
    cube.scale.set(currentScrollScale, currentScrollScale, currentScrollScale);
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
        // Only bounce out if mouse is not down
        if (!mouseDown) {
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
        } else {
          // If mouse is still down, maintain the expanded state
          bounceScale = CONST.BOUNCE_MAX_SCALE;
        }
      }

      // Store current scale for bounce out reference
      currentBounceScale = bounceScale;

      // Apply scale to cube (combined with scroll scale)
      const finalScale = bounceScale * currentScrollScale;
      cube.scale.set(finalScale, finalScale, finalScale);

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
      skyboxBounceAmount = (bounceScale - 1.0) * 0.5; // Significantly increased effect

      // Apply skybox bounce effect to shader
      skyShaderMaterial.uniforms.u_warpAmount.value =
        CONST.WARP_AMOUNT + skyboxBounceAmount * 1.5;
      skyShaderMaterial.uniforms.u_checkerScale.value =
        CONST.CHECKER_SCALE *
        (1.0 - skyboxBounceAmount * 3) *
        backgroundZoomFactor;
      skyShaderMaterial.uniforms.u_warpSpeed.value =
        CONST.WARP_SPEED + Math.abs(skyboxBounceAmount) * 2; // Speed up animation during bounce

      // Force environment map update during bounce
      updateEnvironmentMap();
    } else {
      // Animation complete
      isBouncing = false;

      // Only reset if mouse is not down
      if (!mouseDown && !isBouncingIn) {
        // If we were bouncing out, reset everything except keep the scroll scale
        currentBounceScale = 1.0;
        cube.scale.set(
          currentScrollScale,
          currentScrollScale,
          currentScrollScale
        );
        cube.rotation.z = 0; // Reset z rotation
        cube.material.color.copy(originalCubeColor); // Reset color
        skyShaderMaterial.uniforms.u_warpAmount.value = CONST.WARP_AMOUNT;
        skyShaderMaterial.uniforms.u_checkerScale.value =
          CONST.CHECKER_SCALE * backgroundZoomFactor;
        skyShaderMaterial.uniforms.u_warpSpeed.value = CONST.WARP_SPEED; // Reset warp speed
      } else if (mouseDown) {
        // If mouse is still down, maintain the expanded state
        currentBounceScale = CONST.BOUNCE_MAX_SCALE;
        const finalScale = currentBounceScale * currentScrollScale;
        cube.scale.set(finalScale, finalScale, finalScale);
      }
    }
  } else if (mouseDown && !isBouncing) {
    // If mouse is down but we're not in a bounce animation, maintain the expanded state
    currentBounceScale = CONST.BOUNCE_MAX_SCALE;
    const finalScale = currentBounceScale * currentScrollScale;
    cube.scale.set(finalScale, finalScale, finalScale);
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
