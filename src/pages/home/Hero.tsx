import type { RefObject } from "react";
import { couplets } from "@/data/why.ts";
import { useNight } from "@/lib/sky.ts";

// The essay's opening question, verbatim from docs/why.md.
const [questionA, questionB] = couplets.opening;

/**
 * One line of text that slides up from behind its own overflow mask (.rise)
 * after a delay of `at` ms. Callers stagger `at` so the lines follow one
 * another.
 */
function Line({ at, children }: { at: number; children: string }) {
  return (
    <span className="block overflow-hidden">
      <span
        className="rise block"
        style={{ "--at": `${at}ms` } as React.CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

/** The home page's first section. It shows no loader (DESIGN.md). */
export function Hero({ h1 }: { h1: RefObject<HTMLHeadingElement | null> }) {
  const section = useNight<HTMLElement>(1);

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

        <p className="mt-6 max-w-xl text-lead text-hoshi">
          <Line at={280}>{questionA}</Line>
          <Line at={380}>{questionB}</Line>
        </p>
      </div>
    </section>
  );
}
