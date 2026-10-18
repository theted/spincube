// Frame-rate independent helpers for springs and smoothing.

const MAX_SUBSTEP = 1 / 240;

/**
 * Advances a damped spring towards its target. Semi-implicit Euler with small
 * substeps keeps stiff springs stable and makes the result independent of the
 * frame rate.
 * @param {{value: number, velocity: number}} spring - Mutated in place
 * @param {number} target - Rest position
 * @param {number} stiffness - Pull towards the target, 1/s²
 * @param {number} damping - Velocity damping, 1/s
 * @param {number} dt - Seconds to advance
 * @returns {{value: number, velocity: number}} The same spring
 */
export function stepSpring(spring, target, stiffness, damping, dt) {
  const steps = substepCount(dt);
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    const acceleration =
      (target - spring.value) * stiffness - spring.velocity * damping;
    spring.velocity += acceleration * h;
    spring.value += spring.velocity * h;
  }
  return spring;
}

/**
 * Fraction to move towards a target this frame for exponential smoothing,
 * e.g. `value += (target - value) * approachFactor(rate, dt)`.
 * @param {number} rate - 1/s; higher is snappier
 * @param {number} dt - Seconds since the last frame
 * @returns {number} A factor in [0, 1)
 */
export function approachFactor(rate, dt) {
  return 1 - Math.exp(-rate * dt);
}

/**
 * Number of substeps needed to keep each step at or below MAX_SUBSTEP.
 * @param {number} dt - Seconds to advance
 * @returns {number} Substep count, at least 1
 */
export function substepCount(dt) {
  return Math.max(1, Math.ceil(dt / MAX_SUBSTEP));
}
