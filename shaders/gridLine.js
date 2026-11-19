// Anti-aliased grid lines for the backdrop patterns, as a GLSL string.
//
// gridLine(x, halfWidth) is 1 on a line at every whole number of x, reaching
// halfWidth of a cell to each side. A line is never drawn thinner than a
// pixel; a thinner one is dimmed instead, so it keeps its weight without
// shimmering. Where the cells shrink to a few pixels the lines fade out, so
// a dense grid in the distance turns to nothing instead of moiré.
//
// gridLineW takes how much x changes per pixel, for coordinates such as an
// angle that jumps somewhere, where fwidth would spike.

export const gridLine = `
  float gridLineW(float x, float halfWidth, float perPixel) {
    float d = abs(fract(x + 0.5) - 0.5); // Cells to the nearest line
    float w = max(perPixel, 1e-5);
    float hw = max(halfWidth, w * 0.5);
    float line = 1.0 - smoothstep(hw - w * 0.5, hw + w * 0.5, d);
    return line * (halfWidth / hw) * (1.0 - smoothstep(0.1, 0.35, w));
  }

  float gridLine(float x, float halfWidth) {
    return gridLineW(x, halfWidth, fwidth(x));
  }
`;
