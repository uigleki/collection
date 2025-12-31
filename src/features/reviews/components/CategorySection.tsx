import type { WorkCategory } from "@/data/types";
import { motion } from "framer-motion";
import { WorkCard } from "./WorkCard";

interface CategorySectionProps {
  category: WorkCategory;
}

export function CategorySection({ category }: CategorySectionProps) {
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
