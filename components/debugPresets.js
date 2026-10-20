// Presets for the debug panel, to compare looks quickly. Picking one sets the
// values it lists; the sliders can then fine-tune them.

// How the letter is cut: its depth and the bevel the glowing face sits in
export const EMBOSS_PRESETS = {
  "Strong, deep (default)": { depth: 0.34, bevel: 0.08, bevelSize: 0.065, bevelSegments: 8, bevelInset: true },
  "Strong": { depth: 0.2, bevel: 0.08, bevelSize: 0.065, bevelSegments: 8, bevelInset: true },
  "Soft": { depth: 0.2, bevel: 0.05, bevelSize: 0.045, bevelSegments: 6, bevelInset: true },
  "Flat chamfer": { depth: 0.28, bevel: 0.06, bevelSize: 0.06, bevelSegments: 1, bevelInset: true },
  "Pillow": { depth: 0.24, bevel: 0.11, bevelSize: 0.06, bevelSegments: 10, bevelInset: true },
  "Thin, built out (the original)": { depth: 0.2, bevel: 0.03, bevelSize: 0.021, bevelSegments: 5, bevelInset: false },
};

// The glow and the metal around it. Each faceGlow gives the same brightness
// as champagne at 1.3, so darker hues like blue still clear the bloom.
export const GLOW_PRESETS = {
  "Champagne (default)": { faceColor: "#ffd6a0", rimColor: "#cbb594", faceGlow: 1.3 },
  "Amber (the original)": { faceColor: "#ff9a3d", rimColor: "#d9a35f", faceGlow: 2.09 },
  "Gold": { faceColor: "#ffb84a", rimColor: "#d6b06c", faceGlow: 1.67 },
  "White": { faceColor: "#f1f2f6", rimColor: "#c6cbd4", faceGlow: 1.05 },
  "Ice": { faceColor: "#c8d8ff", rimColor: "#b6c3da", faceGlow: 1.36 },
  "Cyan": { faceColor: "#6fd8ff", rimColor: "#a6c4d8", faceGlow: 1.57 },
  "Blue": { faceColor: "#4d86ff", rimColor: "#9eb2d8", faceGlow: 3.62 },
  "Violet": { faceColor: "#9a7cff", rimColor: "#b1a9d6", faceGlow: 3.28 },
};

// Whole looks for the Presets folder, as overrides: each starts from the
// defaults and changes only what it lists
export const LOOK_PRESETS = {
  // Exactly the S before the Inter Black change: Helvetiker, amber, a thin
  // bevel built out around the letter
  "Original": {
    CORE: {
      glyph: "Helvetiker Bold",
      depth: 0.2,
      bevel: 0.03,
      bevelSize: 0.021,
      bevelSegments: 5,
      bevelInset: false,
      faceColor: "#ff9a3d",
      faceGlow: 1.6,
      rimColor: "#d9a35f",
    },
    BACKDROP: { pulseColor: "#ffb066" },
  },
  // A slow swell and fade in the glow, otherwise the defaults
  "Breathing": { CORE: { breathe: 0.3, breatheSpeed: 0.2 } },
  // Cold white light in mirror-polished silver, under a bluer nebula
  "Ice chrome": {
    CORE: { faceColor: "#c8d8ff", faceGlow: 1.36, rimColor: "#b6c3da", rimRoughness: 0.05, rimReflection: 1.6 },
    GLASS: { attenuationColor: "#e2eeff" },
    BACKDROP: { glowColor: "#17264f", pulseColor: "#c8d8ff" },
  },
  // Plain white light and silver
  "White": {
    CORE: { faceColor: "#f1f2f6", faceGlow: 1.05, rimColor: "#c6cbd4" },
    BACKDROP: { pulseColor: "#f1f2f6" },
  },
  // Rough glass diffuses the S into a soft blur of light
  "Frosted": {
    GLASS: { roughness: 0.42, thickness: 0.5, envMapIntensity: 1.2 },
    CORE: { faceGlow: 1.7 },
  },
  // Heavy dispersion and iridescence split the light into rainbow fringes
  "Prism": { GLASS: { dispersion: 16, iridescence: 0.8, thickness: 0.9 } },
  // A squared, chamfered S in cyan, humming faintly like a sign at night
  "Neon": {
    CORE: {
      glyph: "Orbitron Black",
      depth: 0.28,
      bevel: 0.06,
      bevelSize: 0.06,
      bevelSegments: 1,
      faceColor: "#6fd8ff",
      faceGlow: 1.35,
      rimColor: "#a6c4d8",
      breathe: 0.12,
      breatheSpeed: 0.6,
    },
    BACKDROP: { lineColor: "#9fe8ff", pulseColor: "#6fd8ff" },
  },
  // Hot orange light, slowly glowing up and down like coals
  "Ember": {
    CORE: { faceColor: "#ff7a3d", faceGlow: 2.2, rimColor: "#c98a5a", breathe: 0.2, breatheSpeed: 0.3 },
    BACKDROP: { glowColor: "#3a1a22", pulseColor: "#ff8a4a" },
  },
  // Everything slower and stiller
  "Calm": {
    SPIN: { idle: { x: 0.06, y: 0.15, z: 0.02 } },
    CORE: { sway: 0.1, swaySpeed: 0.6 },
    FLOAT: { amplitude: 0.03 },
  },
  // The S turns on its own inside the cube, like on a turntable
  "Turntable": { CORE: { spin: 0.6, sway: 0.05 } },
};
