import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as THREE from "three";
import { createCube } from "./mocks/cube.mock.js";
import * as CONST from "../constants.js";

// Mock Three.js for DoubleSide constant
vi.mock("three", async () => {
  const actual = await vi.importActual("three");
  return {
    ...actual,
    DoubleSide: "DoubleSide",
  };
});

describe("Cube Component", () => {
  let scene;

  beforeEach(() => {
    scene = new THREE.Scene();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a cube with correct geometry parameters", () => {
    const cube = createCube(scene);

    // Check if the cube was created with the correct geometry parameters
    expect(cube.geometry.width).toBe(CONST.CUBE_SIZE);
    expect(cube.geometry.height).toBe(CONST.CUBE_SIZE);
    expect(cube.geometry.depth).toBe(CONST.CUBE_SIZE);
    expect(cube.geometry.segments).toBe(CONST.SEGMENTS);
    expect(cube.geometry.radius).toBe(CONST.CORNER_RADIUS);
  });

  it("should create a cube with metallic material when USE_GLASS_MATERIAL is false", () => {
    // Override the constant for this test
    vi.spyOn(CONST, "USE_GLASS_MATERIAL", "get").mockReturnValue(false);

    const cube = createCube(scene);

    // Check if the cube has metallic material properties
    expect(cube.material.metalness).toBe(CONST.METALNESS);
    expect(cube.material.roughness).toBe(CONST.ROUGHNESS);
    expect(cube.material.envMapIntensity).toBe(CONST.ENV_MAP_INTENSITY);
    expect(cube.material.clearcoat).toBe(CONST.CLEARCOAT);
    expect(cube.material.clearcoatRoughness).toBe(CONST.CLEARCOAT_ROUGHNESS);
    expect(cube.material.reflectivity).toBe(CONST.REFLECTIVITY);
  });

  it("should create a cube with glass material when USE_GLASS_MATERIAL is true", () => {
    // Override the constant for this test
    vi.spyOn(CONST, "USE_GLASS_MATERIAL", "get").mockReturnValue(true);

    const cube = createCube(scene);

    // Check if the cube has glass material properties
    expect(cube.material.metalness).toBe(CONST.GLASS_METALNESS);
    expect(cube.material.roughness).toBe(CONST.GLASS_ROUGHNESS);
    expect(cube.material.transmission).toBe(CONST.GLASS_TRANSMISSION);
    expect(cube.material.thickness).toBe(CONST.GLASS_THICKNESS);
    expect(cube.material.ior).toBe(CONST.GLASS_IOR);
    expect(cube.material.envMapIntensity).toBe(CONST.GLASS_ENV_MAP_INTENSITY);
    expect(cube.material.transparent).toBe(true);
    expect(cube.material.side).toBe(THREE.DoubleSide);
  });

  it("should return a valid cube object", () => {
    const cube = createCube(scene);

    // Check if the cube object has the expected properties
    expect(cube).toBeDefined();
    expect(cube.geometry).toBeDefined();
    expect(cube.material).toBeDefined();
    expect(cube.scale).toBeDefined();
    expect(cube.rotation).toBeDefined();
  });
});
