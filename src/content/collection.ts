/**
 * Assembles the collection: the items the README lists, in its order, each
 * joined to its review in reviews.md and to its catalog.ts entry (the data
 * the Markdown does not contain). The three sources must agree on every
 * name: a work that is listed but not reviewed, reviewed but not listed, or
 * missing from the catalog fails the build.
 */
import type { TitleLang, Track, Work, WorkCategory } from "../data/types.ts";
import type { Readme, Review } from "./parse.ts";

/** Where a work's cover art is fetched from (scripts/fetch-covers.ts). */
export type CoverSource =
  | { kind: "anilist"; search: string }
  | { kind: "steam"; appid: number };

export interface WorkMeta {
  /** used in the work page's URL and as the cover asset's file name */
  slug: string;
  lang?: TitleLang;
  accent: string;
  /** absent without a licensed source: the work gets a typographic panel */
  art?: CoverSource;
}

export interface SongMeta {
  lang?: TitleLang;
  /** a performer's name can be in a different language from the song */
  artistLang?: TitleLang;
}

export interface Catalog {
  works: Record<string, WorkMeta>;
  /** keyed "artist - title", exactly as the README writes the song */
  songs: Record<string, SongMeta>;
}

export interface Collection {
  categories: WorkCategory[];
  music: Track[];
}

const HAN_OR_KANA = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

function take<T>(source: Map<string, T>, name: string, what: string): T {
  const found = source.get(name);
  if (found === undefined)
    throw new Error(`content: "${name}" is in the README but has no ${what}`);
  source.delete(name);
  return found;
}

function rejectUnused(source: Map<string, unknown>, where: string) {
  const names = [...source.keys()];
  if (names.length > 0)
    throw new Error(
      `content: ${where} names what the README does not list: ${names.join(", ")}`,
    );
}

export function assemble(
  readme: Readme,
  reviews: ReadonlyMap<string, Review>,
  catalog: Catalog,
): Collection {
  const unusedReviews = new Map(reviews);
  const unusedWorks = new Map(Object.entries(catalog.works));
  const unusedSongs = new Map(Object.entries(catalog.songs));

  const categories = readme.groups.map(({ medium, titles }) => ({
    name: medium,
    works: titles.map((title): Work => {
      const { art: _fetchOnly, ...meta } = take(
        unusedWorks,
        title,
        "catalog entry",
      );
      const { subtitle, points, flaws } = take(unusedReviews, title, "review");
      if (HAN_OR_KANA.test(title) && !meta.lang)
        throw new Error(`content: say which language "${title}" is in`);
      return {
        title,
        ...meta,
        subtitle,
        review: points,
        ...(flaws && { flaws }),
      };
    }),
  }));

  const music = readme.songs.map(({ artist, title }): Track => {
    const name = `${artist} - ${title}`;
    const { subtitle } = take(unusedReviews, name, "review");
    const meta = unusedSongs.get(name) ?? {};
    unusedSongs.delete(name);
    if (HAN_OR_KANA.test(title) && !meta.lang)
      throw new Error(`content: say which language the title "${name}" is in`);
    if (HAN_OR_KANA.test(artist) && !meta.artistLang)
      throw new Error(`content: say which language the artist "${name}" is in`);
    return { artist, title, ...meta, subtitle };
  });

  rejectUnused(unusedReviews, "reviews.md");
  rejectUnused(unusedWorks, "the catalog");
  rejectUnused(unusedSongs, "the catalog's songs");
  return { categories, music };
}
