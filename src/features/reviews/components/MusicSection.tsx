import { Music } from "lucide-react";
import { motion } from "motion/react";
import type { WorkTrack } from "@/data/types";

interface MusicSectionProps {
  readonly tracks: readonly WorkTrack[];
}

export function MusicSection({ tracks }: MusicSectionProps) {
  return (
    <section className="mb-20">
      <motion.h2
        initial={{ opacity: 0, x: -40, scale: 0.9 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
        }}
        className="text-4xl font-bold mb-8 flex items-center gap-3"
      >
        <Music className="w-10 h-10" />
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
              transition: { inherit: true, delay: Math.min(index * 0.05, 0.4) },
            }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            style={{
              borderLeft: `4px solid ${track.color}`,
            }}
            className="bg-card p-4 rounded-r-lg relative overflow-hidden"
          >
            <h4 className="text-base font-normal mb-1">{track.title}</h4>
            <p className="text-sm text-muted-foreground italic">
              {track.subtitle}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
