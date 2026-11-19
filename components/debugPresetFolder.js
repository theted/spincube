import { CUSTOM, addCopyButton, addPresetPicker } from "./debugControls.js";

/**
 * The Presets folder: whole looks. The built-in ones (LOOKS in
 * debugPresets.js) come first, then any saved in localStorage. "look" shows
 * the one the settings match now, or "custom" once anything is changed, and
 * picking one loads it. "Save current as preset" keeps everything set now
 * under the name above it (a saved name is replaced, after asking; a
 * built-in one is kept). "Copy all presets" copies the saved presets'
 * changes from the defaults, ready to paste into debugPresets.js or pass as
 * overrides. "Delete preset" deletes the saved look showing.
 * @param {GUI} gui
 * @param {Object} store - From createSettingsStore
 * @param {Function} commit - Applies and saves the settings
 * @param {Function} refresh - Updates every control to its value
 * @returns {GUI} The folder
 */
export function addPresetFolder(gui, store, commit, refresh) {
  const { presets } = store;
  const folder = gui.addFolder("Presets");
  const freeName = () => {
    const taken = presets.names();
    let n = 1;
    while (taken.includes(`Preset ${n}`)) n++;
    return `Preset ${n}`;
  };
  const state = { name: freeName() };

  const load = (name) => {
    try {
      presets.load(name);
    } catch (error) {
      window.alert(`"${name}" no longer fits the settings, so the defaults are back.\n${error.message}`);
      store.reset();
    }
    commit();
    refresh();
  };
  const picker = addPresetPicker(folder, "look", presets.names(), presets.matching, load);
  const showPresets = () => picker.options([CUSTOM, ...presets.names()]);

  const save = () => {
    const name = state.name.trim();
    if (!name || name === CUSTOM) return;
    if (presets.isBuiltIn(name)) {
      window.alert(`"${name}" is a built-in look. Save under another name.`);
      return;
    }
    if (presets.names().includes(name) && !window.confirm(`Replace the preset "${name}"?`)) return;
    presets.save(name);
    showPresets();
    state.name = freeName();
    refresh();
  };
  const remove = () => {
    const name = presets.matching();
    if (!name || presets.isBuiltIn(name)) return;
    if (!window.confirm(`Delete the preset "${name}"?`)) return;
    presets.remove(name);
    showPresets();
  };

  folder.add(state, "name");
  folder.add({ save }, "save").name("Save current as preset");
  addCopyButton(folder, "Copy all presets", presets.all);
  folder.add({ remove }, "remove").name("Delete preset");
  return folder;
}
