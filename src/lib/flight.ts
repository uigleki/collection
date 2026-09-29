import {
  animate,
  cancelFrame,
  frame,
  type MotionValue,
  motionValue,
} from "motion/react";
import { FLIGHT } from "./motion.ts";

/**
 * The cover's flight: a tapped cover is one continuous object traveling
 * from its row into its room and back.
 *
 * Every cover that can fly registers here. When the page changes, the
 * departing page's covers are measured where they are *seen* — mid-flight
 * included — and the arriving page's copy of the same work starts exactly
 * there, then springs home to its own place (FLIP: first, last, invert,
 * play). Its speed is carried over too, so a reader who turns back halfway
 * sees the cover curve around, not stop and restart.
 *
 * In flight the cover is lifted into the top layer (a manual popover): the
 * page it lands on is still fading in, and nothing that page does — its
 * opacity, its transforms, what it stacks above — may touch the one object
 * the reader is following. Its own box stays behind as the place it lands.
 */

interface Craft {
  slug: string;
  /** the box the cover sits in, which stays in the page while it flies */
  home: HTMLElement;
  /** offset of the seen box from the laid-out one, px */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** seen size over laid-out size */
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  /** the frame the flight is waiting on before it starts */
  boarding: number;
}

/** Where a cover was seen as the page changed, and how fast it was going. */
export interface Launch {
  left: number;
  top: number;
  width: number;
  height: number;
  /** px/s of the seen box's left, top, width, height */
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

// A page on its way out is inert; everything else is the page being read.
const leaving = (el: HTMLElement) => el.closest("[inert]") !== null;

function draw(el: HTMLElement, { home, x, y, sx, sy }: Craft) {
  const [dx, dy, kx, ky] = [x.get(), y.get(), sx.get(), sy.get()];
  if (dx === 0 && dy === 0 && kx === 1 && ky === 1) return dock(el);
  // offsets are from the home box as it is now: a reader scrolling
  // mid-flight carries the landing place, and the cover follows it
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

// A popover's own placement undone: it sits exactly on its home box.
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
 * Ref callback for a cover that can fly — the cover itself, inside the box
 * it rests in (React 19: returns its cleanup).
 */
export function aboard(slug: string) {
  return (el: HTMLElement | null) => {
    const home = el?.parentElement;
    if (!el || !home) return;
    // React may detach a ref and attach it again at once — StrictMode does,
    // in development, right after every mount. The cover never left, so its
    // flight goes on: the same element gets the same craft back.
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
    // drawn once a frame, after every value has moved
    const render = () => draw(el, craft);
    const off = values(craft).map((v) =>
      v.on("change", () => frame.render(render)),
    );
    fleet.set(el, craft);
    return () => {
      for (const stop of off) stop();
      cancelFrame(render);
      fleet.delete(el);
      // only a cover still detached once React is done has really gone
      queueMicrotask(() => {
        if (!fleet.has(el)) rest(el, craft);
      });
    };
  };
}

/**
 * Before the page changes: every cover on the page being read, where it is
 * seen and how fast it moves. Covers out of sight stay behind — a flight
 * that starts off-screen is a cover appearing from nowhere.
 */
export function takeOff(): Map<string, Launch> {
  const launches = new Map<string, Launch>();
  for (const [el, craft] of fleet) {
    if (leaving(el)) continue;
    const r = el.getBoundingClientRect();
    if (!onScreen(r)) continue;
    // the laid-out size: what the scale velocities are fractions of
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
 * After the page changed and the scroll was restored: each arriving cover
 * that was seen on the way out starts where it was seen, and the copy left
 * on the departing page steps out of view so only one object exists.
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

    // where it belongs: the box it rests in, whatever flight it is on
    const to = craft.home.getBoundingClientRect();
    rest(el, craft);
    if (still || !onScreen(to) || to.width === 0 || to.height === 0) continue;

    craft.x.jump(from.left - to.left);
    craft.y.jump(from.top - to.top);
    craft.sx.jump(from.width / to.width);
    craft.sy.jump(from.height / to.height);
    // lifted before this frame is painted, not on the next
    draw(el, craft);
    // The spring's clock starts once the cover has been seen where it
    // left from. The arriving page's first frame can take a long while to
    // paint, and a clock started before it would have the cover already
    // halfway home the first time anyone sees it.
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
