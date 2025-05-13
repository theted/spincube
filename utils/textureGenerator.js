/**
 * Texture generator utility
 * Creates textures for the cube
 */

import * as THREE from "three";

/**
 * Creates a texture with a bold "S" letter
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

  // Draw the letter "S"
  context.fillStyle = "rgba(255, 255, 255, 0.8)"; // Semi-transparent white
  context.font = "bold 380px Impact, Arial Black, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("S", canvas.width / 2, canvas.height / 2);

  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);

  // Set texture properties
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  return texture;
}
