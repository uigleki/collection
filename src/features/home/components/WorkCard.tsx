import type { Work } from "@/data/types";
import { AnimatePresence, motion } from "framer-motion";

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
      }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
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
        transition={{
          duration: 0.4,
          ease: [0.34, 1.56, 0.64, 1],
        }}
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
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
                opacity: {
                  duration: 0.3,
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
                {work.review.map((point, i) => (
                  <motion.div
                    key={i}
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
                      duration: 0.4,
                      ease: "easeOut",
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
                      duration: 0.4,
                      delay: work.review.length * 0.06,
                    }}
                    className="pt-4 border-t border-border"
                  >
                    <p className="font-bold text-destructive mb-3">
                      Shortcomings
                    </p>
                    {work.flaws.map((flaw, i) => (
                      <div key={i} className="mb-3">
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
