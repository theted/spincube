// Overrides for the grouped settings in constants.js, used when mounting.

import * as SETTINGS from "../constants.js";

/**
 * Merges partial setting groups into the shared settings in constants.js.
 * Only the grouped objects (CAMERA, GLASS, DUST, ...) can be overridden. They
 * are module-level, so a change applies to every cube on the page.
 * Unknown groups or keys throw, so a typo fails loudly instead of silently.
 * @param {Object} [overrides] - e.g. { CAMERA: { distance: 5 }, SPIN: { idle: { y: 0.2 } } }
 */
export function applyOverrides(overrides = {}) {
  for (const [group, values] of Object.entries(overrides)) {
    const target = SETTINGS[group];
    if (!isPlainObject(target)) {
      throw new Error(`spincube: unknown settings group "${group}"`);
    }
    deepAssign(target, values, group);
  }
}

function deepAssign(target, values, path) {
  for (const [key, value] of Object.entries(values)) {
    if (!(key in target)) {
      throw new Error(`spincube: unknown setting "${path}.${key}"`);
    }
    if (isPlainObject(target[key]) && isPlainObject(value)) {
      deepAssign(target[key], value, `${path}.${key}`);
    } else {
      target[key] = value;
    }
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
