import { Clapperboard, Gamepad2, Music, Palette, Tv } from "lucide-react";
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
} as const satisfies PageMeta;

export const meta = {
  title: "Reviews",
  description:
    "Brief impressions designed to aid memory and recognition while avoiding spoilers.",
} as const satisfies PageMeta;

export const categories = [
  { name: "Anime", icon: Tv, works: anime },
  { name: "Movies", icon: Clapperboard, works: movies },
  { name: "Games", icon: Gamepad2, works: games },
  { name: "Artists", icon: Palette, works: artists },
] as const satisfies readonly WorkCategory[];

export { music };
export const MusicIcon = Music;
