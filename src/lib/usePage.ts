import { type RefObject, useEffect, useRef } from "react";
import { useLocation } from "react-router";

// The key of the last page the visitor stood on. Lets the hook tell a real
// route CHANGE (focus moves to the new h1 — including Back to Home) from the
// first render of a visit or a StrictMode re-run (focus order stays natural,
// so the first Tab reaches the skip link).
let lastKey: string | null = null;

/**
 * Per-route page setup: a deterministic document title (React 19's <title>
 * hoisting races the static one on lazy routes) and focus moved to the h1 so
 * keyboard and screen-reader users land on the new content, not a stale link.
 */
export function usePage(title: string): RefObject<HTMLHeadingElement | null> {
  const h1 = useRef<HTMLHeadingElement>(null);
  const { key } = useLocation();
  useEffect(() => {
    document.title = title;
    if (lastKey !== null && lastKey !== key) {
      h1.current?.focus({ preventScroll: true });
    }
    lastKey = key;
  }, [title, key]);
  return h1;
}
