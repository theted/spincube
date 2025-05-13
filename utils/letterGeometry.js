/**
 * Utility for creating 3D-looking letter textures and geometries
 */

import * as THREE from "three";

/**
 * Creates a 3D letter "S" with deep beveling effect using advanced texturing
 * @param {Function} callback - Callback function that receives the created mesh
 */
export function create3DLetter(callback) {
  // Create a box geometry for each face
  createBeveledLetterMesh(callback);
}

/**
 * Creates a mesh with a deeply beveled "S" letter texture
 * @param {Function} callback - Callback function that receives the created mesh
 */
function createBeveledLetterMesh(callback) {
  // Create a box geometry with some depth for the letter
  const geometry = new THREE.BoxGeometry(0.8, 1, 0.2);

  // Create canvas for texture with 3D beveled effect
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  // Fill background with transparent color
  context.fillStyle = "rgba(0, 0, 0, 0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Create a 3D beveled effect for the "S"
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Draw the base shape (shadow/depth)
  context.shadowColor = "rgba(0, 0, 0, 0.9)";
  context.shadowBlur = 30;
  context.shadowOffsetX = 15;
  context.shadowOffsetY = 15;
  context.fillStyle = "rgba(30, 30, 30, 1.0)";
  context.font = "bold 320px Arial Black, Impact";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("S", centerX, centerY);

  // Draw the middle layer
  context.shadowColor = "rgba(100, 100, 100, 0.8)";
  context.shadowBlur = 20;
  context.shadowOffsetX = 8;
  context.shadowOffsetY = 8;
  context.fillStyle = "rgba(120, 120, 120, 1.0)";
  context.fillText("S", centerX - 4, centerY - 4);

  // Draw the top highlight
  context.shadowColor = "rgba(255, 255, 255, 0.8)";
  context.shadowBlur = 15;
  context.shadowOffsetX = -5;
  context.shadowOffsetY = -5;
  context.fillStyle = "rgba(220, 220, 220, 1.0)";
  context.fillText("S", centerX - 8, centerY - 8);

  // Add edge highlights
  context.shadowColor = "rgba(255, 255, 255, 0.9)";
  context.shadowBlur = 5;
  context.shadowOffsetX = -2;
  context.shadowOffsetY = -2;
  context.strokeStyle = "rgba(255, 255, 255, 0.8)";
  context.lineWidth = 3;
  context.strokeText("S", centerX - 8, centerY - 8);

  // Reset shadow
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  // Create normal map for additional 3D effect
  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = 512;
  normalCanvas.height = 512;
  const normalContext = normalCanvas.getContext("2d");

  // Fill with neutral normal color (128, 128, 255)
  normalContext.fillStyle = "rgb(128, 128, 255)";
  normalContext.fillRect(0, 0, normalCanvas.width, normalCanvas.height);

  // Draw the letter shape with normal map colors
  normalContext.font = "bold 320px Arial Black, Impact";
  normalContext.textAlign = "center";
  normalContext.textBaseline = "middle";

  // Top-left to bottom-right gradient for normal map
  const gradient = normalContext.createLinearGradient(
    centerX - 150,
    centerY - 150,
    centerX + 150,
    centerY + 150
  );
  gradient.addColorStop(0, "rgb(200, 200, 255)"); // Top-left highlight
  gradient.addColorStop(0.5, "rgb(128, 128, 255)"); // Neutral
  gradient.addColorStop(1, "rgb(50, 50, 200)"); // Bottom-right shadow

  normalContext.fillStyle = gradient;
  normalContext.fillText("S", centerX, centerY);

  // Create textures
  const texture = new THREE.CanvasTexture(canvas);
  const normalMap = new THREE.CanvasTexture(normalCanvas);

  // Create material with normal mapping for enhanced 3D effect
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1, 1),
    metalness: 0.9,
    roughness: 0.05,
    envMapIntensity: 2.0,
    transparent: true,
    side: THREE.DoubleSide,
  });

  // Create mesh
  const letterMesh = new THREE.Mesh(geometry, material);

  // Call the callback with the created mesh
  callback(letterMesh);
}
