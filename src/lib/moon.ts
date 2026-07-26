/**
 * The collection's lunar month: each work is one night, and the last always
 * stands under a full moon. One terminator value drives both the WebGL moon
 * and the reading progress, so the two can never disagree.
 */

/**
 * The night the moon is seen whole — the last work's night.
 *
 * Written out rather than derived from `allWorks.length`: the sky imports
 * this on every route, and that one read would drag the whole collection —
 * every work's prose — into the eagerly loaded graph. moon.test.ts asserts
 * the two agree, so the collection cannot grow past its month without CI
 * saying so.
 */
export const FULL_NIGHT = 15;

/**
 * Terminator position across the disc, +1 (new) → -1 (full).
 *
 * For a unit disc lit from the right, the day/night boundary is the
 * half-ellipse x = t·√(1−y²); this returns t. Fractional nights are allowed
 * so scroll can wax the moon continuously.
 */
export function terminator(night: number): number {
  return Math.cos((Math.PI * (night - 1)) / (FULL_NIGHT - 1));
}
