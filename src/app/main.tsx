import "@fontsource/ubuntu/latin-300.css";
import "@fontsource/ubuntu/latin-400.css";
import "@fontsource/ubuntu/latin-400-italic.css";
import "@fontsource/ubuntu/latin-500.css";
import "@fontsource/ubuntu-mono/latin-400.css";
import "@/styles/index.css";
import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter, matchRoutes } from "react-router";
import { RouterProvider } from "react-router/dom";
import { prefetchPages, routes } from "./routes.tsx";
import { noteDrawnChanges } from "./Stage.tsx";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root missing");

// The page arrived already drawn, and React adopts markup only if its first
// render draws the same: so this page's own code is in hand before the
// router exists, or it would start on an empty outlet and tear the page down.
for (const { route } of matchRoutes(routes, window.location) ?? []) {
  if (typeof route.lazy === "function")
    Object.assign(route, await route.lazy(), { lazy: undefined });
}

noteDrawnChanges();
const app = (
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>
);

// The build writes every page into #root; the development server sends it
// empty. A written page is adopted as a transition: React then works through
// it in slices and yields to the reader between them, where by default it
// would hold the main thread until the whole page was done.
if (rootEl.hasChildNodes())
  startTransition(() => void hydrateRoot(rootEl, app));
else createRoot(rootEl).render(app);

prefetchPages();
