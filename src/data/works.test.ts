import { describe, expect, it } from "vitest";
import { FULL_NIGHT } from "@/lib/moon";
import {
  allWorks,
  categories,
  entriesFor,
  neighbors,
  workBySlug,
} from "./works";

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
    const slugs = allWorks.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(allWorks.length);
    for (const slug of slugs) expect(workBySlug.get(slug)).toBeDefined();
  });

  it("runs the shelf unbroken across all media", () => {
    const first = allWorks[0];
    const last = allWorks.at(-1);
    if (!first || !last) throw new Error("works missing");
    expect(neighbors(first.slug).prev).toBeNull();
    expect(neighbors(last.slug).next).toBeNull();
    // the seam between media is walkable: last anime → first movie
    const lastAnime = entriesFor("Anime").at(-1);
    if (!lastAnime) throw new Error("anime missing");
    expect(neighbors(lastAnime.slug).next?.category).toBe("Movies");
  });

  it("marks Japanese titles ja and leaves Latin/Chinese ones unmarked", () => {
    expect(workBySlug.get("bakemonogatari")?.lang).toBe("ja");
    expect(workBySlug.get("girls-last-tour")?.lang).toBe("ja");
    expect(workBySlug.get("to-the-moon")?.lang).toBeUndefined();
    expect(workBySlug.get("charlie-chocolate-factory")?.lang).toBeUndefined();
  });
});
