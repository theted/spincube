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

  // Load the font from local file
  loader.load(
    "/fonts/helvetiker_bold.typeface.json",
    function (font) {
      // Cache the font for future use
      fontCache.boldFont = font;
      createLetterGeometry(font, callback);
    },
    // onProgress callback
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // onError callback
    function (err) {
      console.error("An error happened while loading the font:", err);
      // Fallback to creating a cube with the letter "S" as a texture
      createFallbackLetter(callback);
    }
  );
}

/**
 * Creates a fallback letter mesh using a simple box geometry with texture
 * @param {Function} callback - Callback function that receives the created mesh
 */
function createFallbackLetter(callback) {
  console.log("Using fallback letter mesh");

  // Create a simple box geometry
  const geometry = new THREE.BoxGeometry(0.8, 1, 0.1);

  // Create canvas for texture
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  // Fill background
  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw letter
  context.fillStyle = "#ffffff";
  context.font = "bold 200px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("S", canvas.width / 2, canvas.height / 2);

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);

  // Create material
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.9,
    roughness: 0.05,
  });

  // Create mesh
  const letterMesh = new THREE.Mesh(geometry, material);

  // Call the callback with the created mesh
  callback(letterMesh);
}

/**
 * Creates the letter geometry with the loaded font
 * @param {Font} font - The loaded font
 * @param {Function} callback - Callback function that receives the created mesh
 */
function createLetterGeometry(font, callback) {
  // Create text geometry with extra deep beveling
  const textGeometry = new TextGeometry("S", {
    font: font,
    size: 1.3, // Larger size for bolder appearance
    height: 0.5, // Increased depth of the letter
    curveSegments: 16, // More segments for smoother curves
    bevelEnabled: true,
    bevelThickness: 0.25, // Increased depth of the bevel
    bevelSize: 0.4, // Increased bevel size for more pronounced effect
    bevelOffset: 0,
    bevelSegments: 10, // More bevel segments for smoother bevels
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
