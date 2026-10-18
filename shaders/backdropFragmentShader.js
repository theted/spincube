import { snoise } from "./noise.js";

/**
 * Fragment shader for the backdrop.
 * Layers, back to front:
 *  - a dark vertical gradient
 *  - a slowly churning nebula glow behind the cube
 *  - thin horizontal light lines that the glass cube refracts and disperses
 *  - a ripple that runs outwards through the lines when a pulse is released
 *
 * Most of it is drawn in planar coordinates: the view direction projected
 * onto the plane z = -1 behind the cube. Lines of constant height there look
 * straight on screen, where lines of constant elevation would bow.
 */

export const backdropFragmentShader = `
  uniform float u_time;
  uniform vec3 u_baseTop;
  uniform vec3 u_baseBottom;
  uniform vec3 u_glowColor;
  uniform float u_glowStrength;
  uniform vec3 u_lineColor;
  uniform float u_lineIntensity;
  uniform float u_lineDensity;
  uniform float u_lineWidth;
  uniform float u_lineDrift;
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

  float hash11(float n) {
    return fract(sin(n * 127.1) * 43758.5453);
  }

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

    // Light lines: one possible line per band, with a gentle wobble and drift.
    // Charging bends them in towards the cube, as if it pulls on them.
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
    float lines = line * presence * brightness * flicker * span * band;

    color += u_lineColor * lines * u_lineIntensity * (1.0 + ripple * u_rippleGlow);
    color += u_pulseColor * flash * u_flash;

    gl_FragColor = vec4(color, 1.0);
  }
`;
