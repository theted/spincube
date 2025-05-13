// --- Cube constants ---
export const CUBE_SIZE = 2.25; // Increased by 50% from 1.5
export const CORNER_RADIUS = 0.05; // Reduced corner radius for less rounded edges
export const SEGMENTS = 12; // Increased segments for smoother edges

// --- Material constants ---
export const MATERIAL_COLOR = 0xffffff; // White color to maximize reflectivity
export const METALNESS = 1.0;
export const ROUGHNESS = 0.01; // Even shinier than before
export const ENV_MAP_INTENSITY = 2.0; // Increased intensity for stronger reflections
export const CLEARCOAT = 1.0; // Add clearcoat for extra shine
export const CLEARCOAT_ROUGHNESS = 0.01; // Make clearcoat very smooth
export const REFLECTIVITY = 1.0; // Maximum reflectivity

// --- Environment map constants ---
export const ENV_MAP_SIZE = 512; // Reduced quality for better performance (power of 2)
export const ENV_MAP_UPDATE_INTERVAL = 1 / 20; // Update env map at 20 FPS for better performance
export const BACKGROUND_BLUR = 0.5; // Amount of blur to apply to the background (0-1)

// --- Cube interaction constants ---
export const INITIAL_SPIN_SPEED = { x: 0.002, y: 0.003 }; // Doubled spin speed
export const K_SPRING = 0.05; // Increased springiness
export const K_DAMPING = 0.25; // Reduced damping for more bounce
export const MOUSE_DRAG_SENSITIVITY = 0.008;
export const TARGET_OFFSET_DAMPING_FACTOR = 0.92;
export const CUBE_INTERACTION_PARALLAX_FACTOR = 0.01; // How much cube interaction shifts the shader's UVs

// --- Bounce animation constants ---
export const BOUNCE_DURATION = 0.7; // Animation duration in seconds
export const BOUNCE_MAX_SCALE = 1.3; // Increased maximum scale during bounce
export const BOUNCE_MIN_SCALE = 0.8; // Decreased minimum scale during bounce
export const ORIGINAL_CUBE_COLOR = 0xffffff; // Store original cube color
export const BOUNCE_CUBE_COLOR = 0x88ccff; // Color during bounce (light blue)

// --- Shader constants ---
export const CHECKER_SCALE = 20.0; // How many checkers across
export const WARP_AMOUNT = 0.05; // Strength of warping
export const WARP_FREQUENCY = 5.0; // Spatial frequency of warp pattern
export const WARP_SPEED = 0.1; // How fast the warp animates
