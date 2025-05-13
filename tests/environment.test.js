/**
 * Tests for the environment component
 */

import * as THREE from "three";
import { createEnvironment } from "../components/environment.js";
import * as CONST from "../constants.js";

// Mock THREE.js objects
jest.mock("three", () => {
  const actualThree = jest.requireActual("three");
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement("canvas"),
      shadowMap: {
        enabled: false,
        type: 0,
      },
      outputEncoding: 0,
      toneMapping: 0,
      toneMappingExposure: 1,
      setClearColor: jest.fn(),
      clear: jest.fn(),
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      background: null,
      children: [],
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      aspect: 1,
      updateProjectionMatrix: jest.fn(),
    })),
    ShaderMaterial: jest.fn().mockImplementation(() => ({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new actualThree.Vector2() },
        u_mouse: { value: new actualThree.Vector2() },
        u_uvOffset: { value: new actualThree.Vector2() },
        u_warpAmount: { value: 0 },
        u_warpFrequency: { value: 0 },
        u_warpSpeed: { value: 0 },
        u_checkerScale: { value: 0 },
      },
    })),
    PlaneGeometry: jest.fn().mockImplementation(() => ({})),
    Mesh: jest.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: {},
      geometry: {},
    })),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      intensity: 1,
      castShadow: false,
    })),
    AmbientLight: jest.fn().mockImplementation(() => ({
      intensity: 1,
    })),
    PMREMGenerator: jest.fn().mockImplementation(() => ({
      fromScene: jest.fn().mockReturnValue({}),
      dispose: jest.fn(),
    })),
    Vector2: actualThree.Vector2,
    Color: actualThree.Color,
  };
});

describe("Environment Component", () => {
  let scene, renderer;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new scene and renderer for each test
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
  });

  test("createEnvironment should create sky shader material", () => {
    // Create environment
    const environment = createEnvironment(scene, renderer);

    // Verify environment was created
    expect(environment).toBeDefined();
    expect(environment.skyShaderMaterial).toBeDefined();
    expect(environment.updateEnvironmentMap).toBeDefined();

    // Verify shader material was created
    expect(THREE.ShaderMaterial).toHaveBeenCalled();
  });

  test("setSkyShaderCode should set shader code", () => {
    // Create environment
    const environment = createEnvironment(scene, renderer);

    // Mock shader code
    const vertexShader = "vertex shader code";
    const fragmentShader = "fragment shader code";

    // Set shader code
    environment.setSkyShaderCode(vertexShader, fragmentShader);

    // Verify shader code was set
    expect(THREE.ShaderMaterial).toHaveBeenCalled();
    const materialCall = THREE.ShaderMaterial.mock.calls[1][0]; // Second call is for setting shader code
    expect(materialCall).toHaveProperty("vertexShader", vertexShader);
    expect(materialCall).toHaveProperty("fragmentShader", fragmentShader);
  });

  test("setupLighting should create lights", () => {
    // Create environment
    const environment = createEnvironment(scene, renderer);

    // Setup lighting
    environment.setupLighting();

    // Verify lights were created
    expect(THREE.DirectionalLight).toHaveBeenCalled();
    expect(THREE.AmbientLight).toHaveBeenCalled();
    expect(scene.add).toHaveBeenCalledTimes(3); // Sky mesh, directional light, ambient light
  });

  test("updateEnvironmentMap should update environment map", () => {
    // Create environment
    const environment = createEnvironment(scene, renderer);

    // Update environment map
    environment.updateEnvironmentMap();

    // Verify environment map was updated
    expect(THREE.PMREMGenerator).toHaveBeenCalled();
    const pmremGenerator = THREE.PMREMGenerator.mock.instances[0];
    expect(pmremGenerator.fromScene).toHaveBeenCalled();
  });
});
