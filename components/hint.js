const SHOW_DELAY = 1200; // ms after load
const AUTO_HIDE = 9000; // ms after load

/**
 * Shows a short how-to line that fades away after the first interaction.
 * @param {HTMLElement} element
 * @returns {{dismiss: Function}}
 */
export function createHint(element) {
  if (window.matchMedia("(pointer: coarse)").matches) {
    element.textContent = "drag to spin · hold to charge";
  }

  let dismissed = false;
  const showTimer = setTimeout(() => element.classList.add("visible"), SHOW_DELAY);
  const hideTimer = setTimeout(() => dismiss(), AUTO_HIDE);

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    element.classList.remove("visible");
  }

  return { dismiss };
}
