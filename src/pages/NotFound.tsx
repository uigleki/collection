import { Link } from "react-router";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { MessagePage } from "@/ui/MessagePage.tsx";

export function NotFound() {
  const h1 = usePage("Not found");

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
