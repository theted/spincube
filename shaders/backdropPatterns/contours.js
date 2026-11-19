/**
 * Contours: the level lines of a slowly churning noise field, like a
 * topographic map, with every fifth line brighter. They keep an even width
 * on screen (set by lineWidth) however steep the field is, and fade where
 * they crowd together.
 */

export const contours = `
  float backdropPattern(vec2 q, vec3 dir) {
    float t = u_flow * 0.05;
    float height = snoise(vec3(q * 1.8, t)) + 0.45 * snoise(vec3(q * 3.7 + 11.0, t * 1.6));
    float x = height * u_lineDensity * 0.5;
    float w = max(fwidth(x), 1e-5);

    float pixels = abs(fract(x + 0.5) - 0.5) / w; // To the nearest level line
    float halfWidth = 0.25 + u_lineWidth * 25.0;
    float line = 1.0 - smoothstep(halfWidth - 0.75, halfWidth + 0.75, pixels);
    float index = 1.0 - step(0.5, mod(floor(x + 0.5), 5.0)); // Every fifth line

    float crowded = smoothstep(0.15, 0.5, w);
    float fade = smoothstep(1.1, 0.2, length(q * vec2(0.55, 1.0)));
    return line * mix(0.4, 1.0, index) * (1.0 - crowded) * fade;
  }
`;
