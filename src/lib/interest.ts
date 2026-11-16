/**
 * Interest invokers where the browser has none (Firefox and Safari, as of
 * late 2026): a button's `interestfor` hint opens while a mouse is over the
 * button or the button has keyboard focus, stays open while the pointer is
 * over the hint, and closes on Escape. This is only what HintButton uses,
 * not the whole feature: no delays, and no touch long-press, which has no
 * hover to show. The `interestfor` polyfill package is not used because it
 * inserts <style> elements, which the site's CSP blocks.
 */
export function supportInterestInvokers(): void {
  if ("interestForElement" in HTMLButtonElement.prototype) return;

  let open: HTMLElement | null = null;
  const hintOf = (target: EventTarget | null) => {
    const trigger =
      target instanceof Element ? target.closest("[interestfor]") : null;
    const id = trigger?.getAttribute("interestfor");
    return id ? document.getElementById(id) : null;
  };
  const show = (hint: HTMLElement) => {
    if (hint === open) return;
    hide();
    hint.showPopover();
    open = hint;
  };
  const hide = () => {
    if (open?.matches(":popover-open")) open.hidePopover();
    open = null;
  };

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const hint = hintOf(e.target);
    if (hint) show(hint);
    else if (!(e.target instanceof Node && open?.contains(e.target))) hide();
  });
  document.addEventListener("focusin", (e) => {
    const hint = hintOf(e.target);
    if (
      hint &&
      e.target instanceof Element &&
      e.target.matches(":focus-visible")
    )
      show(hint);
  });
  document.addEventListener("focusout", (e) => {
    if (hintOf(e.target) === open) hide();
  });
  // Closed after the other keydown listeners have run, as the native hint
  // is, so they can still see that Escape closed a hint (PageNav).
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setTimeout(hide);
  });
}
