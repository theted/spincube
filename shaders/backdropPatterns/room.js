/**
 * Room: the inside of a vast gridded cube around the scene, with brighter
 * lines along its edges. It turns with the glass cube by BACKDROP.follow, so
 * a hard throw swings the whole room round.
 *
 * Each view direction is turned into the room's frame (u_roomRotation) and
 * projected onto the wall it points at, which gives coordinates from -1 to 1
 * across that wall.
 */

export const room = `
  float backdropPattern(vec2 q, vec3 dir) {
    vec3 d = u_roomRotation * dir;
    vec3 a = abs(d);
    vec2 uv = a.x > max(a.y, a.z) ? d.yz / a.x : a.y > a.z ? d.xz / a.y : d.xy / a.z;

    float cells = max(1.0, floor(u_lineDensity));
    vec2 g = (uv + 1.0) * 0.5 * cells; // Whole numbers on the lines, the edges included
    float hw = u_lineWidth * 0.5;
    float grid = max(gridLine(g.x, hw), gridLine(g.y, hw));

    // The edges, twice as thick. Clamped so only the edge itself is a line.
    float toEdge = 1.0 - max(abs(uv.x), abs(uv.y));
    float e = min(toEdge * cells * 0.5, 0.5);
    float edge = gridLineW(e, hw * 2.0, fwidth(toEdge) * cells * 0.5);
    return max(grid * 0.45, edge);
  }
`;
