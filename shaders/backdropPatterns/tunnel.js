/**
 * Tunnel: the rings and ribs of a tunnel running away behind the cube,
 * rushing towards you and turning slowly. The far end dissolves into the
 * nebula glow. With BACKDROP.spinBoost, throwing the cube sends it into a
 * rush.
 *
 * A point r from the centre of the view looks 1 / r down the tunnel, so
 * evenly spaced rings bunch up towards the far end.
 */

export const tunnel = `
  float backdropPattern(vec2 q, vec3 dir) {
    float r = max(length(q), 1e-4);
    float depth = 0.1 / r;
    float ribs = max(3.0, floor(u_lineDensity)); // A whole number, so they meet up all the way round
    float around = atan(q.y, q.x) / 6.2831853 * ribs + u_flow * 0.05;
    // How much "around" changes per pixel, without the jump where atan wraps
    float aroundPerPixel = length(fwidth(q)) / r / 6.2831853 * ribs;
    float along = (depth + u_flow * 0.15) * u_lineDensity * 0.75;

    float hw = u_lineWidth * 0.5;
    float lines = max(gridLineW(around, hw, aroundPerPixel), gridLine(along, hw));
    float farEnd = smoothstep(0.02, 0.15, r);
    return lines * farEnd;
  }
`;
