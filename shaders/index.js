/**
 * Shader exports for the SpinCube application
 * This file centralizes all shader imports and exports
 */

// Import all shaders
import { default as skyVertexShader } from "./skyVertexShader.js";
import { default as skyVertexShaderFSQ } from "./skyVertexShaderFSQ.js";
import { default as skyFragmentShader } from "./skyFragmentShader.js";
import { default as blurVertexShader } from "./blurVertexShader.js";
import { default as blurFragmentShader } from "./blurFragmentShader.js";
import { default as cubeVertexShader } from "./cubeVertexShader.js";
import { default as cubeFragmentShader } from "./cubeFragmentShader.js";

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
