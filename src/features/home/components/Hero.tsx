import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router";

export function Hero() {
  const questionRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const x = useTransform(smoothX, (v) => v * 0.1);
  const y = useTransform(smoothY, (v) => v * 0.1);

  const handleQuestionMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!questionRef.current) return;
    const rect = questionRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleQuestionMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
      {/* Question */}
      <motion.div
        ref={questionRef}
        initial={{
          opacity: 0,
          y: 60,
          scale: 0.9,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ willChange: "transform, filter" }}
        className="max-w-4xl"
        onMouseMove={handleQuestionMouseMove}
        onMouseLeave={handleQuestionMouseLeave}
      >
        <Link to="/why">
          <motion.h1
            style={{
              x,
              y,
              willChange: "transform",
              fontSize: "clamp(1rem, 5vw, 2.5rem)",
              lineHeight: "1.5",
            }}
            whileHover={{
              scale: 1.02,
            }}
            transition={{
              duration: 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="font-bold text-center mb-8 transition-colors duration-500 ease-out hover:text-primary"
          >
            If we're here to experience beauty,
            <br />
            what beauty is worth our finite time?
          </motion.h1>
        </Link>
      </motion.div>

      {/* Divider */}
      <div className="w-full max-w-4xl">
        <Link to="/reviews">
          <div className="relative py-8 cursor-pointer overflow-hidden group">
            {/* Base line */}
            <motion.div
              className="h-px bg-border transition-colors duration-500 ease-out group-hover:bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1.4,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ originX: 0.5, willChange: "transform" }}
            />

            {/* Energy pulse on load only */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-primary to-transparent -translate-x-1/2 -translate-y-1/2"
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{
                scaleX: 6,
                opacity: 0,
              }}
              transition={{
                duration: 1.2,
                delay: 0.6,
                ease: "easeOut",
              }}
              style={{ willChange: "transform, opacity" }}
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
