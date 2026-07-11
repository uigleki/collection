import { coverByTitle } from "./generated/covers";
import type { PageMeta, Work, WorkCategory } from "./types";
import { anime } from "./works/anime";
import { artists } from "./works/artists";
import { games } from "./works/games";
import { movies } from "./works/movies";
import { music } from "./works/music";

export const siteMeta = {
  title: "Perfect Collection",
  description:
    "Works that enrich rather than diminish - created from love, not manipulation.",
} as const satisfies PageMeta;

export const categories = [
  { name: "Anime", works: anime },
  { name: "Movies", works: movies },
  { name: "Games", works: games },
  { name: "Artists", works: artists },
] as const satisfies readonly WorkCategory[];

export { music };

// A slug is the stable identity of a work — its room URL and its cover asset
// share it. Twelve slugs come straight from the generated cover metadata; the
// two works with no licensed image source are named explicitly here so every
// work resolves without touching the content files.
const SLUG_OVERRIDES: Record<string, string> = {
  "Charlie and the Chocolate Factory": "charlie-chocolate-factory",
  カントク: "kantoku",
};

function slugFor(title: string): string {
  const slug = coverByTitle[title]?.slug ?? SLUG_OVERRIDES[title];
  if (!slug) throw new Error(`No slug resolved for work: ${title}`);
  return slug;
}

// Every non-Latin title in the four work media is Japanese (the Chinese in
// this collection lives only in the music). Kana detection is NOT enough:
// 化物語 and 少女終末旅行 are kanji-only yet must take Japanese glyph forms.
const CJK = /[぀-ヿ㐀-鿿]/;

export interface WorkEntry {
  readonly work: Work;
  readonly slug: string;
  readonly category: string;
  /** 1-based position within the work's own medium (Anime 01…04) */
  readonly ordinal: number;
  /**
   * The work's night in the collection's lunar month (see lib/moon.ts):
   * the first work is night 2 and the last stands under the full moon (15).
   */
  readonly night: number;
  /** language of the title where it isn't Latin */
  readonly lang?: "ja";
}

// Flatten the curation into addressable rooms. Order is the reading order of
// the collection itself, so each work's night is simply its place in line.
export const allWorks: readonly WorkEntry[] = categories
  .flatMap((category) =>
    category.works.map((work: Work, i) => ({
      work,
      slug: slugFor(work.title),
      category: category.name,
      ordinal: i + 1,
      night: 0, // assigned globally below
      ...(CJK.test(work.title) ? { lang: "ja" as const } : {}),
    })),
  )
  .map((entry, i) => ({ ...entry, night: i + 2 }));

export const workBySlug: ReadonlyMap<string, WorkEntry> = new Map(
  allWorks.map((entry) => [entry.slug, entry]),
);

export function entriesFor(category: string): readonly WorkEntry[] {
  return allWorks.filter((entry) => entry.category === category);
}

/**
 * Previous / next room across the WHOLE collection, in reading order —
 * the media share one format, so the shelf runs unbroken from the first
 * work to the last.
 */
export function neighbors(slug: string): {
  prev: WorkEntry | null;
  next: WorkEntry | null;
} {
  const i = allWorks.findIndex((e) => e.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: allWorks[i - 1] ?? null,
    next: allWorks[i + 1] ?? null,
  };
}
