import { useEffect } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { useScroll, useScrollMemory } from "@/lib/scroll";
import { initTheme } from "@/lib/theme";
import { MoonSky } from "@/scene/MoonSky";
import { BackToTop } from "@/ui/BackToTop";
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
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <h1 className="text-title font-light tracking-tight">
        Clouds crossed the moon.
      </h1>
      <p className="mt-4 text-body text-hoshi">
        Something failed while rendering this page.
      </p>
      <a href="/" className="pill mt-10 text-body hover:text-tsukikage">
        Return to the collection
      </a>
    </main>
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
