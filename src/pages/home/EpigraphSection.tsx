import { Link } from "react-router";
import { meta } from "@/data/why.ts";
import { FULL_NIGHT } from "@/lib/moon.ts";
import { useNight } from "@/lib/sky.ts";

export function EpigraphSection() {
  const ref = useNight<HTMLElement>(FULL_NIGHT);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[90vh] flex-col items-center justify-center py-24 text-center"
    >
      <p className="reveal-fade max-w-md text-lead leading-relaxed italic">
        {meta.description}
      </p>

      <div className="reveal-fade mt-12">
        <Link
          to="/why"
          className="pill text-body text-foreground hover:text-accent"
        >
          Why these works
        </Link>
      </div>
    </section>
  );
}
