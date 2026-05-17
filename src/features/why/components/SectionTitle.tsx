import { motion } from "motion/react";

interface SectionTitleProps {
  title: string;
  intro: string;
}

export function SectionTitle({ title, intro }: SectionTitleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: {
          transition: { staggerChildren: 0.15 },
        },
      }}
    >
      <motion.h2
        variants={{
          hidden: {
            opacity: 0,
            filter: "blur(20px)",
            y: 30,
          },
          visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
              type: "spring",
              stiffness: 120,
              damping: 15,
            },
          },
        }}
        className="text-4xl font-bold mb-4"
      >
        {title}
      </motion.h2>

      {/* Underline with ink spread effect */}
      <motion.div className="relative h-1 w-24 mb-6">
        <motion.div
          className="absolute inset-0 bg-primary"
          variants={{
            hidden: { scaleX: 0, opacity: 0 },
            visible: {
              scaleX: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 60,
                damping: 20,
              },
            },
          }}
          style={{ originX: 0 }}
        />

        {/* Diffusion glow */}
        <motion.div
          className="absolute inset-0 bg-primary/30 blur-sm"
          variants={{
            hidden: { scaleX: 0, opacity: 0 },
            visible: {
              scaleX: 2,
              opacity: 0,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 30,
              },
            },
          }}
          style={{ originX: 0 }}
        />
      </motion.div>

      <motion.p
        variants={{
          hidden: {
            opacity: 0,
            y: 20,
          },
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
        className="text-lg text-muted-foreground mb-12"
      >
        {intro}
      </motion.p>
    </motion.div>
  );
}
