/**
 * Hex: a honeycomb. With BACKDROP.cellGlow its cells light up and fade one
 * by one, more of them near the cube.
 *
 * The cells sit on two interleaved rectangular lattices; whichever centre is
 * nearer is the cell's. Its distance to the edge is then the larger of the
 * distances along the two edge normals, taken from 0.5, the inner radius.
 */

export const hex = `
  float backdropPattern(vec2 q, vec3 dir) {
    const vec2 s = vec2(1.0, 1.7320508); // Between centres of a lattice, in cell widths
    vec2 p = q * u_lineDensity;
    vec2 a = mod(p, s) - s * 0.5;
    vec2 b = mod(p - s * 0.5, s) - s * 0.5;
    vec2 local = dot(a, a) < dot(b, b) ? a : b; // From the cell's centre
    vec2 ap = abs(local);
    float toEdge = 0.5 - max(ap.x, dot(ap, vec2(0.5, 0.8660254)));

    float line = gridLineW(toEdge, u_lineWidth * 0.5, fwidth(p.x));

    // Whole numbers for the hash, which tiny rounding errors would speckle
    vec2 centre = p - local;
    vec2 id = floor(vec2(centre.x * 2.0, centre.y / 0.8660254) + 0.5);
    float rim = 0.45 + 0.55 * smoothstep(0.3, 0.0, toEdge);
    float cell = cellLight(id, centre / u_lineDensity) * rim * u_cellGlow;

    float fade = smoothstep(1.1, 0.2, length(q * vec2(0.55, 1.0)));
    return max(line * 0.5, cell) * fade;
  }
`;
