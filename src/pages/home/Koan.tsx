import { Link } from "react-router";
import { meta } from "@/data/why.ts";
import { FULL_NIGHT } from "@/lib/moon.ts";
import { useNight } from "@/lib/sky.ts";

/** Under the full moon the shrine points past itself (docs/why.md). */
export function Koan() {
  const ref = useNight<HTMLElement>(FULL_NIGHT);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[90vh] flex-col items-center justify-center py-24 text-center"
    >
      <p className="arrive-fade max-w-md text-lead leading-relaxed italic">
        {meta.description}
      </p>

      <div className="arrive-fade mt-12">
        <Link
          to="/why"
          className="pill text-body text-tsuki hover:text-tsukikage"
        >
          Why these works
        </Link>
      </div>
    </section>
  );
}
