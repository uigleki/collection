import { motion } from "framer-motion";
import { Link } from "react-router";

export function BackLink() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>←</span>
        <span>Back</span>
      </Link>
    </motion.div>
  );
}
