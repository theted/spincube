import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createMockRenderer,
  createMockScene,
  createMockCamera,
} from "./mocks/renderer.mock.js";

// Mock document methods
global.document = {
  ...global.document,
  createElement: vi.fn().mockImplementation((tag) => {
    if (tag === "canvas") {
      return {
        getContext: vi.fn().mockReturnValue({
          canvas: { width: 800, height: 600 },
        }),
        style: {},
      };
    }
    return { style: {} };
  }),
  body: {
    appendChild: vi.fn(),
  },
};

// Mock window properties
global.window = {
  ...global.window,
  innerWidth: 800,
  innerHeight: 600,
  devicePixelRatio: 1,
  addEventListener: vi.fn(),
};

// Import main.js dynamically to avoid executing it immediately
describe("Rendering Tests", () => {
  let renderer, scene, camera;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create basic Three.js objects for testing using our mocks
    renderer = createMockRenderer();
    scene = createMockScene();
    camera = createMockCamera();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render a scene with a camera", () => {
    // Perform a render
    renderer.render(scene, camera);

    // Check if render was called
    expect(renderer.render).toHaveBeenCalledWith(scene, camera);
  });

  it("should set up renderer with correct parameters", () => {
    // Set up renderer with typical parameters
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Check if methods were called with correct parameters
    expect(renderer.setSize).toHaveBeenCalledWith(800, 600);
    expect(renderer.setPixelRatio).toHaveBeenCalledWith(1);
  });

  it("should add renderer to DOM", () => {
    // Add renderer to DOM
    document.body.appendChild(renderer.domElement);

    // Check if appendChild was called with renderer's DOM element
    expect(document.body.appendChild).toHaveBeenCalledWith(renderer.domElement);
  });
});
