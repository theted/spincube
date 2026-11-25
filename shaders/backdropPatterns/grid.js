/**
 * Grid: square cells with a brighter line every fourth, drifting slowly
 * upwards and fading out towards the edges. With BACKDROP.cellGlow its
 * cells light up and fade one by one, more of them near the cube; with
 * BACKDROP.warp it sags in around the cube like a gravity well.
 */

export const grid = `
  float backdropPattern(vec2 q, vec3 dir) {
    vec2 drift = vec2(0.0, u_flow * 0.01);
    vec2 g = (q + drift) * u_lineDensity;
    float hw = u_lineWidth * 0.5;
    float minor = max(gridLine(g.x, hw), gridLine(g.y, hw));
    // Every fourth line, half as thick again
    vec2 m = g * 0.25;
    float major = max(gridLine(m.x, hw * 0.375), gridLine(m.y, hw * 0.375));

    // A lit cell glows brightest at its rim, like a pane of frosted glass
    vec2 id = floor(g);
    vec2 inCell = abs(fract(g) - 0.5);
    float rim = 0.45 + 0.55 * smoothstep(0.2, 0.5, max(inCell.x, inCell.y));
    float cell = cellLight(id, (id + 0.5) / u_lineDensity - drift) * rim * u_cellGlow;

    float fade = smoothstep(1.1, 0.2, length(q * vec2(0.55, 1.0)));
    return max(max(minor * 0.3, major), cell) * fade;
  }
`;
