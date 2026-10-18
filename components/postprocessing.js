import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { BLOOM, FINISH, RENDER } from "../constants.js";
import { finishVertexShader, finishFragmentShader } from "../shaders/index.js";

/**
 * Builds the post-processing chain: HDR render with MSAA, bloom, tone
 * mapping and colour conversion (OutputPass), then the finishing pass.
 * On a transparent canvas the finishing pass is skipped, because its grain
 * and vignette would paint the see-through area. Bloom keeps working there:
 * its glow carries its own alpha.
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {Object} [options]
 * @param {boolean} [options.transparent]
 * @returns {Object} Passes plus render, resize, update, applySettings and dispose
 */
export function createPostProcessing(renderer, scene, camera, { transparent = false } = {}) {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: RENDER.msaaSamples,
  });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, 0, 0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const finish = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_time: { value: 0 },
      u_vignette: { value: 0 },
      u_grain: { value: 0 },
      u_aberration: { value: 0 },
    },
    vertexShader: finishVertexShader,
    fragmentShader: finishFragmentShader,
  });
  finish.enabled = !transparent;
  composer.addPass(finish);

  const applySettings = () => {
    bloom.radius = BLOOM.radius;
    bloom.threshold = BLOOM.threshold;
    finish.uniforms.u_vignette.value = FINISH.vignette;
    finish.uniforms.u_grain.value = FINISH.grain;
    finish.uniforms.u_aberration.value = FINISH.aberration;
    renderer.toneMappingExposure = RENDER.exposure;
  };
  applySettings();

  const resize = (width, height, pixelRatio) => {
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    finish.uniforms.u_resolution.value.set(width * pixelRatio, height * pixelRatio);
  };

  /**
   * @param {number} time - Seconds
   * @param {number} charge - 0..1, brightens the bloom
   */
  const update = (time, charge) => {
    finish.uniforms.u_time.value = time;
    bloom.strength = BLOOM.strength * (1 + charge * 0.25);
  };

  return {
    composer,
    bloom,
    finish,
    render: () => composer.render(),
    resize,
    update,
    applySettings,
    dispose: () => {
      for (const pass of composer.passes) pass.dispose?.();
      composer.dispose();
    },
  };
}
