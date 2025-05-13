/**
 * Utility for creating 3D letter geometries
 */

import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Cache for loaded fonts
const fontCache = {};

/**
 * Creates a 3D letter "S" with deep beveling
 * @param {Function} callback - Callback function that receives the created mesh
 */
export function create3DLetter(callback) {
  // Load the font
  const loader = new FontLoader();

  // Use cached font if available
  if (fontCache.boldFont) {
    createLetterGeometry(fontCache.boldFont, callback);
    return;
  }

  // Load the font
  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    function (font) {
      // Cache the font for future use
      fontCache.boldFont = font;
      createLetterGeometry(font, callback);
    }
  );
}

/**
 * Creates the letter geometry with the loaded font
 * @param {Font} font - The loaded font
 * @param {Function} callback - Callback function that receives the created mesh
 */
function createLetterGeometry(font, callback) {
  // Create text geometry with deep beveling
  const textGeometry = new TextGeometry("S", {
    font: font,
    size: 1.2,
    height: 0.4, // Depth of the letter
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.15, // Depth of the bevel
    bevelSize: 0.3, // How far the bevel extends
    bevelOffset: 0,
    bevelSegments: 8, // Number of bevel segments
  });

  // Center the geometry
  textGeometry.computeBoundingBox();
  const centerOffset = new THREE.Vector3();
  centerOffset.x =
    -(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) / 2;
  centerOffset.y =
    -(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y) / 2;
  textGeometry.translate(centerOffset.x, centerOffset.y, 0);

  // Create material for the letter
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.05,
    envMapIntensity: 1.0,
  });

  // Create mesh
  const letterMesh = new THREE.Mesh(textGeometry, material);

  // Call the callback with the created mesh
  callback(letterMesh);
}
