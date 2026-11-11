import { Link } from "react-router";
import { displayLines, meta } from "@/data/why.ts";

// The essay's last sentence, verbatim (displayLines, data/why.ts). It answers
// the question the hero shows and repeats its wording.
const [question, answer] = displayLines.closing;

/**
 * The home page's last section. It is deliberately calm, not a climax
 * (DESIGN.md); the sky brightens toward dawn here.
 */
export function ClosingSection() {
  return (
    <footer className="relative flex min-h-dvh flex-col justify-center">
      <div className="reveal-fade">
        <p className="max-w-xl text-lead text-muted italic">{question}</p>
        <h2 className="mt-10 text-display-large font-light tracking-tight">
          <span className="mask block overflow-hidden">
            <span className="line block">{answer}</span>
          </span>
        </h2>
      </div>

      <div className="absolute right-0 bottom-0 left-0 flex flex-wrap items-baseline justify-between gap-6 border-t border-border/60 pt-6 pb-10 text-caption text-muted">
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
