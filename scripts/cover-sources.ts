/**
 * Where a work's cover comes from, keyed by the slug authored in
 * src/content/catalog.ts. A work absent from this map has no licensed image source
 * and gets a typographic panel instead — that is a valid state, not an
 * omission, so the fetch run does not fail over it.
 *
 * Its own module because two things need the same answer: the fetch script,
 * which goes and gets the art, and works.test.ts, which proves every work
 * that HAS a source ended up credited. Spelled twice, the test would go on
 * passing the day a work gains or loses its source.
 */
export type Source =
  | { kind: "anilist"; search: string }
  | { kind: "steam"; appid: number };

export const SOURCES: Record<string, Source> = {
  bakemonogatari: { kind: "anilist", search: "Bakemonogatari" },
  nisemonogatari: { kind: "anilist", search: "Nisemonogatari" },
  "hi-score-girl": { kind: "anilist", search: "Hi Score Girl" },
  "girls-last-tour": { kind: "anilist", search: "Shoujo Shuumatsu Ryokou" },
  fireworks: { kind: "anilist", search: "Uchiage Hanabi" },
  "penguin-highway": { kind: "anilist", search: "Penguin Highway" },
  "to-the-moon": { kind: "steam", appid: 206440 },
  "edith-finch": { kind: "steam", appid: 501300 },
  "finding-paradise": { kind: "steam", appid: 337340 },
  "steins-gate": { kind: "steam", appid: 412830 },
  "7-years-from-now": { kind: "steam", appid: 1562920 },
  astlibra: { kind: "steam", appid: 1718570 },
};
