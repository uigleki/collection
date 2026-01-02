import type { WorkTrack } from "@/data/types";
import { motion } from "framer-motion";

interface MusicCardProps {
  track: WorkTrack;
  index: number;
}

export function MusicCard({ track, index }: MusicCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -30,
        scale: 0.9,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.3),
        ease: "easeOut",
      }}
      style={{
        borderLeft: `4px solid ${track.color}`,
      }}
    >
      <motion.div
        className="bg-card p-4 rounded-r-lg relative overflow-hidden"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2 }}
        style={{ willChange: "transform" }}
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
    </motion.div>
  );
}
