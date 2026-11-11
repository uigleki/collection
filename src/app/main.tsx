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
import { trackBrowserTransitions } from "./PageTransition.tsx";
import { prefetchPages, routes } from "./routes.tsx";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root missing");

// The page is prerendered, and hydration only works if React's first
// render produces the same markup. So this route's lazy module is loaded
// before the router is created; otherwise the first render would have an
// empty outlet and React would discard the prerendered page.
for (const { route } of matchRoutes(routes, window.location) ?? []) {
  if (typeof route.lazy === "function")
    Object.assign(route, await route.lazy(), { lazy: undefined });
}

trackBrowserTransitions();
const app = (
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>
);

// The build prerenders every page into #root; the development server sends
// #root empty. A prerendered page is hydrated inside a transition: React
// then hydrates in time slices and yields to input between them, where by
// default it would block the main thread until hydration finished.
if (rootEl.hasChildNodes())
  startTransition(() => void hydrateRoot(rootEl, app));
else createRoot(rootEl).render(app);

prefetchPages();
