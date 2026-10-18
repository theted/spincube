import * as THREE from "three";
import { CAMERA, CUBE_SIZE, PRESS, SPIN } from "../constants.js";
import { applyOverrides } from "../utils/settings.js";
import { createInput } from "../utils/input.js";
import {
  cancelCharge,
  createMotion,
  dragMotion,
  pressMotion,
  releaseMotion,
  smoothstep01,
  stepMotion,
  zoomMotion,
} from "../utils/motion.js";
import { dragToRotation } from "../utils/rotation.js";
import { approachFactor } from "../utils/spring.js";
import { createStage, portraitFitFactor } from "./stage.js";
import { createStudioEnvironment } from "./environment.js";
import { createBackdrop } from "./backdrop.js";
import { createSpinCube } from "./spinCube.js";
import { createDust } from "./dust.js";
import { createPostProcessing } from "./postprocessing.js";

const MAX_FRAME_TIME = 1 / 20; // Clamp long frames, e.g. after a pause

// Safe defaults for embedding in a page; the standalone app opts in to more
const DEFAULTS = {
  background: "transparent",
  wheelZoom: false,
  keyboard: false,
  touchAction: "pan-y pinch-zoom",
  pressAnywhere: false,
  pointerTarget: null,
  layout: null,
  autoPause: true,
  overrides: {},
  onPress: null,
};

/**
 * Mounts SpinCube in a container. The canvas fills the container and follows
 * its size. Settings live at module level (constants.js), so `overrides`
 * apply page-wide: mount one cube per page.
 * @param {HTMLElement} container
 * @param {Object} [options]
 * @param {"scene"|"transparent"} [options.background] - Draw the light-line backdrop, or leave the canvas see-through
 * @param {boolean} [options.wheelZoom] - Capture the wheel to zoom
 * @param {boolean} [options.keyboard] - Hold Space to charge
 * @param {string} [options.touchAction] - CSS touch-action for the canvas; the default lets vertical swipes scroll and pinches zoom the page
 * @param {boolean} [options.pressAnywhere] - Any press on the canvas charges the cube, not just one on the cube
 * @param {HTMLElement} [options.pointerTarget] - Element to take presses from, e.g. a section with text over the canvas; the cube wins wherever it is. Defaults to the canvas
 * @param {Object|Function} [options.layout] - Where the cube sits: { x, y, zoom }, x and y as fractions of the canvas, or a function of (width, height) returning that
 * @param {boolean} [options.autoPause] - Stop rendering while off screen or in a hidden tab
 * @param {Object} [options.overrides] - Partial setting groups from constants.js, e.g. { CAMERA: { distance: 5 } }
 * @param {Function} [options.onPress] - Called when a press starts
 * @returns {Object} Handle with dispose, pause, resume and applySettings
 */
export function mountSpinCube(container, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  applyOverrides(opts.overrides);
  const transparent = opts.background === "transparent";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const { renderer, scene, camera, resize: resizeStage } = createStage({
    transparent,
  });
  const canvas = renderer.domElement;
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    touchAction: opts.touchAction,
    userSelect: "none",
    webkitUserSelect: "none",
    webkitTouchCallout: "none",
  });
  if (window.getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }
  container.appendChild(canvas);

  const environment = createStudioEnvironment(renderer);
  scene.environment = environment;

  const backdrop = transparent ? null : createBackdrop();
  const spinCube = createSpinCube();
  const dust = createDust(reducedMotion);
  scene.add(spinCube.root, dust.points);
  if (backdrop) scene.add(backdrop.mesh);

  const post = createPostProcessing(renderer, scene, camera, { transparent });
  const motion = createMotion({ reducedMotion });

  const input = createInput(canvas, {
    target: opts.pointerTarget ?? canvas,
    dragThreshold: PRESS.dragThreshold,
    wheel: opts.wheelZoom,
    keyboard: opts.keyboard,
    canPress: isOverCube,
    onPress: () => {
      pressMotion(motion);
      opts.onPress?.();
    },
    onDragStart: () => cancelCharge(motion),
    onRelease: (release) => releaseMotion(motion, release),
  });

  const smoothedPointer = new THREE.Vector2();
  const dragPixels = new THREE.Vector2();
  const dragRotation = new THREE.Vector3();

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const pixelRatio = resizeStage(width, height);
    const layout =
      (typeof opts.layout === "function" ? opts.layout(width, height) : opts.layout) ?? {};
    const { x = 0.5, y = 0.5, zoom = 1 } = layout;
    camera.zoom = zoom;
    // An off-axis projection puts the cube (and the backdrop's centre) at
    // (x, y) of the canvas without turning the camera
    camera.setViewOffset(width, height, width * (0.5 - x), height * (0.5 - y), width, height);
    post.resize(width, height, pixelRatio);
    dust.resize(height * pixelRatio, camera.fov, zoom);
  }

  // Whether a pointer event lands on the cube: a sphere a little larger than
  // its faces, so a press near an edge still counts
  const raycaster = new THREE.Raycaster();
  const hitSphere = new THREE.Sphere();
  const pointerNdc = new THREE.Vector2();
  function isOverCube(event) {
    if (opts.pressAnywhere) return true;
    const rect = canvas.getBoundingClientRect();
    pointerNdc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(pointerNdc, camera);
    spinCube.root.getWorldPosition(hitSphere.center);
    hitSphere.radius = CUBE_SIZE * 0.75 * spinCube.root.scale.x;
    return raycaster.ray.intersectsSphere(hitSphere);
  }

  function applySettings() {
    spinCube.applySettings();
    backdrop?.applySettings();
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
    backdrop?.update(time, motion.pulse, charge);
    dust.update(time, motion.pulse, charge);
    post.update(time, charge);
    scene.environmentRotation.y = time * 0.05 * motion.motionScale;

    post.render();
  }

  // The loop runs only while it's wanted: not paused by the caller, the
  // container on screen and the tab visible
  let lastTime = null;
  let running = false;
  let paused = false;
  let onScreen = true;
  const loop = (now) => {
    const time = now / 1000;
    const dt = lastTime === null ? 0 : Math.min(time - lastTime, MAX_FRAME_TIME);
    lastTime = time;
    frame(dt, time);
  };
  const updateLoop = () => {
    const wanted =
      !paused && (!opts.autoPause || (onScreen && !document.hidden));
    if (wanted === running) return;
    running = wanted;
    lastTime = null;
    renderer.setAnimationLoop(wanted ? loop : null);
    container.dataset.spincube = wanted ? "running" : "paused";
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    updateLoop();
  });
  intersectionObserver.observe(container);
  document.addEventListener("visibilitychange", updateLoop);

  resize();
  updateLoop();

  return {
    motion,
    frame,
    renderer,
    scene,
    camera,
    input,
    applySettings,
    pause() {
      paused = true;
      updateLoop();
    },
    resume() {
      paused = false;
      updateLoop();
    },
    dispose() {
      paused = true;
      updateLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", updateLoop);
      input.dispose();
      post.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = [object.material ?? []].flat();
        for (const material of materials) material.dispose();
      });
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      delete container.dataset.spincube;
    },
  };
}
