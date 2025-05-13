# SpinCube Project - AI Development Guidelines

## Project Overview

SpinCube is an interactive 3D visualization featuring a spinning cube with dynamic effects, built with Three.js. The project demonstrates advanced web graphics techniques including:

- Interactive 3D rendering with Three.js
- Physics-based animations and spring systems
- GLSL shader programming for dynamic backgrounds
- PBR (Physically Based Rendering) materials
- Environment mapping and reflections

## Development Guidelines

### Code Organization

1. **Shader Code**

   - All shader code MUST be placed in the `shaders/` folder
   - Each shader should be in its own file (one file per shader)
   - Vertex and fragment shaders should be separate files
   - Use consistent naming: `nameVertexShader.js` and `nameFragmentShader.js`

2. **Function Organization**

   - Break down large functions into smaller, reusable functions
   - Place related functions in separate files when appropriate
   - Prefer many small, focused files over few large files
   - Use descriptive function names that indicate their purpose

3. **Configuration**

   - All constants and configurable parameters MUST be in `constants.js`
   - Group related constants together with comments
   - Use UPPER_CASE for constant names
   - Provide descriptive comments for non-obvious constants

4. **File Structure**
   ```
   spincube/
   ├── index.html          # Main HTML entry point
   ├── main.js             # Core application logic
   ├── constants.js        # All configurable parameters
   ├── utils/              # Utility functions
   │   ├── physics.js      # Physics calculations
   │   ├── animation.js    # Animation helpers
   │   └── ...
   ├── components/         # Reusable components
   │   ├── cube.js         # Cube creation and handling
   │   ├── environment.js  # Environment setup
   │   └── ...
   └── shaders/            # All shader code
       ├── skyVertexShader.js
       ├── skyFragmentShader.js
       └── ...
   ```

### Coding Standards

1. **Modularity**

   - Each file should have a single responsibility
   - Export only what's necessary
   - Use ES6 modules for imports/exports

2. **Comments**

   - Add comments for complex logic
   - Document physics calculations and shader operations
   - Include references for algorithms or techniques used

3. **Performance**

   - Consider performance implications, especially for shader code
   - Use appropriate optimization techniques
   - Balance visual quality with performance

4. **Maintainability**
   - Write code that is easy to understand and modify
   - Follow consistent naming conventions
   - Structure code logically

## Implementation Checklist

When implementing new features or modifying existing code:

- [ ] Shader code is placed in the shaders/ folder
- [ ] Functions are broken down into smaller, reusable units
- [ ] Constants and configurable parameters are in constants.js
- [ ] Code follows the established file structure
- [ ] Performance considerations are addressed
- [ ] Code is well-commented and maintainable
