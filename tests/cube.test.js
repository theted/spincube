import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as THREE from "three";
import { createCube } from "../components/cube.js";

// Mock THREE.js classes
vi.mock("three", async () => {
  const actual = await vi.importActual("three");
  return {
    ...actual,
    BoxGeometry: vi.fn().mockImplementation(() => ({
      type: "BoxGeometry",
    })),
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({
      type: "MeshStandardMaterial",
      envMapIntensity: 1.0,
      metalness: 0.0,
      roughness: 0.0,
      color: { set: vi.fn() },
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

describe("Cube Component", () => {
  let scene;

  beforeEach(() => {
    // Create a mock scene
    scene = {
      add: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create a cube with correct geometry", () => {
    const cube = createCube(scene);

    // Check if BoxGeometry was called
    expect(THREE.BoxGeometry).toHaveBeenCalled();

    // Check if the cube was added to the scene
    expect(scene.add).toHaveBeenCalledWith(cube);

    // Check if the cube has the correct type
    expect(cube.type).toBe("Mesh");
  });

  it("should create a cube with metallic material by default", () => {
    const cube = createCube(scene);

    // Check if MeshStandardMaterial was called
    expect(THREE.MeshStandardMaterial).toHaveBeenCalled();

    // Check if the material is a MeshStandardMaterial
    expect(cube.material.type).toBe("MeshStandardMaterial");
  });

  it("should position the cube at the origin", () => {
    const cube = createCube(scene);

    // Check if position.set was called
    expect(cube.position.set).toHaveBeenCalled();
  });
});
