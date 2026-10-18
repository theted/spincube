/**
 * Fragment shader for the finishing pass, run after tone mapping:
 * colour fringing towards the edges, a vignette, and film grain (which also
 * hides banding in the dark gradients).
 */

export const finishFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_vignette;
  uniform float u_grain;
  uniform float u_aberration;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 centered = vUv - 0.5;

    // Chromatic aberration grows with distance from the centre
    vec2 offset = centered * length(centered) * u_aberration * 4.0;
    vec3 color = vec3(
      texture2D(tDiffuse, vUv + offset).r,
      texture2D(tDiffuse, vUv).g,
      texture2D(tDiffuse, vUv - offset).b
    );

    // Vignette, kept round regardless of aspect ratio
    float aspect = u_resolution.x / u_resolution.y;
    float dist = length(centered * vec2(aspect, 1.0)) / length(vec2(aspect, 1.0) * 0.5);
    color *= mix(1.0, 1.0 - u_vignette, smoothstep(0.35, 1.05, dist));

    // Grain
    float grain = hash(vUv * u_resolution + fract(u_time * 7.3) * 100.0) - 0.5;
    color += grain * u_grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;
