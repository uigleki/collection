import { useIsPresent } from "motion/react";
import { useEffect, useRef } from "react";
import { sky } from "@/scene/signal.ts";

type Cross = (visible: boolean) => void;

// One IntersectionObserver per band (rootMargin), shared by every element
// watching that band. An observer per element would run one callback per
// element on each scroll, each holding its own component scope.
const bands = new Map<
  string,
  { io: IntersectionObserver; watchers: WeakMap<Element, Cross> }
>();

function band(rootMargin: string) {
  let existing = bands.get(rootMargin);
  if (!existing) {
    const watchers = new WeakMap<Element, Cross>();
    const io = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          watchers.get(record.target)?.(record.isIntersecting);
        }
      },
      { rootMargin },
    );
    existing = { io, watchers };
    bands.set(rootMargin, existing);
  }
  return existing;
}

/**
 * Observe an element; `onCross` fires when it enters or leaves the band,
 * but only while its page is the current one. An outgoing page's elements
 * still cross the viewport while it fades out, and they must not change
 * the sky.
 */
function useBand<T extends HTMLElement>(rootMargin: string, onCross: Cross) {
  const ref = useRef<T>(null);
  const present = useIsPresent();
  const latest = useRef(onCross);
  useEffect(() => {
    latest.current = present ? onCross : () => {};
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { io, watchers } = band(rootMargin);
    watchers.set(el, (visible) => latest.current(visible));
    io.observe(el);
    return () => {
      io.unobserve(el);
      watchers.delete(el);
    };
  }, [rootMargin]);
  return ref;
}

/**
 * When the observed element enters the middle band of the viewport, its
 * night becomes the sky's target. This is how scrolling advances the moon's
 * phase: one night per work, matching the work in the middle of the screen.
 */
export function useNight<T extends HTMLElement>(night: number) {
  return useBand<T>("-40% 0px -40% 0px", (visible) => {
    if (visible) sky.targetNight = night;
  });
}

/**
 * Brightens the moon's reflection on the water while the music section is
 * in the middle of the viewport.
 */
export function useGlade<T extends HTMLElement>() {
  return useBand<T>("-30% 0px -30% 0px", (visible) => {
    sky.glade = visible ? 1 : 0;
  });
}

export interface SkyClaim {
  /** how far the sky is dimmed behind the page content, 0..1 */
  dim?: number | undefined;
  /** the night the page sets when it becomes the current page */
  night?: number | undefined;
  /** whether scroll progress can set the full moon (see signal.ts) */
  waxWithProgress?: boolean | undefined;
}

// The claims of every mounted page, oldest first. Pages overlap during a
// page change, and the outgoing page releases its claim after the incoming
// page has made its own. So the newest claim applies, not the most recent
// call.
const claims: SkyClaim[] = [];

function settle() {
  const { dim = 0, night, waxWithProgress = false } = claims.at(-1) ?? {};
  sky.dim = dim;
  sky.waxWithProgress = waxWithProgress;
  if (night !== undefined) sky.targetNight = night;
}

/** Register a claim on the sky; the returned function releases it. */
export function claimSky(claim: SkyClaim): () => void {
  const own = { ...claim };
  claims.push(own);
  settle();
  return () => {
    claims.splice(claims.indexOf(own), 1);
    settle();
  };
}

/** A route's claim on the sky, held while it is the current page. */
export function useSky({ dim, night, waxWithProgress }: SkyClaim) {
  const present = useIsPresent();
  useEffect(
    () => (present ? claimSky({ dim, night, waxWithProgress }) : undefined),
    [present, dim, night, waxWithProgress],
  );
}
