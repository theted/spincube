// Setup file for Vitest tests

// Mock browser environment for tests
import { vi } from "vitest";

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 0);
  return 0;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock WebGL context
if (!global.WebGLRenderingContext) {
  global.WebGLRenderingContext = vi.fn();
}

// Mock HTMLCanvasElement.prototype.getContext
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    getExtension: vi.fn(() => null),
    getParameter: vi.fn(() => null),
    getShaderPrecisionFormat: vi.fn(() => ({
      precision: 0,
      rangeMin: 0,
      rangeMax: 0,
    })),
    getUniformLocation: vi.fn(() => null),
    getAttribLocation: vi.fn(() => null),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    depthFunc: vi.fn(),
    frontFace: vi.fn(),
    cullFace: vi.fn(),
    blendEquation: vi.fn(),
    blendFunc: vi.fn(),
    blendFuncSeparate: vi.fn(),
    viewport: vi.fn(),
    clear: vi.fn(),
    useProgram: vi.fn(),
    bindBuffer: vi.fn(),
    bindFramebuffer: vi.fn(),
    bindTexture: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
  }));
}

// Silence console errors during tests
console.error = vi.fn();
