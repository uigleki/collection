import {
  motion,
  type PanInfo,
  useDragControls,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { useEffect, useEffectEvent } from "react";
import {
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from "react-router";
import { siteMeta } from "@/data/site.ts";
import { neighbors, type WorkEntry, workBySlug } from "@/data/works.ts";
import { FLIGHT } from "@/lib/motion.ts";
import { type Step, stepOf } from "@/lib/shelf.ts";
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
  const { title, slug, lang, accent } = work;
  const h1 = usePage(`${title} — ${siteMeta.title}`);
  const { prev, next } = neighbors(slug);

  useSky({ dim: 1, night });

  const arrivedBy = stepOf(useLocation(), useNavigationType());
  const walk = (step: Step) => {
    const to = step === 1 ? next : prev;
    if (to)
      navigate(`/works/${to.work.slug}`, { replace: true, state: { step } });
  };

  // The arrow keys walk the shelf — only for the room being read; one on
  // its way out still hears them.
  const present = useIsPresent();
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight") walk(1);
    if (e.key === "ArrowLeft") walk(-1);
  });
  useEffect(() => {
    if (!present) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [present]);

  // A finger walks it by carrying the room: the room follows 1:1 and
  // gives only grudgingly past either end of the shelf. Let go past the
  // threshold — or flick — and the room keeps its speed on the way out;
  // otherwise it springs home, and it can be caught again mid-spring.
  // Touch only: a mouse selects text. Vertical drags stay the browser's
  // (touch-pan-y), so reading is never hijacked.
  const drag = useDragControls();
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") drag.start(e);
  };
  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    // a drag that was mostly vertical was reading, however far it went
    if (Math.abs(offset.x) < Math.abs(offset.y)) return;
    const far = Math.min(100, window.innerWidth * 0.25);
    const flick = Math.abs(velocity.x) > 500 && Math.abs(offset.x) > 40;
    if (Math.abs(offset.x) < far && !flick) return;
    if (Math.sign(velocity.x || offset.x) !== Math.sign(offset.x)) return;
    walk(offset.x < 0 ? 1 : -1);
  };

  // The whole article enters as one quick choreography from mount: a room
  // opens at its top, so everything in it is in view the moment it arrives.
  // Each beat is one step behind the last (index.css: .enter, .rise).
  const at = (ms: number) => ({ "--at": `${ms}ms` }) as React.CSSProperties;

  return (
    <main
      id="main"
      onPointerDown={onPointerDown}
      className="relative mx-auto max-w-6xl touch-pan-y px-5 md:px-12"
    >
      <Doorway>
        {prev ? (
          <EdgeChip side="prev" work={prev.work} onClick={() => walk(-1)} />
        ) : null}
        {next ? (
          <EdgeChip side="next" work={next.work} onClick={() => walk(1)} />
        ) : null}
      </Doorway>

      {/* Walking the shelf slides the room along it: in from the side the
          reader walked toward, out the way they came. */}
      <motion.div
        custom={arrivedBy}
        variants={SHELF}
        initial={reduced || arrivedBy === 0 ? false : "aside"}
        animate="here"
        exit={reduced ? "here" : "gone"}
        transition={FLIGHT}
        drag="x"
        dragListener={false}
        dragControls={drag}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: next ? 1 : 0.12, right: prev ? 1 : 0.12 }}
        dragTransition={{
          bounceStiffness: FLIGHT.stiffness,
          bounceDamping: FLIGHT.damping,
        }}
        onDragEnd={onDragEnd}
        className="grid gap-10 pt-20 pb-24 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-16"
      >
        <div className="md:sticky md:top-20 md:self-start">
          <Cover
            work={work}
            morph
            priority
            className="mx-auto max-w-sm md:mx-0"
          />
        </div>

        <article className="max-w-2xl pb-10">
          <p
            className="enter mb-6 font-mono text-caption text-hoshi tabular-nums"
            style={at(40)}
          >
            {category} {String(ordinal).padStart(2, "0")}
          </p>

          <h1
            ref={h1}
            tabIndex={-1}
            lang={lang}
            className="text-display font-normal tracking-tight"
          >
            <span className="block overflow-hidden">
              <span className="rise block">{title}</span>
            </span>
          </h1>

          <p className="enter mt-5 text-lead text-hoshi italic" style={at(80)}>
            {work.subtitle}
          </p>

          <div
            aria-hidden="true"
            className="enter my-10 h-px"
            style={{
              ...at(120),
              background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 60%, transparent), transparent)`,
            }}
          />

          <dl className="space-y-9">
            {work.review.map((point, i) => (
              <div key={point.label} className="enter" style={at(160 + i * 50)}>
                <dt
                  className="text-body font-medium"
                  style={{
                    color: `color-mix(in oklab, ${accent} 55%, var(--color-tsuki))`,
                  }}
                >
                  {point.label}
                </dt>
                <dd className="mt-2 text-body text-hoshi">{point.text}</dd>
              </div>
            ))}
          </dl>

          {work.flaws ? (
            <aside
              className="enter mt-14 border-l border-border pl-6"
              style={at(200 + work.review.length * 50)}
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
            </aside>
          ) : null}
        </article>
      </motion.div>
    </main>
  );
}

// How far along the shelf the neighbors stand: far enough that a room
// carried off by a finger keeps going the way it was thrown.
const reach = () => window.innerWidth * 0.3;
const SHELF = {
  aside: (step: Step) => ({ x: step * reach() }),
  here: { x: 0 },
  gone: (step: Step) => ({ x: -step * reach() }),
};

export { WorkRoom as Component };
