import { useEffect } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { useScrollMemory } from "@/lib/scroll.ts";
import { initTheme } from "@/lib/theme.ts";
import { MoonSky } from "@/scene/MoonSky.tsx";
import { BackToTop } from "@/ui/BackToTop.tsx";
import { Standstill } from "@/ui/Standstill.tsx";
import { ThemeToggle } from "@/ui/ThemeToggle.tsx";

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
      <Outlet />
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: BrokenNight,
    children: [
      { index: true, lazy: () => import("@/pages/home/Home.tsx") },
      { path: "works/:slug", lazy: () => import("@/pages/work/WorkRoom.tsx") },
      { path: "why", lazy: () => import("@/pages/why/Why.tsx") },
      { path: "credits", lazy: () => import("@/pages/credits/Credits.tsx") },
      { path: "*", lazy: () => import("@/pages/NotFound.tsx") },
    ],
  },
]);
