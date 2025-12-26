import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface HoverRevealProps {
  show: boolean;
  children: ReactNode;
}

export function HoverReveal({ show, children }: HoverRevealProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
