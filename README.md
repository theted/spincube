# SpinCube

An interactive 3D visualization featuring a spinning cube with dynamic effects, built with Three.js.

## Features

- Interactive 3D cube with physics-based interactions
- Metallic and glass material options
- Dynamic environment mapping
- Customizable shader effects
- Debug panel for adjusting parameters in development mode
- Save and load settings for production builds
- Minified single-file build output

## Development

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

This will start a development server with hot reloading.

### Debug Controls

In development mode, a debug panel is available to adjust various parameters:

- Material properties (metallic/glass, roughness, etc.)
- Cube properties (size, spin speed)
- Animation settings (bounce duration, spring constants)
- Shader effects (warp amount, checker scale)

### Saving Settings

1. Adjust the parameters in the debug panel
2. Click the "Save Settings" button to save to localStorage
3. Run `npm run export-settings` to open a page for downloading the settings file
4. Download the settings file and place it in the project root directory

### Building for Production

#### Standard Build

```bash
npm run build
```

#### Production Build with Debug Mode Disabled

```bash
npm run build:prod
```

#### Production Build with Saved Settings

```bash
npm run build:saved
```

This will use the settings from `saved-settings.json` and disable debug mode.

## Testing

```bash
npm run test
```

## Docker Support

The project includes Docker support for easy deployment.

### Building the Docker Image

```bash
docker build -t spincube .
```

### Running the Docker Container

```bash
docker run -p 8080:80 spincube
```

This will start the application on http://localhost:8080

### How the Dockerfile Works

The Dockerfile uses a multi-stage build process:

1. **Build Stage**:

   - Uses Node.js Alpine image for a small footprint
   - Installs dependencies with `npm ci` for reproducible builds
   - Builds the application with `npm run build`

2. **Production Stage**:
   - Uses Nginx Alpine for a lightweight web server
   - Copies only the built assets from the build stage
   - Configures Nginx to serve the static files
   - Exposes port 80 for HTTP traffic

This approach results in a small, efficient Docker image that contains only what's needed to run the application in production.

## Project Structure

- `/components` - Reusable components (cube, environment, debug UI)
- `/shaders` - GLSL shader code
- `/utils` - Utility functions (physics, animation, events)
- `/tests` - Test files

## License

ISC
