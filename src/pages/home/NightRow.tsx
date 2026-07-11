import { motion, useReducedMotion, useSpring } from "motion/react";
import { Link } from "react-router";
import type { WorkEntry } from "@/data/works";
import { accentFor } from "@/lib/covers";
import { hasRevealed, markRevealed } from "@/lib/reveal";
import { useNight } from "@/lib/useNight";
import { Cover } from "@/ui/Cover";

/** One work; the whole row is one door. Holding the viewport makes its
 * night the sky's target — scrolling is what waxes the moon. */
export function NightRow({ entry }: { entry: WorkEntry }) {
  const reduced = useReducedMotion();
  const ref = useNight<HTMLElement>(entry.night);
  const { work, slug, category, ordinal, lang } = entry;
  const accent = accentFor(slug, work.title);
  const settled = reduced || hasRevealed(slug);

  // Lift and tilt live on the SAME springs so the cover rises and turns
  // toward the cursor as one movement, not two queued effects. Skipped for
  // reduced-motion and touch (no cursor to face).
  const spring = { stiffness: 160, damping: 20 } as const;
  const tiltX = useSpring(0, spring);
  const tiltY = useSpring(0, spring);
  const lift = useSpring(0, spring);
  const zoom = useSpring(1, spring);
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 7);
    lift.set(-6);
    zoom.set(1.02);
  };
  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    lift.set(0);
    zoom.set(1);
  };

  return (
    <motion.article
      ref={ref}
      initial={settled ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => markRevealed(slug)}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ type: "spring", stiffness: 70, damping: 20 }}
      className="py-16 first:pt-0 md:py-20"
    >
      <Link
        to={`/works/${slug}`}
        viewTransition
        aria-label={`${work.title} — open`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ "--glow": accent } as React.CSSProperties}
        className="group grid gap-7 md:grid-cols-[11rem_1fr] md:gap-10 lg:grid-cols-[13rem_1fr]"
      >
        <motion.div
          style={{
            rotateX: tiltX,
            rotateY: tiltY,
            y: lift,
            scale: zoom,
            transformPerspective: 700,
          }}
          className="w-40 md:w-auto"
        >
          <Cover
            title={work.title}
            slug={slug}
            lang={lang}
            morph
            className="cover-lift"
          />
        </motion.div>

        <div className="max-w-xl self-center">
          <motion.h3
            lang={lang}
            initial={settled ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            className="overflow-hidden text-title font-normal tracking-tight"
          >
            <motion.span
              className="block"
              variants={{
                hidden: { y: "1.05em" },
                visible: {
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 70,
                    damping: 20,
                    delay: 0.08,
                  },
                },
              }}
            >
              <span
                className="underline-grow"
                style={{
                  backgroundImage: `linear-gradient(color-mix(in oklab, ${accent} 70%, var(--color-tsuki)), color-mix(in oklab, ${accent} 70%, var(--color-tsuki)))`,
                }}
              >
                {work.title}
              </span>
            </motion.span>
          </motion.h3>
          <p className="mt-3 text-lead text-hoshi italic transition-colors duration-500 group-hover:text-tsuki">
            {work.subtitle}
          </p>
          <p className="mt-5 font-mono text-caption text-hoshi tabular-nums">
            {category} {String(ordinal).padStart(2, "0")}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
