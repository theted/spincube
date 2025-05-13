export const skyVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv; // Comes from FullScreenQuad
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Use this vertex shader if FullScreenQuad sets position to NDC directly
export const skyVertexShaderFSQ = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0); // position is already in NDC for FullScreenQuad
    }
`;
