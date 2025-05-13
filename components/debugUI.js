/**
 * Debug UI component for SpinCube
 * Provides controls for adjusting constants in real-time
 */

import * as CONST from "../constants.js";

/**
 * Creates a debug UI panel for adjusting constants
 * @param {Object} state - Application state
 * @returns {Object} Debug UI controls
 */
export function createDebugUI(state) {
  // Only create debug UI if DEBUG is true
  if (!CONST.DEBUG) {
    return null;
  }

  // Create container
  const container = document.createElement("div");
  container.id = "debug-panel";
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  container.style.color = "white";
  container.style.padding = "10px";
  container.style.borderRadius = "5px";
  container.style.fontFamily = "monospace";
  container.style.fontSize = "12px";
  container.style.zIndex = "1000";
  container.style.width = "300px";
  container.style.maxHeight = "80vh";
  container.style.overflowY = "auto";
  container.style.transition = "transform 0.3s ease";
  container.style.transform = "translateX(310px)";

  // Create header
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "10px";
  header.style.borderBottom = "1px solid #555";
  header.style.paddingBottom = "5px";
  container.appendChild(header);

  // Create title
  const title = document.createElement("h3");
  title.textContent = "Debug Controls";
  title.style.margin = "0";
  header.appendChild(title);

  // Create toggle button
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "<<";
  toggleButton.style.backgroundColor = "#444";
  toggleButton.style.border = "none";
  toggleButton.style.color = "white";
  toggleButton.style.padding = "5px 10px";
  toggleButton.style.borderRadius = "3px";
  toggleButton.style.cursor = "pointer";
  header.appendChild(toggleButton);

  // Toggle panel visibility
  let isVisible = false;
  toggleButton.addEventListener("click", () => {
    isVisible = !isVisible;
    container.style.transform = isVisible
      ? "translateX(0)"
      : "translateX(310px)";
    toggleButton.textContent = isVisible ? ">>" : "<<";
  });

  // Create controls container
  const controlsContainer = document.createElement("div");
  container.appendChild(controlsContainer);

  // Add to document
  document.body.appendChild(container);

  // Create controls
  const controls = {};

  // Helper function to create a slider control
  function createSlider(name, min, max, value, step, onChange) {
    const controlGroup = document.createElement("div");
    controlGroup.style.marginBottom = "10px";
    controlsContainer.appendChild(controlGroup);

    const label = document.createElement("label");
    label.textContent = name;
    label.style.display = "block";
    label.style.marginBottom = "5px";
    controlGroup.appendChild(label);

    const sliderContainer = document.createElement("div");
    sliderContainer.style.display = "flex";
    sliderContainer.style.alignItems = "center";
    controlGroup.appendChild(sliderContainer);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.style.flex = "1";
    sliderContainer.appendChild(slider);

    const valueDisplay = document.createElement("span");
    valueDisplay.textContent = value;
    valueDisplay.style.marginLeft = "10px";
    valueDisplay.style.width = "40px";
    valueDisplay.style.textAlign = "right";
    sliderContainer.appendChild(valueDisplay);

    slider.addEventListener("input", () => {
      const newValue = parseFloat(slider.value);
      valueDisplay.textContent = newValue.toFixed(2);
      if (onChange) {
        onChange(newValue);
      }
    });

    return {
      element: controlGroup,
      slider: slider,
      valueDisplay: valueDisplay,
      getValue: () => parseFloat(slider.value),
      setValue: (val) => {
        slider.value = val;
        valueDisplay.textContent = parseFloat(val).toFixed(2);
      },
    };
  }

  // Helper function to create a toggle control
  function createToggle(name, value, onChange) {
    const controlGroup = document.createElement("div");
    controlGroup.style.marginBottom = "10px";
    controlsContainer.appendChild(controlGroup);

    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.cursor = "pointer";
    controlGroup.appendChild(label);

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = value;
    toggle.style.marginRight = "10px";
    label.appendChild(toggle);

    const text = document.createElement("span");
    text.textContent = name;
    label.appendChild(text);

    toggle.addEventListener("change", () => {
      if (onChange) {
        onChange(toggle.checked);
      }
    });

    return {
      element: controlGroup,
      toggle: toggle,
      getValue: () => toggle.checked,
      setValue: (val) => {
        toggle.checked = val;
      },
    };
  }

  // Create section for cube appearance
  const appearanceSection = document.createElement("div");
  appearanceSection.style.marginBottom = "15px";
  appearanceSection.style.borderBottom = "1px solid #555";
  appearanceSection.style.paddingBottom = "10px";
  controlsContainer.appendChild(appearanceSection);

  const appearanceTitle = document.createElement("h4");
  appearanceTitle.textContent = "Cube Appearance";
  appearanceTitle.style.margin = "5px 0";
  appearanceSection.appendChild(appearanceTitle);

  // Material toggle
  controls.useMaterial = createToggle(
    "Use Glass Material",
    CONST.USE_GLASS_MATERIAL,
    (value) => {
      CONST.USE_GLASS_MATERIAL = value;
      // Reload page to apply material change
      if (confirm("Changing material requires a page reload. Reload now?")) {
        window.location.reload();
      }
    }
  );
  appearanceSection.appendChild(controls.useMaterial.element);

  // Metalness slider
  controls.metalness = createSlider(
    "Metalness",
    0,
    1,
    CONST.METALNESS,
    0.01,
    (value) => {
      CONST.METALNESS = value;
      // Find the cube mesh and update its material
      if (state.cube && state.cube.children && state.cube.children.length > 0) {
        const cubeMesh = state.cube.children[0];
        if (cubeMesh && cubeMesh.material) {
          cubeMesh.material.metalness = value;
          cubeMesh.material.needsUpdate = true;
        }
      }
    }
  );
  appearanceSection.appendChild(controls.metalness.element);

  // Roughness slider
  controls.roughness = createSlider(
    "Roughness",
    0,
    1,
    CONST.ROUGHNESS,
    0.01,
    (value) => {
      CONST.ROUGHNESS = value;
      // Find the cube mesh and update its material
      if (state.cube && state.cube.children && state.cube.children.length > 0) {
        const cubeMesh = state.cube.children[0];
        if (cubeMesh && cubeMesh.material) {
          cubeMesh.material.roughness = value;
          cubeMesh.material.needsUpdate = true;
        }
      }
    }
  );
  appearanceSection.appendChild(controls.roughness.element);

  // Environment map intensity slider
  controls.envMapIntensity = createSlider(
    "Env Map Intensity",
    0,
    3,
    CONST.ENV_MAP_INTENSITY,
    0.1,
    (value) => {
      CONST.ENV_MAP_INTENSITY = value;
      // Find the cube mesh and update its material
      if (state.cube && state.cube.children && state.cube.children.length > 0) {
        const cubeMesh = state.cube.children[0];
        if (cubeMesh && cubeMesh.material) {
          cubeMesh.material.envMapIntensity = value;
          cubeMesh.material.needsUpdate = true;
        }
      }
    }
  );
  appearanceSection.appendChild(controls.envMapIntensity.element);

  // Cube size slider
  controls.cubeSize = createSlider(
    "Cube Size",
    0.5,
    2,
    CONST.CUBE_SIZE,
    0.1,
    (value) => {
      CONST.CUBE_SIZE = value;
      // Reload page to apply size change
      if (confirm("Changing cube size requires a page reload. Reload now?")) {
        window.location.reload();
      }
    }
  );
  appearanceSection.appendChild(controls.cubeSize.element);

  // Create section for animation
  const animationSection = document.createElement("div");
  animationSection.style.marginBottom = "15px";
  animationSection.style.borderBottom = "1px solid #555";
  animationSection.style.paddingBottom = "10px";
  controlsContainer.appendChild(animationSection);

  const animationTitle = document.createElement("h4");
  animationTitle.textContent = "Animation";
  animationTitle.style.margin = "5px 0";
  animationSection.appendChild(animationTitle);

  // Spin speed X slider
  controls.spinSpeedX = createSlider(
    "Spin Speed X",
    -0.01,
    0.01,
    CONST.INITIAL_SPIN_SPEED.x,
    0.001,
    (value) => {
      CONST.INITIAL_SPIN_SPEED.x = value;
      state.initialSpinSpeed.x = value;
    }
  );
  animationSection.appendChild(controls.spinSpeedX.element);

  // Spin speed Y slider
  controls.spinSpeedY = createSlider(
    "Spin Speed Y",
    -0.01,
    0.01,
    CONST.INITIAL_SPIN_SPEED.y,
    0.001,
    (value) => {
      CONST.INITIAL_SPIN_SPEED.y = value;
      state.initialSpinSpeed.y = value;
    }
  );
  animationSection.appendChild(controls.spinSpeedY.element);

  // Bounce duration slider
  controls.bounceDuration = createSlider(
    "Bounce Duration",
    0.1,
    2,
    CONST.BOUNCE_DURATION,
    0.1,
    (value) => {
      CONST.BOUNCE_DURATION = value;
    }
  );
  animationSection.appendChild(controls.bounceDuration.element);

  // Bounce max scale slider
  controls.bounceMaxScale = createSlider(
    "Bounce Max Scale",
    1,
    1.5,
    CONST.BOUNCE_MAX_SCALE,
    0.05,
    (value) => {
      CONST.BOUNCE_MAX_SCALE = value;
    }
  );
  animationSection.appendChild(controls.bounceMaxScale.element);

  // Create section for physics
  const physicsSection = document.createElement("div");
  physicsSection.style.marginBottom = "15px";
  physicsSection.style.borderBottom = "1px solid #555";
  physicsSection.style.paddingBottom = "10px";
  controlsContainer.appendChild(physicsSection);

  const physicsTitle = document.createElement("h4");
  physicsTitle.textContent = "Physics";
  physicsTitle.style.margin = "5px 0";
  physicsSection.appendChild(physicsTitle);

  // Spring constant slider
  controls.springConstant = createSlider(
    "Spring Constant",
    0.01,
    0.2,
    CONST.K_SPRING,
    0.01,
    (value) => {
      CONST.K_SPRING = value;
    }
  );
  physicsSection.appendChild(controls.springConstant.element);

  // Damping factor slider
  controls.dampingFactor = createSlider(
    "Damping Factor",
    0.01,
    0.2,
    CONST.K_DAMPING,
    0.01,
    (value) => {
      CONST.K_DAMPING = value;
    }
  );
  physicsSection.appendChild(controls.dampingFactor.element);

  // Create section for background
  const backgroundSection = document.createElement("div");
  backgroundSection.style.marginBottom = "15px";
  controlsContainer.appendChild(backgroundSection);

  const backgroundTitle = document.createElement("h4");
  backgroundTitle.textContent = "Background";
  backgroundTitle.style.margin = "5px 0";
  backgroundSection.appendChild(backgroundTitle);

  // Warp amount slider
  controls.warpAmount = createSlider(
    "Warp Amount",
    0,
    1,
    CONST.WARP_AMOUNT,
    0.05,
    (value) => {
      CONST.WARP_AMOUNT = value;
      if (state.skyShaderMaterial) {
        state.skyShaderMaterial.uniforms.u_warpAmount.value = value;
      }
    }
  );
  backgroundSection.appendChild(controls.warpAmount.element);

  // Warp frequency slider
  controls.warpFrequency = createSlider(
    "Warp Frequency",
    1,
    10,
    CONST.WARP_FREQUENCY,
    0.5,
    (value) => {
      CONST.WARP_FREQUENCY = value;
      if (state.skyShaderMaterial) {
        state.skyShaderMaterial.uniforms.u_warpFrequency.value = value;
      }
    }
  );
  backgroundSection.appendChild(controls.warpFrequency.element);

  // Warp speed slider
  controls.warpSpeed = createSlider(
    "Warp Speed",
    0,
    2,
    CONST.WARP_SPEED,
    0.1,
    (value) => {
      CONST.WARP_SPEED = value;
      if (state.skyShaderMaterial) {
        state.skyShaderMaterial.uniforms.u_warpSpeed.value = value;
      }
    }
  );
  backgroundSection.appendChild(controls.warpSpeed.element);

  // Checker scale slider
  controls.checkerScale = createSlider(
    "Checker Scale",
    0.5,
    5,
    CONST.CHECKER_SCALE,
    0.1,
    (value) => {
      CONST.CHECKER_SCALE = value;
      if (state.skyShaderMaterial) {
        state.skyShaderMaterial.uniforms.u_checkerScale.value =
          value * state.backgroundZoomFactor;
      }
    }
  );
  backgroundSection.appendChild(controls.checkerScale.element);

  // Create save button
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save Settings";
  saveButton.style.backgroundColor = "#4CAF50";
  saveButton.style.border = "none";
  saveButton.style.color = "white";
  saveButton.style.padding = "8px 16px";
  saveButton.style.borderRadius = "3px";
  saveButton.style.cursor = "pointer";
  saveButton.style.width = "100%";
  saveButton.style.marginTop = "10px";
  controlsContainer.appendChild(saveButton);

  // Save settings to localStorage
  saveButton.addEventListener("click", () => {
    const settings = {
      useMaterial: CONST.USE_GLASS_MATERIAL,
      metalness: CONST.METALNESS,
      roughness: CONST.ROUGHNESS,
      envMapIntensity: CONST.ENV_MAP_INTENSITY,
      cubeSize: CONST.CUBE_SIZE,
      spinSpeedX: CONST.INITIAL_SPIN_SPEED.x,
      spinSpeedY: CONST.INITIAL_SPIN_SPEED.y,
      bounceDuration: CONST.BOUNCE_DURATION,
      bounceMaxScale: CONST.BOUNCE_MAX_SCALE,
      springConstant: CONST.K_SPRING,
      dampingFactor: CONST.K_DAMPING,
      warpAmount: CONST.WARP_AMOUNT,
      warpFrequency: CONST.WARP_FREQUENCY,
      warpSpeed: CONST.WARP_SPEED,
      checkerScale: CONST.CHECKER_SCALE,
    };
    localStorage.setItem("spincube-settings", JSON.stringify(settings));
    alert("Settings saved! They will be loaded next time you open the app.");
  });

  // Create reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset to Defaults";
  resetButton.style.backgroundColor = "#f44336";
  resetButton.style.border = "none";
  resetButton.style.color = "white";
  resetButton.style.padding = "8px 16px";
  resetButton.style.borderRadius = "3px";
  resetButton.style.cursor = "pointer";
  resetButton.style.width = "100%";
  resetButton.style.marginTop = "10px";
  controlsContainer.appendChild(resetButton);

  // Reset settings to defaults
  resetButton.addEventListener("click", () => {
    if (confirm("Reset all settings to defaults?")) {
      localStorage.removeItem("spincube-settings");
      window.location.reload();
    }
  });

  // Update function to update UI values from state
  function update() {
    // Update UI values if needed
  }

  return {
    controls,
    update,
    container,
  };
}
