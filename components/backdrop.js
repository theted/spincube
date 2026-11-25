import * as THREE from "three";
import { BACKDROP, PULSE } from "../constants.js";
import { backdropVertexShader, backdropFragmentShader } from "../shaders/index.js";
import { BACKDROP_PATTERNS } from "../shaders/backdropPatterns/index.js";
import { backdropPoint, createBackdropMotion, stepBackdropMotion } from "../utils/backdropMotion.js";

const _rotation = new THREE.Matrix4();
const _toRoom = new THREE.Quaternion();

/** The fragment shader for a pattern name, or the light lines for an unknown one */
function patternShader(name) {
  if (!BACKDROP_PATTERNS[name]) {
    console.warn(`spincube: unknown backdrop pattern "${name}", drawing the light lines`);
  }
  return backdropFragmentShader(BACKDROP_PATTERNS[name] ?? BACKDROP_PATTERNS.lines);
}

/**
 * Creates the backdrop: a large sphere around the scene with a shader-drawn
 * gradient, nebula glow and lines in one of several patterns. It is opaque,
 * so the glass cube refracts it.
 * @returns {Object} The mesh plus update and applySettings functions
 */
export function createBackdrop() {
  const uniforms = {
    u_time: { value: 0 },
    u_flow: { value: 0 },
    u_baseTop: { value: new THREE.Color() },
    u_baseBottom: { value: new THREE.Color() },
    u_glowColor: { value: new THREE.Color() },
    u_glowStrength: { value: 0 },
    u_lineColor: { value: new THREE.Color() },
    u_lineIntensity: { value: 0 },
    u_lineDensity: { value: 0 },
    u_lineWidth: { value: 0 },
    u_lineDrift: { value: 0 },
    u_cellGlow: { value: 0 },
    u_cubeQ: { value: new THREE.Vector2() },
    u_warp: { value: 0 },
    u_warpRadius: { value: 1 },
    u_roomRotation: { value: new THREE.Matrix3() },
    u_pulseColor: { value: new THREE.Color() },
    u_pulseTime: { value: 0 },
    u_pulseStrength: { value: 0 },
    u_pulseDecay: { value: 0 },
    u_rippleSpeed: { value: 0 },
    u_rippleWidth: { value: 0 },
    u_rippleAmplitude: { value: 0 },
    u_rippleGlow: { value: 0 },
    u_flash: { value: 0 },
    u_charge: { value: 0 },
    u_chargePinch: { value: 0 },
  };

  let pattern = BACKDROP.pattern;
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: backdropVertexShader,
    fragmentShader: patternShader(pattern),
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(BACKDROP.radius, 96, 48),
    material
  );
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;

  const motion = createBackdropMotion();

  const applySettings = () => {
    // A new pattern is a new shader; three keeps the old program cached
    if (BACKDROP.pattern !== pattern) {
      pattern = BACKDROP.pattern;
      material.fragmentShader = patternShader(pattern);
      material.needsUpdate = true;
    }
    uniforms.u_baseTop.value.set(BACKDROP.baseTop);
    uniforms.u_baseBottom.value.set(BACKDROP.baseBottom);
    uniforms.u_glowColor.value.set(BACKDROP.glowColor);
    uniforms.u_glowStrength.value = BACKDROP.glowStrength;
    uniforms.u_lineColor.value.set(BACKDROP.lineColor);
    uniforms.u_lineIntensity.value = BACKDROP.lineIntensity;
    uniforms.u_lineDensity.value = BACKDROP.lineDensity;
    uniforms.u_lineWidth.value = BACKDROP.lineWidth;
    uniforms.u_lineDrift.value = BACKDROP.lineDrift;
    uniforms.u_cellGlow.value = BACKDROP.cellGlow;
    uniforms.u_warp.value = BACKDROP.warp;
    uniforms.u_warpRadius.value = BACKDROP.warpRadius;
    uniforms.u_pulseColor.value.set(BACKDROP.pulseColor);
    uniforms.u_pulseDecay.value = PULSE.decay;
    uniforms.u_rippleSpeed.value = PULSE.rippleSpeed;
    uniforms.u_rippleWidth.value = PULSE.rippleWidth;
    uniforms.u_rippleAmplitude.value = PULSE.rippleAmplitude;
    uniforms.u_rippleGlow.value = PULSE.rippleGlow;
    uniforms.u_flash.value = PULSE.flash;
    uniforms.u_chargePinch.value = BACKDROP.chargePinch;
  };
  applySettings();

  /**
   * @param {Object} frame
   * @param {number} frame.time - Seconds
   * @param {number} frame.dt - Seconds since the last frame
   * @param {{time: number, strength: number}} frame.pulse
   * @param {number} frame.charge - 0..1
   * @param {THREE.Vector3} frame.omega - The cube's angular velocity, rad/s
   * @param {number} frame.motionScale - Below 1 for reduced motion
   * @param {THREE.Vector3} frame.eye - The camera's position
   * @param {THREE.Vector3} frame.cube - The cube's position
   */
  const update = ({ time, dt, pulse, charge, omega, motionScale, eye, cube }) => {
    stepBackdropMotion(motion, { dt, omega, motionScale });
    uniforms.u_time.value = time;
    uniforms.u_flow.value = motion.flow;
    uniforms.u_charge.value = charge;
    uniforms.u_pulseTime.value = pulse.time;
    uniforms.u_pulseStrength.value = pulse.strength;
    backdropPoint(eye, cube, BACKDROP.radius, uniforms.u_cubeQ.value);
    _rotation.makeRotationFromQuaternion(_toRoom.copy(motion.room).invert());
    uniforms.u_roomRotation.value.setFromMatrix4(_rotation);
  };

  return { mesh, update, applySettings };
}
