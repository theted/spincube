import { addCopyButton } from "./debugControls.js";

const NONE = "—";
const DEFAULTS = "Defaults";

/**
 * The Presets folder: whole looks saved in localStorage, plus the defaults.
 * Picking one loads it. "Save current as preset" keeps everything set now
 * under the name above it (an existing name is replaced, after asking).
 * "Copy preset" copies the picked preset's changes from the defaults, ready
 * to paste into constants.js or pass as overrides; with none picked, it
 * copies the current changes.
 * @param {GUI} gui
 * @param {Object} store - From createSettingsStore
 * @param {Function} commit - Applies and saves the settings
 * @param {Function} refresh - Updates every control to its value
 * @returns {GUI} The folder
 */
export function addPresetFolder(gui, store, commit, refresh) {
  const { presets } = store;
  const folder = gui.addFolder("Presets");
  const names = () => [NONE, DEFAULTS, ...presets.names()];
  const freeName = () => {
    const taken = presets.names();
    let n = taken.length + 1;
    while (taken.includes(`Preset ${n}`)) n++;
    return `Preset ${n}`;
  };
  const state = { preset: NONE, name: freeName() };

  const load = (name) => {
    if (name === NONE) return;
    try {
      if (name === DEFAULTS) store.reset();
      else presets.load(name);
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
    if (!name || name === NONE || name === DEFAULTS) return;
    if (presets.names().includes(name) && !window.confirm(`Replace the preset "${name}"?`)) return;
    presets.save(name);
    showPresets(name);
    state.name = freeName();
    refresh();
  };
  const remove = () => {
    if (!presets.names().includes(state.preset)) return;
    if (!window.confirm(`Delete the preset "${state.preset}"?`)) return;
    presets.remove(state.preset);
    showPresets(NONE);
  };

  folder.add(state, "name");
  folder.add({ save }, "save").name("Save current as preset");
  addCopyButton(folder, "Copy preset", () => {
    if (state.preset === DEFAULTS) return "{}";
    return presets.names().includes(state.preset) ? presets.changes(state.preset) : store.changes();
  });
  addCopyButton(folder, "Copy all presets", presets.all);
  folder.add({ remove }, "remove").name("Delete preset");
  return folder;
}
