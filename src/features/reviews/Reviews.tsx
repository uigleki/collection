import { categories, meta, music } from "@/data/works";
import { BackButton } from "@/shared/ui/BackButton";
import { Footer } from "@/shared/ui/Footer";
import { motion } from "framer-motion";
import { CategorySection } from "./components/CategorySection";
import { MusicSection } from "./components/MusicSection";

export function Reviews() {
  return (
    <main className="min-h-screen">
      <title>{meta.title}</title>
      <BackButton variant="top" />

      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">{meta.title}</h1>
          <p className="text-lg text-muted-foreground">{meta.description}</p>
        </motion.div>

        {categories.map((category) => (
          <CategorySection key={category.name} category={category} />
        ))}

        <MusicSection tracks={music} />
      </div>

      <BackButton variant="bottom" />
      <Footer />
    </main>
  );
}

export { Reviews as Component };
