/**
 * The moon-phase model: each work is assigned one night of a lunar month,
 * and the last work's night is the full moon. `terminator` maps a night to
 * the phase the WebGL moon draws, so the phase always matches the work
 * being read.
 */
import workCount from "virtual:work-count";

/**
 * The night of the full moon, which is the last work's night.
 *
 * Derived from the number of works alone, not from `allWorks.length`: the
 * sky imports this on every route, and importing the works data would pull
 * every work's text into the eagerly loaded graph.
 */
export const FULL_NIGHT = workCount + 1;

/**
 * Terminator position across the disc, +1 (new) → -1 (full).
 *
 * For a unit disc lit from the right, the day/night boundary is the
 * half-ellipse x = t·√(1−y²); this returns t. Fractional nights are allowed
 * so scrolling can change the phase continuously.
 */
export function terminator(night: number): number {
  return Math.cos((Math.PI * (night - 1)) / (FULL_NIGHT - 1));
}
