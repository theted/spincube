import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as CONST from "../constants.js";
import { create3DLetter } from "../utils/letterGeometry.js";

/**
 * Creates a cube with the appropriate material based on settings
 * @param {THREE.Scene} scene - The scene to add the cube to
 * @returns {THREE.Mesh} The created cube mesh
 */
export function createCube(scene) {
  // Create a group to hold the cube and letters
  const cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

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
  cubeGroup.add(cube);

  // Add 3D letters to each face of the cube
  addLettersToFaces(cubeGroup, CONST.CUBE_SIZE);

  return cubeGroup;
}

/**
 * Adds 3D letters to each face of the cube
 * @param {THREE.Group} cubeGroup - The group containing the cube
 * @param {number} cubeSize - The size of the cube
 */
function addLettersToFaces(cubeGroup, cubeSize) {
  // Create 3D letter and add it to each face
  create3DLetter((letterMesh) => {
    // Scale the letter to fit on the cube face
    const letterScale = cubeSize * 0.6;
    letterMesh.scale.set(letterScale, letterScale, letterScale);

    // Create 6 copies of the letter for each face
    const offset = cubeSize / 2 + 0.01; // Slight offset to avoid z-fighting

    // Front face
    const frontLetter = letterMesh.clone();
    frontLetter.position.z = offset;
    cubeGroup.add(frontLetter);

    // Back face
    const backLetter = letterMesh.clone();
    backLetter.position.z = -offset;
    backLetter.rotation.y = Math.PI;
    cubeGroup.add(backLetter);

    // Right face
    const rightLetter = letterMesh.clone();
    rightLetter.position.x = offset;
    rightLetter.rotation.y = Math.PI / 2;
    cubeGroup.add(rightLetter);

    // Left face
    const leftLetter = letterMesh.clone();
    leftLetter.position.x = -offset;
    leftLetter.rotation.y = -Math.PI / 2;
    cubeGroup.add(leftLetter);

    // Top face
    const topLetter = letterMesh.clone();
    topLetter.position.y = offset;
    topLetter.rotation.x = -Math.PI / 2;
    cubeGroup.add(topLetter);

    // Bottom face
    const bottomLetter = letterMesh.clone();
    bottomLetter.position.y = -offset;
    bottomLetter.rotation.x = Math.PI / 2;
    cubeGroup.add(bottomLetter);
  });
}

/**
 * Creates a glass material for the cube
 * @returns {THREE.MeshPhysicalMaterial} The glass material
 */
function createGlassMaterial() {
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
  });
}

/**
 * Creates a metallic material for the cube
 * @returns {THREE.MeshPhysicalMaterial} The metallic material
 */
function createMetallicMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: CONST.MATERIAL_COLOR,
    metalness: CONST.METALNESS,
    roughness: CONST.ROUGHNESS,
    emissive: new THREE.Color(CONST.EMISSIVE_COLOR),
    emissiveIntensity: CONST.EMISSIVE_INTENSITY,
    envMapIntensity: CONST.ENV_MAP_INTENSITY,
    clearcoat: CONST.CLEARCOAT,
    clearcoatRoughness: CONST.CLEARCOAT_ROUGHNESS,
    reflectivity: CONST.REFLECTIVITY,
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
