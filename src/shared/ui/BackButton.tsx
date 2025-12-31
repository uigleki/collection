import { motion } from "framer-motion";
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
        <Link to="/">
          <motion.div
            className="flex items-center gap-2 text-muted-foreground"
            whileHover="hover"
            initial="rest"
          >
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: -8 },
              }}
              transition={{
                duration: 0.3,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ willChange: "transform" }}
            >
              ←
            </motion.span>
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: 4 },
              }}
              transition={{
                duration: 0.3,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="text-sm"
              style={{ willChange: "transform" }}
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
          className="inline-flex items-center gap-2 text-muted-foreground"
          whileHover="hover"
          initial="rest"
        >
          <motion.span
            variants={{
              rest: { x: 0 },
              hover: { x: -6 },
            }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ willChange: "transform" }}
          >
            ←
          </motion.span>
          <motion.span
            variants={{
              rest: { x: 0 },
              hover: { x: 4 },
            }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ willChange: "transform" }}
          >
            Back to Home
          </motion.span>
        </motion.div>
      </Link>
    </div>
  );
}
