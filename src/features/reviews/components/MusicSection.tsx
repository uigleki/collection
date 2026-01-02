import type { WorkTrack } from "@/data/types";
import { motion } from "framer-motion";

interface MusicSectionProps {
  tracks: WorkTrack[];
}

export function MusicSection({ tracks }: MusicSectionProps) {
  return (
    <section className="mb-20">
      <motion.h2
        initial={{ opacity: 0, x: -40, scale: 0.9 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{ willChange: "transform" }}
        className="text-4xl font-bold mb-8"
      >
        Music
      </motion.h2>

      <div className="space-y-4">
        {tracks.map((track, index) => (
          <motion.div
            key={track.title}
            initial={{
              opacity: 0,
              x: -40,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.5,
              delay: Math.min(index * 0.02, 0.4),
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              borderLeft: `4px solid ${track.color}`,
              willChange: "transform",
            }}
            className="bg-card p-4 rounded-r-lg relative overflow-hidden"
            whileHover="hover"
          >
            <motion.div
              variants={{
                hover: { x: 4 },
              }}
              transition={{ duration: 0.2 }}
              style={{ willChange: "transform" }}
            >
              <h4 className="text-base font-normal mb-1">{track.title}</h4>
              <p className="text-sm text-muted-foreground italic">
                {track.subtitle}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
