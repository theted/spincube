/**
 * Weave: Truchet tiles. Each square holds two quarter circles joining the
 * midpoints of its edges, mirrored at random, so the arcs link up into
 * meandering loops. Sparks run along the loops in patches that come and go,
 * faster when the cube spins (BACKDROP.spinBoost).
 *
 * Each arc is centred on a corner of its square. The regions between the
 * loops alternate with the parity of the corners they hold, so going round
 * even corners anticlockwise and odd ones clockwise keeps every loop flowing
 * one way. The position along an arc is a whole number at both its ends, so
 * the sparks meet up across squares. Smooth noise shifts them along, so they
 * don't all march in step.
 */

export const weave = `
  float backdropPattern(vec2 q, vec3 dir) {
    vec2 g = q * u_lineDensity;
    vec2 id = floor(g);
    vec2 local = fract(g) - 0.5;
    float mirror = hash21(id) < 0.5 ? -1.0 : 1.0;
    // The nearer of the two corners the arcs are centred on
    float side = local.x * mirror + local.y > 0.0 ? 0.5 : -0.5;
    vec2 corner = vec2(mirror, 1.0) * side;
    vec2 fromCorner = local - corner;

    float w = fwidth(g.x);
    float hw = u_lineWidth * 0.5;
    float offArc = length(fromCorner) - 0.5;
    float line = gridLineW(offArc, hw, w);
    float halo = exp(-pow(offArc / (hw * 1.5 + w * 0.5), 2.0));

    vec2 c = id + 0.5 + corner; // Whole numbers
    float way = mod(c.x + c.y, 2.0) < 0.5 ? 1.0 : -1.0;
    float along = atan(fromCorner.y, fromCorner.x) / 1.5707963 * way;
    float t = fract(along - u_flow * 0.35 + 2.0 * snoise(vec3(q * 0.7, 3.0)));
    float spark = pow(t, 8.0) * smoothstep(1.0, 0.9, t); // A bright head, a fading tail

    float patches = smoothstep(-0.1, 0.6, snoise(vec3(q * 1.6, u_flow * 0.04)));
    float fade = smoothstep(1.1, 0.2, length(q * vec2(0.55, 1.0)));
    return max(line * 0.22, halo * spark * patches * 1.4) * fade;
  }
`;
