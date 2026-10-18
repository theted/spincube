/** Setting groups from constants.js that `overrides` can change. */
export type SpinCubeSettingGroup =
  | "CAMERA"
  | "RENDER"
  | "GLASS"
  | "CORE"
  | "SPIN"
  | "CORE_SPRING"
  | "PRESS"
  | "ZOOM"
  | "FLOAT"
  | "PULSE"
  | "BACKDROP"
  | "DUST"
  | "BLOOM"
  | "FINISH";

export interface SpinCubeOptions {
  /** Draw the light-line backdrop, or leave the canvas see-through. Default "transparent". */
  background?: "scene" | "transparent";
  /** Capture the wheel to zoom. Default false. */
  wheelZoom?: boolean;
  /** Hold Space to charge. Default false. */
  keyboard?: boolean;
  /** CSS touch-action for the canvas. Default "pan-y", so vertical swipes scroll the page. */
  touchAction?: string;
  /** Stop rendering while off screen or in a hidden tab. Default true. */
  autoPause?: boolean;
  /**
   * Partial setting groups, e.g. `{ CAMERA: { distance: 5 } }`. They change
   * module-level settings, so mount one cube per page. Unknown keys throw.
   */
  overrides?: Partial<Record<SpinCubeSettingGroup, Record<string, unknown>>>;
  /** Called when a press starts. */
  onPress?: () => void;
}

export interface SpinCubeHandle {
  /** Stops rendering until resume(). */
  pause(): void;
  resume(): void;
  /** Pushes changed settings to the materials and uniforms. */
  applySettings(): void;
  /** Stops the loop, releases GPU resources and removes the canvas. */
  dispose(): void;
}

/**
 * Mounts SpinCube in a container. The canvas fills the container and follows
 * its size; the container is made `position: relative` if it is static.
 * Throws if WebGL is unavailable.
 */
export function mountSpinCube(
  container: HTMLElement,
  options?: SpinCubeOptions
): SpinCubeHandle;
