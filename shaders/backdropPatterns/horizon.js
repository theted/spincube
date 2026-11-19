/**
 * Horizon: a floor and a fainter ceiling of grid lines running off to a
 * horizon behind the cube, scrolling towards you, with a bright line where
 * they meet.
 *
 * A view direction meets the floor at a distance of 1 / height below the
 * horizon, in planar coordinates, so the floor point is (q.x, 1) / height:
 * lines across it bunch up towards the horizon and lines along it all run
 * to the vanishing point behind the cube.
 */

export const horizon = `
  float backdropPattern(vec2 q, vec3 dir) {
    float h = abs(q.y);
    vec2 floorPoint = vec2(q.x, 1.0) * (0.12 / max(h, 1e-3));
    floorPoint.y += u_flow * 0.12; // Scrolls towards you
    vec2 g = floorPoint * u_lineDensity;
    float hw = u_lineWidth * 0.5;
    float grid = max(gridLine(g.x, hw), gridLine(g.y, hw));

    float haze = smoothstep(0.0, 0.08, h); // Lost in the haze at the horizon
    float ceiling = q.y > 0.0 ? 0.3 : 1.0;
    float horizonLine = exp(-h / 0.006) * smoothstep(1.4, 0.2, abs(q.x));
    return grid * haze * ceiling + horizonLine * 0.8;
  }
`;
