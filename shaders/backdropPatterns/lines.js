/**
 * Light lines, the original backdrop: one possible line per band, only some
 * bands carrying one, each with its own brightness, flicker and length, with
 * a gentle wobble and drift. Charging bends them in towards the cube, as if
 * it pulls on them, so they skip the shared gravity well's charge.
 */

export const lines = `
  #define WELL_CHARGE 0.0

  float hash11(float n) {
    return fract(sin(n * 127.1) * 43758.5453);
  }

  float backdropPattern(vec2 lq, vec3 dir) {
    float wobble = snoise(vec3(lq.x * 1.5, lq.y * 3.0, u_time * 0.08)) * 0.006;
    float pinch = 1.0 + u_charge * u_chargePinch * exp(-lq.x * lq.x / 0.08);
    float y = (lq.y * pinch + wobble + u_time * u_lineDrift) * u_lineDensity;
    float id = floor(y);
    float f = abs(fract(y) - 0.5);
    float aa = fwidth(y) * 1.2;
    float halfWidth = u_lineWidth * 0.5;
    float line = 1.0 - smoothstep(halfWidth, halfWidth + aa, f);

    float presence = step(0.45, hash11(id)); // Only some bands carry a line
    float brightness = mix(0.25, 1.0, pow(hash11(id + 17.0), 2.0));
    float flicker = 0.8 + 0.2 * sin(u_time * (0.3 + hash11(id + 3.0)) + id);
    float extent = mix(0.2, 0.85, hash11(id + 31.0));
    float shift = (hash11(id + 5.0) - 0.5) * 0.5;
    float span = smoothstep(extent, extent * 0.4, abs(lq.x + shift));
    float band = smoothstep(0.5, 0.12, abs(lq.y));
    return line * presence * brightness * flicker * span * band;
  }
`;
