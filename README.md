# SpinCube Interactive 3D Visualization

An interactive 3D visualization featuring a spinning cube with dynamic effects, built with Three.js.

## Features

- Interactive 3D cube with realistic reflections and materials
- Dynamic background shader that responds to cube interactions
- Springy physics-based interactions:
  - Cube continues rotating when "thrown"
  - Background responds to cube movement with parallax effects
  - Smooth zoom effects that affect both cube and background
  - Bounce animations when interacting with the cube
- Customizable appearance (metallic or glass)

## Interaction Guide

- **Mouse Drag**: Rotate the cube with springy physics
- **Mouse Click**: Trigger bounce animation
- **Mouse Hold**: Keep the cube in expanded state
- **Mouse Wheel**: Zoom in/out, affecting both cube and background

## Technical Overview

### Project Structure

```
spincube/
├── index.html          # Main HTML entry point
├── main.js             # Core application logic
├── constants.js        # Configurable parameters
├── shaders/
│   ├── skyVertexShader.js     # Sky shader vertex code
│   ├── skyFragmentShader.js   # Sky shader fragment code
│   ├── blurVertexShader.js    # Blur effect vertex shader
│   ├── blurFragmentShader.js  # Blur effect fragment shader
└── snoise.glsl.js      # Simplex noise implementation for shaders
```

### Key Components

1. **Cube Interaction System**

   - Physics-based spring system for natural movement
   - Velocity-based "throw" mechanics
   - Scale animations on interaction

2. **Dynamic Background**

   - Procedurally generated environment using shaders
   - Responds to cube movement with parallax effects
   - Dynamically updates based on interaction

3. **Material System**
   - PBR (Physically Based Rendering) materials
   - Configurable between metallic and glass appearance
   - Dynamic environment mapping for realistic reflections

## Customization

The project is highly customizable through the `constants.js` file:

- **Cube Properties**: Size, corner radius, segments
- **Material Properties**: Color, metalness, roughness, transparency
- **Animation Parameters**: Spring constants, damping factors, bounce settings
- **Shader Settings**: Warp amount, checker scale, animation speed

## Development Guidelines

### Adding New Features

1. For visual changes, consider modifying shader parameters in `constants.js` first
2. For interaction changes, look at the event handlers in `main.js`
3. Keep physics calculations separate from rendering code
4. Use the existing spring system for new animations to maintain consistent feel

### Performance Considerations

- Environment map updates are expensive - use the interval system
- Consider reducing shader complexity for mobile devices
- Use appropriate texture sizes based on target devices

### Code Style

- Use consistent naming conventions (camelCase for variables, UPPER_CASE for constants)
- Group related constants and variables together
- Add comments for complex physics or shader calculations
- Keep shader code modular and in separate files
