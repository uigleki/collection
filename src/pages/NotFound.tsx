import { useEffect } from "react";
import { Link } from "react-router";
import { usePage } from "@/lib/usePage";
import { sky } from "@/scene/signal";

/** A page that isn't in the collection. */
export function NotFound() {
  const h1 = usePage("Not found — Perfect Collection");

  useEffect(() => {
    sky.targetNight = 1;
    sky.dim = 0.4;
    return () => {
      sky.dim = 0;
    };
  }, []);

  return (
    <main
      id="main"
      className="relative flex min-h-dvh flex-col items-center justify-center px-5 text-center"
    >
      <h1
        ref={h1}
        tabIndex={-1}
        className="text-title font-light tracking-tight outline-none"
      >
        Nothing stands here.
      </h1>
      <p className="mt-4 text-body text-hoshi">
        Whatever stood here has set below the horizon.
      </p>
      <Link
        to="/"
        viewTransition
        className="pill mt-10 text-body hover:text-tsukikage"
      >
        Return to the collection
      </Link>
    </main>
  );
}

export { NotFound as Component };
