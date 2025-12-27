import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExpandProvider } from "@/context";
import "@/index.css";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import { Why } from "@/pages/Why";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from "react-router";

function Root() {
  return (
    <ErrorBoundary>
      <ExpandProvider>
        <Outlet />
        <ScrollRestoration />
      </ExpandProvider>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "why", element: <Why /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
