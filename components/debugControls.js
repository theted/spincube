import { matchingPreset } from "../utils/settings.js";
import { copyText } from "./debugSettings.js";

// Small building blocks for the debug panel's lil-gui controls

// What a preset dropdown shows when the settings match none of its presets
export const CUSTOM = "custom";

/**
 * A dropdown of presets that always shows the one the settings match now,
 * or "custom" when none does. Picking one calls `load` with its name. The
 * panel refreshes it after every change.
 * @param {GUI} folder
 * @param {string} label
 * @param {string[]} names
 * @param {Function} matching - Returns the name of the preset the settings match, if any
 * @param {Function} load - Applies the named preset
 * @returns {Controller} The dropdown; give .options() [CUSTOM, ...names] to change the list
 */
export function addPresetPicker(folder, label, names, matching, load) {
  // lil-gui reads and writes the value through these
  const state = {
    get preset() {
      return matching() ?? CUSTOM;
    },
    set preset(name) {
      if (name !== CUSTOM) load(name);
    },
  };
  return folder.add(state, "preset", [CUSTOM, ...names]).name(label);
}

/**
 * A preset dropdown that sets a few values of one settings group at once,
 * e.g. the S's glow in CORE.
 * @param {GUI} folder
 * @param {Object} target - The settings group, e.g. CORE
 * @param {Object<string, Object>} presets - Values by preset name
 * @param {Function} commit - Applies and saves the settings
 * @param {Function} refresh - Updates every control to its value
 * @param {Function} [onLoad] - Called with a preset's values once they're set
 * @returns {Controller}
 */
export function addValuePreset(folder, target, presets, commit, refresh, onLoad) {
  const load = (name) => {
    Object.assign(target, presets[name]);
    onLoad?.(presets[name]);
    commit();
    refresh();
  };
  return addPresetPicker(folder, "preset", Object.keys(presets), () => matchingPreset(presets, target), load);
}

/**
 * A button that copies some text, and says so on its label for a moment.
 * @param {GUI} gui
 * @param {string} label
 * @param {Function} text - Returns the text to copy
 */
export function addCopyButton(gui, label, text) {
  const copy = async () => {
    if (!(await copyText(text()))) return;
    button.name("Copied ✓");
    setTimeout(() => button.name(label), 1500);
  };
  const button = gui.add({ copy }, "copy").name(label);
}

/**
 * A small corner button that shows the hidden panel again.
 * @param {Function} onClick
 * @returns {HTMLButtonElement}
 */
export function createRevealButton(onClick) {
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
