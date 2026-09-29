import type { PageMeta } from "./types.ts";

// Its own module rather than a field of works.ts: every route titles itself
// from this, and routes like /why and /404 have no other reason to pull in
// the works data (and, through it, the cover placeholders).
export const siteMeta = {
  title: "Perfect Collection",
  description:
    "Works that enrich rather than diminish — created from love, not manipulation.",
} as const satisfies PageMeta;

/**
 * Where the collection lives. Written once: the canonical URL each route
 * declares, the share card's image, the sitemap and robots.txt all read it,
 * so moving the site is one edit instead of twenty.
 */
export const origin = "https://spotless.pages.dev";

/**
 * The standing pages, for the sitemap. Work rooms are deliberately absent —
 * they come from the collection itself, the only thing that knows how many
 * there are. This mirrors the routes in src/app/router.tsx, and an e2e test
 * walks every URL the sitemap advertises and fails if one does not resolve.
 */
export const pages = [
  { path: "/", priority: "1.0" },
  { path: "/why", priority: "0.8" },
  { path: "/credits", priority: "0.3" },
] as const;
