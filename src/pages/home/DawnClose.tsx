import { Link } from "react-router";
import { couplets, meta } from "@/data/why.ts";

// The essay's own final beat, verbatim: the hero's question is answered in
// its own words — beauty for beauty, question for question.
const [question, answer] = couplets.closing;

/** The closing beat: rest, not climax, under a lightening sky. */
export function DawnClose() {
  return (
    <footer className="relative flex min-h-dvh flex-col justify-center">
      <div className="arrive-fade">
        <p className="max-w-xl text-lead text-hoshi italic">{question}</p>
        <h2 className="mt-10 text-colossus font-light tracking-tight">
          <span className="mask block overflow-hidden">
            <span className="line block">{answer}</span>
          </span>
        </h2>
      </div>

      <div className="absolute right-0 bottom-0 left-0 flex flex-wrap items-baseline justify-between gap-6 border-t border-border/60 pt-6 pb-10 text-caption text-hoshi">
        <p>
          <Link to="/credits" className="link-draw">
            Colophon
          </Link>
        </p>
        <p>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            rel="license noopener"
            className="link-draw"
          >
            CC BY-SA 4.0
          </a>
        </p>
        <p className="italic">{meta.footer}</p>
      </div>
    </footer>
  );
}
