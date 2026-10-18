import * as THREE from "three";
import { CAMERA, PRESS, SPIN } from "./constants.js";
import { createStage, portraitFitFactor } from "./components/stage.js";
import { createStudioEnvironment } from "./components/environment.js";
import { createBackdrop } from "./components/backdrop.js";
import { createSpinCube } from "./components/spinCube.js";
import { createDust } from "./components/dust.js";
import { createPostProcessing } from "./components/postprocessing.js";
import { createHint } from "./components/hint.js";
import { createInput } from "./utils/input.js";
import {
  cancelCharge,
  createMotion,
  dragMotion,
  pressMotion,
  releaseMotion,
  smoothstep01,
  stepMotion,
  zoomMotion,
} from "./utils/motion.js";
import { dragToRotation } from "./utils/rotation.js";
import { approachFactor } from "./utils/spring.js";

const MAX_FRAME_TIME = 1 / 20; // Clamp long frames, e.g. after a background tab

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const { renderer, scene, camera, resize: resizeStage } = createStage(document.body);
scene.environment = createStudioEnvironment(renderer);

const backdrop = createBackdrop();
const spinCube = createSpinCube();
const dust = createDust(reducedMotion);
scene.add(backdrop.mesh, spinCube.root, dust.points);

const post = createPostProcessing(renderer, scene, camera);
const motion = createMotion({ reducedMotion });
const hint = createHint(document.getElementById("hint"));

const input = createInput(renderer.domElement, {
  dragThreshold: PRESS.dragThreshold,
  onPress: () => {
    pressMotion(motion);
    hint.dismiss();
  },
  onDragStart: () => cancelCharge(motion),
  onRelease: (release) => releaseMotion(motion, release),
});

const smoothedPointer = new THREE.Vector2();
const dragPixels = new THREE.Vector2();
const dragRotation = new THREE.Vector3();

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = resizeStage(width, height);
  post.resize(width, height, pixelRatio);
  dust.resize(height * pixelRatio, camera.fov);
}

function applySettings() {
  spinCube.applySettings();
  backdrop.applySettings();
  dust.applySettings();
  post.applySettings();
}

/**
 * Advances and renders one frame.
 * @param {number} dt - Seconds since the last frame
 * @param {number} time - Seconds since start
 */
function frame(dt, time) {
  input.consumeDrag(dragPixels);
  if (input.state.isDragging) {
    dragToRotation(
      dragPixels.x,
      dragPixels.y,
      SPIN.dragSensitivity,
      camera.quaternion,
      dragRotation
    );
    dragMotion(motion, dragRotation, dt);
  }
  zoomMotion(motion, input.consumeWheel());

  // Camera: zoom spring, pushed back on narrow screens, drifting with the pointer
  smoothedPointer.lerp(
    input.state.pointer,
    approachFactor(CAMERA.parallaxRate, dt)
  );
  const parallax = CAMERA.parallax * motion.motionScale;
  camera.position.set(
    smoothedPointer.x * parallax,
    smoothedPointer.y * parallax * 0.6,
    motion.zoom.value * portraitFitFactor(camera, motion.zoom.value)
  );
  camera.lookAt(0, 0, 0);

  stepMotion(motion, {
    dt,
    time,
    isDragging: input.state.isDragging,
    cameraPosition: camera.position,
  });

  const charge = smoothstep01(motion.charge);
  spinCube.update(motion);
  backdrop.update(time, motion.pulse, charge);
  dust.update(time, motion.pulse, charge);
  post.update(time, charge);
  scene.environmentRotation.y = time * 0.05 * motion.motionScale;

  post.render();
}

resize();
window.addEventListener("resize", resize);

let lastTime = null;
renderer.setAnimationLoop((now) => {
  const time = now / 1000;
  const dt = lastTime === null ? 0 : Math.min(time - lastTime, MAX_FRAME_TIME);
  lastTime = time;
  frame(dt, time);
});

// Debug panel: ?debug in the URL, or press "d" during development
let debugPanel = null;
let debugVisible = false;
async function toggleDebugPanel() {
  debugVisible = !debugVisible;
  if (!debugPanel) {
    const { createDebugPanel } = await import("./components/debugPanel.js");
    debugPanel = createDebugPanel(applySettings);
  }
  debugPanel.show(debugVisible);
}
if (new URLSearchParams(window.location.search).has("debug")) {
  toggleDebugPanel();
}
if (import.meta.env.DEV) {
  window.addEventListener("keydown", (event) => {
    if (event.key === "d" && event.target === document.body) toggleDebugPanel();
  });
  // Hook for automated screenshots and poking at the state from the console
  window.spincube = { motion, frame, renderer, scene, camera, input };
}
