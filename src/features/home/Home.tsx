import { categories, music, siteMeta } from "@/data/works";
import { Footer } from "@/shared/ui/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { Hero } from "./components/Hero";
import { MusicCard } from "./components/MusicCard";
import { WorkCard } from "./components/WorkCard";

export function Home() {
  const [expandedWork, setExpandedWork] = useState<string | null>(null);

  return (
    <main className="min-h-screen">
      <title>{siteMeta.title}</title>
      <Hero />

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {categories.map((category) => (
          <section key={category.name}>
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-3xl font-bold mb-8"
            >
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
        ))}

        {/* Music Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-3xl font-bold mb-8"
          >
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
