import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CORE } from "../constants.js";
import { createSettingsStore } from "../components/debugSettings.js";

const original = structuredClone(CORE);
const storage = new Map();

beforeEach(() => {
  storage.clear();
  // A stand-in for the browser's localStorage
  vi.stubGlobal("localStorage", {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  });
});

afterEach(() => {
  Object.assign(CORE, original);
  vi.unstubAllGlobals();
});

describe("settings store", () => {
  it("brings the current changes back on the next visit", () => {
    const store = createSettingsStore();
    CORE.faceGlow = 2;
    store.save();
    expect(store.count()).toBe(1);

    Object.assign(CORE, original); // A fresh page
    createSettingsStore().restore();
    expect(CORE.faceGlow).toBe(2);
  });

  it("keeps whole looks as presets, and copies a preset's changes", () => {
    const store = createSettingsStore();
    CORE.faceGlow = 2.5;
    CORE.glyph = "Helvetiker Bold";
    store.presets.save("Bright");
    store.reset();
    expect(CORE.faceGlow).toBe(original.faceGlow);

    store.presets.load("Bright");
    expect(CORE.faceGlow).toBe(2.5);
    expect(CORE.glyph).toBe("Helvetiker Bold");
    const changes = { CORE: { faceGlow: 2.5, glyph: "Helvetiker Bold" } };
    expect(JSON.parse(store.presets.changes("Bright"))).toEqual(changes);
    expect(JSON.parse(store.presets.all())).toEqual({ Bright: changes });

    store.presets.remove("Bright");
    expect(store.presets.names()).toEqual([]);
  });

  it("loads a preset over the defaults, not over the last look", () => {
    const store = createSettingsStore();
    CORE.faceGlow = 3;
    store.presets.save("Glow");
    store.reset();
    CORE.depth = 0.5; // Set after the preset was saved
    store.presets.load("Glow");
    expect(CORE.depth).toBe(original.depth);
  });

  it("refuses a preset with settings that no longer exist", () => {
    storage.set("spincube:presets", JSON.stringify({ Old: { CORE: { gone: 1 } } }));
    expect(() => createSettingsStore().presets.load("Old")).toThrow(/CORE\.gone/);
  });
});
