import { describe, expect, it } from "vitest";
import { assemble, type Catalog } from "./collection.ts";
import type { Readme, Review } from "./parse.ts";

const readme: Readme = {
  tagline: "Works that enrich rather than diminish.",
  groups: [{ medium: "Anime", titles: ["化物語"] }],
  songs: [{ artist: "COP feat. 洛天依", title: "凉雨" }],
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
      "COP feat. 洛天依 - 凉雨",
      { subtitle: "When the rain finally stops", points: [], flaws: [] },
    ],
  ]);

const catalog = (): Catalog => ({
  works: {
    化物語: {
      slug: "bakemonogatari",
      lang: "ja",
      accent: "#9b59d0",
      art: { kind: "anilist", search: "Bakemonogatari" },
    },
  },
  songs: {
    "COP feat. 洛天依 - 凉雨": { lang: "zh-Hans", artistLang: "zh-Hans" },
  },
});

describe("assemble", () => {
  // `art` is used only by scripts/fetch-covers.ts, so assemble() leaves it
  // out of each work instead of shipping it to the browser.
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
            accent: "#9b59d0",
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
        artist: "COP feat. 洛天依",
        title: "凉雨",
        lang: "zh-Hans",
        artistLang: "zh-Hans",
        subtitle: "When the rain finally stops",
      },
    ]);
  });

  it("sets flaws on a work only when its review has shortcomings", () => {
    const flawed = reviews();
    const review = flawed.get("化物語");
    review?.flaws.push({ label: "Slow start", text: "It takes a while." });
    const [work] =
      assemble(readme, flawed, catalog()).categories[0]?.works ?? [];
    expect(work?.flaws).toEqual([
      { label: "Slow start", text: "It takes a while." },
    ]);
  });

  it("throws for a work with no catalog entry", () => {
    const empty = { ...catalog(), works: {} };
    expect(() => assemble(readme, reviews(), empty)).toThrow(/化物語/);
  });

  it("throws for a catalog entry the README does not list", () => {
    const extra = catalog();
    extra.works.偽物語 = { slug: "nisemonogatari", accent: "#f4653f" };
    expect(() => assemble(readme, reviews(), extra)).toThrow(/偽物語/);
  });

  it("throws for a work with no review", () => {
    const missing = reviews();
    missing.delete("化物語");
    expect(() => assemble(readme, missing, catalog())).toThrow(/化物語/);
  });

  it("throws for a review of something the README does not list", () => {
    const stray = reviews().set("偽物語", review("When fake becomes real"));
    expect(() => assemble(readme, stray, catalog())).toThrow(/偽物語/);
  });

  it("throws for a Han song title with no language in the catalog", () => {
    const noLanguage = { ...catalog(), songs: {} };
    expect(() => assemble(readme, reviews(), noLanguage)).toThrow(/凉雨/);
  });

  // Han and kana outside the common blocks: half-width katakana, a katakana
  // extension, a compatibility ideograph and an ideograph beyond the Basic
  // Multilingual Plane. All are written as escapes. Normalization replaces
  // a compatibility ideograph with its unified form, so a literal one might
  // not stay one. And scripts/subset-cjk.ts reads this file, so a literal
  // glyph would be added to the shipped fonts, where none of these belongs.
  it.each([
    ["half-width katakana", "\uFF76\uFF9D\uFF84\uFF78"],
    ["a katakana extension", "\u31F0"],
    ["a compatibility ideograph", "\uFA10"],
    ["an ideograph beyond the BMP", "\u{20B9F}"],
  ])("throws for a title in %s with no stated language", (_form, title) => {
    const edited: Readme = {
      ...readme,
      groups: [{ medium: "Anime", titles: [title] }],
    };
    const reviewed = reviews();
    const entry = reviewed.get("化物語");
    reviewed.delete("化物語");
    if (entry) reviewed.set(title, entry);
    const noLanguage = catalog();
    noLanguage.works = { [title]: { slug: "unstated", accent: "#9b59d0" } };
    expect(() => assemble(edited, reviewed, noLanguage)).toThrow(title);
  });
});
