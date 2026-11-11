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

describe("works", () => {
  it("allWorks holds every work of every category", () => {
    const total = categories.reduce((n, c) => n + c.works.length, 0);
    expect(allWorks).toHaveLength(total);
  });

  it("assigns nights from 2 upward in reading order", () => {
    expect(allWorks.map((e) => e.night)).toEqual(
      Array.from({ length: allWorks.length }, (_, i) => i + 2),
    );
  });

  it("gives the last work the full-moon night", () => {
    expect(allWorks.at(-1)?.night).toBe(FULL_NIGHT);
  });

  it("gives every work a unique slug that workBySlug resolves", () => {
    const slugs = allWorks.map((e) => e.work.slug);
    expect(new Set(slugs).size).toBe(allWorks.length);
    for (const slug of slugs) expect(workBySlug.get(slug)).toBeDefined();
  });

  it("links neighbors across category boundaries, with null at both ends", () => {
    const first = allWorks[0];
    const last = allWorks.at(-1);
    if (!first || !last) throw new Error("works missing");
    expect(neighbors(first.work.slug).prev).toBeNull();
    expect(neighbors(last.work.slug).next).toBeNull();
    // across a category boundary: last anime → first movie
    const lastAnime = sections[0]?.entries.at(-1);
    if (!lastAnime) throw new Error("anime missing");
    expect(neighbors(lastAnime.work.slug).next?.category).toBe("Movies");
  });

  it("gives every track a unique trackName", () => {
    const names = music.map(trackName);
    expect(new Set(names).size).toBe(music.length);
  });

  // The credits page lists cover credits by looking up each work's cover, so
  // a cover that scripts/fetch-covers.ts failed to fetch would leave its
  // rights holder uncredited, with no error. Which works should have a
  // cover is read from the catalog, so the test still holds when a work
  // gains or loses a licensed source.
  it("has a credited cover for exactly the works with an art source", () => {
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
