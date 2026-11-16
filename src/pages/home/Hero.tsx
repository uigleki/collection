import type { RefObject } from "react";
import { displayLines } from "@/data/why.ts";
import { useNight } from "@/lib/sky.ts";
import { Line } from "@/ui/Line.tsx";

// The essay's opening question, verbatim from docs/why.md.
const [questionA, questionB] = displayLines.opening;

/** The home page's first section. It shows no loader (DESIGN.md). */
export function Hero({ h1 }: { h1: RefObject<HTMLHeadingElement | null> }) {
  const section = useNight(1);

  return (
    <section
      ref={section}
      className="relative flex min-h-dvh flex-col justify-end px-5 pb-20 md:px-12 md:pb-24"
    >
      <div className="max-w-3xl">
        <h1
          ref={h1}
          tabIndex={-1}
          className="text-display font-light tracking-tight"
        >
          <Line at={50}>Perfect</Line>
          <Line at={140}>Collection</Line>
        </h1>

        <p className="mt-6 max-w-xl text-lead text-muted">
          <Line at={280}>{questionA}</Line>
          <Line at={380}>{questionB}</Line>
        </p>
      </div>
    </section>
  );
}
