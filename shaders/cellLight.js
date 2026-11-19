// Per-cell randomness for the backdrop patterns, as a GLSL string.
//
// hash21(id) is a steady random number from 0 to 1 for each cell id.
//
// cellLight(id, centre) is how lit a cell is now, 0 to 1: now and then a
// cell flares up and fades again, each on its own clock (pattern time, so
// BACKDROP.speed and a spinning cube hurry them). Cells near the cube flare
// more often. `centre` is the cell's middle in planar coordinates.

export const cellLight = `
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float cellLight(vec2 id, vec2 centre) {
    float rate = mix(0.05, 0.14, hash21(id + 0.37));
    float phase = fract(hash21(id) + u_flow * rate);
    float flare = smoothstep(0.0, 0.04, phase) * (1.0 - smoothstep(0.04, 0.4, phase));
    vec2 toCube = centre - u_cubeQ;
    float odds = mix(0.15, 0.7, exp(-dot(toCube, toCube) / 0.06));
    return flare * smoothstep(odds + 0.05, odds - 0.05, hash21(id + 7.1));
  }
`;
