import {
  animate,
  cancelFrame,
  frame,
  type MotionValue,
  motionValue,
} from "motion/react";
import { MOVE } from "./motion.ts";

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

interface TrackedCover {
  slug: string;
  /** the cover's parent box, which stays in the page while the cover moves */
  parent: HTMLElement;
  /** offset of the on-screen box from the laid-out one, px */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** on-screen size divided by laid-out size */
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  /** id of the animation frame the transition waits for before it starts */
  startFrame: number;
}

/** A cover's on-screen box when the page changed, and its velocity. */
export interface CoverSnapshot {
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

const attached = new Map<HTMLElement, TrackedCover>();
const tracked = new WeakMap<HTMLElement, TrackedCover>();

const values = ({ x, y, sx, sy }: TrackedCover) => [x, y, sx, sy];

function reset(el: HTMLElement, cover: TrackedCover) {
  cancelAnimationFrame(cover.startFrame);
  cover.x.jump(0);
  cover.y.jump(0);
  cover.sx.jump(1);
  cover.sy.jump(1);
  returnToFlow(el);
}

// The outgoing page is inert; any other cover is on the current page.
const isOutgoing = (el: HTMLElement) => el.closest("[inert]") !== null;

function draw(el: HTMLElement, { parent, x, y, sx, sy }: TrackedCover) {
  const [dx, dy, kx, ky] = [x.get(), y.get(), sx.get(), sy.get()];
  if (dx === 0 && dy === 0 && kx === 1 && ky === 1) return returnToFlow(el);
  // offsets are relative to the parent box's current position: if the reader
  // scrolls during the transition, the parent box moves and the cover follows
  const to = parent.getBoundingClientRect();
  if (!el.matches(":popover-open")) {
    el.popover = "manual";
    el.showPopover();
  }
  Object.assign(el.style, {
    ...OVERLAY_STYLE,
    left: `${to.left}px`,
    top: `${to.top}px`,
    width: `${to.width}px`,
    height: `${to.height}px`,
    transform: `translate3d(${dx}px, ${dy}px, 0) scale(${kx}, ${ky})`,
  });
}

function returnToFlow(el: HTMLElement) {
  if (el.matches(":popover-open")) el.hidePopover();
  el.removeAttribute("popover");
  Object.assign(el.style, IN_FLOW_STYLE);
}

// Overrides a popover's default placement: it sits exactly on its parent box.
const OVERLAY_STYLE = {
  position: "fixed",
  inset: "auto",
  margin: "0",
  transformOrigin: "0 0",
};
const IN_FLOW_STYLE = {
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
 * the cover element; the element's parent is the box it moves to (React 19:
 * returns its cleanup).
 */
export function trackCover(slug: string) {
  return (el: HTMLElement | null) => {
    const parent = el?.parentElement;
    if (!el || !parent) return;
    // React may detach a ref and attach it again immediately; StrictMode
    // does so in development after every mount. The element was never
    // removed, so a transition in progress continues: the same element gets
    // the same TrackedCover back.
    const cover: TrackedCover = tracked.get(el) ?? {
      slug,
      parent,
      x: motionValue(0),
      y: motionValue(0),
      sx: motionValue(1),
      sy: motionValue(1),
      startFrame: 0,
    };
    tracked.set(el, cover);
    // rendered once per frame, after all four values have updated
    const render = () => draw(el, cover);
    const off = values(cover).map((v) =>
      v.on("change", () => frame.render(render)),
    );
    attached.set(el, cover);
    return () => {
      for (const stop of off) stop();
      cancelFrame(render);
      attached.delete(el);
      // reset only if the ref is still detached after React has finished
      queueMicrotask(() => {
        if (!attached.has(el)) reset(el, cover);
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
export function snapshotCovers(): Map<string, CoverSnapshot> {
  const snapshots = new Map<string, CoverSnapshot>();
  for (const [el, cover] of attached) {
    if (isOutgoing(el)) continue;
    const r = el.getBoundingClientRect();
    if (!onScreen(r)) continue;
    // the laid-out size: the scale velocities are fractions of it
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    snapshots.set(cover.slug, {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      vLeft: cover.x.getVelocity(),
      vTop: cover.y.getVelocity(),
      vWidth: cover.sx.getVelocity() * w,
      vHeight: cover.sy.getVelocity() * h,
    });
  }
  return snapshots;
}

/**
 * Called after the page changed and the scroll position was restored. Each
 * cover on the incoming page that has a snapshot starts at the snapshot's
 * box. The same work's cover on the outgoing page is hidden, so only one
 * copy is visible.
 */
export function animateCovers(
  snapshots: Map<string, CoverSnapshot>,
  instant: boolean,
): void {
  for (const [el, cover] of attached) {
    const from = snapshots.get(cover.slug);
    if (isOutgoing(el)) {
      el.style.visibility = from ? "hidden" : "";
      reset(el, cover);
      continue;
    }
    el.style.visibility = "";
    if (!from) continue;

    // the destination: the parent box, whatever transition is in progress
    const to = cover.parent.getBoundingClientRect();
    reset(el, cover);
    if (instant || !onScreen(to) || to.width === 0 || to.height === 0) continue;

    cover.x.jump(from.left - to.left);
    cover.y.jump(from.top - to.top);
    cover.sx.jump(from.width / to.width);
    cover.sy.jump(from.height / to.height);
    // put at its start position before this frame is painted, not the next
    draw(el, cover);
    // The spring starts only after the cover has been painted at its start
    // position. The incoming page's first frame can take long to paint, and
    // a spring started before it would already be partway to the
    // destination when the cover is first visible.
    cover.startFrame = requestAnimationFrame(() => {
      cover.startFrame = requestAnimationFrame(() => {
        animate(cover.x, 0, { ...MOVE, velocity: from.vLeft });
        animate(cover.y, 0, { ...MOVE, velocity: from.vTop });
        animate(cover.sx, 1, { ...MOVE, velocity: from.vWidth / to.width });
        animate(cover.sy, 1, {
          ...MOVE,
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
