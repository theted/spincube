// The standalone page at spincube.sundbergsolutions.se. It owns the whole
// window, so it takes the wheel, Space and every touch, and draws the
// light-line backdrop.

import { mountSpinCube } from "./index.js";

const cube = mountSpinCube(document.body, {
  background: "scene",
  wheelZoom: true,
  keyboard: true,
  touchAction: "none",
  pressAnywhere: true,
});

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
const debugRequested = new URLSearchParams(window.location.search).has("debug");
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
