import * as THREE from "three";
import * as CONST from "../constants.js";

/**
 * Updates the physics for the cube's spring-based rotation system
 * @param {Object} params - Physics parameters
 * @param {THREE.Vector2} params.targetUserSpinOffset - Target rotation offset
 * @param {THREE.Vector2} params.currentUserSpinOffset - Current rotation offset
 * @param {THREE.Vector2} params.currentUserSpinVelocity - Current rotation velocity
 * @param {boolean} params.isDragging - Whether the user is currently dragging
 * @returns {Object} Updated physics values
 */
export function updateSpringPhysics({
  targetUserSpinOffset,
  currentUserSpinOffset,
  currentUserSpinVelocity,
  isDragging,
}) {
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

  // Calculate spring forces
  let forceX =
    (targetUserSpinOffset.x - currentUserSpinOffset.x) * CONST.K_SPRING;
  let forceY =
    (targetUserSpinOffset.y - currentUserSpinOffset.y) * CONST.K_SPRING;

  // Calculate damping forces
  let dampingForceX = currentUserSpinVelocity.x * CONST.K_DAMPING;
  let dampingForceY = currentUserSpinVelocity.y * CONST.K_DAMPING;

  // Update velocity based on forces
  currentUserSpinVelocity.x += forceX - dampingForceX;
  currentUserSpinVelocity.y += forceY - dampingForceY;

  // Update position based on velocity
  currentUserSpinOffset.x += currentUserSpinVelocity.x;
  currentUserSpinOffset.y += currentUserSpinVelocity.y;

  return {
    targetUserSpinOffset,
    currentUserSpinOffset,
    currentUserSpinVelocity,
  };
}

/**
 * Calculates the throw factor based on mouse movement
 * @param {Object} deltaMove - The x,y change in mouse position
 * @returns {number} The calculated throw factor
 */
export function calculateThrowFactor(deltaMove) {
  const moveSpeed = Math.sqrt(
    deltaMove.x * deltaMove.x + deltaMove.y * deltaMove.y
  );
  return moveSpeed * CONST.THROW_VELOCITY_FACTOR;
}

/**
 * Updates the scroll animation with spring physics
 * @param {Object} params - Scroll parameters
 * @param {number} params.targetScrollScale - Target scale from scroll wheel
 * @param {number} params.currentScrollScale - Current scale
 * @param {number} params.scrollVelocity - Current scroll velocity
 * @returns {Object} Updated scroll values
 */
export function updateScrollPhysics({
  targetScrollScale,
  currentScrollScale,
  scrollVelocity,
}) {
  const scrollForce =
    (targetScrollScale - currentScrollScale) * CONST.SCROLL_SPRING;
  scrollVelocity += scrollForce;
  scrollVelocity *= CONST.SCROLL_DAMPING; // Apply damping
  currentScrollScale += scrollVelocity;

  return {
    currentScrollScale,
    scrollVelocity,
  };
}

/**
 * Clamps small motion values to zero to prevent jitter
 * @param {Object} params - Motion parameters
 * @returns {boolean} True if motion was clamped to zero
 */
export function clampSmallMotions({
  isDragging,
  isBouncing,
  targetUserSpinOffset,
  currentUserSpinOffset,
  currentUserSpinVelocity,
}) {
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
    return true;
  }

  return false;
}
