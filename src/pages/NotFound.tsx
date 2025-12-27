import { motion } from "framer-motion";
import { Link } from "react-router";

export function NotFound() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
    >
      <h1 className="text-6xl text-text mb-4">404</h1>
      <p className="text-text-secondary mb-8">This page doesn't exist.</p>
      <Link
        to="/"
        className="text-text-secondary hover:text-text transition-colors"
      >
        ← Return home
      </Link>
    </motion.main>
  );
}
