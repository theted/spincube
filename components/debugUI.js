import * as THREE from "three";
import * as CONST from "../constants.js";

/**
 * Creates a debug UI panel for adjusting constants
 * @param {Object} state - Application state
 * @param {THREE.Scene} state.scene - The scene
 * @param {THREE.Mesh} state.cube - The cube mesh
 * @param {THREE.ShaderMaterial} state.skyShaderMaterial - Sky shader material
 * @param {Function} state.updateEnvironmentMap - Function to update environment map
 * @returns {Object} Debug UI controls and functions
 */
export function createDebugUI(state) {
  if (!CONST.DEBUG) return { update: () => {} };

  // Create container
  const container = document.createElement("div");
  container.id = "debug-panel";
  container.style.position = "absolute";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  container.style.color = "white";
  container.style.padding = "10px";
  container.style.borderRadius = "5px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "12px";
  container.style.width = "250px";
  container.style.maxHeight = "80vh";
  container.style.overflowY = "auto";
  container.style.zIndex = "1000";
  container.style.userSelect = "none";
  document.body.appendChild(container);

  // Add title
  const title = document.createElement("h2");
  title.textContent = "Debug Controls";
  title.style.margin = "0 0 10px 0";
  title.style.fontSize = "16px";
  title.style.textAlign = "center";
  container.appendChild(title);

  // Create sections
  const sections = {
    material: createSection("Material", container),
    cube: createSection("Cube", container),
    animation: createSection("Animation", container),
    shader: createSection("Shader", container),
  };

  // Store all controls for updating
  const controls = {};

  // Material controls
  controls.useMaterial = createToggle(
    "Material Type",
    CONST.USE_GLASS_MATERIAL,
    (value) => {
      // Replace the cube's material
      if (value) {
        state.cube.material = createGlassMaterial();
      } else {
        state.cube.material = createMetallicMaterial();
      }
      // Update environment map to reflect changes
      state.updateEnvironmentMap();
    },
    ["Metallic", "Glass"],
    sections.material
  );

  controls.metalness = createSlider(
    "Metalness",
    CONST.METALNESS,
    0,
    1,
    0.01,
    (value) => {
      if (!CONST.USE_GLASS_MATERIAL && state.cube.material) {
        state.cube.material.metalness = value;
        state.updateEnvironmentMap();
      }
    },
    sections.material
  );

  controls.roughness = createSlider(
    "Roughness",
    CONST.ROUGHNESS,
    0,
    1,
    0.01,
    (value) => {
      if (state.cube.material) {
        state.cube.material.roughness = value;
        state.updateEnvironmentMap();
      }
    },
    sections.material
  );

  controls.envMapIntensity = createSlider(
    "Env Map Intensity",
    CONST.ENV_MAP_INTENSITY,
    0,
    5,
    0.1,
    (value) => {
      if (state.cube.material) {
        state.cube.material.envMapIntensity = value;
        state.updateEnvironmentMap();
      }
    },
    sections.material
  );

  // Cube controls
  controls.cubeSize = createSlider(
    "Cube Size",
    CONST.CUBE_SIZE,
    1,
    5,
    0.1,
    (value) => {
      // Can't change geometry directly, would need to recreate the cube
      // This is just for demonstration
    },
    sections.cube
  );

  controls.spinSpeedX = createSlider(
    "Spin Speed X",
    CONST.INITIAL_SPIN_SPEED.x,
    0,
    0.01,
    0.001,
    (value) => {
      state.initialSpinSpeed.x = value;
    },
    sections.cube
  );

  controls.spinSpeedY = createSlider(
    "Spin Speed Y",
    CONST.INITIAL_SPIN_SPEED.y,
    0,
    0.01,
    0.001,
    (value) => {
      state.initialSpinSpeed.y = value;
    },
    sections.cube
  );

  // Animation controls
  controls.bounceDuration = createSlider(
    "Bounce Duration",
    CONST.BOUNCE_DURATION,
    0.1,
    2,
    0.1,
    (value) => {
      // This will affect the next bounce
    },
    sections.animation
  );

  controls.bounceMaxScale = createSlider(
    "Bounce Max Scale",
    CONST.BOUNCE_MAX_SCALE,
    1,
    2,
    0.1,
    (value) => {
      // This will affect the next bounce
    },
    sections.animation
  );

  controls.springConstant = createSlider(
    "Spring Constant",
    CONST.K_SPRING,
    0.01,
    0.2,
    0.01,
    (value) => {
      // This will affect the next interaction
    },
    sections.animation
  );

  controls.dampingFactor = createSlider(
    "Damping Factor",
    CONST.K_DAMPING,
    0.01,
    0.5,
    0.01,
    (value) => {
      // This will affect the next interaction
    },
    sections.animation
  );

  // Shader controls
  controls.useIntenseBackground = createToggle(
    "Background Style",
    CONST.USE_INTENSE_BACKGROUND,
    (value) => {
      state.skyShaderMaterial.uniforms.u_useIntenseBackground.value = value;
      state.updateEnvironmentMap();
    },
    ["Mellow", "Intense"],
    sections.shader
  );

  controls.warpAmount = createSlider(
    "Warp Amount",
    CONST.WARP_AMOUNT,
    0,
    0.2,
    0.01,
    (value) => {
      state.skyShaderMaterial.uniforms.u_warpAmount.value = value;
      state.updateEnvironmentMap();
    },
    sections.shader
  );

  controls.warpFrequency = createSlider(
    "Warp Frequency",
    CONST.WARP_FREQUENCY,
    1,
    10,
    0.5,
    (value) => {
      state.skyShaderMaterial.uniforms.u_warpFrequency.value = value;
      state.updateEnvironmentMap();
    },
    sections.shader
  );

  controls.warpSpeed = createSlider(
    "Warp Speed",
    CONST.WARP_SPEED,
    0,
    0.5,
    0.01,
    (value) => {
      state.skyShaderMaterial.uniforms.u_warpSpeed.value = value;
      state.updateEnvironmentMap();
    },
    sections.shader
  );

  controls.checkerScale = createSlider(
    "Checker Scale",
    CONST.CHECKER_SCALE,
    5,
    50,
    1,
    (value) => {
      state.skyShaderMaterial.uniforms.u_checkerScale.value = value;
      state.updateEnvironmentMap();
    },
    sections.shader
  );

  // Add a reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset All";
  resetButton.style.width = "100%";
  resetButton.style.padding = "8px";
  resetButton.style.marginTop = "10px";
  resetButton.style.backgroundColor = "#555";
  resetButton.style.border = "none";
  resetButton.style.borderRadius = "4px";
  resetButton.style.color = "white";
  resetButton.style.cursor = "pointer";
  resetButton.addEventListener("click", () => {
    // Reset all controls to their default values
    for (const key in controls) {
      if (controls[key].reset) {
        controls[key].reset();
      }
    }
    // Update environment map
    state.updateEnvironmentMap();
  });
  container.appendChild(resetButton);

  // Add a toggle button to show/hide the panel
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Hide Panel";
  toggleButton.style.position = "absolute";
  toggleButton.style.top = "10px";
  toggleButton.style.right = "270px";
  toggleButton.style.padding = "5px 10px";
  toggleButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  toggleButton.style.color = "white";
  toggleButton.style.border = "none";
  toggleButton.style.borderRadius = "5px";
  toggleButton.style.cursor = "pointer";
  toggleButton.style.zIndex = "1000";
  document.body.appendChild(toggleButton);

  let isPanelVisible = true;
  toggleButton.addEventListener("click", () => {
    isPanelVisible = !isPanelVisible;
    container.style.display = isPanelVisible ? "block" : "none";
    toggleButton.textContent = isPanelVisible ? "Hide Panel" : "Show Panel";
  });

  return {
    controls,
    update: () => {
      // Update any controls that need continuous updating
    },
  };
}

