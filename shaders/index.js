/**
 * Shader exports for the SpinCube application
 * This file centralizes all shader imports and exports
 */

// Import all shaders
import { skyVertexShader } from "./skyVertexShader.js";
import { skyVertexShaderFSQ } from "./skyVertexShaderFSQ.js";
import { skyFragmentShader } from "./skyFragmentShader.js";
import { blurVertexShader } from "./blurVertexShader.js";
import { blurFragmentShader } from "./blurFragmentShader.js";
import { cubeVertexShader } from "./cubeVertexShader.js";
import { cubeFragmentShader } from "./cubeFragmentShader.js";
import { godraysVertexShader } from "./godraysVertexShader.js";
import { godraysFragmentShader } from "./godraysFragmentShader.js";

// Export all shaders
export {
  skyVertexShader,
  skyVertexShaderFSQ,
  skyFragmentShader,
  blurVertexShader,
  blurFragmentShader,
  cubeVertexShader,
  cubeFragmentShader,
  godraysVertexShader,
  godraysFragmentShader,
};
