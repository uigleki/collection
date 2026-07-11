import { allWorks } from "@/data/works";

/**
 * The collection's lunar month: each work is one night, and the last always
 * stands under a full moon. One terminator value drives both the WebGL moon
 * and the reading progress, so the two can never disagree.
 */

/** The night the moon is seen whole — the last work's night, however many
 * works the collection holds. */
export const FULL_NIGHT = allWorks.length + 1;

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

/** Lit fraction of the disc, 0 (new) → 1 (full). */
export function illumination(night: number): number {
  return (1 - terminator(night)) / 2;
}
