import Lenis from "lenis";
import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { sky } from "@/scene/signal";

let lenis: Lenis | null = null;

/**
 * Smooth scroll (Lenis), skipped entirely under prefers-reduced-motion where
 * native scroll is the honest choice. Nothing samples the scroll here: the
 * only reader of velocity and progress is the sky, and its own frame loop
 * takes them straight from `window.scrollY` (see scene/MoonSky).
 */
export function useScroll(): void {
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: true });
    }
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

/** Ride back to the surface — smooth through Lenis, instant without. */
export function scrollToTop(): void {
  if (lenis) lenis.scrollTo(0, { duration: 1.1 });
  else window.scrollTo(0, 0);
}

// Positions the reader left each path at. Saved continuously from scroll
// events — NOT in an unmount cleanup: by cleanup time the incoming page's
// shorter DOM has already clamped window.scrollY, and the clamped value
// would be saved as if the reader had been there. Scroll events dispatch
// asynchronously, after the departing route's listener is already gone, so
// the clamp can never be attributed to the wrong path.
// The initial mount restores scroll but plays no view transition.
let firstArrival = true;

const positions = new Map<string, number>(
  (() => {
    try {
      return JSON.parse(sessionStorage.getItem("scroll-memory") ?? "[]");
    } catch {
      return [];
    }
  })(),
);

/**
 * Scroll restoration that Lenis cannot fight: the arrival position is
 * applied through Lenis itself (scrollTo immediate) inside a layout effect
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
        sessionStorage.setItem("scroll-memory", JSON.stringify([...positions]));
      } catch {
        /* storage may be unavailable; memory survives the session anyway */
      }
    };
    window.addEventListener("pagehide", persist);
    return () => window.removeEventListener("pagehide", persist);
  }, []);

  useEffect(() => {
    const save = () => positions.set(pathname, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [pathname]);

  useLayoutEffect(() => {
    const y = positions.get(pathname) ?? 0;
    // While the morph plays the live canvas sits unseen behind the
    // transition's snapshots — rendering it only steals frames from the
    // animation (Firefox's young view-transition engine visibly stutters
    // when the shader competes). First mount has no transition to protect.
    if (!firstArrival) sky.hold = true;
    firstArrival = false;
    if (lenis) {
      // the incoming page's DOM just committed — remeasure first, or Lenis
      // clamps the target to the DEPARTED page's cached height
      lenis.resize();
      lenis.scrollTo(y, { immediate: true, force: true });
      // Hold the scroll while the view transition plays: the morph's
      // targets were measured at snapshot time, and scrolling mid-flight
      // would land the cover on a place that no longer exists.
      lenis.stop();
    } else {
      window.scrollTo(0, y);
    }
    const release = setTimeout(() => {
      sky.hold = false;
      lenis?.start();
    }, 700);
    return () => {
      clearTimeout(release);
      sky.hold = false;
      lenis?.start();
    };
  }, [pathname]);
}
