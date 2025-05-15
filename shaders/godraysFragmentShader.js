export const godraysFragmentShader = `
uniform sampler2D tDiffuse; // Input texture (rendered scene)
uniform vec2 u_lightPositionScreen; // Screen-space position of the light source (0.0 to 1.0)
uniform float u_exposure;
uniform float u_decay;
uniform float u_density;
uniform float u_weight;
uniform int u_samples; // Number of samples along the ray

varying vec2 vUv;

void main() {
  vec2 texCoord = vUv;
  vec2 deltaTexCoord = texCoord - u_lightPositionScreen;
  deltaTexCoord *= 1.0 / float(u_samples) * u_density;
  float illuminationDecay = 1.0;
  vec4 FragColor = vec4(0.0);

  for (int i = 0; i < u_samples; i++) {
    texCoord -= deltaTexCoord;
    vec4 samp = texture2D(tDiffuse, texCoord);
    samp *= illuminationDecay * u_weight;
    FragColor += samp;
    illuminationDecay *= u_decay;
  }

  FragColor *= u_exposure;
  gl_FragColor = FragColor;
}
`;
