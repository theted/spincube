import { afterEach, describe, expect, it } from "vitest";
import * as SETTINGS from "../constants.js";
import { BACKDROP_PATTERNS } from "../shaders/backdropPatterns/index.js";
import { BACKDROP_PRESETS, EMBOSS_PRESETS, GLOW_PRESETS, LOOKS } from "../components/debugPresets.js";
import { applyOverrides, diffSettings, matchingPreset } from "../utils/settings.js";

const { BACKDROP, CORE } = SETTINGS;
const GROUPS = ["BACKDROP", "CORE", "FINISH"];
const original = structuredClone(Object.fromEntries(GROUPS.map((group) => [group, SETTINGS[group]])));

afterEach(() => {
  applyOverrides(structuredClone(original));
});

describe("debug presets", () => {
  it("show the default ones on a fresh page", () => {
    expect(matchingPreset(EMBOSS_PRESETS, CORE)).toBe("Strong, deep (default)");
    expect(matchingPreset(GLOW_PRESETS, CORE)).toBe("Champagne (default)");
    expect(matchingPreset(BACKDROP_PRESETS, BACKDROP)).toBe("Light lines (default)");
  });

  it("give every backdrop a known pattern and every backdrop value", () => {
    const keys = Object.keys(BACKDROP_PRESETS["Light lines (default)"]);
    for (const preset of Object.values(BACKDROP_PRESETS)) {
      expect(Object.keys(BACKDROP_PATTERNS)).toContain(preset.pattern);
      expect(Object.keys(preset).sort()).toEqual([...keys].sort());
    }
  });

  it("apply as whole looks, the default one changing nothing", () => {
    for (const look of Object.values(LOOKS)) {
      expect(() => applyOverrides(structuredClone(look))).not.toThrow();
    }
    applyOverrides(structuredClone(original));
    applyOverrides(structuredClone(LOOKS["sundbergsolutions.se (default)"]));
    const now = Object.fromEntries(GROUPS.map((group) => [group, SETTINGS[group]]));
    expect(diffSettings(now, original)).toEqual({});
  });
});
