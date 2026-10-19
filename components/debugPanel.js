import GUI from "lil-gui";
import * as SETTINGS from "../constants.js";
import { GLYPHS } from "../assets/glyphs.js";
import { GLYPH_CANDIDATES } from "../assets/glyphCandidates.js";
import { EMBOSS_PRESETS, GLOW_PRESETS } from "./debugPresets.js";
import { createSettingsStore } from "./debugSettings.js";
import { addCopyButton, addValuePreset, createRevealButton } from "./debugControls.js";
import { addPresetFolder } from "./debugPresetFolder.js";

const { BACKDROP, BLOOM, CORE, CORE_SPRING, DUST, FINISH, FLOAT, GLASS, PRESS, PULSE, RENDER, SPIN } =
  SETTINGS;

/**
 * Creates a lil-gui panel bound to the settings in constants.js. Values read
 * every frame apply on their own; the rest are pushed with applySettings.
 * Changes are kept in localStorage, so they're back on the next visit with
 * ?debug, and the title counts them. Whole looks can be saved as presets
 * (debugPresetFolder.js). "Copy changed settings" puts just the changes on
 * the clipboard as JSON, ready to paste into constants.js or pass as
 * overrides; "Copy all settings" copies every value.
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

  const presets = addPresetFolder(gui, store, commit, refresh);

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

  // The S, in plain words: its font and size, then how it's embossed, how it
  // glows, how it moves and the metal around the glow. Each preset sets the
  // values below it, which can then be fine-tuned.
  const letter = gui.addFolder("The S");
  letter.add(CORE, "glyph", Object.keys(GLYPHS)).name("font");
  letter.add(CORE, "size", 0.3, 1.4, 0.01);

  const emboss = letter.addFolder("Emboss");
  addValuePreset(emboss, EMBOSS_PRESETS, commit, refresh);
  emboss.add(CORE, "bevel", 0, 0.2, 0.005).name("height");
  emboss.add(CORE, "bevelSize", 0, 0.12, 0.005).name("width");
  emboss.add(CORE, "bevelSegments", 1, 12, 1).name("roundness");
  emboss.add(CORE, "depth", 0.02, 0.8, 0.01).name("letter depth");

  const glow = letter.addFolder("Glow");
  addValuePreset(glow, GLOW_PRESETS, commit, refresh);
  glow.addColor(CORE, "faceColor").name("colour");
  glow.add(CORE, "faceGlow", 0, 10, 0.05).name("strength");
  glow.add(CORE, "chargeGlow", 0, 20, 0.1).name("extra when charged");

  // It turns back to face you on a spring, which the cube's spin drags at
  const spin = letter.addFolder("Spin");
  spin.add(CORE, "spin", -3, 3, 0.05).name("own spin");
  spin.add(CORE, "sway", 0, 1, 0.01).name("rock");
  spin.add(CORE, "swaySpeed", 0, 4, 0.05).name("rock speed");
  spin.add(CORE_SPRING, "stiffness", 0, 60, 0.5).name("turn-back pull");
  spin.add(CORE_SPRING, "damping", 0, 20, 0.1).name("turn-back damping");
  spin.add(CORE_SPRING, "coupling", 0, 10, 0.1).name("drag from cube");

  const metal = letter.addFolder("Metal").close();
  metal.addColor(CORE, "rimColor").name("colour");
  metal.add(CORE, "rimRoughness", 0, 1, 0.01).name("roughness");
  metal.add(CORE, "rimReflection", 0, 4, 0.05).name("reflection");
  metal.add(CORE, "rimGlow", 0, 1, 0.01).name("glow");

  // The cube's own motion
  const motion = gui.addFolder("Motion");
  motion.add(SPIN.idle, "x", -1, 1, 0.01).name("idle spin x");
  motion.add(SPIN.idle, "y", -1, 1, 0.01).name("idle spin y");
  motion.add(SPIN.idle, "z", -1, 1, 0.01).name("idle spin z");
  motion.add(SPIN, "relaxRate", 0.05, 5, 0.05);
  motion.add(SPIN, "dragSensitivity", 0.001, 0.03, 0.0005).name("drag sensitivity");
  motion.add(SPIN, "maxThrow", 1, 40, 0.5).name("max throw");
  motion.add(SPIN, "clickSpin", 0, 20, 0.1);
  motion.add(PRESS, "chargeTime", 0.2, 4, 0.05).name("charge time");
  motion.add(PRESS, "squash", 0, 0.3, 0.005);
  motion.add(PRESS, "damping", 1, 40, 0.5).name("wobble damping");
  motion.add(PRESS, "kick", 0, 20, 0.1).name("release kick");
  motion.add(FLOAT, "amplitude", 0, 0.3, 0.005).name("float height");
  motion.add(FLOAT, "speed", 0, 3, 0.05).name("float speed");

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
  presets.open();
  letter.open();
  return { toggle: () => setVisible(gui._hidden) };
}
