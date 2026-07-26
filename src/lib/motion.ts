/**
 * The site's motion vocabulary.
 *
 * Four springs, because four different things move: a display line lifting
 * behind its mask, a block of reading arriving, a row in a long list, and a
 * cover following the cursor. Anything that moves for one of those reasons
 * uses that spring — the same gesture spelled 60/18 in one file and 65/19 in
 * the next is drift, not art direction, and DESIGN.md asks this site to be
 * internally coherent before it asks anything else.
 *
 * Fade durations are NOT here: each is an editorial choice about how long a
 * particular beat should linger (the koan holds at 1.8s, an interlude at
 * 1.2s), and collapsing them would flatten the pacing on purpose.
 */

/** A masked display line lifting into place — the largest type on the page. */
export const RISE = {
  type: "spring",
  stiffness: 60,
  damping: 18,
} as const;

/** A block of reading arriving: a row, a concept, a paragraph. */
export const ENTER = {
  type: "spring",
  stiffness: 70,
  damping: 20,
} as const;

/** One row of a long list — quicker, so forty-nine of them never drag. */
export const LIST = {
  type: "spring",
  stiffness: 90,
  damping: 22,
} as const;

/** Live cursor tracking: stiff enough to feel attached to the pointer. */
export const FOLLOW = { stiffness: 160, damping: 20 } as const;
