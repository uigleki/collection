import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { Component, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  type Location,
  type NavigationType,
  UNSAFE_LocationContext,
  useLocation,
  useNavigationType,
  useOutlet,
} from "react-router";
import { type Launch, land, takeOff } from "@/lib/flight.ts";
import { SCENE } from "@/lib/motion.ts";
import { restingPlace } from "@/lib/scroll.ts";
import { stepOf } from "@/lib/shelf.ts";

/**
 * Renders page changes. The View Transitions API is not used: it replaces
 * the page with snapshots until the transition ends, so the page cannot be
 * scrolled, clicked or navigated back mid-transition. Here both pages stay
 * in the DOM: the old page fades out in place, the new page is interactive
 * at once, and the cover animates between them (flight.ts). A navigation
 * that starts mid-transition continues from the current state.
 */
export function Stage() {
  const location = useLocation();
  const type = useNavigationType();
  const outlet = useOutlet();

  // When the browser has already animated the change, nothing animates here:
  // the new AnimatePresence key unmounts the exiting pages at once, and the
  // new page gets no fade and no cover animation.
  const drawn = drawnByBrowser.has(location.key);
  const [cut, setCut] = useState("");
  if (drawn && cut !== location.key) setCut(location.key);

  return (
    <Handover
      pathname={location.pathname}
      returned={type === "POP"}
      still={drawn}
    >
      <AnimatePresence key={cut} custom={stepOf(location, type)}>
        <Scene
          key={location.pathname}
          location={location}
          type={type}
          still={drawn}
        >
          {outlet}
        </Scene>
      </AnimatePresence>
    </Handover>
  );
}

// A phone's edge swipe back or forward is animated by the browser, which
// sets hasUAVisualTransition on the popstate event. Animating again here
// would show the same change twice. Stored by the history entry's key, which
// is the key of the location the router renders next.
const drawnByBrowser = new Set<string>();

/**
 * Record which history changes the browser animated itself. Must be called
 * before the router is created (main.tsx): window listeners run in the
 * order they were added, and React renders the new page inside the router's
 * listener, so a listener added later would run after that render.
 */
export function noteDrawnChanges(): void {
  window.addEventListener(
    "popstate",
    (e) => {
      // the history entry the visit started on has no key in its state;
      // the router uses "default" for it
      const key = (e.state as { key?: string } | null)?.key ?? "default";
      if (e.hasUAVisualTransition) drawnByBrowser.add(key);
    },
    { capture: true },
  );
}

// False until the first page has mounted: the first page of a visit renders
// without a fade-in, later pages fade in.
let arrived = false;

/**
 * One page. It provides the location it was rendered for to its subtree, so
 * an exiting page keeps using its own location (for its title, sky state
 * and scroll position) instead of the new one. An exiting page is inert:
 * visible while it fades out, but not interactive.
 */
function Scene({
  location,
  type,
  still,
  children,
}: {
  location: Location;
  type: NavigationType;
  /** the browser animated this change: no fade-in */
  still: boolean;
  children: ReactNode;
}) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const here = useMemo(
    () => ({ location, navigationType: type }),
    [location, type],
  );
  // Read once in the state initializer, and `arrived` is set in an effect,
  // not during render: React may render a component twice (StrictMode does,
  // in development), and a flag set during render would already be true on
  // the second render.
  const [first] = useState(() => !arrived);
  useEffect(() => {
    arrived = true;
  }, []);

  return (
    <UNSAFE_LocationContext.Provider value={here}>
      <motion.div
        data-scene=""
        inert={!present}
        aria-hidden={!present || undefined}
        initial={first || still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reduced ? { duration: 0 } : SCENE}
      >
        {children}
      </motion.div>
    </UNSAFE_LocationContext.Provider>
  );
}

interface Moment {
  launches: Map<string, Launch>;
  y: number;
}

/**
 * Runs the page change synchronously, so no frame is painted between its
 * steps: measure the old page as displayed (before React changes the DOM);
 * then, with the new page in the DOM, fix the old page in place, restore
 * the scroll position and start the cover animations.
 */
class Handover extends Component<{
  pathname: string;
  /** reached by a history navigation, not a link: restore its scroll */
  returned: boolean;
  still: boolean;
  children: ReactNode;
}> {
  override getSnapshotBeforeUpdate(prev: { pathname: string }): Moment | null {
    if (prev.pathname === this.props.pathname) return null;
    return { launches: takeOff(), y: window.scrollY };
  }

  override componentDidUpdate(
    _prev: unknown,
    _state: unknown,
    moment: Moment | null,
  ) {
    if (!moment) return;
    const scenes = [
      ...document.querySelectorAll<HTMLElement>("[data-scene]"),
    ].map((scene) => ({ scene, box: scene.getBoundingClientRect() }));
    for (const { scene, box } of scenes) {
      if (!scene.inert) Object.assign(scene.style, ARRIVING);
      // Taken out of the flow at the position it was displayed. Its width is
      // fixed too, so a scrollbar disappearing cannot reflow it while it
      // fades. From here on the new page alone sets the document's height
      // and scroll.
      else if (scene.style.position !== "fixed")
        Object.assign(scene.style, {
          ...LEAVING,
          top: `${-moment.y}px`,
          left: `${box.left}px`,
          width: `${box.width}px`,
        });
    }
    window.scrollTo({
      top: this.props.returned ? restingPlace(this.props.pathname) : 0,
      behavior: "instant",
    });
    land(
      moment.launches,
      this.props.still ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }

  override render() {
    return this.props.children;
  }
}

// The new page is stacked above the old one: the animated cover belongs to
// the new page.
const ARRIVING = {
  position: "relative",
  zIndex: "1",
  top: "",
  left: "",
  width: "",
};
const LEAVING = { position: "fixed", zIndex: "0" };
