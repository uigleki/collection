import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Ride back to the surface. The browser's own smooth scroll: it runs off the
 * main thread, and the reader's wheel or finger interrupts it at once.
 */
export function scrollToTop(): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
}

// Positions the reader left each path at. Saved continuously from scroll
// events rather than in an unmount cleanup: by cleanup time the incoming
// page's shorter DOM has already clamped window.scrollY, and the clamped
// value would be saved as if the reader had been there.

// Read on first use, not at module scope: this file is in the eagerly loaded
// graph, and a synchronous sessionStorage read would sit on the path to first
// paint for a value nothing wants until the first layout effect.
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

/** Where the reader left a path, or its top if they never stood there. */
export function restingPlace(pathname: string): number {
  return positions().get(pathname) ?? 0;
}

/**
 * Remember reading positions per path. Putting the reader back is the
 * stage's job (Stage.tsx): it has to happen between the page change and the
 * cover's flight, which measures the arriving page where the reader will
 * see it.
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
        /* storage may be unavailable; memory survives the session anyway */
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
      // The other half of the same clamp. Opening a room swaps a page
      // thousands of pixels tall for one that is not, and the browser drags
      // the reader to the top and reports it as a scroll — which WebKit
      // dispatches while the departing page's listener is still attached,
      // where Chromium does not. Saved as-is, the collection forgets where
      // the reader was every time they open anything. No reader can reach a
      // position the page is no longer tall enough to hold, so a scroll into
      // a document that has just lost that height is the layout speaking,
      // not the reader — it is not a reading position and is not kept.
      if (remembered !== undefined && reachable < remembered) return;
      positions().set(pathname, window.scrollY);
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [pathname]);
}
