import { snoise } from "./noise.js";
import { gridLine } from "./gridLine.js";
import { cellLight } from "./cellLight.js";

/**
 * Fragment shader for the backdrop, built around one of the patterns in
 * backdropPatterns/ (BACKDROP.pattern).
 * Layers, back to front:
 *  - a dark vertical gradient
 *  - a slowly churning nebula glow behind the cube
 *  - the pattern's lines, which the glass cube refracts and disperses
 *  - a ripple that runs outwards through the lines when a pulse is released
 *
 * Most of it is drawn in planar coordinates: the view direction projected
 * onto the plane z = -1 behind the cube. Lines of constant height there look
 * straight on screen, where lines of constant elevation would bow.
 *
 * Before the pattern is drawn, the backdrop sags in around the cube like a
 * gravity well (BACKDROP.warp, deepened by charging): near the cube it is
 * sampled further out, so the lines there look drawn in towards it.
 * @param {string} pattern - GLSL defining backdropPattern(q, dir)
 * @returns {string} The shader source
 */
export const backdropFragmentShader = (pattern) => `
  uniform float u_time;
  uniform float u_flow; // Pattern time: BACKDROP.speed, sped up while the cube spins
  uniform vec3 u_baseTop;
  uniform vec3 u_baseBottom;
  uniform vec3 u_glowColor;
  uniform float u_glowStrength;
  uniform vec3 u_lineColor;
  uniform float u_lineIntensity;
  uniform float u_lineDensity;
  uniform float u_lineWidth;
  uniform float u_lineDrift;
  uniform float u_cellGlow;
  uniform vec2 u_cubeQ; // Where the cube sits on the backdrop, seen from the camera
  uniform float u_warp;
  uniform float u_warpRadius;
  uniform mat3 u_roomRotation; // Into the frame of the room pattern
  uniform vec3 u_pulseColor;
  uniform float u_pulseTime;
  uniform float u_pulseStrength;
  uniform float u_pulseDecay;
  uniform float u_rippleSpeed;
  uniform float u_rippleWidth;
  uniform float u_rippleAmplitude;
  uniform float u_rippleGlow;
  uniform float u_flash;
  uniform float u_charge; // 0..1 while a press is held
  uniform float u_chargePinch;

  varying vec3 vDir;

  ${snoise}
  ${gridLine}
  ${cellLight}
  ${pattern}

  #ifndef WELL_CHARGE
  #define WELL_CHARGE 1.0
  #endif

  void main() {
    vec3 dir = normalize(vDir);
    vec2 q = dir.xy / max(-dir.z, 0.05); // Planar coordinates behind the cube
    float r2 = dot(q, q);

    // Base gradient
    vec3 color = mix(u_baseBottom, u_baseTop, smoothstep(-0.5, 0.5, q.y));

    // Nebula glow: a tight core and a broad faint halo, churned by noise
    float n1 = snoise(vec3(q * 2.5, u_time * 0.05)) * 0.5 + 0.5;
    float n2 = snoise(vec3(q.yx * 5.0 + 7.0, u_time * 0.07)) * 0.5 + 0.5;
    float glow = exp(-r2 / 0.05) * (0.5 + 0.5 * n1) + exp(-r2 / 0.4) * 0.25 * n2;
    color += u_glowColor * glow * u_glowStrength;

    // Pulse: a ripple travels outwards and pushes the lines aside as it
    // passes, the release of the pull that charging put on them
    float r = sqrt(r2);
    float pulseFade = u_pulseStrength * exp(-u_pulseTime * u_pulseDecay);
    float rippleOffset = (r - u_pulseTime * u_rippleSpeed) / u_rippleWidth;
    float ripple = exp(-rippleOffset * rippleOffset) * pulseFade;
    // A push-pull wave (the derivative of the band) kinks each line it crosses
    float push = -rippleOffset * ripple * 1.65;
    vec2 lq = q - q / max(r, 1e-4) * push * u_rippleAmplitude;
    float flash = exp(-r2 / 0.02) * u_pulseStrength * exp(-u_pulseTime * 5.0);

    // Gravity well around the cube
    vec2 toCube = lq - u_cubeQ;
    float well = (u_warp + u_charge * u_chargePinch * WELL_CHARGE) *
      exp(-dot(toCube, toCube) / (u_warpRadius * u_warpRadius));
    vec2 pq = lq + toCube * well;
    // The view direction bent the same way, for patterns drawn on the sphere
    vec3 pdir = normalize(dir + vec3((pq - q) * max(-dir.z, 0.0), 0.0));

    float lines = backdropPattern(pq, pdir);
    color += u_lineColor * lines * u_lineIntensity * (1.0 + ripple * u_rippleGlow);
    color += u_pulseColor * flash * u_flash;

    gl_FragColor = vec4(color, 1.0);
  }
`;
