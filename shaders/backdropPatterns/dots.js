/**
 * Dots: a halftone, dots on a square grid that grow towards the cube and
 * swell in slow waves rolling across. BACKDROP.lineWidth sets their largest
 * size, as a share of the gap between them. With BACKDROP.warp they crowd
 * in around the cube.
 */

export const dots = `
  float backdropPattern(vec2 q, vec3 dir) {
    vec2 g = q * u_lineDensity;
    vec2 id = floor(g + 0.5); // The nearest dot
    vec2 centre = id / u_lineDensity;

    vec2 toCube = centre - u_cubeQ;
    float near = exp(-dot(toCube, toCube) / 0.04);
    float swell = smoothstep(-0.3, 0.8, snoise(vec3(centre * 2.0, u_flow * 0.12)));
    float size = 0.08 + 0.92 * min(near + 0.6 * swell, 1.0);
    float radius = u_lineWidth * 0.5 * size; // In cells, so lineWidth of the gap across at most

    // A dot is never drawn smaller than a pixel and a half across; a smaller
    // one is dimmed instead. Where the cells shrink they fade, as grid lines do.
    float w = fwidth(g.x); // Cells per pixel
    float r = max(radius, w * 0.75);
    float disc = 1.0 - smoothstep(r - w * 0.5, r + w * 0.5, length(g - id));
    disc *= (radius / r) * (radius / r) * (1.0 - smoothstep(0.1, 0.35, w));

    float fade = smoothstep(1.1, 0.2, length(q * vec2(0.55, 1.0)));
    return disc * mix(0.4, 1.0, size) * fade;
  }
`;