/**
 * Creates a section in the debug panel
 * @param {string} title - Section title
 * @param {HTMLElement} parent - Parent element
 * @returns {HTMLElement} The section element
 */
function createSection(title, parent) {
  const section = document.createElement("div");
  section.style.marginBottom = "15px";

  const sectionTitle = document.createElement("h3");
  sectionTitle.textContent = title;
  sectionTitle.style.margin = "0 0 5px 0";
  sectionTitle.style.fontSize = "14px";
  sectionTitle.style.borderBottom = "1px solid #555";
  sectionTitle.style.paddingBottom = "3px";

  section.appendChild(sectionTitle);
  parent.appendChild(section);

  return section;
}

/**
 * Creates a slider control
 * @param {string} label - Control label
 * @param {number} initialValue - Initial value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step value
 * @param {Function} onChange - Change handler
 * @param {HTMLElement} parent - Parent element
 * @returns {Object} The slider control
 */
function createSlider(label, initialValue, min, max, step, onChange, parent) {
  const container = document.createElement("div");
  container.style.marginBottom = "8px";

  const labelElement = document.createElement("div");
  labelElement.style.display = "flex";
  labelElement.style.justifyContent = "space-between";
  labelElement.style.marginBottom = "2px";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = label;

  const valueSpan = document.createElement("span");
  valueSpan.textContent = initialValue.toFixed(2);

  labelElement.appendChild(nameSpan);
  labelElement.appendChild(valueSpan);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = initialValue;
  slider.style.width = "100%";
  slider.style.margin = "0";

  slider.addEventListener("input", () => {
    const value = parseFloat(slider.value);
    valueSpan.textContent = value.toFixed(2);
    onChange(value);
  });

  container.appendChild(labelElement);
  container.appendChild(slider);
  parent.appendChild(container);

  return {
    element: container,
    getValue: () => parseFloat(slider.value),
    setValue: (value) => {
      slider.value = value;
      valueSpan.textContent = value.toFixed(2);
      onChange(value);
    },
    reset: () => {
      slider.value = initialValue;
      valueSpan.textContent = initialValue.toFixed(2);
      onChange(initialValue);
    },
  };
}

