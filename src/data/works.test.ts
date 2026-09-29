import { describe, expect, it } from "vitest";
import { catalog } from "@/content/catalog.ts";
import type { WorkMeta } from "@/content/collection.ts";
import { FULL_NIGHT } from "@/lib/moon.ts";
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

  it("names each track by its performer and its song, not one string", () => {
    const names = music.map(trackName);
    expect(new Set(names).size).toBe(music.length);
  });

  // The colophon credits cover art by walking the collection and asking each
  // work for its art, so a cover the fetch run failed to bring back leaves a
  // rights holder uncredited — silently, on the page that must not do that.
  // Which works have art at all is asked of the catalog itself, so a work
  // that gains or loses a licensed source is held to the new answer.
  it("keeps a credited cover for every work that has a source", () => {
    const sourced = new Set(
      Object.values(catalog.works as Record<string, WorkMeta>).flatMap((w) =>
        w.art ? [w.slug] : [],
      ),
    );
    const credited = new Map<string, (typeof covers)[number]>(
      covers.map((c) => [c.slug, c]),
    );
    for (const { work } of allWorks) {
      const cover = credited.get(work.slug);
      if (!sourced.has(work.slug)) {
        expect(cover, work.slug).toBeUndefined();
        continue;
      }
      expect(cover?.credit, work.slug).toBeTruthy();
      expect(cover?.sourceUrl, work.slug).toMatch(/^https:\/\//);
    }
  });
});
