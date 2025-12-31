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
        className="bg-card p-4 rounded-r-lg relative overflow-hidden group"
        whileHover={{
          x: 4,
        }}
        whileTap={{
          scale: 0.97,
        }}
        transition={{ duration: 0.2 }}
        style={{ willChange: "transform" }}
      >
        <h4 className="text-base font-normal mb-1">{track.title}</h4>
        <p className="text-sm text-muted-foreground italic">{track.subtitle}</p>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
          initial={{ x: "-100%", opacity: 0 }}
          whileHover={{
            x: "100%",
            opacity: 1,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
        />
      </motion.div>
    </motion.div>
  );
}
