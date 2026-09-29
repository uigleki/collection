import { useEffect } from "react";
import { createBrowserRouter } from "react-router";
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
      {/* The night exists before (and without) WebGL. */}
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
      {/* a full reload, not a client navigation: the router that would have
          carried it is the thing that just failed */}
      <a href="/" className="pill mt-10 text-body hover:text-tsukikage">
        Return to the collection
      </a>
    </Standstill>
  );
}

// Each page's code, fetched when first needed — and, once the first page
// stands and the browser has nothing better to do, fetched ahead (below).
const pages = [
  () => import("@/pages/home/Home.tsx"),
  () => import("@/pages/work/WorkRoom.tsx"),
  () => import("@/pages/why/Why.tsx"),
  () => import("@/pages/credits/Credits.tsx"),
  () => import("@/pages/NotFound.tsx"),
] as const;
const [home, room, why, credits, missing] = pages;

export const router = createBrowserRouter([
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
]);

/**
 * Fetch every page's code while the reader reads the first. It is all small
 * (the rooms share one chunk), and a change of page that waits on the
 * network is a change of page that stutters — unless the reader has asked
 * to save data, in which case nothing is fetched until it is asked for.
 */
export function prefetchPages(): void {
  const connection = (navigator as { connection?: { saveData?: boolean } })
    .connection;
  if (connection?.saveData) return;
  const idle = (run: () => void) =>
    "requestIdleCallback" in window
      ? requestIdleCallback(run, { timeout: 3000 })
      : setTimeout(run, 1000);
  const start = () => idle(() => pages.forEach((page) => void page()));
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
