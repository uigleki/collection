import { useEffect } from "react";
import type { RouteObject } from "react-router";
import { pages, workPath } from "@/data/site.ts";
import { useScrollMemory } from "@/lib/scroll.ts";
import { initTheme } from "@/lib/theme.ts";
import { MoonSky } from "@/scene/MoonSky.tsx";
import { BackToTop } from "@/ui/BackToTop.tsx";
import { MessagePage } from "@/ui/MessagePage.tsx";
import { ThemeToggle } from "@/ui/ThemeToggle.tsx";
import { PageTransition } from "./PageTransition.tsx";

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
      <PageTransition />
    </>
  );
}

function RenderError() {
  return (
    <MessagePage
      title="Clouds crossed the moon."
      message="Something failed while rendering this page."
    >
      {/* a plain link for a full page load, not a client-side navigation:
          the router is what just failed */}
      <a href="/" className="pill mt-10 text-body hover:text-accent">
        Return to the collection
      </a>
    </MessagePage>
  );
}

// Each page's code is loaded when first needed, and prefetched once the
// first page has loaded and the browser is idle (prefetchPages). The fixed
// pages are keyed by their path in site.ts, so a page listed there without
// code here, or the reverse, is a type error.
const fixed = {
  "/": () => import("@/pages/home/Home.tsx"),
  "/why": () => import("@/pages/why/Why.tsx"),
  "/credits": () => import("@/pages/credits/Credits.tsx"),
} satisfies Record<(typeof pages)[number]["path"], unknown>;
const work = () => import("@/pages/work/WorkPage.tsx");
const notFound = () => import("@/pages/NotFound.tsx");

/**
 * The route table. Used by the build, which prerenders every page to a file
 * (prerender.tsx), and by the browser, which hydrates that page (main.tsx).
 */
export const routes: RouteObject[] = [
  {
    Component: Root,
    ErrorBoundary: RenderError,
    children: [
      ...pages.map(({ path }) => ({ path, lazy: fixed[path] })),
      { path: workPath(":slug"), lazy: work },
      { path: "*", lazy: notFound },
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
    idle(() =>
      [...Object.values(fixed), work, notFound].forEach(
        (page) => void page().catch(() => {}),
      ),
    );
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
