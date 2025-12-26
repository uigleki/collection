import { quotes } from "@/data/quotes";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { HoverReveal } from "./HoverReveal";

export function AnimatedQuote() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      to="/why"
      className="block text-center py-12"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-24 md:h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className={`absolute text-2xl md:text-3xl transition-colors ${hovered ? "text-text" : "text-text-secondary"}`}
          >
            {quotes[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <HoverReveal show={hovered}>
        <span className="block text-text-secondary">Why These →</span>
      </HoverReveal>
    </Link>
  );
}
