import { ErrorBoundary } from "@/features/error/ErrorBoundary";
import { NotFound } from "@/features/error/NotFound";
import { Home } from "@/features/home/Home";
import { lazy } from "react";
import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router";

const DevTools = lazy(() => import("./dev/DevTools"));

function Root() {
  return (
    <ErrorBoundary>
      <Outlet />
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
      {
        index: true,
        element: <Home />,
      },
      {
        path: "why",
        lazy: () => import("@/features/why/Why"),
      },
      {
        path: "reviews",
        lazy: () => import("@/features/reviews/Reviews"),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
