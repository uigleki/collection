import { meta } from "@/data/why";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpToLine, Code } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface FooterProps {
  text?: string;
}

export function Footer({ text }: FooterProps) {
  const { ref, inView } = useInView();
  const showButton = !inView;
  const shouldReduceMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "instant" : "smooth",
    });
  };

  return (
    <>
      {/* Scroll sentinel at 50vh to detect page scroll */}
      <div
        ref={ref}
        className="absolute top-[50vh] h-px w-px opacity-0 pointer-events-none"
      />

      <footer className="py-12 relative">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-muted-foreground italic mb-6"
          >
            {text ?? meta.footer}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center gap-6 text-sm"
          >
            <motion.a
              href="https://github.com/uigleki/collection"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              aria-label="View source on GitHub"
            >
              <Code className="w-4 h-4" />
              <span>GitHub</span>
            </motion.a>

            <motion.div
              className="h-4 w-px bg-border"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            />

            <motion.a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              CC BY-SA 4.0
            </motion.a>
          </motion.div>
        </div>

        {/* Back to top button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              aria-label="Back to top"
            >
              <ArrowUpToLine className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </footer>
    </>
  );
}
