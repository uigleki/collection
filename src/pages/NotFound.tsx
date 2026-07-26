import { Link } from "react-router";
import { siteMeta } from "@/data/site";
import { useSky } from "@/lib/sky";
import { usePage } from "@/lib/usePage";
import { Standstill } from "@/ui/Standstill";

/** A page that isn't in the collection. */
export function NotFound() {
  const h1 = usePage(`Not found — ${siteMeta.title}`);

  useSky({ dim: 0.4, night: 1 });

  return (
    <Standstill
      h1={h1}
      title="Nothing stands here."
      message="Whatever stood here has set below the horizon."
    >
      <Link
        to="/"
        viewTransition
        className="pill mt-10 text-body hover:text-tsukikage"
      >
        Return to the collection
      </Link>
    </Standstill>
  );
}

export { NotFound as Component };
