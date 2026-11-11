import collection from "virtual:collection";
import type { Track, Work } from "./types.ts";

// Parsed from README.md and docs/reviews.md at build time (src/content).
// This module does not change the content; it only orders and indexes it.
export const { categories, music } = collection;

/**
 * A track's full name. The title alone is not unique (two different artists
 * each have a song called LIFE), so the performer and the title together
 * identify a track: as the list key in MusicSection, and in the test that
 * checks no two tracks share a name.
 */
export const trackName = (track: Track) => `${track.artist} · ${track.title}`;

/** A work together with its position in the collection. */
export interface WorkEntry {
  readonly work: Work;
  readonly category: string;
  /** 1-based position within the work's own medium */
  readonly ordinal: number;
  /**
   * The work's night number in the lunar month (see lib/moon.ts): the first
   * work is night 2 and the last is the full-moon night.
   */
  readonly night: number;
}

export interface Section {
  readonly name: string;
  readonly entries: readonly WorkEntry[];
}

// Build the entries per category and keep that grouping for the home page,
// instead of flattening the list and regrouping it by category name: a
// display string is not a reliable key. Nights are assigned in iteration
// order, so a work's night follows its position in reading order.
let night = 2;
export const sections: readonly Section[] = categories.map((category) => ({
  name: category.name,
  entries: category.works.map((work: Work, i) => ({
    work,
    category: category.name,
    ordinal: i + 1,
    night: night++,
  })),
}));

export const allWorks: readonly WorkEntry[] = sections.flatMap(
  (section) => section.entries,
);

export const workBySlug: ReadonlyMap<string, WorkEntry> = new Map(
  allWorks.map((entry) => [entry.work.slug, entry]),
);

/**
 * The previous and next work across the whole collection, in reading
 * order. Every category uses the same page format, so the sequence runs
 * from the first work to the last without stopping at category boundaries.
 */
export function neighbors(slug: string): {
  prev: WorkEntry | null;
  next: WorkEntry | null;
} {
  const i = allWorks.findIndex((e) => e.work.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: allWorks[i - 1] ?? null,
    next: allWorks[i + 1] ?? null,
  };
}
