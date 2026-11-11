import {
  createContext,
  type RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useLocation } from "react-router";
import { origin, siteTitle } from "@/data/site.ts";

// The location key of the previous page. Lets the hook tell a route change
// (focus moves to the new h1, including on Back to the home page) from the
// first render of a visit or a StrictMode re-run (focus is not moved, so
// the first Tab reaches the skip link).
let lastKey: string | null = null;

/**
 * Receives a page's title while the build prerenders it (prerender.tsx).
 * Effects do not run there, so the title is set during render. In the
 * browser there is no provider, and the value is null.
 */
export const PageHead = createContext<{ title?: string } | null>(null);

// One canonical link element, updated on each route change: the one in
// the prerendered HTML, or one created here on the development server,
// whose HTML has none.
let canonicalLink: HTMLLinkElement | null = null;

function canonical(pathname: string) {
  let link =
    canonicalLink ??
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.append(link);
  }
  canonicalLink = link;
  // Always the site's own origin, not the current host: a preview
  // deployment must not declare itself the canonical copy.
  link.href = `${origin}${pathname}`;
}

/**
 * Per-route page setup: a deterministic document title (React 19's <title>
 * hoisting races the static one on lazy routes), the canonical URL, and
 * focus moved to the h1 so keyboard and screen-reader users start at the new
 * content, not on the link they activated. The title is the page's `name`
 * followed by the site's; the home page has no name of its own.
 */
export function usePage(name?: string): RefObject<HTMLHeadingElement | null> {
  const title = name ? `${name} — ${siteTitle}` : siteTitle;
  const h1 = useRef<HTMLHeadingElement>(null);
  const { key, pathname } = useLocation();
  const head = useContext(PageHead);
  if (head) head.title = title;
  useEffect(() => {
    document.title = title;
    canonical(pathname);
    if (lastKey !== null && lastKey !== key) {
      h1.current?.focus({ preventScroll: true });
    }
    lastKey = key;
  }, [title, key, pathname]);
  return h1;
}
