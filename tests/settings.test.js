import { afterEach, describe, expect, it } from "vitest";
import { CAMERA, SPIN } from "../constants.js";
import { applyOverrides } from "../utils/settings.js";

const original = structuredClone({ CAMERA, SPIN });

afterEach(() => {
  Object.assign(CAMERA, original.CAMERA);
  Object.assign(SPIN, structuredClone(original.SPIN));
});

describe("applyOverrides", () => {
  it("merges values into the shared setting groups", () => {
    applyOverrides({ CAMERA: { distance: 5 } });
    expect(CAMERA.distance).toBe(5);
    expect(CAMERA.fov).toBe(original.CAMERA.fov);
  });

  it("merges nested groups without dropping their other keys", () => {
    applyOverrides({ SPIN: { idle: { y: 0.1 } } });
    expect(SPIN.idle.y).toBe(0.1);
    expect(SPIN.idle.x).toBe(original.SPIN.idle.x);
  });

  it("rejects unknown groups and keys", () => {
    expect(() => applyOverrides({ CAMREA: { distance: 5 } })).toThrow(/CAMREA/);
    expect(() => applyOverrides({ CAMERA: { distnace: 5 } })).toThrow(/CAMERA\.distnace/);
    expect(() => applyOverrides({ CUBE_SIZE: { x: 1 } })).toThrow(/CUBE_SIZE/);
  });
});
