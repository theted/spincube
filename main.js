import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

// Import constants
import * as CONST from "./constants.js";

// Load saved settings from localStorage if in development mode
if (CONST.DEBUG) {
  const savedSettings = localStorage.getItem("spincube-settings");
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      console.log("Loading saved settings:", settings);

      // Apply saved settings to constants
      // Note: This doesn't modify the actual constants.js file,
      // but overrides the values in memory for this session
      for (const key in settings) {
        if (key === "useMaterial") {
          CONST.USE_GLASS_MATERIAL = settings[key];
        } else if (key === "useIntenseBackground") {
          CONST.USE_INTENSE_BACKGROUND = settings[key];
        } else if (key === "metalness") {
          CONST.METALNESS = settings[key];
        } else if (key === "roughness") {
          CONST.ROUGHNESS = settings[key];
        } else if (key === "envMapIntensity") {
          CONST.ENV_MAP_INTENSITY = settings[key];
        } else if (key === "cubeSize") {
          CONST.CUBE_SIZE = settings[key];
        } else if (key === "spinSpeedX") {
          CONST.INITIAL_SPIN_SPEED.x = settings[key];
        } else if (key === "spinSpeedY") {
          CONST.INITIAL_SPIN_SPEED.y = settings[key];
        } else if (key === "bounceDuration") {
          CONST.BOUNCE_DURATION = settings[key];
        } else if (key === "bounceMaxScale") {
          CONST.BOUNCE_MAX_SCALE = settings[key];
        } else if (key === "springConstant") {
          CONST.K_SPRING = settings[key];
        } else if (key === "dampingFactor") {
          CONST.K_DAMPING = settings[key];
        } else if (key === "warpAmount") {
          CONST.WARP_AMOUNT = settings[key];
        } else if (key === "warpFrequency") {
          CONST.WARP_FREQUENCY = settings[key];
        } else if (key === "warpSpeed") {
          CONST.WARP_SPEED = settings[key];
        } else if (key === "checkerScale") {
          CONST.CHECKER_SCALE = settings[key];
        }
      }
    } catch (error) {
      console.error("Error loading saved settings:", error);
    }
  }
}

// Import all shaders from the centralized index
import {
  skyVertexShader,
  skyVertexShaderFSQ,
  skyFragmentShader,
  blurVertexShader,
  blurFragmentShader,
  cubeVertexShader,
  cubeFragmentShader,
  godraysVertexShader,
  godraysFragmentShader,
} from "./shaders/index.js";

// Import components
import {
  createCube,
  updateCubeRotation,
  updateCubeScale,
  handleMouseDownState,
} from "./components/cube.js";
import { createEnvironment } from "./components/environment.js";
import { createDebugUI } from "./components/debugUI.js";

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
  composer: null, // Added for post-processing
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
  latestThrowVelocity: new THREE.Vector2(0, 0), // To store velocity from the last drag movement

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
  lastEnvMapUpdateTime: 0,
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

  // Create environment and pass shaders
  const environment = createEnvironment(state.scene, state.renderer);
  state.skyShaderMaterial = environment.skyShaderMaterial;
  state.updateEnvironmentMap = environment.updateEnvironmentMap;

  // Set shader code
  environment.setSkyShaderCode(skyVertexShaderFSQ, skyFragmentShader);

  // Setup lighting
  environment.setupLighting();

  // Initial environment map render
  state.updateEnvironmentMap();

  // Create cube
  state.cube = createCube(state.scene);

  // Setup EffectComposer
  state.composer = new EffectComposer(state.renderer);
  const renderPass = new RenderPass(state.scene, state.camera);
  state.composer.addPass(renderPass);

  if (CONST.ENABLE_GOD_RAYS) {
    // God Rays Pass
    const godraysShaderDef = {
      uniforms: {
        tDiffuse: { value: null }, // Will be set by EffectComposer
        u_lightPositionScreen: { value: new THREE.Vector2(0.5, 0.5) }, // Center of screen
        u_exposure: { value: 0.34 },
        u_decay: { value: 0.95 },
        u_density: { value: 0.96 },
        u_weight: { value: 0.4 },
        u_samples: { value: 100 },
      },
      vertexShader: godraysVertexShader,
      fragmentShader: godraysFragmentShader,
    };
    const godraysPass = new ShaderPass(godraysShaderDef);
    godraysPass.material.blending = THREE.AdditiveBlending; // Additive blending for rays
    godraysPass.renderToScreen = true; // This is the last pass rendering to screen
    state.composer.addPass(godraysPass);
  } else {
    // If god rays are not enabled, the renderPass should render to screen
    renderPass.renderToScreen = true;
  }

  // Create debug UI if enabled
  const debugUI = createDebugUI(state);
  state.debugUI = debugUI;

  // Setup event listeners
  setupEventListeners({
    domElement: state.renderer.domElement,
    onPointerDown: createPointerDownHandler(state, state.clock),
    onPointerMove: createPointerMoveHandler(state),
    onPointerUp: createPointerUpHandler(state, state.clock),
    onWheel: createWheelHandler(state),
    onWindowResize: createWindowResizeHandler(
      state.camera,
      state.renderer,
      state.composer
    ),
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

  // Update debug UI if enabled
  if (state.debugUI) {
    state.debugUI.update();
  }

  // Render the scene via composer
  state.composer.render();
}

// Initialize and start animation
init();
animate();
