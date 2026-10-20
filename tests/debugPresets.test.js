import { afterEach, describe, expect, it } from "vitest";
import * as SETTINGS from "../constants.js";
import { GLYPHS } from "../assets/glyphs.js";
import { GLYPH_CANDIDATES } from "../assets/glyphCandidates.js";
import { EMBOSS_PRESETS, GLOW_PRESETS, LOOK_PRESETS } from "../components/debugPresets.js";
import { applyOverrides } from "../utils/settings.js";

// Every group a look touches, put back after each test
const touched = [...new Set(Object.values(LOOK_PRESETS).flatMap(Object.keys))];
const original = structuredClone(Object.fromEntries(touched.map((group) => [group, SETTINGS[group]])));
afterEach(() => applyOverrides(structuredClone(original)));

const glyphs = { ...GLYPHS, ...GLYPH_CANDIDATES };

describe("debug presets", () => {
  // A typo would only show up as an alert in the panel
  it.each(Object.entries(LOOK_PRESETS))("the %s look fits the settings", (name, look) => {
    expect(() => applyOverrides(look)).not.toThrow();
    expect(glyphs[SETTINGS.CORE.glyph]).toBeDefined();
  });

  it.each(Object.entries({ ...EMBOSS_PRESETS, ...GLOW_PRESETS }))("%s sets S settings only", (name, values) => {
    expect(() => applyOverrides({ CORE: values })).not.toThrow();
  });
});
