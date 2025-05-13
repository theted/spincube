import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as THREE from "three";
import { createEnvironment } from "../components/environment.js";

// Mock THREE.js classes
vi.mock("three", async () => {
  const actual = await vi.importActual("three");
  return {
    ...actual,
    Scene: vi.fn().mockImplementation(() => ({
      background: null,
      environment: null,
    })),
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      outputEncoding: null,
      toneMapping: null,
      toneMappingExposure: 1.0,
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement("canvas"),
    })),
    WebGLCubeRenderTarget: vi.fn().mockImplementation(() => ({
      texture: { encoding: null },
      fromEquirectangularTexture: vi.fn().mockReturnThis(),
    })),
    AmbientLight: vi.fn().mockImplementation(() => ({
      type: "AmbientLight",
    })),
    DirectionalLight: vi.fn().mockImplementation(() => ({
      type: "DirectionalLight",
      position: { set: vi.fn() },
      castShadow: false,
    })),
    ShaderMaterial: vi.fn().mockImplementation(() => ({
      type: "ShaderMaterial",
      uniforms: {},
    })),
    PlaneGeometry: vi.fn().mockImplementation(() => ({
      type: "PlaneGeometry",
    })),
    Mesh: vi.fn().mockImplementation((geometry, material) => ({
      type: "Mesh",
      geometry,
      material,
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      scale: { set: vi.fn() },
    })),
  };
});

describe("Environment Component", () => {
  let scene, renderer;

  beforeEach(() => {
    // Create mock scene and renderer
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create an environment with skybox", () => {
    const environment = createEnvironment(scene, renderer);

    // Check if environment has skyShaderMaterial
    expect(environment.skyShaderMaterial).toBeDefined();

    // Check if updateEnvironmentMap function is returned
    expect(typeof environment.updateEnvironmentMap).toBe("function");
  });

  it("should set up lighting when setupLighting is called", () => {
    const environment = createEnvironment(scene, renderer);
    environment.setupLighting();

    // Check if AmbientLight was created
    expect(THREE.AmbientLight).toHaveBeenCalled();

    // Check if DirectionalLight was created
    expect(THREE.DirectionalLight).toHaveBeenCalled();
  });

  it("should set sky shader code when setSkyShaderCode is called", () => {
    const environment = createEnvironment(scene, renderer);

    const vertexShader = "test vertex shader";
    const fragmentShader = "test fragment shader";

    environment.setSkyShaderCode(vertexShader, fragmentShader);

    // Check if ShaderMaterial was created with the provided shaders
    expect(THREE.ShaderMaterial).toHaveBeenCalled();
  });

  it("should update environment map when updateEnvironmentMap is called", () => {
    const environment = createEnvironment(scene, renderer);

    // Call updateEnvironmentMap
    environment.updateEnvironmentMap();

    // Check if WebGLCubeRenderTarget was created
    expect(THREE.WebGLCubeRenderTarget).toHaveBeenCalled();
  });
});
