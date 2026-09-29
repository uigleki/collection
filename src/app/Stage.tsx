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
 * Where pages change. No view transition: those freeze the page into
 * pictures until they finish, so nothing can be scrolled, pressed, or
 * turned back halfway. Here both pages stay live — the departing one
 * fades where it stood, the arriving one is already in the reader's hands,
 * and a cover flies between them (flight.ts). A second change mid-way picks
 * everything up from where it is.
 */
export function Stage() {
  const location = useLocation();
  const type = useNavigationType();
  const outlet = useOutlet();

  return (
    <Handover pathname={location.pathname}>
      <AnimatePresence custom={stepOf(location, type)}>
        <Scene key={location.pathname} location={location} type={type}>
          {outlet}
        </Scene>
      </AnimatePresence>
    </Handover>
  );
}

// The first page is simply there; every later one arrives.
let arrived = false;

/**
 * One page. It keeps the location it was rendered for, so a page on its
 * way out goes on believing it is where it was — its title, its sky, and
 * its reading position stay its own — and it is inert: it can be seen
 * leaving, not used.
 */
function Scene({
  location,
  type,
  children,
}: {
  location: Location;
  type: NavigationType;
  children: ReactNode;
}) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const here = useMemo(
    () => ({ location, navigationType: type }),
    [location, type],
  );
  // decided once, and outside render: React may render a component twice
  // (StrictMode does, in development) and only the page's first render
  // counts
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
        initial={first ? false : { opacity: 0 }}
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
 * The instant of the change, in three moves no frame can fall between:
 * measure the departing page as it is seen (before React touches the DOM),
 * then — with the arriving page in place — pin the departing one where
 * it stood, put the reader back where they were, and launch the covers.
 */
class Handover extends Component<{ pathname: string; children: ReactNode }> {
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
      // Out of the flow, exactly where it was seen — its width held too, so
      // a scrollbar leaving with it cannot reflow it as it fades. The
      // arriving page owns the document's height and scroll from here on.
      else if (scene.style.position !== "fixed")
        Object.assign(scene.style, {
          ...LEAVING,
          top: `${-moment.y}px`,
          left: `${box.left}px`,
          width: `${box.width}px`,
        });
    }
    window.scrollTo({
      top: restingPlace(this.props.pathname),
      behavior: "instant",
    });
    land(
      moment.launches,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }

  override render() {
    return this.props.children;
  }
}

// The arriving page is drawn over the departing one: its cover is the one
// in flight.
const ARRIVING = {
  position: "relative",
  zIndex: "1",
  top: "",
  left: "",
  width: "",
};
const LEAVING = { position: "fixed", zIndex: "0" };
