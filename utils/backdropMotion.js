// The backdrop's own motion, driven by the cube: the time its patterns move
// by, which a spinning cube speeds up, and the turn of the room pattern,
// which follows the cube's spin. Plus where the cube appears on the
// backdrop, for the gravity well. Pure state with no rendering, so it can be
// unit tested.

import { Euler, Quaternion, Vector3 } from "three";
import { BACKDROP, SPIN } from "../constants.js";
import { integrateRotation } from "./rotation.js";

const _direction = new Vector3();
const _hit = new Vector3();

/** @returns {Object} Backdrop motion state */
export function createBackdropMotion() {
  return {
    flow: 0, // Seconds of pattern motion at BACKDROP.speed
    // Turned a little to start, so the room shows an edge or two
    room: new Quaternion().setFromEuler(new Euler(0.3, 0.55, 0)),
  };
}

/**
 * How much faster than its idle tumble the cube spins: 0 at rest, about the
 * throw's speed just after a throw.
 * @param {Vector3} omega - The cube's angular velocity, rad/s
 * @returns {number} rad/s
 */
export function spinAboveIdle(omega) {
  // With headroom for the slow swell of the idle tumble
  const idle = Math.hypot(SPIN.idle.x, SPIN.idle.y, SPIN.idle.z) * 1.5;
  return Math.max(0, omega.length() - idle);
}

/**
 * Advances the backdrop's motion by one frame.
 * @param {Object} state - From createBackdropMotion
 * @param {Object} frame
 * @param {number} frame.dt - Seconds
 * @param {Vector3} frame.omega - The cube's angular velocity, rad/s
 * @param {number} [frame.motionScale] - Below 1 for reduced motion
 * @returns {Object} state
 */
export function stepBackdropMotion(state, { dt, omega, motionScale = 1 }) {
  const boost = 1 + BACKDROP.spinBoost * spinAboveIdle(omega);
  state.flow += BACKDROP.speed * boost * motionScale * dt;
  integrateRotation(state.room, omega, BACKDROP.follow * dt);
  return state;
}

/**
 * Where a point appears on the backdrop seen from the eye: the ray from the
 * eye through the point meets the backdrop sphere (centred on the origin,
 * the eye inside it) at a direction given in the planar coordinates the
 * backdrop shader draws in, the direction projected onto the plane z = -1.
 * @param {Vector3} eye
 * @param {Vector3} point
 * @param {number} radius - Of the backdrop sphere
 * @param {import("three").Vector2} out
 * @returns {import("three").Vector2} out
 */
export function backdropPoint(eye, point, radius, out) {
  _direction.subVectors(point, eye).normalize();
  const b = eye.dot(_direction);
  const t = -b + Math.sqrt(Math.max(0, b * b - eye.lengthSq() + radius * radius));
  _hit.copy(eye).addScaledVector(_direction, t).divideScalar(radius);
  const depth = Math.max(-_hit.z, 0.05); // Clamped as the shader does
  return out.set(_hit.x / depth, _hit.y / depth);
}
