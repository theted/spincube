import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import * as CONST from "../constants.js";

/**
 * Creates and initializes the environment for the scene
 * @param {THREE.Scene} scene - The scene to set up the environment for
 * @param {THREE.WebGLRenderer} renderer - The renderer
 * @returns {Object} Environment objects and functions
 */
export function createEnvironment(scene, renderer) {
  // Initialize PMREMGenerator and Render Target for Sky Shader
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader(); // Pre-compile shader used by PMREMGenerator

  const envMapRenderTarget = new THREE.WebGLRenderTarget(
    CONST.ENV_MAP_SIZE,
    CONST.ENV_MAP_SIZE / 2,
    {
      // Equirectangular is 2:1
      format: THREE.RGBAFormat, // Or RGBFormat if alpha not needed
      type: THREE.FloatType, // Or HalfFloatType for better precision if supported well
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false, // PMREMGenerator will handle mipmaps
    }
  );
  // The texture from this render target will be equirectangular
  envMapRenderTarget.texture.mapping = THREE.EquirectangularReflectionMapping;

  // Create Sky Shader Material with default shaders (will be replaced later)
  const skyShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0.0 },
      u_resolution: {
        value: new THREE.Vector2(CONST.ENV_MAP_SIZE, CONST.ENV_MAP_SIZE / 2),
      },
      u_checkerScale: { value: CONST.CHECKER_SCALE },
      u_warpAmount: { value: CONST.WARP_AMOUNT },
      u_warpFrequency: { value: CONST.WARP_FREQUENCY },
      u_warpSpeed: { value: CONST.WARP_SPEED },
      u_uvOffset: { value: new THREE.Vector2(0, 0) }, // For parallax
      u_useIntenseBackground: { value: CONST.USE_INTENSE_BACKGROUND }, // Toggle between intense and mellow background
    },
    vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`, // Default placeholder
    fragmentShader: `void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }`, // Default placeholder
  });

  // Helper to render the shader to the full target
  const rtQuad = new FullScreenQuad(skyShaderMaterial);

  // Track the last environment map update time
  let lastEnvMapUpdateTime = 0;
  let processedEnvMap = null;

  /**
   * Updates the environment map
   * @param {number} elapsedTime - Current elapsed time
   */
  const updateEnvironmentMap = (elapsedTime = 0) => {
    // Check if it's time to update
    if (
      elapsedTime === 0 ||
      elapsedTime - lastEnvMapUpdateTime > CONST.ENV_MAP_UPDATE_INTERVAL
    ) {
      // 1. Render the shader to our equirectangular render target
      renderer.setRenderTarget(envMapRenderTarget);
      rtQuad.render(renderer);
      renderer.setRenderTarget(null);

      // 2. Process this texture with PMREMGenerator
      // Dispose of old processed map if it exists to free GPU memory
      if (processedEnvMap) {
        processedEnvMap.dispose();
      }

      // Apply blur to the environment map for better performance and aesthetics
      // Create a temporary render target for the blur pass
      const blurredRenderTarget = new THREE.WebGLRenderTarget(
        CONST.ENV_MAP_SIZE,
        CONST.ENV_MAP_SIZE / 2,
        {
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          generateMipmaps: false,
        }
      );

      // Create a blur shader material with default shaders
      const blurMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: envMapRenderTarget.texture },
          resolution: {
            value: new THREE.Vector2(
              CONST.ENV_MAP_SIZE,
              CONST.ENV_MAP_SIZE / 2
            ),
          },
          blurSize: { value: CONST.BACKGROUND_BLUR * 0.01 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform vec2 resolution;
          uniform float blurSize;
          varying vec2 vUv;
          
          void main() {
            vec4 sum = vec4(0.0);
            float blur = blurSize / resolution.x;
            
            // Simple box blur
            sum += texture2D(tDiffuse, vec2(vUv.x - 4.0*blur, vUv.y)) * 0.05;
            sum += texture2D(tDiffuse, vec2(vUv.x - 3.0*blur, vUv.y)) * 0.09;
            sum += texture2D(tDiffuse, vec2(vUv.x - 2.0*blur, vUv.y)) * 0.12;
            sum += texture2D(tDiffuse, vec2(vUv.x - 1.0*blur, vUv.y)) * 0.15;
            sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y)) * 0.18;
            sum += texture2D(tDiffuse, vec2(vUv.x + 1.0*blur, vUv.y)) * 0.15;
            sum += texture2D(tDiffuse, vec2(vUv.x + 2.0*blur, vUv.y)) * 0.12;
            sum += texture2D(tDiffuse, vec2(vUv.x + 3.0*blur, vUv.y)) * 0.09;
            sum += texture2D(tDiffuse, vec2(vUv.x + 4.0*blur, vUv.y)) * 0.05;
            
            gl_FragColor = sum;
          }
        `,
      });

      // Render the blur pass
      const blurQuad = new FullScreenQuad(blurMaterial);
      renderer.setRenderTarget(blurredRenderTarget);
      blurQuad.render(renderer);
      renderer.setRenderTarget(null);

      // Clean up the blur quad
      blurQuad.dispose();

      // Process the blurred texture with PMREMGenerator
      processedEnvMap = pmremGenerator.fromEquirectangular(
        blurredRenderTarget.texture
      ).texture;

      // Clean up the temporary render target
      blurredRenderTarget.dispose();

      // 3. Apply to scene
      scene.background = processedEnvMap; // Use processed for background too for consistency
      scene.environment = processedEnvMap;

      // Update the last update time
      lastEnvMapUpdateTime = elapsedTime;
    }
  };

  /**
   * Sets the shader code for the sky shader
   * @param {string} vertexShader - Vertex shader code
   * @param {string} fragmentShader - Fragment shader code
   */
  const setSkyShaderCode = (vertexShader, fragmentShader) => {
    skyShaderMaterial.vertexShader = vertexShader;
    skyShaderMaterial.fragmentShader = fragmentShader;
    skyShaderMaterial.needsUpdate = true;
  };

  /**
   * Sets the shader code for the blur shader
   * @param {string} vertexShader - Vertex shader code
   * @param {string} fragmentShader - Fragment shader code
   * @returns {THREE.ShaderMaterial} The blur material
   */
  const createBlurMaterial = (vertexShader, fragmentShader) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: envMapRenderTarget.texture },
        resolution: {
          value: new THREE.Vector2(CONST.ENV_MAP_SIZE, CONST.ENV_MAP_SIZE / 2),
        },
        blurSize: { value: CONST.BACKGROUND_BLUR * 0.01 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  };

  /**
   * Sets up the scene lighting
   */
  const setupLighting = () => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional lights for enhanced reflections
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xccccff, 0.5); // Slightly blue light from another angle
    directionalLight2.position.set(-1, 0.5, -1);
    scene.add(directionalLight2);
  };

  return {
    skyShaderMaterial,
    updateEnvironmentMap,
    setSkyShaderCode,
    createBlurMaterial,
    setupLighting,
  };
}
