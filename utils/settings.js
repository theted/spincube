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

/**
 * The values in `current` that differ from `base`, nested the same way, in
 * the shape applyOverrides takes. Groups with nothing changed are left out.
 * @param {Object} current - e.g. { CORE: { faceGlow: 2, size: 0.92 } }
 * @param {Object} base - e.g. { CORE: { faceGlow: 1.3, size: 0.92 } }
 * @returns {Object} e.g. { CORE: { faceGlow: 2 } }
 */
export function diffSettings(current, base) {
  const changes = {};
  for (const [key, value] of Object.entries(current)) {
    if (isPlainObject(value) && isPlainObject(base?.[key])) {
      const nested = diffSettings(value, base[key]);
      if (Object.keys(nested).length > 0) changes[key] = nested;
    } else if (value !== base?.[key]) {
      changes[key] = value;
    }
  }
  return changes;
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
