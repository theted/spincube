// The standalone page at spincube.sundbergsolutions.se. It owns the whole
// window, so it takes the wheel, Space and every touch, and draws the
// light-line backdrop.

import { mountSpinCube } from "./index.js";
import { createHint } from "./components/hint.js";

const hint = createHint(document.getElementById("hint"));

const cube = mountSpinCube(document.body, {
  background: "scene",
  wheelZoom: true,
  keyboard: true,
  touchAction: "none",
  onPress: () => hint.dismiss(),
});

// Debug panel: ?debug in the URL, or press "d" during development
let debugPanel = null;
let debugVisible = false;
async function toggleDebugPanel() {
  debugVisible = !debugVisible;
  if (!debugPanel) {
    const { createDebugPanel } = await import("./components/debugPanel.js");
    debugPanel = createDebugPanel(cube.applySettings);
  }
  debugPanel.show(debugVisible);
}
if (new URLSearchParams(window.location.search).has("debug")) {
  toggleDebugPanel();
}
if (import.meta.env.DEV) {
  window.addEventListener("keydown", (event) => {
    if (event.key === "d" && event.target === document.body) toggleDebugPanel();
  });
  // Hook for automated screenshots and poking at the state from the console
  window.spincube = cube;
}
