/**
 * Kagome: three families of lines 60° apart, leaving hexagons ringed by
 * small triangles (the trihexagonal tiling). It is the triangle tiling
 * rectified, as the solid is the tetrahedron rectified: lines that met in
 * threes slid half a cell apart. Charging slides them back together, so the
 * small triangles shrink to the points where the lines meet. Every fourth
 * line is brighter, it drifts slowly upwards, and with BACKDROP.cellGlow its
 * hexagons light up and fade.
 *
 * Each line family i is drawn at the whole numbers of x_i, the distance
 * along its normal in cells. The three normals sum to zero, so the x_i sum
 * to the slide everywhere: a slide of a whole number makes the lines meet in
 * threes, half a cell leaves the triangles open.
 */

export const kagome = `
  const vec2 KAGOME_N2 = vec2(0.8660254, -0.5);
  const vec2 KAGOME_N3 = vec2(-0.8660254, -0.5);

  float backdropPattern(vec2 q, vec3 dir) {
    vec2 drift = vec2(0.0, u_flow * 0.01);
    vec2 p = (q + drift) * u_lineDensity;
    float slide = 0.5 * (1.0 - smoothstep(0.0, 1.0, u_charge));
    vec3 x = vec3(p.y, dot(p, KAGOME_N2), dot(p, KAGOME_N3) + slide);

    float hw = u_lineWidth * 0.5;
    float minor = max(gridLine(x.x, hw), max(gridLine(x.y, hw), gridLine(x.z, hw)));
    vec3 m = x * 0.25;
    float mhw = hw * 0.375;
    float major = max(gridLine(m.x, mhw), max(gridLine(m.y, mhw), gridLine(m.z, mhw)));

    // The cells: the floors of x sum to 0 or -2 in the small triangles and
    // to -1 in the hexagons, whose middles lie half a cell along each family
    vec3 k = floor(x);
    float hexagon = step(abs(k.x + k.y + k.z + 1.0), 0.5);
    vec2 middle = vec2((k.y + 0.5 + 0.5 * (k.x + 0.5)) / 0.8660254, k.x + 0.5);
    vec3 f = abs(fract(x) - 0.5) * 2.0;
    float rim = 0.45 + 0.55 * smoothstep(0.3, 1.0, max(f.x, max(f.y, f.z)));
    float cell = hexagon * cellLight(k.xy, middle / u_lineDensity - drift) * rim * u_cellGlow;

    float fade = smoothstep(1.1, 0.2, length(q * vec2(0.55, 1.0)));
    return max(max(minor * 0.35, major * 0.75), cell) * fade;
  }
`;
