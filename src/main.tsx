import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExpandProvider } from "@/context";
import "@/index.css";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import { Why } from "@/pages/Why";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ExpandProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/why" element={<Why />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ExpandProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
