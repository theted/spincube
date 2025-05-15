import * as THREE from "three";
import * as CONST from "../constants.js";
import { triggerBounceAnimation } from "./animation.js";
import { calculateThrowFactor } from "./physics.js";

/**
 * Sets up all event listeners for the application
 * @param {Object} params - Event parameters
 * @param {HTMLElement} params.domElement - The DOM element to attach listeners to
 * @param {Function} params.onPointerDown - Pointer down handler
 * @param {Function} params.onPointerMove - Pointer move handler
 * @param {Function} params.onPointerUp - Pointer up handler
 * @param {Function} params.onWheel - Wheel handler
 * @param {Function} params.onWindowResize - Window resize handler
 */
export function setupEventListeners({
  domElement,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onWindowResize,
}) {
  window.addEventListener("resize", onWindowResize, false);
  domElement.addEventListener("pointerdown", onPointerDown, false);
  domElement.addEventListener("pointermove", onPointerMove, false);
  domElement.addEventListener("pointerup", onPointerUp, false);
  domElement.addEventListener("pointerout", onPointerUp, false);
  domElement.addEventListener("wheel", onWheel, false);
}

/**
 * Creates a pointer down event handler
 * @param {Object} state - Application state
 * @param {THREE.Clock} clock - Three.js clock
 * @returns {Function} The pointer down handler
 */
export function createPointerDownHandler(state, clock) {
  return (event) => {
    state.isDragging = true;
    state.mouseDown = true;
    state.previousMousePosition.x = event.clientX;
    state.previousMousePosition.y = event.clientY;

    // Trigger bounce-in animation regardless of where the user clicks
    if (!state.isBouncing) {
      const bounceAnimation = triggerBounceAnimation(
        true,
        clock.getElapsedTime()
      );
      state.isBouncing = bounceAnimation.isBouncing;
      state.isBouncingIn = bounceAnimation.isBouncingIn;
      state.bounceStartTime = bounceAnimation.bounceStartTime;
    }
  };
}

/**
 * Creates a pointer move event handler
 * @param {Object} state - Application state
 * @returns {Function} The pointer move handler
 */
export function createPointerMoveHandler(state) {
  return (event) => {
    if (!state.isDragging) return;

    const deltaMove = {
      x: event.clientX - state.previousMousePosition.x,
      y: event.clientY - state.previousMousePosition.y,
    };

    // Calculate velocity for "throwing" effect
    const throwFactor = calculateThrowFactor(deltaMove); // This is more of a speed magnitude

    // Update target spin offset for the spring system during drag
    state.targetUserSpinOffset.y += deltaMove.x * CONST.MOUSE_DRAG_SENSITIVITY; // Simpler update for target
    state.targetUserSpinOffset.x += deltaMove.y * CONST.MOUSE_DRAG_SENSITIVITY;

    // Store the potential throw velocity, scaled appropriately
    // This captures the velocity of the drag movement itself
    state.latestThrowVelocity.y =
      deltaMove.x * CONST.MOUSE_DRAG_SENSITIVITY * CONST.THROW_VELOCITY_FACTOR;
    state.latestThrowVelocity.x =
      deltaMove.y * CONST.MOUSE_DRAG_SENSITIVITY * CONST.THROW_VELOCITY_FACTOR;

    state.previousMousePosition.x = event.clientX;
    state.previousMousePosition.y = event.clientY;
  };
}

/**
 * Creates a pointer up event handler
 * @param {Object} state - Application state
 * @param {THREE.Clock} clock - Three.js clock
 * @returns {Function} The pointer up handler
 */
export function createPointerUpHandler(state, clock) {
  return (event) => {
    if (state.isDragging) {
      // Only apply throw if a drag was in progress
      // Apply the last calculated throw velocity to the current spin velocity
      state.currentUserSpinVelocity.x += state.latestThrowVelocity.x;
      state.currentUserSpinVelocity.y += state.latestThrowVelocity.y;

      // Reset latestThrowVelocity for the next interaction
      state.latestThrowVelocity.set(0, 0);
    }

    state.isDragging = false;
    state.mouseDown = false;

    // If we're currently in a bounced-in state, trigger the bounce-out animation
    if (!state.isBouncing && state.currentBounceScale > 1.0) {
      const bounceAnimation = triggerBounceAnimation(
        false,
        clock.getElapsedTime()
      );
      state.isBouncing = bounceAnimation.isBouncing;
      state.isBouncingIn = bounceAnimation.isBouncingIn;
      state.bounceStartTime = bounceAnimation.bounceStartTime;
    }
  };
}

/**
 * Creates a wheel event handler
 * @param {Object} state - Application state
 * @returns {Function} The wheel handler
 */
export function createWheelHandler(state) {
  return (event) => {
    // Prevent default scrolling behavior
    event.preventDefault();

    // Update target scale based on scroll direction
    if (event.deltaY < 0) {
      // Scrolling up - increase scale
      state.targetScrollScale += CONST.SCROLL_SENSITIVITY;
    } else {
      // Scrolling down - decrease scale
      state.targetScrollScale -= CONST.SCROLL_SENSITIVITY;
    }

    // Clamp target scale to min/max values
    state.targetScrollScale = Math.max(
      CONST.MIN_SCROLL_SCALE,
      Math.min(CONST.MAX_SCROLL_SCALE, state.targetScrollScale)
    );

    // Update background zoom factor - inverse relationship to create depth effect
    state.backgroundZoomFactor = 1.0 / (0.7 + 0.3 * state.targetScrollScale);
  };
}

/**
 * Creates a window resize handler
 * @param {THREE.PerspectiveCamera} camera - The camera
 * @param {THREE.WebGLRenderer} renderer - The renderer
 * @param {THREE.EffectComposer} composer - The effect composer
 * @returns {Function} The resize handler
 */
export function createWindowResizeHandler(camera, renderer, composer) {
  return () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  };
}
