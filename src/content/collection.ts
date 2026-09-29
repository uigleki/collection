/**
 * The collection as the site knows it: what the README lists, in its order,
 * each piece joined to what reviews.md says about it and to the little the
 * Markdown cannot carry (catalog.ts). The three sources must agree on every
 * name — a work listed but never reviewed, reviewed but never listed, or
 * missing from the catalog stops the build rather than the site going short.
 */
import type { TitleLang, Track, Work, WorkCategory } from "../data/types.ts";
import type { Readme, Review } from "./parse.ts";

export interface WorkMeta {
  /** the work's address, its cover asset and its accent's key */
  slug: string;
  lang?: TitleLang;
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
  tagline: string;
  categories: WorkCategory[];
  music: Track[];
}

const HAN_OR_KANA = /[぀-ヿ㐀-鿿]/;

function take<T>(source: Map<string, T>, name: string, what: string): T {
  const found = source.get(name);
  if (found === undefined)
    throw new Error(`content: "${name}" is in the README but has no ${what}`);
  source.delete(name);
  return found;
}

function leftovers(source: Map<string, unknown>, where: string) {
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
  const unreviewed = new Map(reviews);
  const uncataloged = new Map(Object.entries(catalog.works));
  const unsung = new Map(Object.entries(catalog.songs));

  const categories = readme.shelves.map(({ medium, titles }) => ({
    name: medium,
    works: titles.map((title): Work => {
      const meta = take(uncataloged, title, "catalog entry");
      const { subtitle, points, flaws } = take(unreviewed, title, "review");
      if (HAN_OR_KANA.test(title) && !meta.lang)
        throw new Error(`content: say which language "${title}" is in`);
      return {
        title,
        ...meta,
        subtitle,
        review: points,
        ...(flaws.length > 0 && { flaws }),
      };
    }),
  }));

  const music = readme.songs.map(({ artist, title }): Track => {
    const name = `${artist} - ${title}`;
    const { subtitle } = take(unreviewed, name, "review");
    const meta = unsung.get(name) ?? {};
    unsung.delete(name);
    if (HAN_OR_KANA.test(title) && !meta.lang)
      throw new Error(`content: say which language the title "${name}" is in`);
    if (HAN_OR_KANA.test(artist) && !meta.artistLang)
      throw new Error(`content: say which language the artist "${name}" is in`);
    return { artist, title, ...meta, subtitle };
  });

  leftovers(unreviewed, "reviews.md");
  leftovers(uncataloged, "the catalog");
  leftovers(unsung, "the catalog's songs");
  return { tagline: readme.tagline, categories, music };
}
