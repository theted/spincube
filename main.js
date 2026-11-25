// The standalone page at spincube.sundbergsolutions.se. It owns the whole
// window, so it takes the wheel, Space and every touch, and draws the
// light-line backdrop.

import { mountSpinCube } from "./index.js";
import { BACKDROP } from "./constants.js";
import { BACKDROP_PATTERNS } from "./shaders/backdropPatterns/index.js";
import { applyOverrides } from "./utils/settings.js";

const cube = mountSpinCube(document.body, {
  background: "scene",
  wheelZoom: true,
  keyboard: true,
  touchAction: "none",
  pressAnywhere: true,
});

// A look to start with, without the debug panel: ?look=Kagome (any of the
// panel's looks, by name) and/or ?pattern=grid (any BACKDROP.pattern)
const params = new URLSearchParams(window.location.search);
if (params.has("look") || params.has("pattern")) {
  // The looks come with the debug panel's chunk
  import("./components/debugPresets.js").then(({ LOOKS }) => {
    const look = params.get("look") ?? "";
    if (Object.hasOwn(LOOKS, look)) applyOverrides(structuredClone(LOOKS[look]));
    const pattern = params.get("pattern") ?? "";
    if (Object.hasOwn(BACKDROP_PATTERNS, pattern)) BACKDROP.pattern = pattern;
    cube.applySettings();
  });
}

// Debug panel: ?debug in the URL, or press "d" during development. Once it's
// open, "d" hides and shows it in any build.
let debugPanel = null; // A promise of the panel, loaded on first use
function toggleDebugPanel() {
  if (debugPanel) {
    debugPanel.then((panel) => panel.toggle());
    return;
  }
  debugPanel = import("./components/debugPanel.js").then(({ createDebugPanel }) =>
    createDebugPanel(cube.applySettings)
  );
}
const debugRequested = params.has("debug");
if (debugRequested) toggleDebugPanel();
if (import.meta.env.DEV || debugRequested) {
  window.addEventListener("keydown", (event) => {
    if (event.key === "d" && event.target === document.body) toggleDebugPanel();
  });
}
if (import.meta.env.DEV) {
  // Hook for automated screenshots and poking at the state from the console
  window.spincube = cube;
}
