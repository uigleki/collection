import { AnimatedQuote } from "@/components/AnimatedQuote";
import { Divider } from "@/components/Divider";
import { Footer } from "@/components/Footer";
import { MusicSection, WorkCategorySection } from "@/components/Section";
import { categories, music } from "@/data/works";
import { motion } from "framer-motion";
import { Link } from "react-router";

export function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-6"
    >
      <AnimatedQuote />

      <Divider symbol="start" />

      {categories.map((category) => (
        <WorkCategorySection key={category.name} category={category} />
      ))}

      <MusicSection tracks={music} />

      <Divider symbol="end" />

      <div className="text-center">
        <Link
          to="/why"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          Why These →
        </Link>
      </div>

      <Footer />
    </motion.main>
  );
}
