import { describe, expect, it } from "vitest";
import { FULL_NIGHT } from "@/lib/moon.ts";
import { SOURCES } from "../../scripts/cover-sources.ts";
import { CANON_ACCENT } from "./accents.ts";
import { covers } from "./generated/covers.ts";
import {
  allWorks,
  categories,
  music,
  neighbors,
  sections,
  trackName,
  workBySlug,
} from "./works.ts";

const HAN_OR_KANA = /[぀-ヿ㐀-鿿]/;

describe("the collection spine", () => {
  it("holds every work of every category", () => {
    const total = categories.reduce((n, c) => n + c.works.length, 0);
    expect(allWorks).toHaveLength(total);
  });

  it("assigns each work one night, in reading order", () => {
    expect(allWorks.map((e) => e.night)).toEqual(
      Array.from({ length: allWorks.length }, (_, i) => i + 2),
    );
  });

  it("stands the last work under the full moon, whatever its night", () => {
    expect(allWorks.at(-1)?.night).toBe(FULL_NIGHT);
  });

  it("resolves every work to a unique slug", () => {
    const slugs = allWorks.map((e) => e.work.slug);
    expect(new Set(slugs).size).toBe(allWorks.length);
    for (const slug of slugs) expect(workBySlug.get(slug)).toBeDefined();
  });

  it("runs the shelf unbroken across all media", () => {
    const first = allWorks[0];
    const last = allWorks.at(-1);
    if (!first || !last) throw new Error("works missing");
    expect(neighbors(first.work.slug).prev).toBeNull();
    expect(neighbors(last.work.slug).next).toBeNull();
    // the seam between media is walkable: last anime → first movie
    const lastAnime = sections[0]?.entries.at(-1);
    if (!lastAnime) throw new Error("anime missing");
    expect(neighbors(lastAnime.work.slug).next?.category).toBe("Movies");
  });

  it("marks Japanese titles ja and leaves Latin ones unmarked", () => {
    expect(workBySlug.get("bakemonogatari")?.work.lang).toBe("ja");
    expect(workBySlug.get("girls-last-tour")?.work.lang).toBe("ja");
    expect(workBySlug.get("to-the-moon")?.work.lang).toBeUndefined();
    expect(
      workBySlug.get("charlie-chocolate-factory")?.work.lang,
    ).toBeUndefined();
  });

  // Script detection cannot tell 少女終末旅行 from 世末积雨云 — both are
  // kanji-only, and the regional glyph forms differ. It CAN insist that
  // somebody said which one a title is. This is the seam that keeps
  // DESIGN.md's "languages are data, not heuristics" true as the collection
  // grows: it never decides a language, it only refuses silence.
  it("makes every non-Latin name declare its language", () => {
    for (const { work } of allWorks) {
      if (HAN_OR_KANA.test(work.title))
        expect(work.lang, work.title).toBeDefined();
    }
    // A track has two names, and they need not share a language: 凛々咲
    // sings "Letters from Heaven".
    for (const track of music) {
      if (HAN_OR_KANA.test(track.title))
        expect(track.lang, track.title).toBeDefined();
      if (HAN_OR_KANA.test(track.artist))
        expect(track.artistLang, track.artist).toBeDefined();
    }
  });

  it("names each track by its performer and its song, not one string", () => {
    const names = music.map(trackName);
    expect(new Set(names).size).toBe(music.length);
  });

  // The colophon credits cover art by walking the collection and asking each
  // work for its art, so a cover the fetch run failed to bring back leaves a
  // rights holder uncredited — silently, on the page that must not do that.
  // Which works have art at all is asked of the source map itself, so a work
  // that gains or loses a licensed source is held to the new answer.
  it("keeps a credited cover for every work that has a source", () => {
    const credited = new Map<string, (typeof covers)[number]>(
      covers.map((c) => [c.slug, c]),
    );
    for (const { work } of allWorks) {
      const cover = credited.get(work.slug);
      if (!SOURCES[work.slug]) {
        expect(cover, work.slug).toBeUndefined();
        continue;
      }
      expect(cover?.credit, work.slug).toBeTruthy();
      expect(cover?.sourceUrl, work.slug).toMatch(/^https:\/\//);
    }
  });

  // accentFor falls back to the moon's warmth so an unlisted work still
  // renders. DESIGN.md asks for more than renders: each room is lit by its
  // work's own canonical color, so the fallback must stay unreachable.
  it("gives every work a canonical accent of its own", () => {
    for (const { work } of allWorks)
      expect(CANON_ACCENT[work.slug], work.slug).toBeDefined();
  });
});
