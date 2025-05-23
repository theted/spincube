import * as THREE from "three";
import * as CONST from "../constants.js";

/**
 * Handles the bounce animation for the cube
 * @param {Object} params - Animation parameters
 * @param {number} params.elapsedTime - Current elapsed time
 * @param {number} params.bounceStartTime - Time when bounce started
 * @param {boolean} params.isBouncingIn - Whether bouncing in or out
 * @param {boolean} params.mouseDown - Whether mouse is down
 * @param {number} params.currentBounceScale - Current bounce scale
 * @param {number} params.currentScrollScale - Current scroll scale
 * @param {THREE.Mesh} params.cube - The cube mesh
 * @param {THREE.Color} params.originalCubeColor - Original cube color
 * @param {THREE.Color} params.bounceCubeColor - Bounce cube color
 * @param {THREE.ShaderMaterial} params.skyShaderMaterial - Sky shader material
 * @param {Function} params.updateEnvironmentMap - Function to update environment map
 * @returns {Object} Updated animation state
 */
export function updateBounceAnimation({
  elapsedTime,
  bounceStartTime,
  isBouncingIn,
  mouseDown,
  currentBounceScale,
  currentScrollScale,
  cube,
  originalCubeColor,
  bounceCubeColor,
  skyShaderMaterial,
  backgroundZoomFactor,
  updateEnvironmentMap,
}) {
  let isBouncing = true;
  const bounceTime = elapsedTime - bounceStartTime;

  if (bounceTime < CONST.BOUNCE_DURATION) {
    // Calculate bounce progress (0 to 1)
    const progress = bounceTime / CONST.BOUNCE_DURATION;

    // Use a sine wave for smooth bounce effect
    let bounceScale;

    if (isBouncingIn) {
      // Bounce in: Start at 1.0, go to max scale
      bounceScale = THREE.MathUtils.lerp(
        1.0,
        CONST.BOUNCE_MAX_SCALE,
        Math.sin(progress * Math.PI * 0.5) // Use half sine wave for smooth in
      );
    } else {
      // Bounce out: Only if mouse is not down
      if (!mouseDown) {
        // Smoothly interpolate from current (likely max) scale to 1.0
        bounceScale = THREE.MathUtils.lerp(
          CONST.BOUNCE_MAX_SCALE, // Assuming it starts from max scale after mouse up
          1.0,
          Math.sin(progress * Math.PI * 0.5) // Use half sine wave for smooth out
        );
      } else {
        // If mouse is still down, maintain the expanded state
        bounceScale = CONST.BOUNCE_MAX_SCALE;
      }
    }

    // Store current scale for bounce out reference
    currentBounceScale = bounceScale;

    // Apply scale to cube (combined with scroll scale)
    const finalScale = bounceScale * currentScrollScale;
    cube.scale.set(finalScale, finalScale, finalScale);

    // Apply color change to cube during bounce
    const colorProgress = Math.sin(progress * Math.PI);
    const currentColor = new THREE.Color();
    currentColor.lerpColors(originalCubeColor, bounceCubeColor, colorProgress);

    // Apply color to the cube (which is now a group)
    // Find the actual cube mesh (first child of the group)
    if (cube.children && cube.children.length > 0) {
      const cubeMesh = cube.children[0]; // The first child is the actual cube mesh
      if (cubeMesh && cubeMesh.material) {
        cubeMesh.material.color.copy(currentColor);
      }
    }

    // Calculate skybox bounce effect (inverse of cube scale for contrast)
    const skyboxBounceAmount = (bounceScale - 1.0) * 0.5; // Significantly increased effect

    // Apply skybox bounce effect to shader
    skyShaderMaterial.uniforms.u_warpAmount.value =
      CONST.WARP_AMOUNT + skyboxBounceAmount * 1.5;
    skyShaderMaterial.uniforms.u_checkerScale.value =
      CONST.CHECKER_SCALE *
      (1.0 - skyboxBounceAmount * 3) *
      backgroundZoomFactor;
    skyShaderMaterial.uniforms.u_warpSpeed.value =
      CONST.WARP_SPEED + Math.abs(skyboxBounceAmount) * 2; // Speed up animation during bounce

    // Force environment map update during bounce
    updateEnvironmentMap();
  } else {
    // Animation complete
    isBouncing = false;

    // Only reset if mouse is not down
    if (!mouseDown && !isBouncingIn) {
      // If we were bouncing out, reset everything except keep the scroll scale
      currentBounceScale = 1.0;
      cube.scale.set(
        currentScrollScale,
        currentScrollScale,
        currentScrollScale
      );
      cube.rotation.z = 0; // Reset z rotation

      // Reset color on the cube mesh (first child of the group)
      if (cube.children && cube.children.length > 0) {
        const cubeMesh = cube.children[0]; // The first child is the actual cube mesh
        if (cubeMesh && cubeMesh.material) {
          cubeMesh.material.color.copy(originalCubeColor);
        }
      }
      skyShaderMaterial.uniforms.u_warpAmount.value = CONST.WARP_AMOUNT;
      skyShaderMaterial.uniforms.u_checkerScale.value =
        CONST.CHECKER_SCALE * backgroundZoomFactor;
      skyShaderMaterial.uniforms.u_warpSpeed.value = CONST.WARP_SPEED; // Reset warp speed
    } else if (mouseDown) {
      // If mouse is still down, maintain the expanded state
      currentBounceScale = CONST.BOUNCE_MAX_SCALE;
      const finalScale = currentBounceScale * currentScrollScale;
      cube.scale.set(finalScale, finalScale, finalScale);
    }
  }

  return {
    isBouncing,
    currentBounceScale,
  };
}

/**
 * Updates the background effects based on cube interaction
 * @param {Object} params - Background parameters
 * @param {THREE.ShaderMaterial} params.skyShaderMaterial - Sky shader material
 * @param {THREE.Vector2} params.currentUserSpinOffset - Current rotation offset
 * @param {THREE.Vector2} params.currentUserSpinVelocity - Current rotation velocity
 * @param {number} params.backgroundZoomFactor - Background zoom factor
 */
export function updateBackgroundEffects({
  skyShaderMaterial,
  currentUserSpinOffset,
  currentUserSpinVelocity,
  backgroundZoomFactor,
}) {
  // Parallax for sky shader based on cube's interactive spin - enhanced effect
  skyShaderMaterial.uniforms.u_uvOffset.value.x =
    -currentUserSpinOffset.y *
    CONST.CUBE_INTERACTION_PARALLAX_FACTOR *
    (1 + Math.abs(currentUserSpinVelocity.y) * 2);
  skyShaderMaterial.uniforms.u_uvOffset.value.y =
    -currentUserSpinOffset.x *
    CONST.CUBE_INTERACTION_PARALLAX_FACTOR *
    (1 + Math.abs(currentUserSpinVelocity.x) * 2);

  // Apply background zoom effect to shader with enhanced effect based on velocity
  skyShaderMaterial.uniforms.u_checkerScale.value =
    CONST.CHECKER_SCALE *
    backgroundZoomFactor *
    (1 + Math.abs(currentUserSpinVelocity.x + currentUserSpinVelocity.y) * 0.1);
}

/**
 * Triggers a bounce animation
 * @param {boolean} bounceIn - Whether to bounce in (true) or out (false)
 * @param {number} elapsedTime - Current elapsed time
 * @returns {Object} Bounce animation parameters
 */
export function triggerBounceAnimation(bounceIn, elapsedTime) {
  return {
    isBouncing: true,
    isBouncingIn: bounceIn,
    bounceStartTime: elapsedTime,
  };
}
