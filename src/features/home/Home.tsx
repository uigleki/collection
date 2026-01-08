import { categories, music, siteMeta } from "@/data/works";
import { Footer } from "@/shared/ui/Footer";
import { motion } from "motion/react";
import {
  Clapperboard,
  Gamepad2,
  Music,
  Palette,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Hero } from "./components/Hero";
import { MusicCard } from "./components/MusicCard";
import { WorkCard } from "./components/WorkCard";

const categoryIcons: Record<string, LucideIcon> = {
  Anime: Tv,
  Movies: Clapperboard,
  Games: Gamepad2,
  Artists: Palette,
};

export function Home() {
  const [expandedWork, setExpandedWork] = useState<string | null>(null);

  return (
    <main className="min-h-screen">
      <title>{siteMeta.title}</title>
      <Hero />

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {categories.map((category) => {
          const Icon = categoryIcons[category.name];
          return (
            <section key={category.name}>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-3xl font-bold mb-8 flex items-center gap-3"
              >
                {Icon && <Icon className="w-8 h-8" />}
                {category.name}
              </motion.h2>

              <div className="space-y-6">
                {category.works.map((work, index) => (
                  <WorkCard
                    key={work.title}
                    work={work}
                    index={index}
                    expanded={expandedWork === work.title}
                    onToggle={() =>
                      setExpandedWork(
                        expandedWork === work.title ? null : work.title,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Music Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-3xl font-bold mb-8 flex items-center gap-3"
          >
            <Music className="w-8 h-8" />
            Music
          </motion.h2>

          <div className="space-y-4">
            {music.map((track, index) => (
              <MusicCard key={track.title} track={track} index={index} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

export { Home as Component };
