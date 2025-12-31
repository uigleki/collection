import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  intro: string;
}

export function SectionTitle({ title, intro }: SectionTitleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
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
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            },
          },
        }}
        style={{ willChange: "transform, filter" }}
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
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
          style={{ originX: 0, willChange: "transform" }}
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
                duration: 1.2,
                ease: "easeOut",
              },
            },
          }}
          style={{ originX: 0, willChange: "transform" }}
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
              duration: 0.6,
              ease: "easeOut",
            },
          },
        }}
        style={{ willChange: "transform" }}
        className="text-lg text-muted-foreground mb-12"
      >
        {intro}
      </motion.p>
    </motion.div>
  );
}
