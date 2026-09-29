import { describe, expect, it } from "vitest";
import { assemble, type Catalog } from "./collection.ts";
import type { Readme, Review } from "./parse.ts";

const readme: Readme = {
  tagline: "Works that enrich rather than diminish.",
  shelves: [{ medium: "Anime", titles: ["化物語"] }],
  songs: [{ artist: "COP", title: "凉雨" }],
};

const review = (subtitle: string): Review => ({
  subtitle,
  points: [{ label: "Dialogue as art", text: "Rapid-fire wordplay." }],
  flaws: [],
});

const reviews = () =>
  new Map<string, Review>([
    ["化物語", review("Supernatural tales of adolescent awakening")],
    [
      "COP - 凉雨",
      { subtitle: "When the rain finally stops", points: [], flaws: [] },
    ],
  ]);

const catalog = (): Catalog => ({
  works: { 化物語: { slug: "bakemonogatari", lang: "ja" } },
  songs: { "COP - 凉雨": { lang: "zh-Hans" } },
});

describe("assemble", () => {
  it("joins each title to its review and its catalog entry", () => {
    const collection = assemble(readme, reviews(), catalog());
    expect(collection.tagline).toBe("Works that enrich rather than diminish.");
    expect(collection.categories).toEqual([
      {
        name: "Anime",
        works: [
          {
            title: "化物語",
            slug: "bakemonogatari",
            lang: "ja",
            subtitle: "Supernatural tales of adolescent awakening",
            review: [
              { label: "Dialogue as art", text: "Rapid-fire wordplay." },
            ],
          },
        ],
      },
    ]);
    expect(collection.music).toEqual([
      {
        artist: "COP",
        title: "凉雨",
        lang: "zh-Hans",
        subtitle: "When the rain finally stops",
      },
    ]);
  });

  it("gives a work its shortcomings only when it has some", () => {
    const flawed = reviews();
    const review = flawed.get("化物語");
    review?.flaws.push({ label: "Slow start", text: "It takes a while." });
    const [work] =
      assemble(readme, flawed, catalog()).categories[0]?.works ?? [];
    expect(work?.flaws).toEqual([
      { label: "Slow start", text: "It takes a while." },
    ]);
  });

  it("refuses a work the catalog has never heard of", () => {
    const empty = { ...catalog(), works: {} };
    expect(() => assemble(readme, reviews(), empty)).toThrow(/化物語/);
  });

  it("refuses a catalog entry the README does not list", () => {
    const extra = catalog();
    extra.works.偽物語 = { slug: "nisemonogatari" };
    expect(() => assemble(readme, reviews(), extra)).toThrow(/偽物語/);
  });

  it("refuses a work with no review", () => {
    const missing = reviews();
    missing.delete("化物語");
    expect(() => assemble(readme, missing, catalog())).toThrow(/化物語/);
  });

  it("refuses a review of something the README does not list", () => {
    const stray = reviews().set("偽物語", review("When fake becomes real"));
    expect(() => assemble(readme, stray, catalog())).toThrow(/偽物語/);
  });

  it("refuses a song whose language nobody stated", () => {
    const silent = { ...catalog(), songs: {} };
    expect(() => assemble(readme, reviews(), silent)).toThrow(/凉雨/);
  });
});
