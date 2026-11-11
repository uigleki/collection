import {
  createContext,
  type RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useLocation } from "react-router";
import { origin } from "@/data/site.ts";

// The key of the last page the visitor stood on. Lets the hook tell a real
// route CHANGE (focus moves to the new h1 — including Back to Home) from the
// first render of a visit or a StrictMode re-run (focus order stays natural,
// so the first Tab reaches the skip link).
let lastKey: string | null = null;

/**
 * Where a page being written to its file leaves its title (prerender.tsx).
 * No effect runs there, so the title is handed over as the page renders; in
 * the browser nobody is listening.
 */
export const PageHead = createContext<{ title?: string } | null>(null);

// One link element, moved from route to route: the one the page's file
// arrived with, or — on the development server, whose shell has none — one
// made here.
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
  // The site's own origin, never the host being browsed: a preview
  // deployment must not nominate itself as the canonical copy.
  link.href = `${origin}${pathname}`;
}

/**
 * Per-route page setup: a deterministic document title (React 19's <title>
 * hoisting races the static one on lazy routes), the canonical URL, and
 * focus moved to the h1 so keyboard and screen-reader users land on the new
 * content, not a stale link.
 */
export function usePage(title: string): RefObject<HTMLHeadingElement | null> {
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
