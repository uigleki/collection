import { cssSpring, type Spring } from "./spring.ts";

/**
 * The site's spring constants.
 *
 * One spring per kind of motion, each named below. Every motion of a kind
 * uses that constant, so the same motion never gets slightly different
 * values in different files (60/18 here, 65/19 there). DESIGN.md requires
 * the site to be internally coherent.
 *
 * Scroll-driven reveals use no spring and no duration: the scroll position
 * is their timeline (index.css: .arrive).
 */

/** Display text (the largest type) sliding up into place behind its mask. */
export const RISE = { stiffness: 60, damping: 18 } as const satisfies Spring;

/** A block of body content entering when its page mounts. */
export const ENTER = { stiffness: 70, damping: 20 } as const satisfies Spring;

/** Live cursor tracking: stiff enough to feel attached to the pointer. */
export const FOLLOW = { stiffness: 160, damping: 20 } as const;

/**
 * A cover moving between its home-page row and its work page. Slightly
 * underdamped: it overshoots a little before it stops, and a move reversed
 * halfway keeps its velocity through the reversal.
 */
export const FLIGHT = { type: "spring", stiffness: 190, damping: 26 } as const;

/**
 * The cross-fade between two pages. Opacity only: the pages overlap while
 * it runs, and a transform on a page would also move its position:fixed
 * controls. Fast, so the reader does not wait for it, and interruptible,
 * because a spring continues from the current opacity.
 */
export const SCENE = { type: "spring", stiffness: 260, damping: 34 } as const;

/** Hover on a control: a small overshoot, then rest. */
export const HOVER = { stiffness: 300, damping: 24 } as const satisfies Spring;

/** A press: stiff, so the control responds immediately. */
export const PRESS = { stiffness: 900, damping: 50 } as const satisfies Spring;

/**
 * The springs CSS uses, as custom properties (index.css reads
 * --spring-<name> and --spring-<name>-ms), so a CSS entrance or hover and a
 * motion spring share one definition. The build sets them on <body>
 * (vite.config.ts), because a page is painted and its entrance animations
 * start before any script runs. On <body>, not <html>: they are kilobytes
 * long, and before <head> they would push the page's charset declaration
 * past where a browser looks for it.
 */
export function cssSprings(): string {
  return (
    [
      ["rise", RISE],
      ["enter", ENTER],
      ["hover", HOVER],
      ["press", PRESS],
    ] as const
  )
    .map(([name, spring]) => {
      const { easing, duration } = cssSpring(spring);
      return `--spring-${name}: ${easing}; --spring-${name}-ms: ${duration}ms`;
    })
    .join("; ");
}
