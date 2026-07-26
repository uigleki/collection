import type { ReactNode } from "react";
import { Doorway } from "./Doorway";

/**
 * The shape of a page that is only prose: one narrow column, and the
 * doorway's chips and clickable margins around it. The sky keeps the rest.
 */
export function Reading({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="relative mx-auto max-w-3xl px-5 md:px-0">
      <Doorway />
      <div className="py-14 md:py-20">{children}</div>
    </main>
  );
}
