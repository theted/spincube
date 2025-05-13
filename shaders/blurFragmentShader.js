export const blurFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float blurSize;
  varying vec2 vUv;
  
  void main() {
    vec4 sum = vec4(0.0);
    vec2 texelSize = vec2(blurSize, blurSize);
    
    // 9-tap Gaussian blur
    sum += texture2D(tDiffuse, vUv + vec2(-texelSize.x, -texelSize.y)) * 0.0625;
    sum += texture2D(tDiffuse, vUv + vec2(0.0, -texelSize.y)) * 0.125;
    sum += texture2D(tDiffuse, vUv + vec2(texelSize.x, -texelSize.y)) * 0.0625;
    
    sum += texture2D(tDiffuse, vUv + vec2(-texelSize.x, 0.0)) * 0.125;
    sum += texture2D(tDiffuse, vUv) * 0.25;
    sum += texture2D(tDiffuse, vUv + vec2(texelSize.x, 0.0)) * 0.125;
    
    sum += texture2D(tDiffuse, vUv + vec2(-texelSize.x, texelSize.y)) * 0.0625;
    sum += texture2D(tDiffuse, vUv + vec2(0.0, texelSize.y)) * 0.125;
    sum += texture2D(tDiffuse, vUv + vec2(texelSize.x, texelSize.y)) * 0.0625;
    
    gl_FragColor = sum;
  }
`;
