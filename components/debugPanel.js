import GUI from "lil-gui";
import * as SETTINGS from "../constants.js";
import { GLYPHS } from "../assets/glyphs.js";
import { GLYPH_CANDIDATES } from "../assets/glyphCandidates.js";
import { EMBOSS_PRESETS, GLOW_PRESETS } from "./debugPresets.js";
import { copyText, createSettingsStore } from "./debugSettings.js";

const { BACKDROP, BLOOM, CORE, CORE_SPRING, DUST, FINISH, GLASS, PRESS, PULSE, RENDER, SPIN } =
  SETTINGS;

/**
 * Creates a lil-gui panel bound to the settings in constants.js. Values read
 * every frame apply on their own; the rest are pushed with applySettings.
 * Changes are kept in localStorage, so they're back on the next visit with
 * ?debug, and the title counts them. "Copy changed settings" puts just the
 * changes on the clipboard as JSON, ready to paste into constants.js or pass
 * as overrides; "Copy all settings" copies every value.
 * @param {Function} applySettings - Pushes all settings to materials and uniforms
 * @returns {{toggle: Function}} Shows or hides the panel
 */
export function createDebugPanel(applySettings) {
  // The candidate glyphs join the default only once the panel is open
  Object.assign(GLYPHS, GLYPH_CANDIDATES);
  // Bring back an earlier visit's changes before the controls read the values
  const store = createSettingsStore();
  store.restore();
  applySettings();

  const gui = new GUI();
  const showCount = () => gui.title(`SpinCube · ${store.count()} changed`);
  const commit = () => {
    applySettings();
    store.save();
    showCount();
  };
  const refresh = () => {
    for (const controller of gui.controllersRecursive()) controller.updateDisplay();
  };
  gui.onChange(commit);
  showCount();

  const glass = gui.addFolder("Glass");
  glass.add(GLASS, "roughness", 0, 0.5, 0.005);
  glass.add(GLASS, "thickness", 0, 4, 0.05);
  glass.add(GLASS, "ior", 1, 2.4, 0.01);
  glass.add(GLASS, "dispersion", 0, 20, 0.1);
  glass.add(GLASS, "iridescence", 0, 1, 0.01);
  glass.add(GLASS, "iridescenceIOR", 1, 2.4, 0.01);
  glass.addColor(GLASS, "color");
  glass.add(GLASS, "attenuationDistance", 0.2, 20, 0.1);
  glass.addColor(GLASS, "attenuationColor");
  glass.add(GLASS, "envMapIntensity", 0, 4, 0.05).name("reflection");
  glass.add(GLASS, "specularIntensity", 0, 2, 0.05).name("specular");

  // The S: its glyph, then how it's cut and how it glows. The presets set
  // the values below them, which can then be fine-tuned.
  const core = gui.addFolder("The S");
  core.add(CORE, "glyph", Object.keys(GLYPHS));
  addPreset(core, "emboss", EMBOSS_PRESETS, commit, refresh);
  core.add(CORE, "depth", 0.02, 0.8, 0.01);
  core.add(CORE, "bevel", 0, 0.2, 0.005);
  core.add(CORE, "bevelSize", 0, 0.12, 0.005);
  core.add(CORE, "bevelSegments", 1, 12, 1);
  addPreset(core, "glow", GLOW_PRESETS, commit, refresh);
  core.addColor(CORE, "faceColor");
  core.add(CORE, "faceGlow", 0, 10, 0.05);
  core.add(CORE, "chargeGlow", 0, 20, 0.1);
  core.addColor(CORE, "rimColor").name("metal colour");
  core.add(CORE, "rimRoughness", 0, 1, 0.01).name("metal roughness");
  core.add(CORE, "rimReflection", 0, 4, 0.05).name("metal reflection");
  core.add(CORE, "rimGlow", 0, 1, 0.01).name("metal glow");
  core.add(CORE, "sway", 0, 1, 0.01);

  const motion = gui.addFolder("Motion");
  motion.add(SPIN.idle, "x", -1, 1, 0.01).name("idle spin x");
  motion.add(SPIN.idle, "y", -1, 1, 0.01).name("idle spin y");
  motion.add(SPIN.idle, "z", -1, 1, 0.01).name("idle spin z");
  motion.add(SPIN, "relaxRate", 0.05, 5, 0.05);
  motion.add(SPIN, "clickSpin", 0, 20, 0.1);
  motion.add(CORE_SPRING, "stiffness", 0, 60, 0.5).name("core stiffness");
  motion.add(CORE_SPRING, "damping", 0, 20, 0.1).name("core damping");
  motion.add(CORE_SPRING, "coupling", 0, 10, 0.1).name("core coupling");
  motion.add(PRESS, "damping", 1, 40, 0.5).name("wobble damping");
  motion.add(PRESS, "kick", 0, 20, 0.1).name("release kick");

  const backdrop = gui.addFolder("Backdrop");
  backdrop.addColor(BACKDROP, "glowColor");
  backdrop.add(BACKDROP, "glowStrength", 0, 3, 0.05);
  backdrop.addColor(BACKDROP, "lineColor");
  backdrop.add(BACKDROP, "lineIntensity", 0, 3, 0.05);
  backdrop.add(BACKDROP, "lineDensity", 4, 80, 1);
  backdrop.add(BACKDROP, "lineWidth", 0.01, 0.5, 0.005);
  backdrop.add(BACKDROP, "lineDrift", -0.1, 0.1, 0.001);
  backdrop.add(BACKDROP, "chargePinch", 0, 1, 0.01);
  backdrop.add(DUST, "chargePull", 0, 0.6, 0.01).name("dust charge pull");
  backdrop.add(DUST, "brightness", 0, 2, 0.05).name("dust brightness");

  const pulse = gui.addFolder("Pulse");
  pulse.add(PULSE, "rippleSpeed", 0.1, 2, 0.01);
  pulse.add(PULSE, "rippleWidth", 0.01, 0.3, 0.005);
  pulse.add(PULSE, "rippleAmplitude", 0, 0.15, 0.001);
  pulse.add(PULSE, "rippleGlow", 0, 5, 0.05);
  pulse.add(PULSE, "flash", 0, 2, 0.05);
  pulse.add(PULSE, "decay", 0.2, 4, 0.05);

  const post = gui.addFolder("Post");
  post.add(RENDER, "exposure", 0.2, 3, 0.05);
  post.add(BLOOM, "strength", 0, 3, 0.05).name("bloom strength");
  post.add(BLOOM, "radius", 0, 1.5, 0.05).name("bloom radius");
  post.add(BLOOM, "threshold", 0, 3, 0.05).name("bloom threshold");
  post.add(FINISH, "vignette", 0, 1, 0.01);
  post.add(FINISH, "grain", 0, 0.2, 0.005);
  post.add(FINISH, "aberration", 0, 0.02, 0.0005);

  addCopyButton(gui, "Copy changed settings", store.changes);
  addCopyButton(gui, "Copy all settings", store.all);
  const reset = () => {
    store.reset();
    commit();
    refresh();
  };
  gui.add({ reset }, "reset").name("Reset to defaults");

  // Hidden, the panel leaves the scene exactly as it is without it. "d"
  // brings it back; touch screens, with no key to press, get a small button.
  const reveal = createRevealButton(() => setVisible(true));
  const setVisible = (visible) => {
    gui.show(visible);
    reveal.hidden = visible || !window.matchMedia("(hover: none)").matches;
  };
  gui.add({ hide: () => setVisible(false) }, "hide").name("Hide controls (D)");

  for (const folder of gui.folders) folder.close();
  core.open();
  return { toggle: () => setVisible(gui._hidden) };
}

