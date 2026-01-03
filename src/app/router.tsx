import { ErrorBoundary } from "@/features/error/ErrorBoundary";
import { NotFound } from "@/features/error/NotFound";
import { Home } from "@/features/home/Home";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router";
import { DevTools } from "./dev/DevTools";

// Lazy load non-home routes for better initial bundle size
const Why = lazy(() =>
  import("@/features/why/Why").then((m) => ({ default: m.Why })),
);
const Reviews = lazy(() =>
  import("@/features/reviews/Reviews").then((m) => ({ default: m.Reviews })),
);

function Root() {
  return (
    <ErrorBoundary>
      <div
        id="scroll-sentinel"
        className="absolute top-[50vh] h-px w-px opacity-0 pointer-events-none"
      />
      <Suspense>
        <Outlet />
      </Suspense>
      <ScrollRestoration />
      <DevTools />
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "why", element: <Why /> },
      { path: "reviews", element: <Reviews /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
