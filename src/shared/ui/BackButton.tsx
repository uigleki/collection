import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
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
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.span>
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: 4 },
              }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
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
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.span>
          <motion.span
            variants={{
              rest: { x: 0 },
              hover: { x: 4 },
            }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Back to Home
          </motion.span>
        </motion.div>
      </Link>
    </div>
  );
}
