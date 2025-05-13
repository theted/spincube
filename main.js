import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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

// Import components
import {
  createCube,
  updateCubeRotation,
  updateCubeScale,
  handleMouseDownState,
} from "./components/cube.js";
import { createEnvironment } from "./components/environment.js";

// Import utilities
import {
  updateSpringPhysics,
  updateScrollPhysics,
  clampSmallMotions,
} from "./utils/physics.js";
import {
  updateBounceAnimation,
  updateBackgroundEffects,
} from "./utils/animation.js";
import {
  setupEventListeners,
  createPointerDownHandler,
  createPointerMoveHandler,
  createPointerUpHandler,
  createWheelHandler,
  createWindowResizeHandler,
} from "./utils/events.js";

// Application state
const state = {
  // Scene objects
  scene: null,
  camera: null,
  renderer: null,
  cube: null,
  controls: null,
  clock: new THREE.Clock(),

  // Cube interaction state
  initialSpinSpeed: new THREE.Vector2(
    CONST.INITIAL_SPIN_SPEED.x,
    CONST.INITIAL_SPIN_SPEED.y
  ),
  isDragging: false,
  mouseDown: false,
  previousMousePosition: { x: 0, y: 0 },
  baseSpinAccumulator: new THREE.Vector2(0, 0),
  targetUserSpinOffset: new THREE.Vector2(0, 0),
  currentUserSpinOffset: new THREE.Vector2(0, 0),
  currentUserSpinVelocity: new THREE.Vector2(0, 0),

  // Bounce animation state
  isBouncing: false,
  isBouncingIn: false,
  bounceStartTime: 0,
  cubeBaseScale: 1.0,
  skyboxBounceAmount: 0.0,
  originalCubeColor: new THREE.Color(CONST.ORIGINAL_CUBE_COLOR),
  bounceCubeColor: new THREE.Color(CONST.BOUNCE_CUBE_COLOR),
  currentBounceScale: 1.0,

  // Scroll animation state
  targetScrollScale: 1.0,
  currentScrollScale: 1.0,
  scrollVelocity: 0.0,

  // Background state
  backgroundZoomFactor: 1.0,
  skyShaderMaterial: null,
  updateEnvironmentMap: null,
};

/**
 * Initialize the application
 */
function init() {
  // Create scene
  state.scene = new THREE.Scene();

  // Create camera
  state.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  state.camera.position.z = 3.5;

  // Create renderer
  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(window.devicePixelRatio);
  state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  state.renderer.toneMappingExposure = 1.5;
  document.body.appendChild(state.renderer.domElement);

  // Create controls
  state.controls = new OrbitControls(state.camera, state.renderer.domElement);
  state.controls.enableDamping = true;
  state.controls.dampingFactor = 0.1;
  state.controls.minDistance = 3.0;
  state.controls.maxDistance = 6.0;
  state.controls.zoomSpeed = 0.5;
  state.controls.rotateSpeed = 0.7;
  state.controls.target.set(0, 0, 0);

  // Create environment
  const environment = createEnvironment(state.scene, state.renderer);
  state.skyShaderMaterial = environment.skyShaderMaterial;
  state.updateEnvironmentMap = environment.updateEnvironmentMap;

  // Set shader code
  environment.setSkyShaderCode(skyVertexShaderFSQ, skyFragmentShader);
  const blurMaterial = environment.createBlurMaterial(
    blurVertexShader,
    blurFragmentShader
  );

  // Setup lighting
  environment.setupLighting();

  // Initial environment map render
  state.updateEnvironmentMap();

  // Create cube
  state.cube = createCube(state.scene);

  // Setup event listeners
  setupEventListeners({
    domElement: state.renderer.domElement,
    onPointerDown: createPointerDownHandler(state, state.clock),
    onPointerMove: createPointerMoveHandler(state),
    onPointerUp: createPointerUpHandler(state, state.clock),
    onWheel: createWheelHandler(state),
    onWindowResize: createWindowResizeHandler(state.camera, state.renderer),
  });
}

/**
 * Animation loop
 */
