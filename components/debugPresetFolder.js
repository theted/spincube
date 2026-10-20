import { addCopyButton } from "./debugControls.js";
import { LOOK_PRESETS } from "./debugPresets.js";

const NONE = "—";
const DEFAULTS = "Defaults";
// Always there, ahead of the saved presets
const BUILT_IN = [DEFAULTS, ...Object.keys(LOOK_PRESETS)];

/**
 * The Presets folder: the defaults and built-in looks (debugPresets.js),
 * then whole looks saved in localStorage. Picking one loads it. "Save
 * current as preset" keeps everything set now under the name above it (an
 * existing name is replaced, after asking). "Copy preset" copies the picked
 * preset's changes from the defaults, ready to paste into constants.js or
 * pass as overrides; with none picked, it copies the current changes.
 * @param {GUI} gui
 * @param {Object} store - From createSettingsStore
 * @param {Function} commit - Applies and saves the settings
 * @param {Function} refresh - Updates every control to its value
 * @returns {GUI} The folder
 */
export function addPresetFolder(gui, store, commit, refresh) {
  const { presets } = store;
  const folder = gui.addFolder("Presets");
  const names = () => [NONE, ...BUILT_IN, ...presets.names()];
  const isSaved = (name) => presets.names().includes(name);
  const freeName = () => {
    const taken = presets.names();
    let n = taken.length + 1;
    while (taken.includes(`Preset ${n}`)) n++;
    return `Preset ${n}`;
  };
  const state = { preset: NONE, name: freeName() };

  // A saved preset wins over a built-in look of the same name: it's yours
  const load = (name) => {
    if (name === NONE) return;
    try {
      if (isSaved(name)) presets.load(name);
      else if (name === DEFAULTS) store.reset();
      else store.load(LOOK_PRESETS[name]);
    } catch (error) {
      window.alert(`"${name}" no longer fits the settings, so the defaults are back.\n${error.message}`);
      store.reset();
    }
    commit();
    refresh();
  };
  const picker = folder.add(state, "preset", names()).name("load").onChange(load);
  const showPresets = (picked) => {
    state.preset = picked;
    picker.options(names());
  };

  const save = () => {
    const name = state.name.trim();
    if (!name || name === NONE) return;
    if (BUILT_IN.includes(name)) {
      window.alert(`"${name}" is a built-in look; pick another name.`);
      return;
    }
    if (isSaved(name) && !window.confirm(`Replace the preset "${name}"?`)) return;
    presets.save(name);
    showPresets(name);
    state.name = freeName();
    refresh();
  };
  const remove = () => {
    if (!isSaved(state.preset)) return;
    if (!window.confirm(`Delete the preset "${state.preset}"?`)) return;
    presets.remove(state.preset);
    showPresets(NONE);
  };
  const copied = () => {
    const name = state.preset;
    if (isSaved(name)) return presets.changes(name);
    if (name === DEFAULTS) return "{}";
    return LOOK_PRESETS[name] ? JSON.stringify(LOOK_PRESETS[name], null, 2) : store.changes();
  };

  folder.add(state, "name");
  folder.add({ save }, "save").name("Save current as preset");
  addCopyButton(folder, "Copy preset", copied);
  addCopyButton(folder, "Copy all presets", presets.all);
  folder.add({ remove }, "remove").name("Delete preset");
  return folder;
}
