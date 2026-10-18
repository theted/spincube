import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { CUBE_RADIUS, CUBE_SEGMENTS, CUBE_SIZE, GLASS } from "../constants.js";

/**
 * Creates the glass cube: a rounded box with physically based transmission,
 * dispersion and a faint thin-film iridescence.
 * @returns {{mesh: THREE.Mesh, applySettings: Function}}
 */
export function createGlassCube() {
  const geometry = new RoundedBoxGeometry(
    CUBE_SIZE,
    CUBE_SIZE,
    CUBE_SIZE,
    CUBE_SEGMENTS,
    CUBE_RADIUS
  );

  const material = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    transmission: 1,
    side: THREE.DoubleSide, // Inner faces add depth to the refraction
  });

  const applySettings = () => {
    material.color.set(GLASS.color);
    material.roughness = GLASS.roughness;
    material.thickness = GLASS.thickness;
    material.ior = GLASS.ior;
    material.dispersion = GLASS.dispersion;
    material.iridescence = GLASS.iridescence;
    material.iridescenceIOR = GLASS.iridescenceIOR;
    material.attenuationColor.set(GLASS.attenuationColor);
    material.attenuationDistance = GLASS.attenuationDistance;
    material.envMapIntensity = GLASS.envMapIntensity;
    material.specularIntensity = GLASS.specularIntensity;
  };
  applySettings();

  return { mesh: new THREE.Mesh(geometry, material), applySettings };
}
