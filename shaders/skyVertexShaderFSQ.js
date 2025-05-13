/**
 * Full-screen quad vertex shader for sky
 * Used for rendering the sky background
 */

export const skyVertexShaderFSQ = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;
