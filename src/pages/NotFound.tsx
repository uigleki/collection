import { Link } from "react-router";
import { siteMeta } from "@/data/site.ts";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { MessagePage } from "@/ui/MessagePage.tsx";

/** A page that isn't in the collection. */
export function NotFound() {
  const h1 = usePage(`Not found — ${siteMeta.title}`);

  useSky({ dim: 0.4, night: 1 });

  return (
    <MessagePage
      h1={h1}
      title="Nothing stands here."
      message="Whatever stood here has set below the horizon."
    >
      <Link to="/" className="pill mt-10 text-body hover:text-accent">
        Return to the collection
      </Link>
    </MessagePage>
  );
}

export { NotFound as Component };
