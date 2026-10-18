import * as THREE from "three";
import { CAMERA, RENDER } from "../constants.js";

/**
 * Creates the renderer, scene and camera.
 * @param {HTMLElement} container - Element the canvas is appended to
 * @returns {Object} Stage objects and a resize function
 */
export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: false, // MSAA happens in the post-processing render target
    powerPreference: "high-performance",
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDER.exposure;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 200);

  /**
   * Matches the canvas and camera to a new viewport size.
   * @returns {number} The pixel ratio in use
   */
  const resize = (width, height) => {
    const pixelRatio = Math.min(window.devicePixelRatio, RENDER.maxPixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    return pixelRatio;
  };

  return { renderer, scene, camera, resize };
}

/**
 * How much further back the camera must sit so that at least
 * CAMERA.minVisibleWidth stays in view on narrow screens.
 * @param {THREE.PerspectiveCamera} camera
 * @param {number} distance - Intended distance
 * @returns {number} A multiplier of 1 or more
 */
export function portraitFitFactor(camera, distance) {
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const visibleWidth = 2 * distance * halfHeight * camera.aspect;
  return Math.max(1, CAMERA.minVisibleWidth / visibleWidth);
}
