import * as THREE from "three";
import { CAMERA, RENDER } from "../constants.js";

/**
 * Creates the renderer, scene and camera.
 * @param {Object} [options]
 * @param {boolean} [options.transparent] - Leave the canvas see-through around the cube
 * @returns {Object} Stage objects and a resize function
 */
export function createStage({ transparent = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: false, // MSAA happens in the post-processing render target
    alpha: transparent,
    powerPreference: "high-performance",
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDER.exposure;
  if (transparent) {
    renderer.setClearColor(0x000000, 0);
    keepTransmissionClear(renderer);
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 200);

  /**
   * Matches the drawing buffer and camera to a new size. The canvas element
   * itself is sized by CSS.
   * @returns {number} The pixel ratio in use
   */
  const resize = (width, height) => {
    const pixelRatio = Math.min(window.devicePixelRatio, RENDER.maxPixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    renderer.transmissionResolutionScale = RENDER.transmissionScale;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    return pixelRatio;
  };

  return { renderer, scene, camera, resize };
}

/**
 * On a transparent canvas, three clears the buffer that glass refracts to
 * white at half alpha (renderTransmissionPass in WebGLRenderer, three r186),
 * which makes clear glass look milky over the page. This swaps that one
 * clear for a fully transparent one, so the page shows through the glass.
 * Recheck it when upgrading three.
 * @param {THREE.WebGLRenderer} renderer
 */
function keepTransmissionClear(renderer) {
  const setClearColor = renderer.setClearColor;
  renderer.setClearColor = function (color, alpha) {
    if (color === 0xffffff && alpha === 0.5) {
      return setClearColor.call(this, 0x000000, 0);
    }
    return setClearColor.call(this, color, alpha);
  };
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
