/**
 * Shader exports
 * This file exports all shader code for easier imports
 */

// Import shaders
import { skyVertexShader } from "./skyVertexShader.js";
import { skyVertexShaderFSQ } from "./skyVertexShaderFSQ.js";
import { skyFragmentShader } from "./skyFragmentShader.js";
import { blurVertexShader } from "./blurVertexShader.js";
import { blurFragmentShader } from "./blurFragmentShader.js";
import { cubeVertexShader } from "./cubeVertexShader.js";
import { cubeFragmentShader } from "./cubeFragmentShader.js";

// Export all shaders
export {
  skyVertexShader,
  skyVertexShaderFSQ,
  skyFragmentShader,
  blurVertexShader,
  blurFragmentShader,
  cubeVertexShader,
  cubeFragmentShader,
};
