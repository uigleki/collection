import { motion, useReducedMotion } from "motion/react";
import type { RefObject } from "react";
import { couplets } from "@/data/why.ts";
import { RISE } from "@/lib/motion.ts";
import { useNight } from "@/lib/sky.ts";

// The opening question, verbatim from docs/why.md — the page is its answer.
const [questionA, questionB] = couplets.opening;

/** The opening sky: no loader, nothing to wait for. */
export function Hero({ h1 }: { h1: RefObject<HTMLHeadingElement | null> }) {
  const reduced = useReducedMotion();
  const section = useNight<HTMLElement>(1);

  const rise = (delay: number) =>
    reduced
      ? {}
      : ({
          initial: { opacity: 0, y: "0.6em" },
          animate: { opacity: 1, y: 0 },
          transition: { ...RISE, delay },
        } as const);

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
          <span className="block overflow-hidden">
            <motion.span className="block" {...rise(0.05)}>
              Perfect
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" {...rise(0.14)}>
              Collection
            </motion.span>
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lead text-hoshi">
          <span className="block overflow-hidden">
            <motion.span className="block" {...rise(0.28)}>
              {questionA}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" {...rise(0.38)}>
              {questionB}
            </motion.span>
          </span>
        </p>
      </div>
    </section>
  );
}