/**
 * A small corner button that shows the hidden panel again.
 * @param {Function} onClick
 * @returns {HTMLButtonElement}
 */
function createRevealButton(onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Controls";
  button.hidden = true;
  Object.assign(button.style, {
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: "1001",
    padding: "6px 12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "999px",
    background: "rgba(10, 12, 20, 0.6)",
    color: "rgba(255, 255, 255, 0.75)",
    font: "12px system-ui, sans-serif",
  });
  button.addEventListener("click", onClick);
  document.body.append(button);
  return button;
}

/**
 * A dropdown that sets several CORE values at once. It starts on no preset,
 * since the values may have been changed since. lil-gui calls the panel's
 * onChange before this one's, so it commits the new values itself. The
 * release flash follows the glow colour.
 * @param {GUI} folder
 * @param {string} name
 * @param {Object<string, Object>} presets - CORE values by preset name
 * @param {Function} commit - Applies and saves the settings
 * @param {Function} refresh - Updates every control to its value
 */
function addPreset(folder, name, presets, commit, refresh) {
  const NONE = "—";
  const choice = { [name]: NONE };
  folder.add(choice, name, [NONE, ...Object.keys(presets)]).onChange((key) => {
    if (key === NONE) return;
    Object.assign(CORE, presets[key]);
    if (presets[key].faceColor) BACKDROP.pulseColor = presets[key].faceColor;
    commit();
    refresh();
  });
}

/**
 * A button that copies some text, and says so on its label for a moment.
 * @param {GUI} gui
 * @param {string} label
 * @param {Function} text - Returns the text to copy
 */
function addCopyButton(gui, label, text) {
  const copy = async () => {
    if (!(await copyText(text()))) return;
    button.name("Copied ✓");
    setTimeout(() => button.name(label), 1500);
  };
  const button = gui.add({ copy }, "copy").name(label);
}
