/**
 * Rays: streaks of light flying out from the cube in every direction, like
 * stars at warp speed. Each ray carries one streak at a time on its own
 * clock: it sets off close in, speeds up and stretches as it goes, and fades
 * on the way out. BACKDROP.lineDensity sets how many rays there are;
 * BACKDROP.spinBoost makes a thrown cube jump to light speed.
 *
 * The streaks keep an even width on screen, so they are narrowest, as a
 * share of the gap between rays, far out.
 */

export const rays = `
  float backdropPattern(vec2 q, vec3 dir) {
    vec2 p = q - u_cubeQ;
    float r = max(length(p), 1e-4);
    float count = max(8.0, floor(u_lineDensity * 8.0));
    float gap = r * 6.2831853 / count; // Between rays at this distance
    float around = atan(p.y, p.x) / 6.2831853 * count;
    float pixel = length(fwidth(q));
    float ray = gridLineW(around, 0.5 * u_lineWidth / u_lineDensity / gap, pixel / gap);

    float id = mod(floor(around + 0.5), count);
    float clock = fract(hash21(vec2(id, 1.0)) + u_flow * mix(0.12, 0.3, hash21(vec2(id, 2.0))));
    float head = 0.05 + 1.4 * clock * clock;
    float tail = 0.015 + 0.3 * clock * clock;
    float streak = smoothstep(head - tail, head, r) * (1.0 - smoothstep(head - pixel, head, r));
    float life = smoothstep(0.0, 0.15, clock) * (1.0 - smoothstep(0.6, 1.0, clock));
    float brightness = mix(0.35, 1.0, hash21(vec2(id, 3.0)));
    return ray * streak * streak * life * brightness;
  }
`;
