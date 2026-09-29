import { cssSpring, type Spring } from "./spring.ts";

/**
 * The site's motion vocabulary.
 *
 * One spring per reason something moves: a display line lifting behind its
 * mask, a block of reading arriving, a cover following the cursor, a cover
 * flying between pages, a page changing, a control under a hovering
 * pointer, a control being pressed.
 * Anything that moves for one of those reasons
 * uses that spring — the same gesture spelled 60/18 in one file and 65/19 in
 * the next is drift, not art direction, and DESIGN.md asks this site to be
 * internally coherent before it asks anything else.
 *
 * What the scroll reveals has no spring and no clock: the reader's position
 * is its timeline (index.css: .arrive).
 */

/** A masked display line lifting into place — the largest type on the page. */
export const RISE = { stiffness: 60, damping: 18 } as const satisfies Spring;

/** A block of reading arriving as its page mounts. */
export const ENTER = { stiffness: 70, damping: 20 } as const satisfies Spring;

/** Live cursor tracking: stiff enough to feel attached to the pointer. */
export const FOLLOW = { stiffness: 160, damping: 20 } as const;

/**
 * A cover flying between its row and its room. Just short of critical: it
 * lands with the faintest settle, and a flight turned around halfway keeps
 * its speed through the turn.
 */
export const FLIGHT = { type: "spring", stiffness: 190, damping: 26 } as const;

/**
 * One page giving way to the next. Opacity only — the pages overlap for
 * this long, and anything that moved them would drag their fixed chips
 * along. Quick, so a reader never waits on it; interruptible, since
 * a spring picks up from wherever the fade stands.
 */
export const SCENE = { type: "spring", stiffness: 260, damping: 34 } as const;

/** A pointer settling onto a control: a little give, then rest. */
export const HOVER = { stiffness: 300, damping: 24 } as const satisfies Spring;

/** A press: crisp going in, so the control answers the finger at once. */
export const PRESS = { stiffness: 900, damping: 50 } as const satisfies Spring;

/**
 * Publish the CSS-side springs as custom properties (index.css reads
 * --spring-<name> and --spring-<name>-ms), so an entrance or a hover in
 * CSS and a spring in motion are the same physics, written once.
 */
export function publishSprings(root: HTMLElement): void {
  for (const [name, spring] of [
    ["rise", RISE],
    ["enter", ENTER],
    ["hover", HOVER],
    ["press", PRESS],
  ] as const) {
    const { easing, duration } = cssSpring(spring);
    root.style.setProperty(`--spring-${name}`, easing);
    root.style.setProperty(`--spring-${name}-ms`, `${duration}ms`);
  }
}
