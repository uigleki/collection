import type { Work } from "@/data/types";
import { motion } from "framer-motion";

interface WorkCardProps {
  readonly work: Work;
  index: number;
}

export function WorkCard({ work, index }: WorkCardProps) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 40,
        rotateX: -10,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        borderLeft: `4px solid ${work.color}`,
      }}
      className="bg-card p-8 rounded-r-lg"
    >
      <h3 className="text-2xl font-bold mb-2">{work.title}</h3>
      <p className="text-muted-foreground italic mb-6">{work.subtitle}</p>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: {
            transition: { staggerChildren: 0.05 },
          },
        }}
        className="space-y-4"
      >
        {work.review.map((point, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              },
            }}
          >
            <p className="font-medium text-primary mb-1">{point.label}</p>
            <p className="text-muted-foreground leading-relaxed">
              {point.text}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {work.flaws && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: work.review.length * 0.05,
            duration: 0.4,
          }}
          className="mt-6 pt-6 border-t border-border"
        >
          <p className="font-bold text-destructive mb-4">Shortcomings</p>
          <div className="space-y-3">
            {work.flaws.map((flaw, i) => (
              <div key={i}>
                <p className="font-medium text-sm mb-1">{flaw.label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {flaw.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}
