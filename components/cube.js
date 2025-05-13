import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as CONST from "../constants.js";
import { createLetterTexture } from "../utils/textureGenerator.js";

/**
 * Creates a cube with the appropriate material based on settings
 * @param {THREE.Scene} scene - The scene to add the cube to
 * @returns {THREE.Mesh} The created cube mesh
 */
export function createCube(scene) {
  // Create cube geometry
  const geometry = new RoundedBoxGeometry(
    CONST.CUBE_SIZE,
    CONST.CUBE_SIZE,
    CONST.CUBE_SIZE,
    CONST.SEGMENTS,
    CONST.CORNER_RADIUS
  );

  // Create material based on the USE_GLASS_MATERIAL setting
  let material;
  if (CONST.USE_GLASS_MATERIAL) {
    // Glass material
    material = createGlassMaterial();
  } else {
    // Metallic material
    material = createMetallicMaterial();
  }

  // Create the cube mesh
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  return cube;
}

/**
 * Creates a glass material for the cube
 * @returns {THREE.MeshPhysicalMaterial} The glass material
 */
function createGlassMaterial() {
  // Create the letter texture
  const letterTexture = createLetterTexture();

  return new THREE.MeshPhysicalMaterial({
    color: CONST.GLASS_COLOR,
    metalness: CONST.GLASS_METALNESS,
    roughness: CONST.GLASS_ROUGHNESS,
    transmission: CONST.GLASS_TRANSMISSION, // Transmission for transparency
    thickness: CONST.GLASS_THICKNESS, // Thickness of the glass
    ior: CONST.GLASS_IOR, // Index of refraction
    envMapIntensity: CONST.GLASS_ENV_MAP_INTENSITY,
    transparent: true, // Enable transparency
    side: THREE.DoubleSide, // Render both sides for glass effect
    map: letterTexture, // Apply the letter texture
  });
}

/**
 * Creates a metallic material for the cube
 * @returns {THREE.MeshPhysicalMaterial} The metallic material
 */
function createMetallicMaterial() {
  // Create the letter texture
  const letterTexture = createLetterTexture();

  return new THREE.MeshPhysicalMaterial({
    color: CONST.MATERIAL_COLOR,
    metalness: CONST.METALNESS,
    roughness: CONST.ROUGHNESS,
    envMapIntensity: CONST.ENV_MAP_INTENSITY,
    clearcoat: CONST.CLEARCOAT,
    clearcoatRoughness: CONST.CLEARCOAT_ROUGHNESS,
    reflectivity: CONST.REFLECTIVITY,
    map: letterTexture, // Apply the letter texture
  });
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
