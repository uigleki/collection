import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { meta } from "@/data/why";
import { FULL_NIGHT } from "@/lib/moon";
import { useNight } from "@/lib/useNight";

/** Under the full moon the shrine points past itself (docs/why.md). */
export function Koan() {
  const reduced = useReducedMotion();
  const ref = useNight<HTMLElement>(FULL_NIGHT);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[90vh] flex-col items-center justify-center py-24 text-center"
    >
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.8 }}
        className="max-w-md text-lead leading-relaxed italic"
      >
        {meta.description}
      </motion.p>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-12"
      >
        <Link
          to="/why"
          viewTransition
          className="pill text-body text-tsuki hover:text-tsukikage"
        >
          Why these works
        </Link>
      </motion.div>
    </section>
  );
}
