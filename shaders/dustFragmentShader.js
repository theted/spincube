/**
 * Fragment shader for the floating dust: a soft round mote, blended additively.
 */

export const dustFragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float falloff = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, falloff * falloff * vAlpha);
  }
`;
