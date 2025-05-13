/**
 * Tests for the cube component
 */

import * as THREE from "three";
import {
  createCube,
  updateCubeRotation,
  updateCubeScale,
} from "../components/cube.js";
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
    Mesh: jest.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1, set: jest.fn() },
      material: { color: { copy: jest.fn() } },
      geometry: {},
      add: jest.fn(),
      children: [],
    })),
    Group: jest.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1, set: jest.fn() },
      add: jest.fn(),
      children: [],
    })),
    MeshPhysicalMaterial: jest.fn().mockImplementation(() => ({
      color: { copy: jest.fn() },
      metalness: 0,
      roughness: 0,
      envMapIntensity: 1,
    })),
    Vector2: actualThree.Vector2,
    Color: actualThree.Color,
  };
});

// Mock RoundedBoxGeometry
jest.mock("three/addons/geometries/RoundedBoxGeometry.js", () => ({
  RoundedBoxGeometry: jest.fn().mockImplementation(() => ({})),
}));

// Mock letterGeometry
jest.mock("../utils/letterGeometry.js", () => ({
  create3DLetter: jest.fn().mockImplementation((callback) => {
    const mockLetterMesh = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { set: jest.fn() },
      clone: jest.fn().mockReturnValue({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { set: jest.fn() },
      }),
    };
    callback(mockLetterMesh);
  }),
}));

describe("Cube Component", () => {
  let scene;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new scene for each test
    scene = new THREE.Scene();
  });

  test("createCube should create a cube with correct material", () => {
    // Set up constants for test
    CONST.USE_GLASS_MATERIAL = false; // Use metallic material
    CONST.METALNESS = 0.9;
    CONST.ROUGHNESS = 0.1;

    // Create cube
    const cube = createCube(scene);

    // Verify cube was created and added to scene
    expect(cube).toBeDefined();
    expect(scene.add).toHaveBeenCalledWith(cube);

    // Verify cube is a group
    expect(THREE.Group).toHaveBeenCalled();

    // Verify material properties
    expect(THREE.MeshPhysicalMaterial).toHaveBeenCalled();
    const materialCall = THREE.MeshPhysicalMaterial.mock.calls[0][0];
    expect(materialCall).toHaveProperty("metalness", CONST.METALNESS);
    expect(materialCall).toHaveProperty("roughness", CONST.ROUGHNESS);
  });

  test("updateCubeRotation should update cube rotation correctly", () => {
    // Create a mock cube
    const cube = {
      rotation: { x: 0, y: 0, z: 0 },
    };

    // Create test values
    const baseSpinAccumulator = new THREE.Vector2(0.1, 0.2);
    const currentUserSpinOffset = new THREE.Vector2(0.3, 0.4);

    // Update cube rotation
    updateCubeRotation(cube, baseSpinAccumulator, currentUserSpinOffset);

    // Verify rotation was updated correctly
    expect(cube.rotation.x).toBe(
      baseSpinAccumulator.x + currentUserSpinOffset.x
    );
    expect(cube.rotation.y).toBe(
      baseSpinAccumulator.y + currentUserSpinOffset.y
    );
  });

  test("updateCubeScale should update cube scale correctly", () => {
    // Create a mock cube
    const cube = {
      scale: { set: jest.fn() },
    };

    // Create test value
    const currentScrollScale = 1.5;

    // Update cube scale
    updateCubeScale(cube, currentScrollScale);

    // Verify scale was updated correctly
    expect(cube.scale.set).toHaveBeenCalledWith(
      currentScrollScale,
      currentScrollScale,
      currentScrollScale
    );
  });
});
