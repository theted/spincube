// Rotation helpers. Angular velocities are world-space vectors whose direction
// is the spin axis and whose length is the speed in rad/s. Working with
// quaternions avoids the gimbal wobble of accumulating Euler angles.

import { Quaternion, Vector3 } from "three";
import { substepCount } from "./spring.js";

const _delta = new Quaternion();
const _error = new Quaternion();
const _axis = new Vector3();
const _offset = new Vector3();

/**
 * Rotates a quaternion by an angular velocity over a time step.
 * @param {Quaternion} quaternion - Mutated in place
 * @param {Vector3} omega - Angular velocity, rad/s
 * @param {number} dt - Seconds
 * @returns {Quaternion} The same quaternion
 */
export function integrateRotation(quaternion, omega, dt) {
  const speed = omega.length();
  if (speed < 1e-9) return quaternion;
  _axis.copy(omega).divideScalar(speed);
  _delta.setFromAxisAngle(_axis, speed * dt);
  return quaternion.premultiply(_delta).normalize();
}

/**
 * Converts a screen-space drag into a world-space rotation vector, so that the
 * face under the pointer follows it: dragging right turns the cube around the
 * camera's up axis, dragging down tips it around the camera's right axis.
 * @param {number} dx - Pixels moved right
 * @param {number} dy - Pixels moved down
 * @param {number} sensitivity - Radians per pixel
 * @param {Quaternion} cameraQuaternion - Camera orientation
 * @param {Vector3} out - Receives axis * angle
 * @returns {Vector3} out
 */
export function dragToRotation(dx, dy, sensitivity, cameraQuaternion, out) {
  return out
    .set(dy, dx, 0)
    .multiplyScalar(sensitivity)
    .applyQuaternion(cameraQuaternion);
}

/**
 * The shortest rotation taking `from` to `to`, as axis * angle.
 * @param {Quaternion} from
 * @param {Quaternion} to
 * @param {Vector3} out
 * @returns {Vector3} out
 */
export function rotationBetween(from, to, out) {
  _error.copy(from).invert().premultiply(to);
  if (_error.w < 0) {
    _error.set(-_error.x, -_error.y, -_error.z, -_error.w);
  }
  const w = Math.min(1, _error.w);
  const sinHalf = Math.sqrt(1 - w * w);
  if (sinHalf < 1e-9) return out.set(0, 0, 0);
  const angle = 2 * Math.acos(w);
  return out
    .set(_error.x, _error.y, _error.z)
    .multiplyScalar(angle / sinHalf);
}

/**
 * Advances a rotational spring that pulls `quaternion` towards `target`, with
 * an optional coupling that drags it along with another spinning body.
 * @param {Quaternion} quaternion - Mutated in place
 * @param {Vector3} omega - Angular velocity, mutated in place
 * @param {Quaternion} target - Rest orientation
 * @param {Object} params
 * @param {number} params.stiffness - 1/s²
 * @param {number} params.damping - 1/s
 * @param {number} [params.coupling=0] - 1/s, pull towards driveOmega
 * @param {Vector3} [params.driveOmega] - Angular velocity of the driving body
 * @param {number} dt - Seconds
 */
export function stepRotationSpring(
  quaternion,
  omega,
  target,
  { stiffness, damping, coupling = 0, driveOmega },
  dt
) {
  const steps = substepCount(dt);
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    rotationBetween(quaternion, target, _offset);
    _offset.multiplyScalar(stiffness).addScaledVector(omega, -damping);
    if (driveOmega && coupling > 0) {
      _offset.addScaledVector(driveOmega, coupling);
      _offset.addScaledVector(omega, -coupling);
    }
    omega.addScaledVector(_offset, h);
    integrateRotation(quaternion, omega, h);
  }
}