/**
 * Creates a toggle control
 * @param {string} label - Control label
 * @param {boolean} initialValue - Initial value
 * @param {Function} onChange - Change handler
 * @param {Array<string>} labels - Labels for false/true states
 * @param {HTMLElement} parent - Parent element
 * @returns {Object} The toggle control
 */
function createToggle(label, initialValue, onChange, labels, parent) {
  const container = document.createElement("div");
  container.style.marginBottom = "8px";

  const labelElement = document.createElement("div");
  labelElement.style.display = "flex";
  labelElement.style.justifyContent = "space-between";
  labelElement.style.marginBottom = "2px";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = label;

  const valueSpan = document.createElement("span");
  valueSpan.textContent = initialValue ? labels[1] : labels[0];

  labelElement.appendChild(nameSpan);
  labelElement.appendChild(valueSpan);

  const toggle = document.createElement("div");
  toggle.style.width = "100%";
  toggle.style.height = "24px";
  toggle.style.backgroundColor = "#555";
  toggle.style.borderRadius = "12px";
  toggle.style.position = "relative";
  toggle.style.cursor = "pointer";

  const toggleButton = document.createElement("div");
  toggleButton.style.width = "50%";
  toggleButton.style.height = "100%";
  toggleButton.style.backgroundColor = "#888";
  toggleButton.style.borderRadius = "12px";
  toggleButton.style.position = "absolute";
  toggleButton.style.left = initialValue ? "50%" : "0";
  toggleButton.style.transition = "left 0.2s";

  const leftLabel = document.createElement("div");
  leftLabel.textContent = labels[0];
  leftLabel.style.position = "absolute";
  leftLabel.style.left = "10px";
  leftLabel.style.top = "50%";
  leftLabel.style.transform = "translateY(-50%)";
  leftLabel.style.color = initialValue ? "#fff" : "#000";
  leftLabel.style.fontSize = "10px";
  leftLabel.style.fontWeight = "bold";

  const rightLabel = document.createElement("div");
  rightLabel.textContent = labels[1];
  rightLabel.style.position = "absolute";
  rightLabel.style.right = "10px";
  rightLabel.style.top = "50%";
  rightLabel.style.transform = "translateY(-50%)";
  rightLabel.style.color = initialValue ? "#000" : "#fff";
  rightLabel.style.fontSize = "10px";
  rightLabel.style.fontWeight = "bold";

  toggle.appendChild(toggleButton);
  toggle.appendChild(leftLabel);
  toggle.appendChild(rightLabel);

  let value = initialValue;

  toggle.addEventListener("click", () => {
    value = !value;
    toggleButton.style.left = value ? "50%" : "0";
    valueSpan.textContent = value ? labels[1] : labels[0];
    leftLabel.style.color = value ? "#fff" : "#000";
    rightLabel.style.color = value ? "#000" : "#fff";
    onChange(value);
  });

  container.appendChild(labelElement);
  container.appendChild(toggle);
  parent.appendChild(container);

  return {
    element: container,
    getValue: () => value,
    setValue: (newValue) => {
      value = newValue;
      toggleButton.style.left = value ? "50%" : "0";
      valueSpan.textContent = value ? labels[1] : labels[0];
      leftLabel.style.color = value ? "#fff" : "#000";
      rightLabel.style.color = value ? "#000" : "#fff";
      onChange(value);
    },
    reset: () => {
      value = initialValue;
      toggleButton.style.left = value ? "50%" : "0";
      valueSpan.textContent = value ? labels[1] : labels[0];
      leftLabel.style.color = value ? "#fff" : "#000";
      rightLabel.style.color = value ? "#000" : "#fff";
      onChange(value);
    },
  };
}

/**
 * Creates a glass material for the cube
 * @returns {THREE.MeshPhysicalMaterial} The glass material
 */
function createGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: CONST.GLASS_COLOR,
    metalness: CONST.GLASS_METALNESS,
    roughness: CONST.GLASS_ROUGHNESS,
    transmission: CONST.GLASS_TRANSMISSION,
    thickness: CONST.GLASS_THICKNESS,
    ior: CONST.GLASS_IOR,
    envMapIntensity: CONST.GLASS_ENV_MAP_INTENSITY,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Creates a metallic material for the cube
 * @returns {THREE.MeshPhysicalMaterial} The metallic material
 */
function createMetallicMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: CONST.MATERIAL_COLOR,
    metalness: CONST.METALNESS,
    roughness: CONST.ROUGHNESS,
    envMapIntensity: CONST.ENV_MAP_INTENSITY,
    clearcoat: CONST.CLEARCOAT,
    clearcoatRoughness: CONST.CLEARCOAT_ROUGHNESS,
    reflectivity: CONST.REFLECTIVITY,
  });
}
