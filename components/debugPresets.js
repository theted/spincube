// Presets for the S in the debug panel, to compare looks quickly. Picking one
// sets the CORE values it lists; the sliders can then fine-tune them.

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
