// All tunable parameters live here. They are grouped into plain objects so the
// debug panel (press "d" in dev, or add ?debug to the URL) can tweak them live.

// --- Camera & rendering ---
export const CAMERA = {
  fov: 32, // Narrow lens for a product-shot look with little distortion
  distance: 7.2, // Resting distance from the cube
  minDistance: 4.6,
  maxDistance: 12,
  parallax: 0.5, // How far the camera drifts with the pointer
  parallaxRate: 3, // 1/s, how quickly the camera follows the pointer
  minVisibleWidth: 3.8, // World units kept in view on narrow (portrait) screens
};

export const RENDER = {
  maxPixelRatio: 2,
  exposure: 1.05,
  msaaSamples: 4,
  transmissionScale: 1, // Resolution of the buffer the glass refracts; lower is cheaper
};

// --- Glass cube ---
export const CUBE_SIZE = 1.6;
export const CUBE_RADIUS = 0.09; // Rounded edges catch the light
export const CUBE_SEGMENTS = 8;

export const GLASS = {
  color: "#ffffff",
  roughness: 0.03,
  thickness: 0.45, // Refraction strength; higher splits the S into more copies
  ior: 1.5,
  dispersion: 6, // Rainbow fringes on refracted edges
  iridescence: 0.25, // Thin-film sheen on the faces
  iridescenceIOR: 1.3,
  attenuationColor: "#dfe8ff",
  attenuationDistance: 3.5,
  envMapIntensity: 1.8,
  specularIntensity: 1,
};

// --- Glowing S at the core ---
export const CORE = {
  glyph: "Inter Black", // A name from assets/glyphs.js
  size: 0.92, // Height of the letter in world units
  depth: 0.34,
  bevel: 0.08, // How far the rounded bevel stands out from the sides
  bevelSize: 0.065, // How far the bevel cuts into the glowing face
  bevelSegments: 8, // 1 is a flat chamfer; more rounds it off
  faceColor: "#ffd6a0", // Champagne glow
  faceGlow: 1.3, // Emissive intensity; enough to clear the bloom threshold
  rimColor: "#cbb594", // Polished metal on the bevel and the letter's sides
  rimRoughness: 0.16, // Blur of the metal's reflections; 0 is a mirror
  rimReflection: 1, // Strength of the studio reflected in the metal
  rimGlow: 0.12, // How much of the glow colour the metal gives off itself
  chargeGlow: 1.5, // Extra emissive intensity at full charge
  sway: 0.22, // Radians the letter rocks while facing the camera
  swaySpeed: 1, // How fast it rocks; 2 is twice as fast
  spin: 0, // rad/s it turns about its upright axis on its own; 0 keeps it facing you
};

// --- Motion ---
export const SPIN = {
  idle: { x: 0.14, y: 0.34, z: 0.05 }, // rad/s, the resting tumble
  relaxRate: 0.8, // 1/s, how fast a throw settles back to the idle tumble
  dragSensitivity: 0.0075, // rad per pixel dragged
  throwSmoothing: 18, // 1/s, smoothing of the drag velocity used for throws
  maxThrow: 16, // rad/s cap on throw speed
  clickSpin: 5, // rad/s spin kick from a full-charge release
};

// The S is loosely coupled to the cube: a hard throw drags it along, then a
// spring turns it back to face the viewer.
export const CORE_SPRING = {
  stiffness: 14,
  damping: 4.5,
  coupling: 1.6, // How strongly the cube's spin drags the letter
};

export const PRESS = {
  chargeTime: 1.1, // Seconds of holding to reach full charge
  squash: 0.08, // Scale reduction at full charge
  stiffness: 220, // Scale spring
  damping: 9, // Low damping gives a jelly wobble on release
  kick: 7, // Outward scale velocity on release, times charge
  dragThreshold: 6, // Pixels of movement before a press becomes a drag
};

export const ZOOM = {
  sensitivity: 0.0035, // Distance per wheel delta unit
  stiffness: 70,
  damping: 16,
};

export const FLOAT = {
  amplitude: 0.06, // Gentle vertical bob
  speed: 0.7,
};

// --- Pulse released on click ---
export const PULSE = {
  minStrength: 0.35, // Strength of a quick tap; a full charge gives 1
  rippleSpeed: 0.55, // Backdrop units per second the ripple runs outwards
  rippleWidth: 0.06, // Width of the ripple band, in backdrop units
  rippleAmplitude: 0.05, // How far the ripple pushes the lines aside
  rippleGlow: 2, // Extra line brightness inside the ripple
  flash: 0.35, // Brief warm glow behind the cube
  dustSpeed: 7, // World units per second the dust shockwave travels
  decay: 1.1, // 1/s
};

// --- Backdrop ---
export const BACKDROP = {
  radius: 40,
  baseTop: "#0b0e18",
  baseBottom: "#040508",
  glowColor: "#1e2550", // Nebula behind the cube
  glowStrength: 0.9,
  lineColor: "#c8d8ff",
  lineIntensity: 0.9,
  lineDensity: 16, // Line bands per backdrop unit of height
  lineWidth: 0.025, // Fraction of the band height
  lineDrift: 0.006, // Backdrop units per second of upward drift
  pulseColor: "#ffd6a0", // Colour of the release flash, the S's champagne
  chargePinch: 0.55, // How hard the lines bend towards the cube at full charge
};

// --- Dust ---
export const DUST = {
  count: 650,
  innerRadius: 1.8,
  outerRadius: 9,
  size: 0.06, // World-space diameter
  brightness: 0.45,
  drift: 0.12, // Amplitude of the wandering motion
  chargePull: 0.2, // Fraction the dust shell contracts at full charge
};

// --- Post-processing ---
export const BLOOM = {
  strength: 0.45,
  radius: 0.35,
  threshold: 0.6,
};

export const FINISH = {
  vignette: 0.55,
  grain: 0.035,
  aberration: 0.0012, // Colour fringing towards the screen edges
};
