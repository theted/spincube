import * as SETTINGS from "../constants.js";
import { applyOverrides, diffSettings, mergeSettings } from "../utils/settings.js";

// The setting groups the debug panel tunes, copies and saves
const GROUPS = ["SOLID", "GLASS", "CORE", "SPIN", "CORE_SPRING", "PRESS", "FLOAT", "PULSE", "BACKDROP", "DUST", "BLOOM", "FINISH", "RENDER"];
const SETTINGS_KEY = "spincube:settings";
const PRESETS_KEY = "spincube:presets";

/** @returns {Object} A deep copy of the tuned groups as they are now */
const snapshot = () => structuredClone(Object.fromEntries(GROUPS.map((group) => [group, SETTINGS[group]])));

const countValues = (changes) =>
  Object.values(changes).reduce((n, v) => n + (typeof v === "object" ? countValues(v) : 1), 0);

const toJSON = (value) => JSON.stringify(value, null, 2);

// Storage can be unavailable (private windows, blocked site data); the panel
// then works for the visit only
function readStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not kept; it still applies until the page is left
  }
}

/**
 * Keeps the panel's work in localStorage:
 * - the current changes, as the difference from the defaults, so anything
 *   left alone follows constants.js and a reload picks up where you were;
 * - named presets, each every tuned value, so loading one brings back
 *   exactly that look, whatever the defaults are by then.
 * Built-in looks join the saved presets, listed first. They are overrides
 * of the defaults, and can't be replaced or deleted.
 * @param {Object} [options]
 * @param {Object<string, Object>} [options.looks] - Built-in looks by name, as overrides
 * @returns {Object} The store
 */
export function createSettingsStore({ looks = {} } = {}) {
  const defaults = snapshot();
  const changes = () => diffSettings(snapshot(), defaults);
  const saved = () => readStored(PRESETS_KEY, {});
  const isBuiltIn = (name) => Object.hasOwn(looks, name);
  const find = (name) => (isBuiltIn(name) ? looks[name] : saved()[name]);
  const names = () => [...Object.keys(looks), ...Object.keys(saved()).filter((name) => !isBuiltIn(name))];

  const store = {
    /** Applies the saved changes; drops them if they no longer fit the settings */
    restore() {
      try {
        applyOverrides(readStored(SETTINGS_KEY, {}));
      } catch {
        store.reset();
      }
    },
    save: () => writeStored(SETTINGS_KEY, changes()),
    reset() {
      applyOverrides(structuredClone(defaults));
      writeStored(SETTINGS_KEY, undefined);
    },
    /** @returns {string} The changes from the defaults, as JSON for applyOverrides */
    changes: () => toJSON(changes()),
    /** @returns {string} Every tuned value, as JSON */
    all: () => toJSON(snapshot()),
    /** @returns {number} How many values differ from the defaults */
    count: () => countValues(changes()),

    presets: {
      /** @returns {string[]} The built-in looks, then the saved presets, oldest first */
      names,
      isBuiltIn,
      /** Keeps every tuned value as it is now, under `name` */
      save: (name) => writeStored(PRESETS_KEY, { ...saved(), [name]: snapshot() }),
      remove(name) {
        const { [name]: _removed, ...rest } = saved();
        writeStored(PRESETS_KEY, rest);
      },
      /**
       * Brings back a preset's look. Values it doesn't have keep their
       * defaults. Throws if it has settings that no longer exist.
       */
      load(name) {
        applyOverrides(structuredClone(defaults));
        applyOverrides(structuredClone(find(name)));
      },
      /** @returns {string|undefined} The first preset the settings match exactly, if any */
      matching() {
        const now = snapshot();
        return names().find(
          (name) => Object.keys(diffSettings(now, mergeSettings(defaults, find(name)))).length === 0
        );
      },
      /** @returns {string} Every saved preset's changes from the defaults, by name, as JSON */
      all: () =>
        toJSON(
          Object.fromEntries(
            Object.entries(saved()).map(([name, values]) => [name, diffSettings(values, defaults)])
          )
        ),
    },
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
