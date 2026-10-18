import * as SETTINGS from "../constants.js";
import { applyOverrides, diffSettings } from "../utils/settings.js";

// The setting groups the debug panel tunes, copies and saves
const GROUPS = ["GLASS", "CORE", "SPIN", "CORE_SPRING", "PRESS", "PULSE", "BACKDROP", "DUST", "BLOOM", "FINISH", "RENDER"];
const STORAGE_KEY = "spincube:settings";

/** @returns {Object} A deep copy of the tuned groups as they are now */
const snapshot = () => structuredClone(Object.fromEntries(GROUPS.map((group) => [group, SETTINGS[group]])));

const countValues = (changes) =>
  Object.values(changes).reduce((n, v) => n + (typeof v === "object" ? countValues(v) : 1), 0);

/**
 * Keeps the panel's changes across reloads in localStorage. Only the changes
 * from the defaults are kept, so anything left alone follows constants.js.
 * Storage can be unavailable (private windows, blocked site data); the panel
 * then works for the visit only.
 * @returns {Object} The store: restore, save, reset, changes, all, count
 */
export function createSettingsStore() {
  const defaults = snapshot();
  const changes = () => diffSettings(snapshot(), defaults);

  const store = {
    /** Applies the saved changes; drops them if they no longer fit the settings */
    restore() {
      try {
        applyOverrides(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"));
      } catch {
        store.reset();
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(changes()));
      } catch {
        // Not saved; the values still apply until the page is left
      }
    },
    reset() {
      applyOverrides(structuredClone(defaults));
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing was saved
      }
    },
    /** @returns {string} The changes from the defaults, as JSON for applyOverrides */
    changes: () => JSON.stringify(changes(), null, 2),
    /** @returns {string} Every tuned value, as JSON */
    all: () => JSON.stringify(snapshot(), null, 2),
    /** @returns {number} How many values differ from the defaults */
    count: () => countValues(changes()),
  };
  return store;
}

/**
 * Puts text on the clipboard. Where that's refused, it's shown in a prompt
 * to copy by hand instead.
 * @param {string} text
 * @returns {Promise<boolean>} Whether it reached the clipboard
 */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt("Copy the settings:", text);
    return false;
  }
}
