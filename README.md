# SpinCube

An interactive 3D visualization featuring a spinning cube with dynamic effects, built with Three.js.

## Features

- Interactive 3D cube with physics-based animations
- Spring-based rotation system with "throw" physics
- Dynamic environment mapping with shader-based background
- Responsive zoom and bounce animations
- Glass and metallic material options
- Modular, maintainable code structure

## Technical Details

### Physics System

The cube uses a spring-based physics system that allows it to:

- Continue spinning when "thrown" with momentum
- Bounce and scale when clicked
- Respond to scroll wheel for zooming
- Maintain expanded state when mouse is held down

### Visual Effects

- Dynamic shader-based background that responds to cube movement
- Environment mapping for realistic reflections
- Parallax effect that enhances the sense of depth
- Smooth animations with spring physics

### Code Organization

The project follows a modular structure:

- `main.js` - Core application logic and state management
- `constants.js` - All configurable parameters
- `utils/` - Utility functions
  - `physics.js` - Physics calculations
  - `animation.js` - Animation helpers
  - `events.js` - Event handling
- `components/` - Reusable components
  - `cube.js` - Cube creation and handling
  - `environment.js` - Environment setup
- `shaders/` - All shader code
  - `skyVertexShader.js`
  - `skyFragmentShader.js`
  - `blurVertexShader.js`
  - `blurFragmentShader.js`

## Usage

1. Start a local server:

   ```
   python -m http.server 8080
   ```

2. Open in a browser:

   ```
   http://localhost:8080
   ```

3. Interact with the cube:
   - Click and drag to rotate
   - Click to trigger bounce animation
   - Scroll to zoom in/out
   - Hold mouse down to keep the cube in expanded state

## Customization

Most parameters can be adjusted in `constants.js`:

- Cube size, corner radius, and segments
- Material properties (metalness, roughness, etc.)
- Spring constants for physics
- Animation durations and scales
- Shader parameters

Toggle between glass and metallic materials by changing `USE_GLASS_MATERIAL` in `constants.js`.

## Development Guidelines

See [AI_RULES.md](./AI_RULES.md) for development guidelines and best practices.
