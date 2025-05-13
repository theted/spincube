import * as THREE from "three";
import { vi } from "vitest";

/**
 * Creates a mock WebGLRenderer for testing
 * @returns {Object} Mock WebGLRenderer
 */
export function createMockRenderer() {
  const setSize = vi.fn();
  const setPixelRatio = vi.fn();
  const render = vi.fn();

  return {
    setSize,
    setPixelRatio,
    toneMapping: 0,
    toneMappingExposure: 0,
    render,
    domElement: document.createElement("canvas"),
  };
}

/**
 * Creates a mock Scene for testing
 * @returns {Object} Mock Scene
 */
export function createMockScene() {
  return {
    add: vi.fn(),
    children: [],
    background: null,
    environment: null,
  };
}

/**
 * Creates a mock Camera for testing
 * @returns {Object} Mock Camera
 */
export function createMockCamera() {
  return {
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
    position: { z: 0 },
  };
}
