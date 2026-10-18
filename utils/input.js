// Pointer, wheel and keyboard input. Movement is accumulated between frames
// and consumed by the animation loop, so the loop works with whole-frame
// deltas no matter how often events fire.

import { Vector2 } from "three";

const WHEEL_LINE_HEIGHT = 16; // Pixels per line for wheel events in line mode

/**
 * @param {HTMLElement} element - The canvas
 * @param {Object} options
 * @param {number} options.dragThreshold - Pixels moved before a press becomes a drag
 * @param {boolean} [options.wheel] - Capture the wheel for zooming
 * @param {boolean} [options.keyboard] - Space presses and releases like a click
 * @param {Function} options.onPress - A press started (pointer or Space)
 * @param {Function} options.onDragStart - A press turned into a drag
 * @param {Function} options.onRelease - Called with { wasDrag, cancelled }
 * @returns {Object} Input state, consume helpers and dispose
 */
export function createInput(
  element,
  { dragThreshold, wheel = false, keyboard = false, onPress, onDragStart, onRelease }
) {
  const state = {
    pointer: new Vector2(), // -1..1 across the window, for camera parallax
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
  let wheelDelta = 0;
  let spaceDown = false;

  const setPointer = (event) => {
    state.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
  };

  const setDragging = (dragging) => {
    state.isDragging = dragging;
    element.style.cursor = dragging ? "grabbing" : "grab";
  };

  // A cancelled press (the browser took the touch over to scroll the page)
  // releases without a pulse or a throw
  const release = (cancelled) => {
    const wasDrag = state.isDragging;
    state.isDown = false;
    setDragging(false);
    onRelease({ wasDrag, cancelled });
  };

  const elementHandlers = {
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
      if (!state.isDown || event.pointerId !== activePointer) return;
      if (
        !state.isDragging &&
        Math.hypot(event.clientX - downX, event.clientY - downY) > dragThreshold
      ) {
        setDragging(true);
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
      release(false);
    },
    pointercancel(event) {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      release(true);
    },
    contextmenu(event) {
      if (state.isDown) event.preventDefault(); // A long touch is a charge
    },
  };
  if (wheel) {
    elementHandlers.wheel = (event) => {
      event.preventDefault();
      wheelDelta +=
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * WHEEL_LINE_HEIGHT
          : event.deltaY;
    };
  }

  const windowHandlers = {
    pointermove: setPointer,
    pointerout(event) {
      // Left the window: let the camera drift back to centre
      if (!event.relatedTarget && event.pointerType === "mouse" && !state.isDown) {
        state.pointer.set(0, 0);
      }
    },
  };
  if (keyboard) {
    windowHandlers.keydown = (event) => {
      if (event.code !== "Space" || event.repeat || isTyping(event)) return;
      event.preventDefault();
      if (state.isDown) return;
      spaceDown = true;
      state.isDown = true;
      onPress();
    };
    windowHandlers.keyup = (event) => {
      if (event.code !== "Space" || !spaceDown) return;
      spaceDown = false;
      release(false);
    };
  }

  const listen = (target, handlers, method) => {
    for (const [type, handler] of Object.entries(handlers)) {
      target[method](type, handler, { passive: type !== "wheel" && type !== "contextmenu" });
    }
  };
  listen(element, elementHandlers, "addEventListener");
  listen(window, windowHandlers, "addEventListener");
  element.style.cursor = "grab";

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
      const value = wheelDelta;
      wheelDelta = 0;
      return value;
    },
    dispose() {
      listen(element, elementHandlers, "removeEventListener");
      listen(window, windowHandlers, "removeEventListener");
    },
  };
}

function isTyping(event) {
  const tag = event.target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
