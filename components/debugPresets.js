// Presets for the debug panel, to compare looks quickly. Each dropdown shows
// the preset the current values match, so a fresh page shows the defaults.
// Picking one sets the values it lists; the sliders can then fine-tune them.

// How the letter is cut: its depth and the bevel the glowing face sits in
export const EMBOSS_PRESETS = {
  "Strong, deep (default)": { depth: 0.34, bevel: 0.08, bevelSize: 0.065, bevelSegments: 8 },
  "Strong": { depth: 0.2, bevel: 0.08, bevelSize: 0.065, bevelSegments: 8 },
  "Soft": { depth: 0.2, bevel: 0.05, bevelSize: 0.045, bevelSegments: 6 },
  "Flat chamfer": { depth: 0.28, bevel: 0.06, bevelSize: 0.06, bevelSegments: 1 },
  "Pillow": { depth: 0.24, bevel: 0.11, bevelSize: 0.06, bevelSegments: 10 },
  "Thin (the original)": { depth: 0.2, bevel: 0.03, bevelSize: 0.021, bevelSegments: 5 },
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

// The backdrop: a pattern and everything that colours and moves it. Each
// lists every one of these values, so switching never leaves one behind.
const LIGHT_LINES = {
  pattern: "lines",
  baseTop: "#0b0e18",
  baseBottom: "#040508",
  glowColor: "#1e2550",
  glowStrength: 0.9,
  lineColor: "#c8d8ff",
  lineIntensity: 0.75,
  lineDensity: 16,
  lineWidth: 0.025,
  cellGlow: 0,
  lineDrift: 0.006,
  speed: 1,
  spinBoost: 0,
  follow: 0,
  warp: 0,
  warpRadius: 0.35,
  chargePinch: 0.55,
};

const GRID = {
  ...LIGHT_LINES,
  pattern: "grid",
  baseTop: "#0a1222",
  baseBottom: "#03050a",
  glowColor: "#173058",
  glowStrength: 0.8,
  lineColor: "#9cc0ff",
  lineIntensity: 0.5,
  lineDensity: 10,
  lineWidth: 0.03,
  chargePinch: 0.6,
};

export const BACKDROP_PRESETS = {
  "Light lines (default)": LIGHT_LINES,
  // Blueprint squares, drifting up
  "Grid": GRID,
  // The grid with its cells flaring up and fading, more of them near the cube
  "Lit grid": {
    ...GRID,
    lineColor: "#8fd4ff",
    lineIntensity: 0.6,
    lineDensity: 12,
    lineWidth: 0.025,
    cellGlow: 0.3,
  },
  // Hexagons ringed by triangles, the triangle grid rectified like the
  // glass; charging slides its lines back into plain triangles
  "Kagome": {
    ...GRID,
    pattern: "kagome",
    baseTop: "#08141c",
    baseBottom: "#020608",
    glowColor: "#123c4c",
    glowStrength: 0.85,
    lineColor: "#a8e4ec",
    lineIntensity: 0.45,
    lineDensity: 15,
    lineWidth: 0.022,
    cellGlow: 0.25,
  },
  // A halftone of dots, growing towards the cube and swelling in slow waves
  "Halftone": {
    ...LIGHT_LINES,
    pattern: "dots",
    lineIntensity: 0.7,
    lineDensity: 30,
    lineWidth: 0.6,
  },
  // A honeycomb whose cells glow amber now and then
  "Hive": {
    ...LIGHT_LINES,
    pattern: "hex",
    baseTop: "#120d08",
    baseBottom: "#050302",
    glowColor: "#4a2a0c",
    glowStrength: 0.8,
    lineColor: "#ffb257",
    lineIntensity: 0.55,
    lineDensity: 9,
    lineWidth: 0.03,
    cellGlow: 0.45,
  },
  // Meandering Truchet loops with sparks running along them
  "Weave": {
    ...LIGHT_LINES,
    pattern: "weave",
    baseTop: "#07121a",
    baseBottom: "#020507",
    glowColor: "#0f3a44",
    lineColor: "#7fe8e0",
    lineIntensity: 0.7,
    lineDensity: 9,
    lineWidth: 0.03,
    spinBoost: 0.5,
  },
  // Streaks flying out from the cube; throw it to jump to light speed
  "Warp": {
    ...LIGHT_LINES,
    pattern: "rays",
    glowColor: "#26306a",
    glowStrength: 1,
    lineIntensity: 1.1,
    lineDensity: 12,
    lineWidth: 0.025,
    spinBoost: 1,
  },
  // The grid sags in around the cube and follows it as the camera drifts
  "Gravity well": {
    ...GRID,
    lineColor: "#c8d8ff",
    lineIntensity: 0.5,
    lineDensity: 14,
    lineWidth: 0.025,
    warp: 0.9,
    warpRadius: 0.3,
  },
  // A floor and ceiling running off to a horizon, scrolling towards you
  "Horizon": {
    ...LIGHT_LINES,
    pattern: "horizon",
    baseTop: "#160a26",
    baseBottom: "#050208",
    glowColor: "#6a2470",
    glowStrength: 0.9,
    lineColor: "#ff6ad5",
    lineIntensity: 0.9,
    lineDensity: 8,
    lineWidth: 0.04,
    spinBoost: 0.4,
  },
  // Rushing down a tunnel; throw the cube to go faster
  "Tunnel": {
    ...LIGHT_LINES,
    pattern: "tunnel",
    baseTop: "#08070f",
    baseBottom: "#020206",
    glowColor: "#33267a",
    glowStrength: 1.2,
    lineColor: "#b0a4ff",
    lineIntensity: 0.7,
    lineDensity: 24,
    lineWidth: 0.025,
    spinBoost: 0.5,
  },
  // Inside a vast gridded cube that turns with the glass one
  "Room": {
    ...LIGHT_LINES,
    pattern: "room",
    lineIntensity: 0.5,
    lineDensity: 8,
    lineWidth: 0.02,
    follow: 0.15,
  },
  // Level lines of a churning noise field
  "Contours": {
    ...LIGHT_LINES,
    pattern: "contours",
    glowColor: "#14303a",
    lineColor: "#8fe0cf",
    lineIntensity: 0.55,
    lineDensity: 10,
    lineWidth: 0.03,
  },
};

/** A whole look: a backdrop, the S's glow (and its release flash), and any extras */
const look = (backdrop, glow, extras = {}) => ({
  BACKDROP: { ...BACKDROP_PRESETS[backdrop], pulseColor: GLOW_PRESETS[glow].faceColor },
  CORE: { ...GLOW_PRESETS[glow] },
  ...extras,
});

// Whole looks for the Presets folder, as overrides of the defaults
export const LOOKS = {
  "sundbergsolutions.se (default)": look("Light lines (default)", "Champagne (default)"),
  "Blueprint": look("Grid", "Ice"),
  "Lit grid": look("Lit grid", "Champagne (default)"),
  "Kagome": look("Kagome", "Champagne (default)"),
  "Halftone": look("Halftone", "Champagne (default)"),
  "Hive": look("Hive", "Gold"),
  "Weave": look("Weave", "White"),
  "Warp": look("Warp", "Ice"),
  "Gravity well": look("Gravity well", "White"),
  "Synthwave": look("Horizon", "Gold", { FINISH: { vignette: 0.65 } }),
  "Wormhole": look("Tunnel", "Violet"),
  "Cube room": look("Room", "Champagne (default)"),
  "Topography": look("Contours", "Amber (the original)"),
  // Exactly the S before the Inter Black change: Helvetiker, amber, a thin
  // bevel built out around the letter
  "Original S": {
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
  // Everything slower and stiller
  "Calm": {
    SPIN: { idle: { x: 0.06, y: 0.15, z: 0.02 } },
    CORE: { sway: 0.1, swaySpeed: 0.6 },
    FLOAT: { amplitude: 0.03 },
  },
  // The S turns on its own inside the cube, like on a turntable
  "Turntable": { CORE: { spin: 0.6, sway: 0.05 } },
};
