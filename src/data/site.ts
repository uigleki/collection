// A separate module from works.ts: every route reads its title from here,
// and routes like /why and /404 would otherwise import the works data (and
// with it the cover placeholders) only for this.
export const siteTitle = "Perfect Collection";

/**
 * The site's origin. Each route's canonical URL, the og:image URL, the
 * sitemap and robots.txt all read it from here, so moving the site is one
 * edit.
 */
export const origin = "https://spotless.pages.dev";

/**
 * The fixed pages. The sitemap lists them, and src/app/routes.tsx has a
 * route for each. Work pages are not listed here: they are derived from the
 * collection.
 */
export const pages = [
  { path: "/", priority: "1.0" },
  { path: "/why", priority: "0.8" },
  { path: "/credits", priority: "0.3" },
] as const;

/** The path of a work's page. */
export const workPath = (slug: string) => `/works/${slug}`;

/**
 * The file a page is prerendered to. <path>.html, not <path>/index.html:
 * the host serves the first at the bare path and redirects the second to a
 * trailing slash, which is not the URL the sitemap and the links use.
 */
export const pageFile = (path: string) =>
  path === "/" ? "index.html" : `${path.slice(1)}.html`;
