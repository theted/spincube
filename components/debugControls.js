import { BACKDROP, CORE } from "../constants.js";
import { copyText } from "./debugSettings.js";

// Small building blocks for the debug panel's lil-gui controls

/**
 * A "preset" dropdown that sets several CORE values at once. It starts on no
 * preset, since the values may have been changed since. lil-gui calls the
 * panel's onChange before this one's, so it commits the new values itself.
 * The release flash follows the glow colour.
 * @param {GUI} folder
 * @param {Object<string, Object>} presets - CORE values by preset name
 * @param {Function} commit - Applies and saves the settings
 * @param {Function} refresh - Updates every control to its value
 */
export function addValuePreset(folder, presets, commit, refresh) {
  const NONE = "—";
  const choice = { preset: NONE };
  folder.add(choice, "preset", [NONE, ...Object.keys(presets)]).onChange((key) => {
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
