import { type RefObject, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { origin } from "@/data/site.ts";

// The key of the last page the visitor stood on. Lets the hook tell a real
// route CHANGE (focus moves to the new h1 — including Back to Home) from the
// first render of a visit or a StrictMode re-run (focus order stays natural,
// so the first Tab reaches the skip link).
let lastKey: string | null = null;

// One link element, made once and moved from route to route. A canonical URL
// cannot live in the shell: the shell is served for every path
// (public/_redirects), so a static one would tell a crawler that all fourteen
// rooms are the home page.
let canonicalLink: HTMLLinkElement | null = null;

function canonical(pathname: string) {
  let link = canonicalLink;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.append(link);
    canonicalLink = link;
  }
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
