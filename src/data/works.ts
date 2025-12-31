import type { PageMeta, WorkCategory } from "./types";
import { anime } from "./works/anime";
import { artists } from "./works/artists";
import { games } from "./works/games";
import { movies } from "./works/movies";
import { music } from "./works/music";

export const siteMeta: PageMeta = {
  title: "Perfect Collection",
  description:
    "Works that enrich rather than diminish - created from love, not manipulation.",
};

export const meta: PageMeta = {
  title: "Reviews",
  description:
    "Brief impressions designed to aid memory and recognition while avoiding spoilers.",
};

export const categories: WorkCategory[] = [
  { name: "Anime", works: anime },
  { name: "Movies", works: movies },
  { name: "Games", works: games },
  { name: "Artists", works: artists },
];

export { music };
