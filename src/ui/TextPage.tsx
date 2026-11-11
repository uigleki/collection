import type { ReactNode } from "react";
import { PageNav } from "./PageNav.tsx";

/**
 * Layout for a page that is only text: one narrow column, with PageNav's
 * back button and clickable margins.
 */
export function TextPage({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="relative mx-auto max-w-3xl px-5 md:px-0">
      <PageNav />
      <div className="py-14 md:py-20">{children}</div>
    </main>
  );
}
