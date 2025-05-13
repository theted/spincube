// Script to generate constants.js from saved settings
const fs = require("fs");
const path = require("path");

// Default constants file path
const CONSTANTS_FILE = path.join(__dirname, "constants.js");
// Output file path for production constants
const OUTPUT_FILE = path.join(__dirname, "constants.prod.js");

// Try to read saved settings from localStorage
// Since this is a Node.js script, we can't access localStorage directly
// Instead, we'll check if a settings file exists (which would be created by the build process)
const SETTINGS_FILE = path.join(__dirname, "saved-settings.json");

// Read the original constants file
fs.readFile(CONSTANTS_FILE, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading constants file:", err);
    process.exit(1);
  }

  // Start with the original constants
  let modifiedConstants = data;

  // Set DEBUG to false for production
  modifiedConstants = modifiedConstants.replace(
    /export const DEBUG = .*;/,
    "export const DEBUG = false; // Debug mode disabled in production"
  );

  // Check if we have saved settings
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const savedSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
      console.log("Applying saved settings to constants...");

      // Apply saved settings to constants
      if (savedSettings.useMaterial !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const USE_GLASS_MATERIAL = .*;/,
          `export const USE_GLASS_MATERIAL = ${savedSettings.useMaterial}; // Applied from saved settings`
        );
      }

      if (savedSettings.useIntenseBackground !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const USE_INTENSE_BACKGROUND = .*;/,
          `export const USE_INTENSE_BACKGROUND = ${savedSettings.useIntenseBackground}; // Applied from saved settings`
        );
      }

      if (savedSettings.metalness !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const METALNESS = .*;/,
          `export const METALNESS = ${savedSettings.metalness}; // Applied from saved settings`
        );
      }

      if (savedSettings.roughness !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const ROUGHNESS = .*;/,
          `export const ROUGHNESS = ${savedSettings.roughness}; // Applied from saved settings`
        );
      }

      if (savedSettings.envMapIntensity !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const ENV_MAP_INTENSITY = .*;/,
          `export const ENV_MAP_INTENSITY = ${savedSettings.envMapIntensity}; // Applied from saved settings`
        );
      }

      if (savedSettings.cubeSize !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const CUBE_SIZE = .*;/,
          `export const CUBE_SIZE = ${savedSettings.cubeSize}; // Applied from saved settings`
        );
      }

      if (savedSettings.spinSpeedX !== undefined) {
        // This one is trickier because it's in an object
        modifiedConstants = modifiedConstants.replace(
          /export const INITIAL_SPIN_SPEED = { x: .*, y: .* };/,
          `export const INITIAL_SPIN_SPEED = { x: ${
            savedSettings.spinSpeedX
          }, y: ${
            savedSettings.spinSpeedY !== undefined
              ? savedSettings.spinSpeedY
              : "INITIAL_SPIN_SPEED.y"
          } }; // Applied from saved settings`
        );
      } else if (savedSettings.spinSpeedY !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const INITIAL_SPIN_SPEED = { x: .*, y: .* };/,
          `export const INITIAL_SPIN_SPEED = { x: ${
            savedSettings.spinSpeedX !== undefined
              ? savedSettings.spinSpeedX
              : "INITIAL_SPIN_SPEED.x"
          }, y: ${savedSettings.spinSpeedY} }; // Applied from saved settings`
        );
      }

      if (savedSettings.bounceDuration !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const BOUNCE_DURATION = .*;/,
          `export const BOUNCE_DURATION = ${savedSettings.bounceDuration}; // Applied from saved settings`
        );
      }

      if (savedSettings.bounceMaxScale !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const BOUNCE_MAX_SCALE = .*;/,
          `export const BOUNCE_MAX_SCALE = ${savedSettings.bounceMaxScale}; // Applied from saved settings`
        );
      }

      if (savedSettings.springConstant !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const K_SPRING = .*;/,
          `export const K_SPRING = ${savedSettings.springConstant}; // Applied from saved settings`
        );
      }

      if (savedSettings.dampingFactor !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const K_DAMPING = .*;/,
          `export const K_DAMPING = ${savedSettings.dampingFactor}; // Applied from saved settings`
        );
      }

      if (savedSettings.warpAmount !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const WARP_AMOUNT = .*;/,
          `export const WARP_AMOUNT = ${savedSettings.warpAmount}; // Applied from saved settings`
        );
      }

      if (savedSettings.warpFrequency !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const WARP_FREQUENCY = .*;/,
          `export const WARP_FREQUENCY = ${savedSettings.warpFrequency}; // Applied from saved settings`
        );
      }

      if (savedSettings.warpSpeed !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const WARP_SPEED = .*;/,
          `export const WARP_SPEED = ${savedSettings.warpSpeed}; // Applied from saved settings`
        );
      }

      if (savedSettings.checkerScale !== undefined) {
        modifiedConstants = modifiedConstants.replace(
          /export const CHECKER_SCALE = .*;/,
          `export const CHECKER_SCALE = ${savedSettings.checkerScale}; // Applied from saved settings`
        );
      }
    } catch (error) {
      console.error("Error applying saved settings:", error);
    }
  } else {
    console.log(
      "No saved settings found, using default constants with DEBUG=false"
    );
  }

  // Write the modified constants to the output file
  fs.writeFile(OUTPUT_FILE, modifiedConstants, "utf8", (err) => {
    if (err) {
      console.error("Error writing production constants file:", err);
      process.exit(1);
    }
    console.log(`Production constants file created at ${OUTPUT_FILE}`);
  });
});
