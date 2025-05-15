import { snoise } from "../snoise.glsl.js";
import { USE_INTENSE_BACKGROUND } from "../constants.js";

export const skyFragmentShader = `
    uniform bool u_useIntenseBackground;
    uniform float u_time;
    uniform vec2 u_resolution; // Resolution of the render target
    uniform float u_checkerScale;
    uniform float u_warpAmount;
    uniform float u_warpFrequency;
    uniform float u_warpSpeed;
    uniform vec2 u_uvOffset; // For parallax driven by cube interaction

    varying vec2 vUv; // UV coords from [0,1]

    // Define PI constant
    #define PI 3.1415926535897932384626433832795

    ${snoise} // Injects the Simplex Noise GLSL code

    // Function to convert equirectangular UVs to a 3D direction
    vec3 equirectToDirection(vec2 uv) {
        float phi = (uv.x - 0.5) * 2.0 * PI; // Longitude
        float theta = (uv.y - 0.5) * PI;     // Latitude
        return normalize(vec3(cos(theta) * cos(phi), sin(theta), cos(theta) * sin(phi)));
    }
    
    // Simpler checkerboard directly on UVs (will have polar distortion but can be ok)
    float checker(vec2 uv, float scale) {
        vec2 S = vec2(1.0,-1.0); // Flip Y for typical texture coords if needed, but vUv is often fine
        vec2 p = mod(uv * scale, 2.0);
        return (p.x > 1.0 ^^ p.y > 1.0) ? 1.0 : 0.0;
    }

    void main() {
        vec2 currentUv = vUv + u_uvOffset; // Apply parallax offset
        vec3 finalColor;

        if (u_useIntenseBackground) {
            // Intense background with warping and checkerboard pattern
            // Warp the UV coordinates using simplex noise
            vec2 warpedUv = currentUv;
            float noiseVal = snoise(vec3(currentUv * u_warpFrequency, u_time * u_warpSpeed));
            warpedUv.x += noiseVal * u_warpAmount;
            
            float noiseValY = snoise(vec3(currentUv.yx * u_warpFrequency * 1.2 + 5.0, u_time * u_warpSpeed * 0.8));
            warpedUv.y += noiseValY * u_warpAmount * 0.7;

            // Calculate checkerboard pattern on warped UVs
            float pattern = checker(warpedUv, u_checkerScale);

            vec3 color1 = vec3(0.08, 0.08, 0.18); // Darker part with increased contrast
            vec3 color2 = vec3(0.35, 0.35, 0.55); // Lighter part with increased contrast
            
            finalColor = mix(color1, color2, pattern);
            
            // Add a subtle glow or atmospheric effect based on view direction
            vec3 viewDir = equirectToDirection(vUv); // original vUv for direction
            float horizonFactor = smoothstep(0.0, 0.3, abs(viewDir.y)); // Stronger effect near horizon
            finalColor = mix(finalColor, vec3(0.4, 0.4, 0.6) * 0.8, horizonFactor * 0.4);
        } else {
            // Dark gray background
            finalColor = vec3(0.12, 0.12, 0.12); // Solid dark gray
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;
