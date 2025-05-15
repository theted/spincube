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

  // Create an inward beveled 3D effect for the "S"
  const letterColor = "rgb(220, 220, 220)"; // Main color of the letter face
  const shadowColor = "rgba(0, 0, 0, 0.5)"; // Darker edge for the bevel (simulates shadow on one side of the indent)
  const highlightColor = "rgba(255, 255, 255, 0.6)"; // Lighter edge for the bevel (simulates highlight on the other side)
  const bevelOffset = 3; // Controls the width of the bevel

  // Ensure no global shadows interfere with the bevel effect
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  // Draw the highlight part of the bevel (e.g., appears on bottom-right for a light source from top-left)
  context.fillStyle = highlightColor;
  context.fillText("S", centerX + bevelOffset, centerY + bevelOffset);

  // Draw the shadow part of the bevel (e.g., appears on top-left)
  context.fillStyle = shadowColor;
  context.fillText("S", centerX - bevelOffset, centerY - bevelOffset);

  // Draw the main letter face
  context.fillStyle = letterColor;
  context.fillText("S", centerX, centerY);

  // Reset shadow properties (good practice, though done above for this block specifically)
  // This ensures subsequent drawing operations on the canvas are not affected by these settings.
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);

  // Set texture properties
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  return texture;
}
