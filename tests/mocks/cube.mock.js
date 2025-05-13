import * as THREE from "three";
import * as CONST from "../../constants.js";
import { vi } from "vitest";

/**
 * Creates a cube with the appropriate material based on settings
 * This is a modified version for testing that doesn't rely on scene.add
 * @param {THREE.Scene} scene - The scene to add the cube to
 * @returns {THREE.Mesh} The created cube mesh
 */
export function createCube(scene) {
  // Create cube geometry
  const geometry = {
    width: CONST.CUBE_SIZE,
    height: CONST.CUBE_SIZE,
    depth: CONST.CUBE_SIZE,
    segments: CONST.SEGMENTS,
    radius: CONST.CORNER_RADIUS,
  };

  // Create material based on the USE_GLASS_MATERIAL setting
  let material;
  if (CONST.USE_GLASS_MATERIAL) {
    // Glass material
    material = {
      color: CONST.GLASS_COLOR,
      metalness: CONST.GLASS_METALNESS,
      roughness: CONST.GLASS_ROUGHNESS,
      transmission: CONST.GLASS_TRANSMISSION,
      thickness: CONST.GLASS_THICKNESS,
      ior: CONST.GLASS_IOR,
      envMapIntensity: CONST.GLASS_ENV_MAP_INTENSITY,
      transparent: true,
      side: THREE.DoubleSide,
    };
  } else {
    // Metallic material
    material = {
      color: CONST.MATERIAL_COLOR,
      metalness: CONST.METALNESS,
      roughness: CONST.ROUGHNESS,
      envMapIntensity: CONST.ENV_MAP_INTENSITY,
      clearcoat: CONST.CLEARCOAT,
      clearcoatRoughness: CONST.CLEARCOAT_ROUGHNESS,
      reflectivity: CONST.REFLECTIVITY,
    };
  }

  // Create the cube mesh
  const cube = {
    geometry,
    material,
    scale: { set: vi.fn() },
    rotation: { x: 0, y: 0, z: 0 },
  };

  // In a real implementation, we would add the cube to the scene
  // scene.add(cube);

  return cube;
}

/**
 * Updates the cube rotation based on the current state
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {THREE.Vector2} baseSpinAccumulator - Base spin accumulator
 * @param {THREE.Vector2} currentUserSpinOffset - Current user spin offset
 */
export function updateCubeRotation(
  cube,
  baseSpinAccumulator,
  currentUserSpinOffset
) {
  if (cube) {
    cube.rotation.x = baseSpinAccumulator.x + currentUserSpinOffset.x;
    cube.rotation.y = baseSpinAccumulator.y + currentUserSpinOffset.y;
  }
}

/**
 * Updates the cube scale based on scroll value
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {number} currentScrollScale - Current scroll scale
 */
export function updateCubeScale(cube, currentScrollScale) {
  cube.scale.set(currentScrollScale, currentScrollScale, currentScrollScale);
}

/**
 * Handles the mouse down state for the cube
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {number} currentBounceScale - Current bounce scale
 * @param {number} currentScrollScale - Current scroll scale
 */
export function handleMouseDownState(
  cube,
  currentBounceScale,
  currentScrollScale
) {
  const finalScale = currentBounceScale * currentScrollScale;
  cube.scale.set(finalScale, finalScale, finalScale);
}
