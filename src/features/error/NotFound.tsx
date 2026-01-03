import { BackButton } from "@/shared/ui/BackButton";
import { Footer } from "@/shared/ui/Footer";
import { motion } from "framer-motion";

export function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <title>Page Not Found</title>
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl font-bold mb-4"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-muted-foreground mb-8"
          >
            Page not found
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <BackButton variant="bottom" />
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
