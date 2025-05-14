/**
 * Utility for creating 3D letter geometries with inward beveling
 */

import * as THREE from "three";

/**
 * Creates a 3D letter "S" with inward beveling on all sides
 * @param {Function} callback - Callback function that receives the created mesh
 */
export function create3DLetter(callback) {
  // Create a letter S with inward beveling using a multi-layer approach
  createInwardBeveledLetterS(callback);
}

/**
 * Creates a letter "S" with pronounced inward beveling using a multi-layer approach
 * @param {Function} callback - Callback function that receives the created mesh
 */
function createInwardBeveledLetterS(callback) {
  // Create a group to hold the letter parts
  const letterGroup = new THREE.Group();
  
  // Create material with metallic finish
  const material = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.9,
    roughness: 0.05,
    envMapIntensity: 2.0,
    side: THREE.DoubleSide,
  });
  
  // Create a simple shape for the letter "S" (outer shape)
  const outerShape = new THREE.Shape();
  
  // Define a simple "S" shape - keeping the shape the user liked
  outerShape.moveTo(-0.3, 0.3);  // Top-left
  outerShape.lineTo(0.3, 0.3);   // Top-right
  outerShape.lineTo(0.3, 0.1);   // Right edge down
  outerShape.lineTo(-0.1, 0.1);  // Middle-top
  outerShape.lineTo(-0.1, 0);    // Middle-left
  outerShape.lineTo(0.3, 0);     // Middle-right
  outerShape.lineTo(0.3, -0.3);  // Bottom-right
  outerShape.lineTo(-0.3, -0.3); // Bottom-left
  outerShape.lineTo(-0.3, -0.1); // Left edge up
  outerShape.lineTo(0.1, -0.1);  // Middle-bottom
  outerShape.lineTo(0.1, 0);     // Middle-right
  outerShape.lineTo(-0.3, 0);    // Middle-left
  outerShape.lineTo(-0.3, 0.3);  // Back to top-left
  
  // Create the base (background) for the letter
  const baseGeometry = new THREE.ShapeGeometry(outerShape);
  const baseMesh = new THREE.Mesh(baseGeometry, material.clone());
  baseMesh.position.z = 0.05; // Position slightly forward
  letterGroup.add(baseMesh);
  
  // Create multiple inset layers for a more pronounced inward bevel
  const numLayers = 5; // More layers for a smoother inward bevel
  const maxDepth = 0.15; // Total depth of the inward bevel
  
  for (let i = 0; i < numLayers; i++) {
    // Calculate scale and depth for this layer
    const scale = 1.0 - (i * 0.1); // Each layer is 10% smaller
    const depth = 0.05 - (i * (maxDepth / numLayers)); // Gradually move inward
    
    // Calculate offset to keep centered
    const offset = (1 - scale) * 0.3;
    
    // Create shape for this layer
    const layerShape = new THREE.Shape();
    
    // Define the scaled "S" shape
    layerShape.moveTo(-0.3 * scale + offset, 0.3 * scale + offset);  // Top-left
    layerShape.lineTo(0.3 * scale + offset, 0.3 * scale + offset);   // Top-right
    layerShape.lineTo(0.3 * scale + offset, 0.1 * scale + offset);   // Right edge down
    layerShape.lineTo(-0.1 * scale + offset, 0.1 * scale + offset);  // Middle-top
    layerShape.lineTo(-0.1 * scale + offset, 0 * scale + offset);    // Middle-left
    layerShape.lineTo(0.3 * scale + offset, 0 * scale + offset);     // Middle-right
    layerShape.lineTo(0.3 * scale + offset, -0.3 * scale + offset);  // Bottom-right
    layerShape.lineTo(-0.3 * scale + offset, -0.3 * scale + offset); // Bottom-left
    layerShape.lineTo(-0.3 * scale + offset, -0.1 * scale + offset); // Left edge up
    layerShape.lineTo(0.1 * scale + offset, -0.1 * scale + offset);  // Middle-bottom
    layerShape.lineTo(0.1 * scale + offset, 0 * scale + offset);     // Middle-right
    layerShape.lineTo(-0.3 * scale + offset, 0 * scale + offset);    // Middle-left
    layerShape.lineTo(-0.3 * scale + offset, 0.3 * scale + offset);  // Back to top-left
    
    // Create geometry for this layer
    const layerGeometry = new THREE.ShapeGeometry(layerShape);
    
    // Create material with progressively darker color
    const layerMaterial = material.clone();
    // Calculate color: progressively darker as we go deeper
    const colorValue = Math.max(0x44, 0xdd - (i * 0x33));
    layerMaterial.color.setHex((colorValue << 16) | (colorValue << 8) | colorValue);
    
    // Create mesh for this layer
    const layerMesh = new THREE.Mesh(layerGeometry, layerMaterial);
    layerMesh.position.z = depth;
    letterGroup.add(layerMesh);
  }
  
  // Scale up the entire letter group to make it bigger on the cube face
  letterGroup.scale.set(1.2, 1.2, 1.0);
  
  // Call the callback with the created letter group
  callback(letterGroup);
}
