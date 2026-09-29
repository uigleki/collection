import type { Track, Work, WorkCategory } from "./types.ts";
import { anime } from "./works/anime.ts";
import { artists } from "./works/artists.ts";
import { games } from "./works/games.ts";
import { movies } from "./works/movies.ts";
import { music } from "./works/music.ts";

export const categories = [
  { name: "Anime", works: anime },
  { name: "Movies", works: movies },
  { name: "Games", works: games },
  { name: "Artists", works: artists },
] as const satisfies readonly WorkCategory[];

export { music };

/**
 * A song's full name. The title alone is not one — two different artists
 * each have a song called LIFE — so performer and song together identify a
 * track, both on the water and in the test that proves no two collide.
 */
export const trackName = (track: Track) => `${track.artist} · ${track.title}`;

/** A work placed in the collection: what it is, and where it stands. */
export interface WorkEntry {
  readonly work: Work;
  readonly category: string;
  /** 1-based position within the work's own medium (Anime 01…04) */
  readonly ordinal: number;
  /**
   * The work's night in the collection's lunar month (see lib/moon.ts):
   * the first work is night 2 and the last stands under the full moon (15).
   */
  readonly night: number;
}

export interface Section {
  readonly name: string;
  readonly entries: readonly WorkEntry[];
}

// Turn the curation into addressable rooms, keeping the grouping the home
// page reads rather than flattening and re-joining it by category NAME —
// a display string is no way to find a work again. Nights are handed out as
// the pass walks, so a work's night is simply its place in reading order.
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
 * Previous / next room across the WHOLE collection, in reading order —
 * the media share one format, so the shelf runs unbroken from the first
 * work to the last.
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
