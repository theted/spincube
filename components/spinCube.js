import * as THREE from "three";
import { CORE } from "../constants.js";
import { smoothstep01 } from "../utils/motion.js";
import { createGlassCube } from "./glassCube.js";
import { createCoreLetter } from "./coreLetter.js";

/**
 * Assembles the glass cube and its glowing S. The root group carries the
 * shared scale and float; the cube and the letter rotate independently.
 * @returns {Object} The root group, its parts, and update/applySettings
 */
export function createSpinCube() {
  const root = new THREE.Group();
  const glass = createGlassCube();
  const core = createCoreLetter();
  root.add(core.mesh, glass.mesh);

  /**
   * Copies the motion state onto the meshes.
   * @param {Object} motion - From utils/motion.js
   */
  const update = (motion) => {
    glass.mesh.quaternion.copy(motion.cubeQuaternion);
    core.mesh.quaternion.copy(motion.coreQuaternion);
    root.scale.setScalar(motion.scale.value);

    // A nervous tremble as the charge nears full
    const charge = smoothstep01(motion.charge);
    const tremble = charge * charge * charge * 0.012;
    root.position.set(
      (Math.random() - 0.5) * tremble,
      motion.floatOffset + (Math.random() - 0.5) * tremble,
      0
    );

    const flash = motion.pulse.strength * Math.exp(-motion.pulse.time * 5) * 3;
    const breath = 1 + CORE.breathe * Math.sin(motion.glowPhase);
    core.face.emissiveIntensity =
      CORE.faceGlow * breath + CORE.chargeGlow * charge * charge + flash;
  };

  const applySettings = () => {
    glass.applySettings();
    core.applySettings();
  };

  return { root, glass, core, update, applySettings };
}
