import { motion } from "motion/react";
import type { WhyConcept } from "@/data/types";
import { renderEmphasis } from "@/shared/lib/markdown";

interface ConceptCardProps {
  readonly concept: WhyConcept;
  index: number;
}

export function ConceptCard({ concept, index }: ConceptCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        rotateY: -15,
        scale: 0.9,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateY: 0,
        scale: 1,
      }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 15,
        delay: index * 0.15,
      }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        borderTop: `4px solid ${concept.color}`,
      }}
      className="bg-card p-8 rounded-lg"
    >
      <h3 className="text-2xl font-bold mb-2" style={{ color: concept.color }}>
        {concept.title}
      </h3>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: {
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="space-y-4"
      >
        {concept.explanation.map((item) => {
          if (typeof item === "string") {
            return (
              <motion.div
                key={item}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                    },
                  },
                }}
                className="text-foreground leading-relaxed"
              >
                {renderEmphasis(item)}
              </motion.div>
            );
          }

          return (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                  },
                },
              }}
            >
              <p className="font-medium mb-1" style={{ color: concept.color }}>
                {item.label}
              </p>
              <div className="text-muted-foreground leading-relaxed">
                {renderEmphasis(item.text)}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
