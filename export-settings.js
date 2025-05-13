// Script to export settings from localStorage to a file
// This script is meant to be run in the browser
// It will be injected into the page by the export-settings.html file

(function () {
  // Get settings from localStorage
  const settings = localStorage.getItem("spincube-settings");

  if (!settings) {
    console.error("No settings found in localStorage");
    document.body.innerHTML =
      "<h1>No settings found in localStorage</h1><p>Please save settings in the debug panel first.</p>";
    return;
  }

  try {
    // Parse settings to make sure they're valid JSON
    const parsedSettings = JSON.parse(settings);

    // Create a data URI for downloading
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(settings);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", dataStr);
    downloadLink.setAttribute("download", "saved-settings.json");
    downloadLink.innerHTML = "Download Settings";
    downloadLink.style.display = "block";
    downloadLink.style.margin = "20px auto";
    downloadLink.style.padding = "10px 20px";
    downloadLink.style.backgroundColor = "#4CAF50";
    downloadLink.style.color = "white";
    downloadLink.style.textDecoration = "none";
    downloadLink.style.borderRadius = "5px";
    downloadLink.style.textAlign = "center";
    downloadLink.style.width = "200px";

    // Add to page
    document.body.innerHTML = "<h1>Export Settings</h1>";
    document.body.appendChild(downloadLink);

    // Display settings
    const settingsDisplay = document.createElement("pre");
    settingsDisplay.style.margin = "20px auto";
    settingsDisplay.style.padding = "10px";
    settingsDisplay.style.backgroundColor = "#f5f5f5";
    settingsDisplay.style.border = "1px solid #ddd";
    settingsDisplay.style.borderRadius = "5px";
    settingsDisplay.style.maxWidth = "600px";
    settingsDisplay.style.overflow = "auto";
    settingsDisplay.textContent = JSON.stringify(parsedSettings, null, 2);
    document.body.appendChild(settingsDisplay);

    console.log("Settings exported successfully");
  } catch (error) {
    console.error("Error parsing settings:", error);
    document.body.innerHTML =
      "<h1>Error parsing settings</h1><p>" + error.message + "</p>";
  }
})();
