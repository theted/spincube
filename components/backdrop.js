import * as THREE from "three";
import { BACKDROP, PULSE } from "../constants.js";
import { backdropVertexShader, backdropFragmentShader } from "../shaders/index.js";

/**
 * Creates the backdrop: a large sphere around the scene with a shader-drawn
 * gradient, nebula glow and light lines. It is opaque, so the glass cube
 * refracts it.
 * @returns {Object} The mesh plus update and applySettings functions
 */
export function createBackdrop() {
  const uniforms = {
    u_time: { value: 0 },
    u_baseTop: { value: new THREE.Color() },
    u_baseBottom: { value: new THREE.Color() },
    u_glowColor: { value: new THREE.Color() },
    u_glowStrength: { value: 0 },
    u_lineColor: { value: new THREE.Color() },
    u_lineIntensity: { value: 0 },
    u_lineDensity: { value: 0 },
    u_lineWidth: { value: 0 },
    u_lineDrift: { value: 0 },
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

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: backdropVertexShader,
    fragmentShader: backdropFragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(BACKDROP.radius, 96, 48),
    material
  );
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;

  const applySettings = () => {
    uniforms.u_baseTop.value.set(BACKDROP.baseTop);
    uniforms.u_baseBottom.value.set(BACKDROP.baseBottom);
    uniforms.u_glowColor.value.set(BACKDROP.glowColor);
    uniforms.u_glowStrength.value = BACKDROP.glowStrength;
    uniforms.u_lineColor.value.set(BACKDROP.lineColor);
    uniforms.u_lineIntensity.value = BACKDROP.lineIntensity;
    uniforms.u_lineDensity.value = BACKDROP.lineDensity;
    uniforms.u_lineWidth.value = BACKDROP.lineWidth;
    uniforms.u_lineDrift.value = BACKDROP.lineDrift;
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
   * @param {number} time - Seconds
   * @param {{time: number, strength: number}} pulse
   * @param {number} charge - 0..1
   */
  const update = (time, pulse, charge) => {
    uniforms.u_time.value = time;
    uniforms.u_charge.value = charge;
    uniforms.u_pulseTime.value = pulse.time;
    uniforms.u_pulseStrength.value = pulse.strength;
  };

  return { mesh, update, applySettings };
}
