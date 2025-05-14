/**
 * Utility for creating 3D letter geometries with inward beveling
 */

import * as THREE from "three";

/**
 * Creates a 3D letter "S" with inward beveling on all sides
 * @param {Function} callback - Callback function that receives the created mesh
 */
export function create3DLetter(callback) {
  // Create a letter S with inward beveling using a two-layer approach
  createInwardBeveledLetterS(callback);
}

/**
 * Creates a letter "S" with inward beveling using a two-layer approach
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
  
  // Define a simple "S" shape
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
  baseMesh.position.z = -0.05; // Position slightly behind
  letterGroup.add(baseMesh);
  
  // Create a smaller inset shape for the letter "S" (inner shape)
  // This will be positioned slightly in front of the base to create the inward bevel effect
  const insetShape = new THREE.Shape();
  
  // Scale factor for the inset (smaller than the outer shape)
  const scale = 0.8;
  const offset = (1 - scale) * 0.3; // Offset to keep centered
  
  // Define a smaller "S" shape
  insetShape.moveTo(-0.3 * scale + offset, 0.3 * scale + offset);  // Top-left
  insetShape.lineTo(0.3 * scale + offset, 0.3 * scale + offset);   // Top-right
  insetShape.lineTo(0.3 * scale + offset, 0.1 * scale + offset);   // Right edge down
  insetShape.lineTo(-0.1 * scale + offset, 0.1 * scale + offset);  // Middle-top
  insetShape.lineTo(-0.1 * scale + offset, 0 * scale + offset);    // Middle-left
  insetShape.lineTo(0.3 * scale + offset, 0 * scale + offset);     // Middle-right
  insetShape.lineTo(0.3 * scale + offset, -0.3 * scale + offset);  // Bottom-right
  insetShape.lineTo(-0.3 * scale + offset, -0.3 * scale + offset); // Bottom-left
  insetShape.lineTo(-0.3 * scale + offset, -0.1 * scale + offset); // Left edge up
  insetShape.lineTo(0.1 * scale + offset, -0.1 * scale + offset);  // Middle-bottom
  insetShape.lineTo(0.1 * scale + offset, 0 * scale + offset);     // Middle-right
  insetShape.lineTo(-0.3 * scale + offset, 0 * scale + offset);    // Middle-left
  insetShape.lineTo(-0.3 * scale + offset, 0.3 * scale + offset);  // Back to top-left
  
  // Create the inset geometry
  const insetGeometry = new THREE.ShapeGeometry(insetShape);
  
  // Create a darker material for the inset to enhance the 3D effect
  const insetMaterial = material.clone();
  insetMaterial.color.setHex(0xaaaaaa); // Slightly darker
  
  const insetMesh = new THREE.Mesh(insetGeometry, insetMaterial);
  insetMesh.position.z = -0.02; // Position slightly in front of the base but still inset
  letterGroup.add(insetMesh);
  
  // Create a third layer for even more depth (optional)
  const innerShape = new THREE.Shape();
  const innerScale = 0.6;
  const innerOffset = (1 - innerScale) * 0.3;
  
  // Define an even smaller "S" shape
  innerShape.moveTo(-0.3 * innerScale + innerOffset, 0.3 * innerScale + innerOffset);
  innerShape.lineTo(0.3 * innerScale + innerOffset, 0.3 * innerScale + innerOffset);
  innerShape.lineTo(0.3 * innerScale + innerOffset, 0.1 * innerScale + innerOffset);
  innerShape.lineTo(-0.1 * innerScale + innerOffset, 0.1 * innerScale + innerOffset);
  innerShape.lineTo(-0.1 * innerScale + innerOffset, 0 * innerScale + innerOffset);
  innerShape.lineTo(0.3 * innerScale + innerOffset, 0 * innerScale + innerOffset);
  innerShape.lineTo(0.3 * innerScale + innerOffset, -0.3 * innerScale + innerOffset);
  innerShape.lineTo(-0.3 * innerScale + innerOffset, -0.3 * innerScale + innerOffset);
  innerShape.lineTo(-0.3 * innerScale + innerOffset, -0.1 * innerScale + innerOffset);
  innerShape.lineTo(0.1 * innerScale + innerOffset, -0.1 * innerScale + innerOffset);
  innerShape.lineTo(0.1 * innerScale + innerOffset, 0 * innerScale + innerOffset);
  innerShape.lineTo(-0.3 * innerScale + innerOffset, 0 * innerScale + innerOffset);
  innerShape.lineTo(-0.3 * innerScale + innerOffset, 0.3 * innerScale + innerOffset);
  
  // Create the inner geometry
  const innerGeometry = new THREE.ShapeGeometry(innerShape);
  
  // Create an even darker material for the inner layer
  const innerMaterial = material.clone();
  innerMaterial.color.setHex(0x888888); // Even darker
  
  const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
  innerMesh.position.z = 0.01; // Position at the deepest level
  letterGroup.add(innerMesh);
  
  // Call the callback with the created letter group
  callback(letterGroup);
}
