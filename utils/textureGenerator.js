/**
 * Texture generator utility
 * Creates textures for the cube
 */

import * as THREE from "three";

/**
 * Creates a texture with a bold "S" letter with bezeled 3D effect
 * @returns {THREE.CanvasTexture} The generated texture
 */
export function createLetterTexture() {
  // Create a canvas element
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  // Get the 2D context
  const context = canvas.getContext("2d");

  // Fill the background with a transparent color
  context.fillStyle = "rgba(255, 255, 255, 0.0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Create a 3D bezeled effect for the "S"
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Use an even bolder font
  context.font = "bold 420px Impact, Arial Black, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Create shadow/depth effect for bezeling inward
  // Outer shadow (darker edge)
  context.shadowColor = "rgba(0, 0, 0, 0.8)";
  context.shadowBlur = 15;
  context.shadowOffsetX = 4;
  context.shadowOffsetY = 4;
  context.fillStyle = "rgba(180, 180, 180, 0.9)"; // Slightly darker for the outer edge
  context.fillText("S", centerX, centerY);

  // Inner highlight (lighter center to create depth)
  context.shadowColor = "rgba(255, 255, 255, 0.9)";
  context.shadowBlur = 8;
  context.shadowOffsetX = -3;
  context.shadowOffsetY = -3;
  context.fillStyle = "rgba(240, 240, 240, 0.95)"; // Brighter for the inner part
  context.fillText("S", centerX - 1, centerY - 1); // Slight offset for depth

  // Reset shadow
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  // Add a subtle inward bevel edge
  context.strokeStyle = "rgba(50, 50, 50, 0.7)";
  context.lineWidth = 2;
  context.strokeText("S", centerX, centerY);

  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);

  // Set texture properties
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  return texture;
}
