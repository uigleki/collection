import type { WorkCategory } from "@/data/types";
import { motion } from "motion/react";
import {
  Clapperboard,
  Gamepad2,
  Palette,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { WorkCard } from "./WorkCard";

const categoryIcons: Record<string, LucideIcon> = {
  Anime: Tv,
  Movies: Clapperboard,
  Games: Gamepad2,
  Artists: Palette,
};

interface CategorySectionProps {
  readonly category: WorkCategory;
}

export function CategorySection({ category }: CategorySectionProps) {
  const Icon = categoryIcons[category.name];
  return (
    <section className="mb-20">
      <motion.h2
        initial={{ opacity: 0, x: -40, scale: 0.9 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="text-4xl font-bold mb-8 flex items-center gap-3"
      >
        {Icon && <Icon className="w-10 h-10" />}
        {category.name}
      </motion.h2>

      <div className="space-y-8">
        {category.works.map((work, i) => (
          <WorkCard key={work.title} work={work} index={i} />
        ))}
      </div>
    </section>
  );
}
