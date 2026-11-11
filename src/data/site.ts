import type { PageMeta } from "./types.ts";

// A separate module from works.ts: every route reads its title from here,
// and routes like /why and /404 would otherwise import the works data (and
// with it the cover placeholders) only for this.
export const siteMeta = {
  title: "Perfect Collection",
  description:
    "Works that enrich rather than diminish — created from love, not manipulation.",
} as const satisfies PageMeta;

/**
 * The site's origin. Each route's canonical URL, the og:image URL, the
 * sitemap and robots.txt all read it from here, so moving the site is one
 * edit.
 */
export const origin = "https://spotless.pages.dev";

/**
 * The fixed pages, for the sitemap. Work pages are not listed here: they
 * are derived from the collection. This list must match the routes in
 * src/app/routes.tsx; an e2e test requests every URL in the sitemap and
 * fails if one does not resolve.
 */
export const pages = [
  { path: "/", priority: "1.0" },
  { path: "/why", priority: "0.8" },
  { path: "/credits", priority: "0.3" },
] as const;
