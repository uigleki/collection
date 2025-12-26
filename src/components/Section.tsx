import type { Category, Section as SectionType } from "@/data/types";
import { motion } from "framer-motion";
import { Item } from "./Item";

interface CategorySectionProps {
  category: Category;
}

export function CategorySection({ category }: CategorySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <h2 className="text-2xl text-text mb-6">{category.name}</h2>
      <div className="space-y-2">
        {category.items.map((item) => (
          <Item key={item.title} item={item} />
        ))}
      </div>
    </motion.section>
  );
}

interface WhySectionProps {
  section: SectionType;
}

export function WhySection({ section }: WhySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <h2 className="text-3xl text-text mb-4">{section.title}</h2>
      <p className="text-text-secondary mb-8">{section.intro}</p>

      <div className="space-y-4">
        {section.items.map((item) => (
          <Item key={item.title} item={item} />
        ))}
      </div>

      <p className="text-text-secondary mt-8 italic">{section.outro}</p>
    </motion.section>
  );
}
