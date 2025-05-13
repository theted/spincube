// Script to save settings from localStorage to a file
// This script is meant to be run in Node.js after exporting settings from the browser

const fs = require("fs");
const path = require("path");

// Check if the saved-settings.json file exists
const settingsFile = path.join(__dirname, "saved-settings.json");

if (!fs.existsSync(settingsFile)) {
  console.error("Error: saved-settings.json file not found.");
  console.log(
    'Please run "npm run export-settings" first, save your settings in the debug panel,'
  );
  console.log(
    "then download the settings file and place it in the project root directory."
  );
  process.exit(1);
}

// Read the settings file
try {
  const settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
  console.log("Settings loaded successfully:", settings);

  // Now run the build-constants.js script
  require("./build-constants.js");
} catch (error) {
  console.error("Error reading or parsing settings file:", error);
  process.exit(1);
}
