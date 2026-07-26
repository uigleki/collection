import { useEffect } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { useScroll, useScrollMemory } from "@/lib/scroll";
import { initTheme } from "@/lib/theme";
import { MoonSky } from "@/scene/MoonSky";
import { BackToTop } from "@/ui/BackToTop";
import { Standstill } from "@/ui/Standstill";
import { ThemeToggle } from "@/ui/ThemeToggle";

function Root() {
  useScroll();
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
      { index: true, lazy: () => import("@/pages/home/Home") },
      { path: "works/:slug", lazy: () => import("@/pages/work/WorkRoom") },
      { path: "why", lazy: () => import("@/pages/why/Why") },
      { path: "credits", lazy: () => import("@/pages/credits/Credits") },
      { path: "*", lazy: () => import("@/pages/NotFound") },
    ],
  },
]);
