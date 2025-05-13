// --- Debug mode ---
export const DEBUG = process.env.DEBUG !== false; // Toggle debug mode for controls panel
export const USE_INTENSE_BACKGROUND = false; // Using calm background with darker colors

// --- Cube constants ---
export const CUBE_SIZE = 2.25; // Increased by 50% from 1.5
export const CORNER_RADIUS = 0.05; // Reduced corner radius for less rounded edges
export const SEGMENTS = 12; // Increased segments for smoother edges

// --- Material constants ---
export const USE_GLASS_MATERIAL = false; // Toggle between glass (true) and metallic (false)

// Metallic material properties
export const MATERIAL_COLOR = 0xffffff; // White color to maximize reflectivity
export const METALNESS = 1.0;
export const ROUGHNESS = 0.001; // Ultra-low roughness for maximum shininess
export const ENV_MAP_INTENSITY = 3.0; // Significantly increased intensity for stronger reflections
export const CLEARCOAT = 1.0; // Add clearcoat for extra shine
export const CLEARCOAT_ROUGHNESS = 0.001; // Ultra-smooth clearcoat
export const REFLECTIVITY = 1.0; // Maximum reflectivity

// Glass material properties
export const GLASS_COLOR = 0xffffff; // Base color for glass
export const GLASS_METALNESS = 0.0; // Non-metallic for glass
export const GLASS_ROUGHNESS = 0.05; // Slightly rough for subtle diffusion
export const GLASS_TRANSMISSION = 0.95; // High transmission for transparency
export const GLASS_THICKNESS = 0.5; // Medium thickness
export const GLASS_IOR = 1.5; // Index of refraction (1.5 is typical for glass)
export const GLASS_ENV_MAP_INTENSITY = 1.0; // Environment map intensity for glass

// --- Environment map constants ---
export const ENV_MAP_SIZE = 512; // Reduced quality for better performance (power of 2)
export const ENV_MAP_UPDATE_INTERVAL = 1 / 20; // Update env map at 20 FPS for better performance
export const BACKGROUND_BLUR = 0.8; // Increased blur for better performance and aesthetics (0-1)

// --- Cube interaction constants ---
export const INITIAL_SPIN_SPEED = { x: 0.003, y: 0.005 }; // Increased spin speed for better visual effect
export const K_SPRING = 0.12; // Increased springiness for smoother animations
export const K_DAMPING = 0.3; // Increased damping for smoother deceleration
export const MOUSE_DRAG_SENSITIVITY = 0.002; // Significantly reduced sensitivity when picking up
export const TARGET_OFFSET_DAMPING_FACTOR = 0.95; // Increased for smoother transitions
export const CUBE_INTERACTION_PARALLAX_FACTOR = 0.01; // Reduced parallax effect
export const THROW_VELOCITY_FACTOR = 0.4; // Reduced for more controlled throwing

// --- Scroll constants ---
export const SCROLL_SPRING = 0.15; // Increased spring constant for smoother scroll physics
export const SCROLL_DAMPING = 0.35; // Increased damping for smoother scroll transitions
export const SCROLL_SENSITIVITY = 0.001; // Sensitivity for scroll input
export const MIN_SCROLL_SCALE = 0.5; // Minimum scale when scrolling
export const MAX_SCROLL_SCALE = 1.5; // Maximum scale when scrolling

// --- Bounce animation constants ---
export const BOUNCE_DURATION = 0.6; // Slightly longer animation duration
export const BOUNCE_MAX_SCALE = 1.4; // Increased maximum scale during bounce
export const BOUNCE_MIN_SCALE = 0.75; // Decreased minimum scale during bounce
export const ORIGINAL_CUBE_COLOR = 0xffffff; // Store original cube color
export const BOUNCE_CUBE_COLOR = 0xffffff; // Keep the cube white during bounce (removed blue color)

// --- Shader constants ---
export const CHECKER_SCALE = 20.0; // How many checkers across
export const WARP_AMOUNT = 0.05; // Strength of warping
export const WARP_FREQUENCY = 5.0; // Spatial frequency of warp pattern
export const WARP_SPEED = 0.1; // How fast the warp animates
