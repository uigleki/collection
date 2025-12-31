import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FooterProps {
  text: string;
  onHomeClick?: () => void;
}

export function Footer({ text, onHomeClick }: FooterProps) {
  const [showButton, setShowButton] = useState(false);
  const [pageIsLong, setPageIsLong] = useState(false);

  useEffect(() => {
    const checkPageHeight = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      setPageIsLong(scrollHeight > clientHeight * 1.5);
    };

    const handleScroll = () => {
      setShowButton(window.scrollY > window.innerHeight);
    };

    checkPageHeight();
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkPageHeight);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkPageHeight);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = (
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-muted-foreground italic mb-6"
    >
      {text}
    </motion.p>
  );

  return (
    <footer className="py-12 relative">
      <div className="text-center">
        {onHomeClick ? (
          <motion.button
            onClick={onHomeClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hover:text-foreground transition-colors duration-300"
            style={{ willChange: "transform" }}
          >
            {content}
          </motion.button>
        ) : (
          content
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center gap-6 text-sm"
        >
          <motion.a
            href="https://github.com/uigleki/collection"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ willChange: "transform" }}
          >
            GitHub
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
            style={{ willChange: "transform" }}
          >
            CC BY-SA 4.0
          </motion.a>
        </motion.div>
      </div>

      {pageIsLong && (
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{ willChange: "transform" }}
              aria-label="Back to top"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </footer>
  );
}
