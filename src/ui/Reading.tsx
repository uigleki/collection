import type { ReactNode } from "react";
import { Doorway } from "./Doorway.tsx";

/**
 * Layout for a page that is only text: one narrow column, with Doorway's
 * back button and clickable margins.
 */
export function Reading({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="relative mx-auto max-w-3xl px-5 md:px-0">
      <Doorway />
      <div className="py-14 md:py-20">{children}</div>
    </main>
  );
}
