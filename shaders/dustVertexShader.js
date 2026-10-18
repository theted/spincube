/**
 * Vertex shader for the floating dust.
 * Each mote wanders around its home position and is pushed outwards when the
 * pulse shockwave passes through it.
 */

export const dustVertexShader = `
  attribute float aSeed;

  uniform float u_time;
  uniform float u_size;
  uniform float u_pixelScale; // Drawing-buffer pixels per world unit at distance 1
  uniform float u_drift;
  uniform float u_brightness;
  uniform float u_pulseTime;
  uniform float u_pulseStrength;
  uniform float u_pulseSpeed;
  uniform float u_charge; // 0..1 while a press is held
  uniform float u_chargePull;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float phase = aSeed * 6.2831853;
    vec3 p = position;

    // Wander
    p += u_drift * vec3(
      sin(u_time * 0.21 + phase * 3.0),
      sin(u_time * 0.17 + phase * 5.0),
      cos(u_time * 0.19 + phase * 7.0)
    );

    // Slow orbit around the vertical axis
    float a = u_time * 0.02 * (0.5 + aSeed);
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;

    // Charging draws the dust in towards the cube
    p *= 1.0 - u_charge * u_chargePull;

    // Shockwave from a released pulse
    float front = u_pulseTime * u_pulseSpeed;
    float wave = exp(-pow((length(p) - front) / 1.2, 2.0))
      * u_pulseStrength * exp(-u_pulseTime * 0.8);
    p += normalize(p) * wave * 0.7;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = u_size * u_pixelScale * (0.6 + aSeed * 0.8) / -mvPosition.z;

    float twinkle = 0.6 + 0.4 * sin(u_time * (0.8 + aSeed * 1.7) + phase * 11.0);
    float nearFade = smoothstep(1.0, 3.0, -mvPosition.z);
    vAlpha = u_brightness * twinkle * nearFade * (1.0 + wave * 3.0);
    vColor = mix(vec3(0.75, 0.83, 1.0), vec3(1.0, 0.76, 0.5), step(0.72, aSeed));
  }
`;