function animate() {
  requestAnimationFrame(animate);

  const delta = state.clock.getDelta();
  const elapsedTime = state.clock.getElapsedTime();

  // Update controls
  state.controls.update();

  // Update time uniform for sky shader
  state.skyShaderMaterial.uniforms.u_time.value = elapsedTime;

  // Update cube rotation base spin
  state.baseSpinAccumulator.x += state.initialSpinSpeed.x;
  state.baseSpinAccumulator.y += state.initialSpinSpeed.y;

  // Update spring physics
  const springPhysics = updateSpringPhysics({
    targetUserSpinOffset: state.targetUserSpinOffset,
    currentUserSpinOffset: state.currentUserSpinOffset,
    currentUserSpinVelocity: state.currentUserSpinVelocity,
    isDragging: state.isDragging,
  });

  state.targetUserSpinOffset = springPhysics.targetUserSpinOffset;
  state.currentUserSpinOffset = springPhysics.currentUserSpinOffset;
  state.currentUserSpinVelocity = springPhysics.currentUserSpinVelocity;

  // Update cube rotation
  updateCubeRotation(
    state.cube,
    state.baseSpinAccumulator,
    state.currentUserSpinOffset
  );

  // Update background effects
  updateBackgroundEffects({
    skyShaderMaterial: state.skyShaderMaterial,
    currentUserSpinOffset: state.currentUserSpinOffset,
    currentUserSpinVelocity: state.currentUserSpinVelocity,
    backgroundZoomFactor: state.backgroundZoomFactor,
  });

  // Update environment map periodically
  if (
    elapsedTime - state.lastEnvMapUpdateTime >
    CONST.ENV_MAP_UPDATE_INTERVAL
  ) {
    state.updateEnvironmentMap(elapsedTime);
    state.lastEnvMapUpdateTime = elapsedTime;
  }

  // Update scroll physics
  const scrollPhysics = updateScrollPhysics({
    targetScrollScale: state.targetScrollScale,
    currentScrollScale: state.currentScrollScale,
    scrollVelocity: state.scrollVelocity,
  });

  state.currentScrollScale = scrollPhysics.currentScrollScale;
  state.scrollVelocity = scrollPhysics.scrollVelocity;

  // Apply scroll scale to cube if not in bounce animation
  if (!state.isBouncing) {
    updateCubeScale(state.cube, state.currentScrollScale);
  }

  // Handle bounce animation
  if (state.isBouncing) {
    const bounceResult = updateBounceAnimation({
      elapsedTime,
      bounceStartTime: state.bounceStartTime,
      isBouncingIn: state.isBouncingIn,
      mouseDown: state.mouseDown,
      currentBounceScale: state.currentBounceScale,
      currentScrollScale: state.currentScrollScale,
      cube: state.cube,
      originalCubeColor: state.originalCubeColor,
      bounceCubeColor: state.bounceCubeColor,
      skyShaderMaterial: state.skyShaderMaterial,
      backgroundZoomFactor: state.backgroundZoomFactor,
      updateEnvironmentMap: state.updateEnvironmentMap,
    });

    state.isBouncing = bounceResult.isBouncing;
    state.currentBounceScale = bounceResult.currentBounceScale;
  } else if (state.mouseDown) {
    // If mouse is down but we're not in a bounce animation, maintain the expanded state
    handleMouseDownState(
      state.cube,
      CONST.BOUNCE_MAX_SCALE,
      state.currentScrollScale
    );
  }

  // Clamp small motions to prevent jitter
  if (
    clampSmallMotions({
      isDragging: state.isDragging,
      isBouncing: state.isBouncing,
      targetUserSpinOffset: state.targetUserSpinOffset,
      currentUserSpinOffset: state.currentUserSpinOffset,
      currentUserSpinVelocity: state.currentUserSpinVelocity,
    })
  ) {
    // Reset parallax too
    state.skyShaderMaterial.uniforms.u_uvOffset.value.set(0, 0);
  }

  // Render the scene
  state.renderer.render(state.scene, state.camera);
}

// Initialize and start animation
init();
animate();
