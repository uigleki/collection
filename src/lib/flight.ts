import {
  animate,
  cancelFrame,
  frame,
  type MotionValue,
  motionValue,
} from "motion/react";
import { FLIGHT } from "./motion.ts";

/**
 * The shared-element transition for covers: a cover appears to move as one
 * element between its home-page row and its work page, in both directions.
 *
 * Every cover that can take part registers here. When the page changes, the
 * outgoing page's covers are measured at their on-screen position, including
 * mid-transition. The incoming page's cover for the same work starts at that
 * position and springs to its own place (FLIP: first, last, invert, play).
 * Its velocity is carried over too, so when the reader goes back halfway,
 * the cover turns around instead of stopping and restarting.
 *
 * While it moves, the cover is in the top layer (a manual popover). The
 * page it belongs to is still fading in, and that page's opacity,
 * transforms and stacking must not affect the cover. The cover's parent box
 * stays in the page as the position it moves to.
 */

interface Craft {
  slug: string;
  /** the cover's parent box, which stays in the page while the cover moves */
  home: HTMLElement;
  /** offset of the on-screen box from the laid-out one, px */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** on-screen size divided by laid-out size */
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  /** id of the animation frame the transition waits for before it starts */
  boarding: number;
}

/** A cover's on-screen box when the page changed, and its velocity. */
export interface Launch {
  left: number;
  top: number;
  width: number;
  height: number;
  /** px/s of the on-screen box's left, top, width, height */
  vLeft: number;
  vTop: number;
  vWidth: number;
  vHeight: number;
}

const fleet = new Map<HTMLElement, Craft>();
const crafts = new WeakMap<HTMLElement, Craft>();

const values = ({ x, y, sx, sy }: Craft) => [x, y, sx, sy];

function rest(el: HTMLElement, craft: Craft) {
  cancelAnimationFrame(craft.boarding);
  craft.x.jump(0);
  craft.y.jump(0);
  craft.sx.jump(1);
  craft.sy.jump(1);
  dock(el);
}

// The outgoing page is inert; any other cover is on the current page.
const leaving = (el: HTMLElement) => el.closest("[inert]") !== null;

function draw(el: HTMLElement, { home, x, y, sx, sy }: Craft) {
  const [dx, dy, kx, ky] = [x.get(), y.get(), sx.get(), sy.get()];
  if (dx === 0 && dy === 0 && kx === 1 && ky === 1) return dock(el);
  // offsets are relative to the home box's current position: if the reader
  // scrolls during the transition, the home box moves and the cover follows
  const to = home.getBoundingClientRect();
  if (!el.matches(":popover-open")) {
    el.popover = "manual";
    el.showPopover();
  }
  Object.assign(el.style, {
    ...ALOFT,
    left: `${to.left}px`,
    top: `${to.top}px`,
    width: `${to.width}px`,
    height: `${to.height}px`,
    transform: `translate3d(${dx}px, ${dy}px, 0) scale(${kx}, ${ky})`,
  });
}

function dock(el: HTMLElement) {
  if (el.matches(":popover-open")) el.hidePopover();
  el.removeAttribute("popover");
  Object.assign(el.style, GROUNDED);
}

// Overrides a popover's default placement: it sits exactly on its home box.
const ALOFT = {
  position: "fixed",
  inset: "auto",
  margin: "0",
  transformOrigin: "0 0",
};
const GROUNDED = {
  position: "",
  inset: "",
  margin: "",
  left: "",
  top: "",
  width: "",
  height: "",
  transform: "",
  transformOrigin: "",
};

/**
 * Ref callback for a cover that takes part in the transition. Attach it to
 * the cover element; its parent is the home box (React 19: returns its
 * cleanup).
 */
export function aboard(slug: string) {
  return (el: HTMLElement | null) => {
    const home = el?.parentElement;
    if (!el || !home) return;
    // React may detach a ref and attach it again immediately; StrictMode
    // does so in development after every mount. The element was never
    // removed, so a transition in progress continues: the same element gets
    // the same craft back.
    const craft: Craft = crafts.get(el) ?? {
      slug,
      home,
      x: motionValue(0),
      y: motionValue(0),
      sx: motionValue(1),
      sy: motionValue(1),
      boarding: 0,
    };
    crafts.set(el, craft);
    // rendered once per frame, after all four values have updated
    const render = () => draw(el, craft);
    const off = values(craft).map((v) =>
      v.on("change", () => frame.render(render)),
    );
    fleet.set(el, craft);
    return () => {
      for (const stop of off) stop();
      cancelFrame(render);
      fleet.delete(el);
      // reset only if the ref is still detached after React has finished
      queueMicrotask(() => {
        if (!fleet.has(el)) rest(el, craft);
      });
    };
  };
}

/**
 * Called before the page changes. Returns the on-screen box and velocity of
 * every cover on the current page. Covers outside the viewport are skipped:
 * a transition that starts off-screen would show a cover entering from
 * outside the viewport.
 */
export function takeOff(): Map<string, Launch> {
  const launches = new Map<string, Launch>();
  for (const [el, craft] of fleet) {
    if (leaving(el)) continue;
    const r = el.getBoundingClientRect();
    if (!onScreen(r)) continue;
    // the laid-out size: the scale velocities are fractions of it
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    launches.set(craft.slug, {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      vLeft: craft.x.getVelocity(),
      vTop: craft.y.getVelocity(),
      vWidth: craft.sx.getVelocity() * w,
      vHeight: craft.sy.getVelocity() * h,
    });
  }
  return launches;
}

/**
 * Called after the page changed and the scroll position was restored. Each
 * cover on the incoming page that has a launch starts at the launch's box.
 * The same work's cover on the outgoing page is hidden, so only one copy
 * is visible.
 */
export function land(launches: Map<string, Launch>, still: boolean): void {
  for (const [el, craft] of fleet) {
    const from = launches.get(craft.slug);
    if (leaving(el)) {
      el.style.visibility = from ? "hidden" : "";
      rest(el, craft);
      continue;
    }
    el.style.visibility = "";
    if (!from) continue;

    // the destination: the home box, whatever transition is in progress
    const to = craft.home.getBoundingClientRect();
    rest(el, craft);
    if (still || !onScreen(to) || to.width === 0 || to.height === 0) continue;

    craft.x.jump(from.left - to.left);
    craft.y.jump(from.top - to.top);
    craft.sx.jump(from.width / to.width);
    craft.sy.jump(from.height / to.height);
    // put at its start position before this frame is painted, not the next
    draw(el, craft);
    // The spring starts only after the cover has been painted at its start
    // position. The incoming page's first frame can take long to paint, and
    // a spring started before it would already be partway to the
    // destination when the cover is first visible.
    craft.boarding = requestAnimationFrame(() => {
      craft.boarding = requestAnimationFrame(() => {
        animate(craft.x, 0, { ...FLIGHT, velocity: from.vLeft });
        animate(craft.y, 0, { ...FLIGHT, velocity: from.vTop });
        animate(craft.sx, 1, { ...FLIGHT, velocity: from.vWidth / to.width });
        animate(craft.sy, 1, {
          ...FLIGHT,
          velocity: from.vHeight / to.height,
        });
      });
    });
  }
}

function onScreen(r: DOMRect): boolean {
  return (
    r.bottom > 0 &&
    r.top < window.innerHeight &&
    r.right > 0 &&
    r.left < window.innerWidth
  );
}
