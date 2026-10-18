// Pointer, wheel and keyboard input. Movement is accumulated between frames
// and consumed by the animation loop, so the loop works with whole-frame
// deltas no matter how often events fire.

import { Vector2 } from "three";

const WHEEL_LINE_HEIGHT = 16; // Pixels per line for wheel events in line mode

/**
 * @param {HTMLElement} element - The canvas
 * @param {Object} options
 * @param {number} options.dragThreshold - Pixels moved before a press becomes a drag
 * @param {Function} options.onPress - A press started (pointer or Space)
 * @param {Function} options.onDragStart - A press turned into a drag
 * @param {Function} options.onRelease - Called with { wasDrag }
 * @returns {Object} Input state plus consume helpers
 */
export function createInput(
  element,
  { dragThreshold, onPress, onDragStart, onRelease }
) {
  const state = {
    pointer: new Vector2(), // -1..1, for camera parallax
    isDown: false,
    isDragging: false,
  };

  let activePointer = null;
  let downX = 0;
  let downY = 0;
  let lastX = 0;
  let lastY = 0;
  let dragX = 0;
  let dragY = 0;
  let wheel = 0;
  let spaceDown = false;

  const setPointer = (event) => {
    state.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
  };

  const release = () => {
    const wasDrag = state.isDragging;
    state.isDown = false;
    state.isDragging = false;
    element.classList.remove("dragging");
    onRelease({ wasDrag });
  };

  const handlers = {
    pointerdown(event) {
      if (state.isDown) return; // Ignore extra fingers
      activePointer = event.pointerId;
      element.setPointerCapture(event.pointerId);
      downX = lastX = event.clientX;
      downY = lastY = event.clientY;
      dragX = dragY = 0;
      state.isDown = true;
      setPointer(event);
      onPress();
    },
    pointermove(event) {
      setPointer(event);
      if (!state.isDown || event.pointerId !== activePointer) return;
      if (
        !state.isDragging &&
        Math.hypot(event.clientX - downX, event.clientY - downY) > dragThreshold
      ) {
        state.isDragging = true;
        element.classList.add("dragging");
        onDragStart();
      }
      if (state.isDragging) {
        dragX += event.clientX - lastX;
        dragY += event.clientY - lastY;
      }
      lastX = event.clientX;
      lastY = event.clientY;
    },
    pointerup(event) {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      release();
    },
    pointercancel(event) {
      handlers.pointerup(event);
    },
    pointerleave(event) {
      if (event.pointerType === "mouse" && !state.isDown) state.pointer.set(0, 0);
    },
    wheel(event) {
      event.preventDefault();
      wheel +=
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * WHEEL_LINE_HEIGHT
          : event.deltaY;
    },
  };

  const keyHandlers = {
    keydown(event) {
      if (event.code !== "Space" || event.repeat || isTyping(event)) return;
      event.preventDefault();
      if (state.isDown) return;
      spaceDown = true;
      state.isDown = true;
      onPress();
    },
    keyup(event) {
      if (event.code !== "Space" || !spaceDown) return;
      spaceDown = false;
      release();
    },
  };

  for (const [type, handler] of Object.entries(handlers)) {
    element.addEventListener(type, handler, { passive: type !== "wheel" });
  }
  for (const [type, handler] of Object.entries(keyHandlers)) {
    window.addEventListener(type, handler);
  }

  return {
    state,
    /** Pixels dragged since the last call. */
    consumeDrag(out) {
      out.set(dragX, dragY);
      dragX = dragY = 0;
      return out;
    },
    /** Wheel delta in pixels since the last call. */
    consumeWheel() {
      const value = wheel;
      wheel = 0;
      return value;
    },
  };
}

function isTyping(event) {
  const tag = event.target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
