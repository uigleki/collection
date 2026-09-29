import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { sky } from "@/scene/signal.ts";

/**
 * How long to wait out a view transition. Long enough to outlast the
 * slowest of them (index.css: 620ms eclipse wipe, 560ms cover morph, 460ms
 * shelf slide). Anything that has to stay still until the morph lands reads
 * this, so the waits cannot drift apart.
 */
const TRANSITION_MS = 700;

/**
 * Which way the shelf is being walked, for the duration of one navigation.
 * `html[data-dir]` picks the directional slide in index.css. Set this
 * immediately before navigating to a neighboring room; clearing it is the
 * transition's job, not the departing room's — see useScrollMemory below.
 */
export function walkShelf(dir: "prev" | "next"): void {
  document.documentElement.dataset.dir = dir;
}

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
// The initial mount restores scroll but plays no view transition.
let firstArrival = true;

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

/**
 * Scroll restoration: the arrival position is applied inside a layout effect
 * — which runs within the view transition's update callback, so the
 * incoming snapshot is taken at the right offset and nothing jumps after
 * the morph settles.
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

  useLayoutEffect(() => {
    const y = positions().get(pathname) ?? 0;
    // While the morph plays the live canvas sits unseen behind the
    // transition's snapshots — rendering it only steals frames from the
    // animation (Firefox's young view-transition engine visibly stutters
    // when the shader competes). First mount has no transition to protect.
    if (!firstArrival) sky.hold = true;
    firstArrival = false;

    // Put the reader back where they were.
    window.scrollTo({ top: y, behavior: "instant" });

    // Everything a transition suspends is resumed here, together: the sky
    // starts drawing and the shelf's direction stops applying. One clock,
    // so they cannot fall out of step. The scroll is never suspended.
    const release = () => {
      sky.hold = false;
      delete document.documentElement.dataset.dir;
    };
    const settle = setTimeout(release, TRANSITION_MS);
    return () => {
      clearTimeout(settle);
      release();
    };
  }, [pathname]);
}
