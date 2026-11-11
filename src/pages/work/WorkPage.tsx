import {
  motion,
  type PanInfo,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from "react-router";
import { workPath } from "@/data/site.ts";
import type { Work } from "@/data/types.ts";
import { neighbors, type WorkEntry, workBySlug } from "@/data/works.ts";
import { MOVE } from "@/lib/motion.ts";
import { useSky } from "@/lib/sky.ts";
import { type Step, stepOf } from "@/lib/step.ts";
import { useKeydown } from "@/lib/useKeydown.ts";
import { usePage } from "@/lib/usePage.ts";
import { Cover } from "@/ui/Cover.tsx";
import { Chevron } from "@/ui/Icon.tsx";
import { EdgeButton, PageNav } from "@/ui/PageNav.tsx";
import { NotFound } from "../NotFound.tsx";

export function WorkPage() {
  const { slug = "" } = useParams();
  const entry = workBySlug.get(slug);

  if (!entry) return <NotFound />;
  return <WorkPageBody key={slug} entry={entry} />;
}

function WorkPageBody({ entry }: { entry: WorkEntry }) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { work, night, category, ordinal } = entry;
  const { title, slug, lang, accent } = work;
  const h1 = usePage(title);
  const { prev, next } = neighbors(slug);

  useSky({ dim: 1, night });

  const entryStep = stepOf(useLocation(), useNavigationType());
  const goToNeighbor = (step: Step) => {
    const to = step === 1 ? next : prev;
    if (to)
      navigate(workPath(to.work.slug), { replace: true, state: { step } });
  };

  useKeydown((e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight") goToNeighbor(1);
    if (e.key === "ArrowLeft") goToNeighbor(-1);
  });

  // A horizontal touch drag also goes to the previous or next work. The page
  // follows the finger 1:1, with strong resistance past the first and last
  // work. Released past the threshold, or flicked, the page keeps its
  // velocity as it leaves; otherwise it springs back, and can be grabbed
  // again mid-spring. Touch only: a mouse drag selects text. Vertical drags
  // stay with the browser (touch-pan-y), so scrolling is never blocked.
  const drag = useDragControls();
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") drag.start(e);
  };
  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    // a mostly vertical drag was a scroll, however far it moved sideways
    if (Math.abs(offset.x) < Math.abs(offset.y)) return;
    const far = Math.min(100, window.innerWidth * 0.25);
    const flick = Math.abs(velocity.x) > 500 && Math.abs(offset.x) > 40;
    if (Math.abs(offset.x) < far && !flick) return;
    if (Math.sign(velocity.x || offset.x) !== Math.sign(offset.x)) return;
    goToNeighbor(offset.x < 0 ? 1 : -1);
  };

  // The article's parts animate in on mount, not on scroll: a work page
  // opens at its top, so its content is in view at once. Each part starts a
  // little later than the one before (index.css: .enter, .rise).
  const at = (ms: number) => ({ "--at": `${ms}ms` });

  return (
    <main
      id="main"
      onPointerDown={onPointerDown}
      className="relative mx-auto max-w-6xl touch-pan-y px-5 md:px-12"
    >
      <PageNav>
        {prev ? (
          <EdgeButton
            step={-1}
            work={prev.work}
            onClick={() => goToNeighbor(-1)}
          />
        ) : null}
        {next ? (
          <EdgeButton
            step={1}
            work={next.work}
            onClick={() => goToNeighbor(1)}
          />
        ) : null}
      </PageNav>

      {/* Going to the previous or next work slides the page sideways: the
          new page enters from the side of the neighbor that was chosen, and
          the old page leaves on the opposite side. */}
      <motion.div
        custom={entryStep}
        variants={SLIDE}
        initial={reduced || entryStep === 0 ? false : "enter"}
        animate="center"
        exit={reduced ? "center" : "exit"}
        transition={MOVE}
        drag="x"
        dragListener={false}
        dragControls={drag}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: next ? 1 : 0.12, right: prev ? 1 : 0.12 }}
        dragTransition={{
          bounceStiffness: MOVE.stiffness,
          bounceDamping: MOVE.damping,
        }}
        onDragEnd={onDragEnd}
        className="grid gap-10 pt-20 pb-24 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-16"
      >
        <div className="md:sticky md:top-20 md:self-start">
          <Cover work={work} priority className="mx-auto max-w-sm md:mx-0" />
        </div>

        <article className="max-w-2xl pb-10">
          <p
            className="enter mb-6 font-mono text-caption text-muted tabular-nums"
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

          <p className="enter mt-5 text-lead text-muted italic" style={at(80)}>
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
                    color: `color-mix(in oklab, ${accent} 55%, var(--color-foreground))`,
                  }}
                >
                  {point.label}
                </dt>
                <dd className="mt-2 text-body text-muted">{point.text}</dd>
              </div>
            ))}
          </dl>

          {work.flaws ? (
            <aside
              className="enter mt-14 border-l border-border pl-6"
              style={at(200 + work.review.length * 50)}
            >
              <h2 className="text-body font-medium text-muted">
                {work.flaws.heading}
              </h2>
              <dl className="mt-5 space-y-6">
                {work.flaws.points.map((point) => (
                  <div key={point.label}>
                    <dt className="text-body font-medium text-muted">
                      {point.label}
                    </dt>
                    <dd className="mt-1.5 text-body text-muted">
                      {point.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}

          <nav
            aria-label="Shelf"
            className="enter mt-16 grid grid-cols-2 gap-x-6 md:hidden"
            style={at(250 + work.review.length * 50)}
          >
            {prev ? <NeighborLink step={-1} work={prev.work} /> : null}
            {next ? <NeighborLink step={1} work={next.work} /> : null}
          </nav>
        </article>
      </motion.div>
    </main>
  );
}

/**
 * A link to the previous or next work, at the end of the article. Shown
 * only on narrow screens, which have no space at the edges for EdgeButton.
 */
function NeighborLink({ step, work }: { step: 1 | -1; work: Work }) {
  const isNext = step === 1;
  return (
    <Link
      to={workPath(work.slug)}
      replace
      state={{ step }}
      className={`flex flex-col gap-1 ${isNext ? "col-start-2 items-end text-right" : "items-start"}`}
    >
      <span
        className={`flex items-center gap-1.5 font-mono text-caption text-muted ${isNext ? "flex-row-reverse" : ""}`}
      >
        <Chevron step={step} />
        {isNext ? "Next" : "Previous"}
      </span>
      <span lang={work.lang} className="text-body text-balance">
        <span className="link-draw">{work.title}</span>
      </span>
    </Link>
  );
}

// Horizontal distance a page slides in from and out to. Far enough that a
// page released from a drag keeps moving in the direction it was dragged.
const slideDistance = () => window.innerWidth * 0.3;
const SLIDE = {
  enter: (step: Step) => ({ x: step * slideDistance() }),
  center: { x: 0 },
  exit: (step: Step) => ({ x: -step * slideDistance() }),
};

export { WorkPage as Component };
