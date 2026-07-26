import { motion, useReducedMotion } from "motion/react";

/**
 * The pause before a medium begins — mostly empty on purpose, so each group
 * of works gets its own silence first. Music sits closer to what precedes it
 * (the koan already gave that silence), hence the overridable spacing.
 */
export function Interlude({
  name,
  count,
  className = "min-h-[34vh] py-16 md:min-h-[42vh]",
}: {
  name: string;
  count: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.header
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 1.2 }}
      className={`flex items-end ${className}`}
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
