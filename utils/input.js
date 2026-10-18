// Pointer, wheel and keyboard input. Movement is accumulated between frames
// and consumed by the animation loop, so the loop works with whole-frame
// deltas no matter how often events fire.

import { Vector2 } from "three";

const WHEEL_LINE_HEIGHT = 16; // Pixels per line for wheel events in line mode

// Cursor classes. They override descendants' cursors too, so the grab hand
// shows over the cube even where page text lies on top of it
const CURSOR_STYLE_ID = "spincube-cursor";
const CURSOR_CSS = `
  .spincube-grab, .spincube-grab * { cursor: grab !important; }
  .spincube-grabbing, .spincube-grabbing * { cursor: grabbing !important; }
`;

/**
 * @param {HTMLElement} element - The canvas
 * @param {Object} options
 * @param {HTMLElement} [options.target] - Element whose pointer events drive the cube; defaults to the canvas
 * @param {number} options.dragThreshold - Pixels moved before a press becomes a drag
 * @param {boolean} [options.wheel] - Capture the wheel for zooming
 * @param {boolean} [options.keyboard] - Space presses and releases like a click
 * @param {Function} [options.canPress] - Whether a pointer event is over something pressable
 * @param {Function} options.onPress - A press started (pointer or Space)
 * @param {Function} options.onDragStart - A press turned into a drag
 * @param {Function} options.onRelease - Called with { wasDrag, cancelled }
 * @returns {Object} Input state, consume helpers and dispose
 */
export function createInput(
  element,
  {
    target = element,
    dragThreshold,
    wheel = false,
    keyboard = false,
    canPress = () => true,
    onPress,
    onDragStart,
    onRelease,
  }
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

  ensureCursorStyle();
  const setCursor = (cursor) => {
    target.classList.toggle("spincube-grab", cursor === "grab");
    target.classList.toggle("spincube-grabbing", cursor === "grabbing");
  };

  const setDragging = (dragging) => {
    state.isDragging = dragging;
    setCursor(dragging ? "grabbing" : "grab");
  };

  // A cancelled press (the browser took the touch over to scroll the page)
  // releases without a pulse or a throw
  const release = (cancelled) => {
    const wasDrag = state.isDragging;
    state.isDown = false;
    setDragging(false);
    onRelease({ wasDrag, cancelled });
  };

  // Listened for on the target in the capture phase, so a press on the cube
  // wins over whatever page content lies on top of it
  const targetHandlers = {
    pointerdown(event) {
      if (state.isDown || !canPress(event)) return; // Ignore extra fingers
      event.preventDefault(); // No text selection or focus change
      activePointer = event.pointerId;
      target.setPointerCapture(event.pointerId);
      downX = lastX = event.clientX;
      downY = lastY = event.clientY;
      dragX = dragY = 0;
      state.isDown = true;
      setPointer(event);
      onPress();
    },
    pointermove(event) {
      if (!state.isDown) {
        setCursor(canPress(event) ? "grab" : null);
        return;
      }
      if (event.pointerId !== activePointer) return;
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
    targetHandlers.wheel = (event) => {
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

  const listen = (eventTarget, handlers, method) => {
    for (const [type, handler] of Object.entries(handlers)) {
      eventTarget[method](type, handler, {
        capture: eventTarget === target,
        passive: !["pointerdown", "wheel", "contextmenu"].includes(type),
      });
    }
  };
  listen(target, targetHandlers, "addEventListener");
  listen(window, windowHandlers, "addEventListener");

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
      listen(target, targetHandlers, "removeEventListener");
      listen(window, windowHandlers, "removeEventListener");
      setCursor(null);
    },
  };
}

function ensureCursorStyle() {
  if (document.getElementById(CURSOR_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CURSOR_STYLE_ID;
  style.textContent = CURSOR_CSS;
  document.head.append(style);
}

function isTyping(event) {
  const tag = event.target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
