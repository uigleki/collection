import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { hasRevealed, markRevealed } from "@/lib/reveal";

/** The closing beat: rest, not climax, under a lightening sky. */
export function DawnClose() {
  const reduced = useReducedMotion();
  const settled = reduced || hasRevealed("dawn-close");

  // Masked lines can't observe themselves: clipped by the overflow-hidden
  // parent their visible area is zero and the viewport trigger never fires.
  // The (unclipped) heading observes; variants carry the reveal down.
  const line = (delay: number) => ({
    hidden: { y: "1.05em" },
    visible: {
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 60,
        damping: 19,
        delay,
      },
    },
  });

  return (
    <footer className="relative flex min-h-dvh flex-col justify-center">
      <motion.div
        onViewportEnter={() => markRevealed("dawn-close")}
        initial={settled ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2 }}
      >
        {/* the essay's own final beat, verbatim: the hero's question is
            answered in its own words — beauty for beauty, question for
            question */}
        <p className="max-w-xl text-lead text-hoshi italic">
          The beauty you were born to experience?
        </p>
        <motion.h2
          initial={settled ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-10 text-colossus font-light tracking-tight"
        >
          <span className="block overflow-hidden">
            <motion.span variants={line(0.15)} className="block">
              You&rsquo;ve found it.
            </motion.span>
          </span>
        </motion.h2>
      </motion.div>

      <div className="absolute right-0 bottom-0 left-0 flex flex-wrap items-baseline justify-between gap-6 border-t border-border/60 pt-6 pb-10 text-caption text-hoshi">
        <p>
          <Link to="/credits" viewTransition className="link-draw">
            Colophon
          </Link>
        </p>
        <p>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            rel="license noopener"
            className="link-draw"
          >
            CC BY-SA 4.0
          </a>
        </p>
        <p className="italic">I honor the creators who refuse shortcuts.</p>
      </div>
    </footer>
  );
}
