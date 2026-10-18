// The cube's motion model: an idle tumble, direct drag and throw, a press that
// charges up and releases a pulse, a zoom spring, and the S at the core that
// keeps turning back to face the viewer. Pure state with no rendering, so it
// can be unit tested.

import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import {
  CAMERA,
  CORE,
  CORE_SPRING,
  FLOAT,
  PRESS,
  PULSE,
  SPIN,
  ZOOM,
} from "../constants.js";
import { approachFactor, stepSpring } from "./spring.js";
import { integrateRotation, stepRotationSpring } from "./rotation.js";

// A pulse this old has faded out completely. Kept finite for the shaders.
const IDLE_PULSE_TIME = 1000;

const ORIGIN = new Vector3();
const UP = new Vector3(0, 1, 0);
const _idle = new Vector3();
const _instant = new Vector3();
const _kick = new Vector3();
const _lookAt = new Matrix4();
const _sway = new Quaternion();
const _swayEuler = new Euler();
const _coreTarget = new Quaternion();
const _coreSpring = { ...CORE_SPRING, driveOmega: null };

/**
 * @param {Object} [options]
 * @param {boolean} [options.reducedMotion] - Calmer idle motion
 * @returns {Object} Motion state
 */
export function createMotion({ reducedMotion = false } = {}) {
  return {
    // Start mostly face-on so the S reads cleanly before the tumble turns it
    cubeQuaternion: new Quaternion().setFromEuler(new Euler(0.3, -0.45, 0)),
    cubeOmega: new Vector3(SPIN.idle.x, SPIN.idle.y, SPIN.idle.z),
    throwOmega: new Vector3(),
    coreQuaternion: null, // Set on the first step, facing the camera
    coreOmega: new Vector3(),
    scale: { value: 1, velocity: 0 },
    zoom: { value: CAMERA.distance, velocity: 0 },
    zoomTarget: CAMERA.distance,
    charge: 0, // 0..1 while a press is held
    isCharging: false,
    pulse: { time: IDLE_PULSE_TIME, strength: 0 },
    floatOffset: 0,
    motionScale: reducedMotion ? 0.35 : 1,
  };
}

/** A press started: begin charging. */
export function pressMotion(motion) {
  motion.isCharging = true;
}

/** The press turned into a drag: drop the charge. */
export function cancelCharge(motion) {
  motion.isCharging = false;
}

/**
 * The press ended. A drag throws the cube; a click releases a pulse whose
 * strength grows with how long the press was held.
 * @param {Object} motion
 * @param {{wasDrag: boolean}} release
 * @param {Function} [random] - Source of randomness for the spin kick
 * @returns {number} Pulse strength, or 0 for a throw
 */
export function releaseMotion(motion, { wasDrag }, random = Math.random) {
  motion.isCharging = false;

  if (wasDrag) {
    motion.cubeOmega.copy(motion.throwOmega).clampLength(0, SPIN.maxThrow);
    motion.throwOmega.set(0, 0, 0);
    motion.charge = 0;
    return 0;
  }

  const strength = PULSE.minStrength + (1 - PULSE.minStrength) * motion.charge;
  motion.charge = 0;
  motion.scale.velocity += PRESS.kick * strength;

  // Flick the cube around a mostly vertical axis
  _kick.set(random() * 2 - 1, 1.5, random() * 2 - 1).normalize();
  motion.cubeOmega.addScaledVector(_kick, SPIN.clickSpin * strength);

  motion.pulse.time = 0;
  motion.pulse.strength = strength;
  return strength;
}

/**
 * Applies one frame of dragging. The cube follows the pointer directly while
 * a smoothed angular velocity is tracked for the throw.
 * @param {Object} motion
 * @param {Vector3} rotation - World-space axis * angle dragged this frame
 * @param {number} dt - Seconds
 */
export function dragMotion(motion, rotation, dt) {
  integrateRotation(motion.cubeQuaternion, rotation, 1);
  if (dt <= 0) return;
  _instant.copy(rotation).divideScalar(dt);
  motion.throwOmega.lerp(_instant, approachFactor(SPIN.throwSmoothing, dt));
}

/**
 * Moves the zoom target by a wheel delta.
 * @param {Object} motion
 * @param {number} wheelDelta - Pixels; positive zooms out
 */
export function zoomMotion(motion, wheelDelta) {
  motion.zoomTarget = Math.min(
    CAMERA.maxDistance,
    Math.max(CAMERA.minDistance, motion.zoomTarget + wheelDelta * ZOOM.sensitivity)
  );
}

/**
 * Advances everything by one frame.
 * @param {Object} motion
 * @param {Object} frame
 * @param {number} frame.dt - Seconds since the last frame
 * @param {number} frame.time - Seconds since start
 * @param {boolean} frame.isDragging
 * @param {Vector3} frame.cameraPosition
 * @returns {Object} motion
 */
export function stepMotion(motion, { dt, time, isDragging, cameraPosition }) {
  if (motion.isCharging) {
    motion.charge = Math.min(1, motion.charge + dt / PRESS.chargeTime);
  } else {
    motion.charge = Math.max(0, motion.charge - dt * 4);
  }

  // Settle back towards a slowly varying idle tumble
  if (!isDragging) {
    _idle
      .set(
        SPIN.idle.x * (1 + 0.35 * Math.sin(time * 0.13)),
        SPIN.idle.y * (1 + 0.25 * Math.sin(time * 0.09 + 1)),
        SPIN.idle.z * (1 + 0.5 * Math.sin(time * 0.11 + 2))
      )
      .multiplyScalar(motion.motionScale);
    motion.cubeOmega.lerp(_idle, approachFactor(SPIN.relaxRate, dt));
    integrateRotation(motion.cubeQuaternion, motion.cubeOmega, dt);
  }

  // Squash while charging; the release kick makes it wobble
  const charge = smoothstep01(motion.charge);
  stepSpring(
    motion.scale,
    1 - PRESS.squash * charge,
    PRESS.stiffness,
    PRESS.damping,
    dt
  );

  stepSpring(motion.zoom, motion.zoomTarget, ZOOM.stiffness, ZOOM.damping, dt);

  // The S turns to face the camera, but the cube's spin drags it along
  coreTarget(cameraPosition, time, motion.motionScale, _coreTarget);
  if (!motion.coreQuaternion) motion.coreQuaternion = _coreTarget.clone();
  Object.assign(_coreSpring, CORE_SPRING);
  _coreSpring.driveOmega = isDragging ? motion.throwOmega : motion.cubeOmega;
  stepRotationSpring(
    motion.coreQuaternion,
    motion.coreOmega,
    _coreTarget,
    _coreSpring,
    dt
  );

  motion.pulse.time = Math.min(motion.pulse.time + dt, IDLE_PULSE_TIME);
  motion.floatOffset =
    Math.sin(time * FLOAT.speed) * FLOAT.amplitude * motion.motionScale;
  return motion;
}

/** Hermite ease for 0..1 values. */
export function smoothstep01(x) {
  return x * x * (3 - 2 * x);
}

// Orientation that points the letter's front (+Z) at the camera, rocked gently
function coreTarget(cameraPosition, time, swayScale, out) {
  _lookAt.lookAt(cameraPosition, ORIGIN, UP);
  out.setFromRotationMatrix(_lookAt);
  _swayEuler.set(
    Math.sin(time * 0.43) * CORE.sway * 0.5 * swayScale,
    Math.sin(time * 0.61) * CORE.sway * swayScale,
    0
  );
  return out.multiply(_sway.setFromEuler(_swayEuler));
}
