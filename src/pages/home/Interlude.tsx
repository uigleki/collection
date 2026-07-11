import { motion, useReducedMotion } from "motion/react";

/**
 * The pause between mediums — mostly empty on purpose, so each group of
 * works gets its own silence before it begins.
 */
export function Interlude({ name, count }: { name: string; count: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.header
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 1.2 }}
      className="flex min-h-[34vh] items-end py-16 md:min-h-[42vh]"
    >
      <div className="flex items-baseline gap-4">
        <h2 className="text-title font-light tracking-tight">{name}</h2>
        <span className="font-mono text-caption text-hoshi tabular-nums">
          {String(count).padStart(2, "0")}
        </span>
      </div>
    </motion.header>
  );
}
