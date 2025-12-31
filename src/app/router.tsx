import { ErrorBoundary } from "@/features/error/ErrorBoundary";
import { NotFound } from "@/features/error/NotFound";
import { Home } from "@/features/home/Home";
import { Reviews } from "@/features/reviews/Reviews";
import { Why } from "@/features/why/Why";
import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router";
import { DevTools } from "./dev/DevTools";

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
      { index: true, element: <Home /> },
      { path: "why", element: <Why /> },
      { path: "reviews", element: <Reviews /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
