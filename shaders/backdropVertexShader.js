/**
 * Vertex shader for the backdrop sphere.
 * The sphere is centred on the origin, so the vertex position doubles as the
 * direction the backdrop is seen from.
 */

export const backdropVertexShader = `
  varying vec3 vDir;

  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
