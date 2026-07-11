import { useDrag } from "@use-gesture/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { neighbors, siteMeta, workBySlug } from "@/data/works";
import { accentFor } from "@/lib/covers";
import { usePage } from "@/lib/usePage";
import { sky } from "@/scene/signal";
import { Cover } from "@/ui/Cover";
import { Doorway, EdgeChip } from "@/ui/Doorway";
import { NotFound } from "../NotFound";

/** A work's room: the sky eases to its night and dims; the room is lit
 * by the work's canonical color. Flaws are stated plainly. */
export function WorkRoom() {
  const { slug = "" } = useParams();
  const entry = workBySlug.get(slug);

  if (!entry) return <NotFound />;
  return <Room key={slug} slug={slug} entry={entry} />;
}

function Room({
  slug,
  entry,
}: {
  slug: string;
  entry: NonNullable<ReturnType<typeof workBySlug.get>>;
}) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { work, night, category, ordinal, lang } = entry;
  const h1 = usePage(`${work.title} — ${siteMeta.title}`);
  const accent = accentFor(slug, work.title);
  const { prev, next } = neighbors(slug);

  useEffect(() => {
    sky.targetNight = night;
    sky.dim = 1;
    return () => {
      sky.dim = 0;
    };
  }, [night]);

  // Directional shelf slide for prev/next lives on <html> only during the
  // transition (see index.css).
  useEffect(() => {
    const t = setTimeout(() => {
      delete document.documentElement.dataset.dir;
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const goNeighbor = (dir: "prev" | "next", to: string) => {
    document.documentElement.dataset.dir = dir;
    navigate(`/works/${to}`, { viewTransition: true, replace: true });
  };

  // Touch walks the shelf too: a decisive horizontal swipe moves to the
  // neighbouring work (use-gesture's swipe detector — velocity + distance
  // thresholds, axis-locked so vertical reading is never hijacked).
  const bindSwipe = useDrag(
    ({ swipe: [sx] }) => {
      if (sx === -1 && next) goNeighbor("next", next.slug);
      if (sx === 1 && prev) goNeighbor("prev", prev.slug);
    },
    { axis: "x", pointer: { touch: true }, swipe: { distance: 60 } },
  );

  // The whole article enters as one choreography from mount. whileInView is
  // deliberately NOT used here: during a view transition the observer fires
  // while the page is still covered, and anything without a delay finishes
  // animating before it is ever visible.
  const reveal = (delay: number) =>
    reduced
      ? {}
      : ({
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: {
            type: "spring" as const,
            stiffness: 65,
            damping: 19,
            delay,
          },
        } as const);

  return (
    <main
      id="main"
      {...bindSwipe()}
      className="relative mx-auto max-w-6xl touch-pan-y px-5 md:px-12"
    >
      <Doorway>
        {prev ? (
          <EdgeChip
            side="prev"
            title={prev.work.title}
            lang={prev.lang}
            onClick={() => goNeighbor("prev", prev.slug)}
          />
        ) : null}
        {next ? (
          <EdgeChip
            side="next"
            title={next.work.title}
            lang={next.lang}
            onClick={() => goNeighbor("next", next.slug)}
          />
        ) : null}
      </Doorway>

      <div className="grid gap-10 pt-20 pb-24 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-16">
        <div className="md:sticky md:top-20 md:self-start">
          <Cover
            title={work.title}
            slug={slug}
            lang={lang}
            morph
            priority
            className="mx-auto max-w-sm md:mx-0"
          />
        </div>

        <article className="max-w-2xl pb-10">
          <motion.p
            className="mb-6 font-mono text-caption text-hoshi tabular-nums"
            {...reveal(0.08)}
          >
            {category} {String(ordinal).padStart(2, "0")}
          </motion.p>

          <h1
            ref={h1}
            tabIndex={-1}
            lang={lang}
            className="text-display font-normal tracking-tight outline-none"
          >
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                {...(reduced
                  ? {}
                  : {
                      initial: { opacity: 0, y: "0.55em" },
                      animate: { opacity: 1, y: 0 },
                      transition: {
                        type: "spring" as const,
                        stiffness: 60,
                        damping: 18,
                      },
                    })}
              >
                {work.title}
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="mt-5 text-lead text-hoshi italic"
            {...reveal(0.16)}
          >
            {work.subtitle}
          </motion.p>

          <motion.hr
            aria-hidden="true"
            className="my-10 h-px border-0"
            style={{
              background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 60%, transparent), transparent)`,
            }}
            {...reveal(0.22)}
          />

          <dl className="space-y-9">
            {work.review.map((point, i) => (
              <motion.div key={point.label} {...reveal(0.3 + i * 0.09)}>
                <dt
                  className="text-body font-medium"
                  style={{
                    color: `color-mix(in oklab, ${accent} 55%, var(--color-tsuki))`,
                  }}
                >
                  {point.label}
                </dt>
                <dd className="mt-2 text-body text-hoshi">{point.text}</dd>
              </motion.div>
            ))}
          </dl>

          {work.flaws ? (
            <motion.aside
              {...(reduced
                ? {}
                : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: {
                      duration: 0.9,
                      delay: 0.4 + work.review.length * 0.09,
                    },
                  })}
              className="mt-14 border-l border-border pl-6"
            >
              <h2 className="text-body font-medium text-hoshi">
                Flaws, stated plainly
              </h2>
              <dl className="mt-5 space-y-6">
                {work.flaws.map((point) => (
                  <div key={point.label}>
                    <dt className="text-body font-medium text-hoshi">
                      {point.label}
                    </dt>
                    <dd className="mt-1.5 text-body text-hoshi">
                      {point.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.aside>
          ) : null}
        </article>
      </div>
    </main>
  );
}

export { WorkRoom as Component };
