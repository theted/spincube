import * as THREE from "three";

// Light panels for the reflection environment, like a photo studio's
// softboxes and strip lights. Glass is mostly reflections, so these panels
// are what draw the crisp highlights along the cube's edges.
const PANELS = [
  { size: [8, 8], position: [0, 9, 0], intensity: 1.6, color: 0xffffff }, // Overhead softbox
  { size: [1.2, 14], position: [-9, 1, 2], intensity: 5, color: 0xe6efff }, // Left strip
  { size: [1.2, 14], position: [9, 1, -2], intensity: 3.5, color: 0xffffff }, // Right strip
  { size: [16, 1.5], position: [0, -3, -10], intensity: 3, color: 0xffa860 }, // Warm rim, low behind
  { size: [6, 3], position: [2, 2, 10], intensity: 0.7, color: 0x8fa8ff }, // Cool front fill
  { size: [0.8, 0.8], position: [-6, 6, 6], intensity: 14, color: 0xffffff }, // Sparkle kicker
];

/**
 * Renders a procedural studio into a prefiltered environment map.
 * @param {THREE.WebGLRenderer} renderer
 * @returns {THREE.Texture} PMREM environment texture
 */
export function createStudioEnvironment(renderer) {
  const envScene = new THREE.Scene();

  const room = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x050608, side: THREE.BackSide })
  );
  envScene.add(room);

  for (const panel of PANELS) {
    envScene.add(createPanel(panel));
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(envScene, 0.015).texture;

  pmrem.dispose();
  envScene.traverse((object) => {
    object.geometry?.dispose();
    object.material?.dispose();
  });

  return envMap;
}

function createPanel({ size, position, intensity, color }) {
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });
  material.color.multiplyScalar(intensity); // HDR: values above 1 are fine
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  mesh.position.set(...position);
  mesh.lookAt(0, 0, 0);
  return mesh;
}
