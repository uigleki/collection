import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

interface BackButtonProps {
  variant?: "top" | "bottom";
}

export function BackButton({ variant = "top" }: BackButtonProps) {
  if (variant === "top") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="fixed top-8 left-8 z-50"
      >
        <Link to="/" aria-label="Go back to home">
          <motion.div
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            whileHover="hover"
            initial="rest"
          >
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: -6 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.span>
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: 4 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="text-sm"
            >
              Back
            </motion.span>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="py-8 text-center">
      <Link to="/">
        <motion.div
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          whileHover="hover"
          initial="rest"
        >
          <motion.span
            variants={{
              rest: { x: 0 },
              hover: { x: -6 },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.span>
          <motion.span
            variants={{
              rest: { x: 0 },
              hover: { x: 4 },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            Back to Home
          </motion.span>
        </motion.div>
      </Link>
    </div>
  );
}
