import * as THREE from "three";
import { DUST, PULSE } from "../constants.js";
import { dustVertexShader, dustFragmentShader } from "../shaders/index.js";

/**
 * Creates the dust motes floating in a shell around the cube.
 * @param {boolean} reducedMotion - Keep the motes still
 * @returns {Object} The points plus update, resize and applySettings
 */
export function createDust(reducedMotion) {
  const positions = new Float32Array(DUST.count * 3);
  const seeds = new Float32Array(DUST.count);
  const direction = new THREE.Vector3();
  const inner3 = DUST.innerRadius ** 3;
  const outer3 = DUST.outerRadius ** 3;

  for (let i = 0; i < DUST.count; i++) {
    // Uniform in volume between the inner and outer radius
    const radius = Math.cbrt(inner3 + (outer3 - inner3) * Math.random());
    direction.randomDirection().multiplyScalar(radius);
    direction.toArray(positions, i * 3);
    seeds[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    u_time: { value: 0 },
    u_size: { value: 0 },
    u_pixelScale: { value: 1 },
    u_drift: { value: 0 },
    u_brightness: { value: 0 },
    u_pulseTime: { value: 0 },
    u_pulseStrength: { value: 0 },
    u_pulseSpeed: { value: 0 },
    u_charge: { value: 0 },
    u_chargePull: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: dustVertexShader,
    fragmentShader: dustFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  const applySettings = () => {
    uniforms.u_size.value = DUST.size;
    uniforms.u_drift.value = reducedMotion ? 0 : DUST.drift;
    uniforms.u_brightness.value = DUST.brightness;
    uniforms.u_pulseSpeed.value = PULSE.dustSpeed;
    uniforms.u_chargePull.value = DUST.chargePull;
  };
  applySettings();

  const update = (time, pulse, charge) => {
    uniforms.u_time.value = reducedMotion ? 0 : time;
    uniforms.u_charge.value = charge;
    uniforms.u_pulseTime.value = pulse.time;
    uniforms.u_pulseStrength.value = pulse.strength;
  };

  /**
   * Keeps point sizes in world units.
   * @param {number} bufferHeight - Drawing buffer height in pixels
   * @param {number} fov - Vertical field of view in degrees
   */
  const resize = (bufferHeight, fov) => {
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    uniforms.u_pixelScale.value = bufferHeight / (2 * halfHeight);
  };

  return { points, update, resize, applySettings };
}
