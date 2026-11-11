import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Scroll to the top with the browser's native smooth scroll: it runs off
 * the main thread, and wheel or touch input interrupts it immediately.
 */
export function scrollToTop(): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
}

// The scroll position the reader left each path at. Saved on every scroll
// event rather than in an unmount cleanup: by cleanup time the incoming
// page's shorter DOM has already clamped window.scrollY, and the clamped
// value would be saved as the reader's position.

// Read on first use, not at module scope: this file is in the eagerly loaded
// graph, and a synchronous sessionStorage read there would delay first paint
// for a value nothing needs until the first layout effect.
let memory: Map<string, number> | null = null;
function positions(): Map<string, number> {
  if (!memory) {
    try {
      memory = new Map(
        JSON.parse(sessionStorage.getItem("scroll-memory") ?? "[]"),
      );
    } catch {
      memory = new Map();
    }
  }
  return memory;
}

/** The saved scroll position for a path, or 0 if none was saved. */
export function restingPlace(pathname: string): number {
  return positions().get(pathname) ?? 0;
}

/**
 * Save the scroll position per path. Restoring it is done in Stage.tsx: it
 * has to happen between the page change and the cover transition
 * (flight.ts), which measures the incoming page at its restored scroll
 * position.
 */
export function useScrollMemory(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    const persist = () => {
      try {
        sessionStorage.setItem(
          "scroll-memory",
          JSON.stringify([...positions()]),
        );
      } catch {
        /* storage may be unavailable; the in-memory map still works */
      }
    };
    window.addEventListener("pagehide", persist);
    return () => window.removeEventListener("pagehide", persist);
  }, []);

  useEffect(() => {
    const save = () => {
      const remembered = positions().get(pathname);
      const reachable =
        document.documentElement.scrollHeight - window.innerHeight;
      // The same clamp, seen from the scroll event. Opening a work page
      // replaces a page thousands of pixels tall with a shorter one. The
      // browser clamps the scroll position and fires a scroll event, which
      // WebKit dispatches while the outgoing page's listener is still
      // attached (Chromium does not). Saving that value would overwrite the
      // reader's position on every navigation. A saved position that the
      // document is no longer tall enough to reach means the document just
      // got shorter, so this scroll event came from layout, not from the
      // reader, and is not saved.
      if (remembered !== undefined && reachable < remembered) return;
      positions().set(pathname, window.scrollY);
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [pathname]);
}
