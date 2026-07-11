import Lenis from "lenis";
import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { FULL_NIGHT } from "@/lib/moon";
import { sky } from "@/scene/signal";

let lenis: Lenis | null = null;

/**
 * Smooth scroll (Lenis — the standard on contemporary award sites), skipped
 * entirely under prefers-reduced-motion where native scroll is the honest
 * choice. A separate rAF sampler derives velocity and document progress for
 * the sky from wherever the scroll actually is, so it works identically
 * with or without Lenis.
 */
export function useScroll(): void {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduced.matches) {
      lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: true });
    }

    let last = window.scrollY;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      sky.velocity += (y - last - sky.velocity) * 0.25;
      last = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      sky.progress = max > 0 ? y / max : 0;
      // An instant jump (deep link, keyboard End) can skip every night's
      // observer band on the HOME page; past the works the moon must
      // already stand full. Nowhere else — a room's own scroll must never
      // touch the month (it did, and read as the moon moving at random).
      if (
        window.location.pathname === "/" &&
        sky.progress > 0.6 &&
        sky.targetNight < FULL_NIGHT
      ) {
        sky.targetNight = FULL_NIGHT;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
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
    if (lenis) {
      // the incoming page's DOM just committed — remeasure first, or Lenis
      // clamps the target to the DEPARTED page's cached height
      lenis.resize();
      lenis.scrollTo(y, { immediate: true, force: true });
      // Hold the scroll while the view transition plays: the morph's
      // targets were measured at snapshot time, and scrolling mid-flight
      // would land the cover on a place that no longer exists.
      lenis.stop();
      const release = setTimeout(() => lenis?.start(), 700);
      return () => {
        clearTimeout(release);
        lenis?.start();
      };
    }
    window.scrollTo(0, y);
    return undefined;
  }, [pathname]);
}
