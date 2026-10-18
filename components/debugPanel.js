import GUI from "lil-gui";
import * as SETTINGS from "../constants.js";

const { BACKDROP, BLOOM, CORE, CORE_SPRING, DUST, FINISH, GLASS, PRESS, RENDER, SPIN } =
  SETTINGS;

/**
 * Creates a lil-gui panel bound to the settings in constants.js. Values read
 * every frame apply on their own; the rest are pushed with applySettings.
 * "Copy settings" puts the current values on the clipboard as JSON, ready to
 * paste back into constants.js.
 * @param {Function} applySettings - Pushes all settings to materials and uniforms
 * @returns {GUI}
 */
export function createDebugPanel(applySettings) {
  const gui = new GUI({ title: "SpinCube" });
  gui.onChange(applySettings);

  const glass = gui.addFolder("Glass");
  glass.add(GLASS, "roughness", 0, 0.5, 0.005);
  glass.add(GLASS, "thickness", 0, 4, 0.05);
  glass.add(GLASS, "ior", 1, 2.4, 0.01);
  glass.add(GLASS, "dispersion", 0, 20, 0.1);
  glass.add(GLASS, "iridescence", 0, 1, 0.01);
  glass.add(GLASS, "attenuationDistance", 0.2, 20, 0.1);
  glass.addColor(GLASS, "attenuationColor");
  glass.add(GLASS, "envMapIntensity", 0, 4, 0.05);

  const core = gui.addFolder("Core");
  core.addColor(CORE, "faceColor");
  core.add(CORE, "faceGlow", 0, 10, 0.1);
  core.add(CORE, "chargeGlow", 0, 20, 0.1);
  core.addColor(CORE, "rimColor");
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

  const post = gui.addFolder("Post");
  post.add(RENDER, "exposure", 0.2, 3, 0.05);
  post.add(BLOOM, "strength", 0, 3, 0.05).name("bloom strength");
  post.add(BLOOM, "radius", 0, 1.5, 0.05).name("bloom radius");
  post.add(BLOOM, "threshold", 0, 3, 0.05).name("bloom threshold");
  post.add(FINISH, "vignette", 0, 1, 0.01);
  post.add(FINISH, "grain", 0, 0.2, 0.005);
  post.add(FINISH, "aberration", 0, 0.02, 0.0005);

  gui.add({ copy: () => copySettings() }, "copy").name("Copy settings");

  for (const folder of gui.folders) folder.close();
  return gui;
}

function copySettings() {
  const json = JSON.stringify(
    { GLASS, CORE, SPIN, CORE_SPRING, PRESS, BACKDROP, DUST, BLOOM, FINISH, RENDER },
    null,
    2
  );
  navigator.clipboard.writeText(json).then(
    () => console.info("Settings copied to the clipboard"),
    () => console.info(json)
  );
}
