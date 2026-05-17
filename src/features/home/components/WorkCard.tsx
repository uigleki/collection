import { AnimatePresence, motion } from "motion/react";
import type { Work } from "@/data/types";

interface WorkCardProps {
  readonly work: Work;
  expanded: boolean;
  onToggle: () => void;
  index: number;
}

export function WorkCard({ work, expanded, onToggle, index }: WorkCardProps) {
  return (
    <motion.button
      type="button"
      aria-expanded={expanded}
      initial={{
        opacity: 0,
        y: 40,
        rotateX: 15,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: { inherit: true, delay: Math.min(index * 0.08, 0.4) },
      }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        borderLeft: `4px solid ${work.color}`,
      }}
      className="cursor-pointer text-left w-full"
      onClick={onToggle}
    >
      <motion.div
        className="bg-card p-6 rounded-r-lg"
        whileHover={{
          y: -12,
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        <h3 className="text-xl font-bold mb-2">{work.title}</h3>
        <p className="text-muted-foreground">{work.subtitle}</p>

        <AnimatePresence mode="wait">
          {expanded && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
                marginTop: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
                marginTop: 24,
              }}
              exit={{
                height: 0,
                opacity: 0,
                marginTop: 0,
              }}
              transition={{
                height: {
                  type: "spring",
                  stiffness: 140,
                  damping: 24,
                },
                opacity: {
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: expanded ? 0.15 : 0,
                },
              }}
              className="overflow-hidden"
            >
              <motion.div
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={{
                  expanded: {
                    transition: { staggerChildren: 0.06 },
                  },
                }}
              >
                {work.review.map((point) => (
                  <motion.div
                    key={point.label}
                    variants={{
                      collapsed: {
                        opacity: 0,
                        x: -20,
                        scale: 0.95,
                      },
                      expanded: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                    }}
                    className="mb-4"
                  >
                    <p className="font-medium text-primary mb-1">
                      {point.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {point.text}
                    </p>
                  </motion.div>
                ))}

                {work.flaws && (
                  <motion.div
                    variants={{
                      collapsed: {
                        opacity: 0,
                        y: 10,
                      },
                      expanded: {
                        opacity: 1,
                        y: 0,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: Math.min(work.review.length * 0.06, 0.4),
                    }}
                    className="pt-4 border-t border-border"
                  >
                    <p className="font-bold text-destructive mb-3">
                      Shortcomings
                    </p>
                    {work.flaws.map((flaw) => (
                      <div key={flaw.label} className="mb-3">
                        <p className="font-medium text-sm">{flaw.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {flaw.text}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
