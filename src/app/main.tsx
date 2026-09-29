import "@fontsource/ubuntu/latin-300.css";
import "@fontsource/ubuntu/latin-400.css";
import "@fontsource/ubuntu/latin-400-italic.css";
import "@fontsource/ubuntu/latin-500.css";
import "@fontsource/ubuntu-mono/latin-400.css";
import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { publishSprings } from "@/lib/motion.ts";
import { router } from "./router.tsx";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root missing");

publishSprings(document.documentElement);

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
