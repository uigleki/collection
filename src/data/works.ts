import type { PageMeta, WorkCategory } from "./types";
import { anime } from "./works/anime";
import { artists } from "./works/artists";
import { games } from "./works/games";
import { movies } from "./works/movies";
import { music } from "./works/music";

export const siteMeta = {
  title: "Perfect Collection",
  description:
    "Works that enrich rather than diminish - created from love, not manipulation.",
} satisfies PageMeta;

export const meta = {
  title: "Reviews",
  description:
    "Brief impressions designed to aid memory and recognition while avoiding spoilers.",
} satisfies PageMeta;

export const categories = [
  { name: "Anime", works: anime },
  { name: "Movies", works: movies },
  { name: "Games", works: games },
  { name: "Artists", works: artists },
] satisfies WorkCategory[];

export { music };
