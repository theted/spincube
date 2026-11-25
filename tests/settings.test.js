import { afterEach, describe, expect, it } from "vitest";
import { CAMERA, SPIN } from "../constants.js";
import { applyOverrides, diffSettings, matchingPreset, mergeSettings } from "../utils/settings.js";

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

describe("diffSettings", () => {
  it("keeps only the values that changed, nested as overrides are", () => {
    const base = { CORE: { glyph: "Inter Black", faceGlow: 1.3 }, SPIN: { idle: { x: 0.1, y: 0.3 } } };
    const current = { CORE: { glyph: "Orbitron Black", faceGlow: 1.3 }, SPIN: { idle: { x: 0.1, y: 0.5 } } };
    expect(diffSettings(current, base)).toEqual({ CORE: { glyph: "Orbitron Black" }, SPIN: { idle: { y: 0.5 } } });
  });

  it("is empty when nothing changed, and round-trips through applyOverrides", () => {
    expect(diffSettings({ CAMERA: { ...CAMERA } }, { CAMERA })).toEqual({});
    applyOverrides(diffSettings({ CAMERA: { ...CAMERA, fov: 40 } }, { CAMERA }));
    expect(CAMERA.fov).toBe(40);
  });
});

describe("mergeSettings", () => {
  it("gives the settings overrides would make, without changing anything", () => {
    const base = { CORE: { glyph: "Inter Black", faceGlow: 1.3 }, SPIN: { idle: { x: 0.1, y: 0.3 } } };
    const merged = mergeSettings(base, { CORE: { faceGlow: 2 }, SPIN: { idle: { y: 0.5 } } });
    expect(merged).toEqual({ CORE: { glyph: "Inter Black", faceGlow: 2 }, SPIN: { idle: { x: 0.1, y: 0.5 } } });
    expect(base.CORE.faceGlow).toBe(1.3);
  });
});

describe("matchingPreset", () => {
  const presets = {
    Warm: { faceColor: "#ffd6a0", faceGlow: 1.3 },
    Cold: { faceColor: "#c8d8ff", faceGlow: 1.36 },
  };

  it("finds the preset whose every value matches, ignoring the rest", () => {
    expect(matchingPreset(presets, { faceColor: "#C8D8FF", faceGlow: 1.36, size: 2 })).toBe("Cold");
    expect(matchingPreset(presets, { faceColor: "#ffd6a0", faceGlow: 1.3 + 1e-9 })).toBe("Warm");
  });

  it("finds none once a value is changed", () => {
    expect(matchingPreset(presets, { faceColor: "#ffd6a0", faceGlow: 1.4 })).toBeUndefined();
  });
});
