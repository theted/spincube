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

export interface SpinCubeLayout {
  x?: number;
  y?: number;
  zoom?: number;
}

export interface SpinCubeOptions {
  /** Draw the light-line backdrop, or leave the canvas see-through. Default "transparent". */
  background?: "scene" | "transparent";
  /** Capture the wheel to zoom. Default false. */
  wheelZoom?: boolean;
  /** Hold Space to charge. Default false. */
  keyboard?: boolean;
  /** CSS touch-action for the canvas. Default "pan-y pinch-zoom", so vertical swipes scroll and pinches zoom the page. */
  touchAction?: string;
  /** Any press on the canvas charges the cube, not only one on the cube itself. Default false. */
  pressAnywhere?: boolean;
  /**
   * Element to take presses from, such as a section whose text lies over the
   * canvas. Presses on the cube win over that content; the rest pass through.
   * Default: the canvas.
   */
  pointerTarget?: HTMLElement;
  /**
   * Where the cube sits in the canvas: x and y as fractions (0.5 is the
   * centre), zoom as a size multiplier. A function is called with the
   * canvas size on every resize. Default centred, zoom 1.
   */
  layout?: SpinCubeLayout | ((width: number, height: number) => SpinCubeLayout);
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
