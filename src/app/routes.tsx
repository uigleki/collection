import { useEffect } from "react";
import type { RouteObject } from "react-router";
import { useScrollMemory } from "@/lib/scroll.ts";
import { initTheme } from "@/lib/theme.ts";
import { MoonSky } from "@/scene/MoonSky.tsx";
import { BackToTop } from "@/ui/BackToTop.tsx";
import { Standstill } from "@/ui/Standstill.tsx";
import { ThemeToggle } from "@/ui/ThemeToggle.tsx";
import { Stage } from "./Stage.tsx";

function Root() {
  useScrollMemory();

  useEffect(() => initTheme(), []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {/* CSS background shown before WebGL starts, and when there is none. */}
      <div aria-hidden="true" className="poster fixed inset-0 -z-20" />
      <MoonSky />
      <ThemeToggle />
      <BackToTop />
      <Stage />
    </>
  );
}

function BrokenNight() {
  return (
    <Standstill
      title="Clouds crossed the moon."
      message="Something failed while rendering this page."
    >
      {/* a plain link for a full page load, not a client-side navigation:
          the router is what just failed */}
      <a href="/" className="pill mt-10 text-body hover:text-tsukikage">
        Return to the collection
      </a>
    </Standstill>
  );
}

// Each page's code is loaded when first needed, and prefetched once the
// first page has loaded and the browser is idle (prefetchPages).
const pages = [
  () => import("@/pages/home/Home.tsx"),
  () => import("@/pages/work/WorkRoom.tsx"),
  () => import("@/pages/why/Why.tsx"),
  () => import("@/pages/credits/Credits.tsx"),
  () => import("@/pages/NotFound.tsx"),
] as const;
const [home, room, why, credits, missing] = pages;

/**
 * The route table. Used by the build, which prerenders every page to a file
 * (prerender.tsx), and by the browser, which hydrates that page (main.tsx).
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    Component: Root,
    ErrorBoundary: BrokenNight,
    children: [
      { index: true, lazy: home },
      { path: "works/:slug", lazy: room },
      { path: "why", lazy: why },
      { path: "credits", lazy: credits },
      { path: "*", lazy: missing },
    ],
  },
];

/**
 * Prefetch every page's code once the first page has loaded. The chunks are
 * small (all work pages share one), and a page change that waits on the
 * network stutters. Nothing is prefetched when the browser reports
 * Save-Data. A failed prefetch is ignored: navigating to that page requests
 * the chunk again.
 */
export function prefetchPages(): void {
  const connection = (navigator as { connection?: { saveData?: boolean } })
    .connection;
  if (connection?.saveData) return;
  const idle = (run: () => void) =>
    "requestIdleCallback" in window
      ? requestIdleCallback(run, { timeout: 3000 })
      : setTimeout(run, 1000);
  const start = () =>
    idle(() => pages.forEach((page) => void page().catch(() => {})));
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
