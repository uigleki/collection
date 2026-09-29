import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { siteMeta } from "@/data/site.ts";
import { neighbors, type WorkEntry, workBySlug } from "@/data/works.ts";
import { accentFor } from "@/lib/covers.ts";
import { ENTER, RISE } from "@/lib/motion.ts";
import { walkShelf } from "@/lib/scroll.ts";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { Cover } from "@/ui/Cover.tsx";
import { Doorway, EdgeChip } from "@/ui/Doorway.tsx";
import { NotFound } from "../NotFound.tsx";

/** A work's room: the sky eases to its night and dims; the room is lit
 * by the work's canonical color. Flaws are stated plainly. */
export function WorkRoom() {
  const { slug = "" } = useParams();
  const entry = workBySlug.get(slug);

  if (!entry) return <NotFound />;
  return <Room key={slug} entry={entry} />;
}

function Room({ entry }: { entry: WorkEntry }) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { work, night, category, ordinal } = entry;
  const { title, slug, lang } = work;
  const h1 = usePage(`${title} — ${siteMeta.title}`);
  const accent = accentFor(slug);
  const { prev, next } = neighbors(slug);

  useSky({ dim: 1, night });

  const goNeighbor = (dir: "prev" | "next", to: string) => {
    walkShelf(dir);
    navigate(`/works/${to}`, { viewTransition: true, replace: true });
  };

  // Touch walks the shelf too. Pointer Events carry the whole gesture: the
  // start is remembered on down, judged on up. Axis-locked (|dx| must beat
  // |dy|) so vertical reading is never hijacked, and time-bounded so a slow
  // drag across the page is not a swipe.
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    start.current =
      e.pointerType === "touch"
        ? { x: e.clientX, y: e.clientY, t: e.timeStamp }
        : null;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const from = start.current;
    start.current = null;
    if (!from) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (e.timeStamp - from.t > 700) return;
    if (dx < 0 && next) goNeighbor("next", next.work.slug);
    if (dx > 0 && prev) goNeighbor("prev", prev.work.slug);
  };

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
          transition: { ...ENTER, delay },
        } as const);

  return (
    <main
      id="main"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="relative mx-auto max-w-6xl touch-pan-y px-5 md:px-12"
    >
      <Doorway>
        {prev ? (
          <EdgeChip
            side="prev"
            work={prev.work}
            onClick={() => goNeighbor("prev", prev.work.slug)}
          />
        ) : null}
        {next ? (
          <EdgeChip
            side="next"
            work={next.work}
            onClick={() => goNeighbor("next", next.work.slug)}
          />
        ) : null}
      </Doorway>

      <div className="grid gap-10 pt-20 pb-24 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-16">
        <div className="md:sticky md:top-20 md:self-start">
          <Cover
            work={work}
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
            className="text-display font-normal tracking-tight"
          >
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                {...(reduced
                  ? {}
                  : {
                      initial: { opacity: 0, y: "0.55em" },
                      animate: { opacity: 1, y: 0 },
                      transition: RISE,
                    })}
              >
                {title}
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
