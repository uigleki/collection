import { useEffect } from "react";
import { covers } from "@/data/generated/covers";
import { usePage } from "@/lib/usePage";
import { sky } from "@/scene/signal";
import { Doorway } from "@/ui/Doorway";

/**
 * The colophon. Where every borrowed thing is named: the cover art's
 * sources, the letterforms, the machinery. A shrine credits its carpenters.
 */
export function Credits() {
  const h1 = usePage("Colophon — Perfect Collection");

  useEffect(() => {
    sky.dim = 0.75;
    return () => {
      sky.dim = 0;
    };
  }, []);

  return (
    <main id="main" className="relative mx-auto max-w-3xl px-5 md:px-0">
      <Doorway />

      <div className="py-14 md:py-20">
        <h1
          ref={h1}
          tabIndex={-1}
          className="text-title font-light tracking-tight outline-none"
        >
          Colophon
        </h1>

        <section className="mt-14">
          <h2 className="text-lead font-medium">Cover art</h2>
          <p className="mt-3 text-body text-hoshi">
            Shown in true color, unfiltered, at reduced size, linking to each
            source — the art belongs to its creators.
          </p>
          <ul className="mt-6 divide-y divide-border/60">
            {covers.map((cover) => (
              <li
                key={cover.slug}
                className="grid gap-1 py-3 md:grid-cols-[1fr_auto] md:gap-6"
              >
                <span
                  lang={/[぀-ヿ㐀-鿿]/.test(cover.title) ? "ja" : undefined}
                  className="text-body"
                >
                  {cover.title}
                </span>
                <a
                  href={cover.sourceUrl}
                  rel="noopener"
                  className="link-draw text-caption text-hoshi hover:text-tsuki"
                >
                  {cover.credit} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-lead font-medium">Letterforms</h2>
          <ul className="mt-4 space-y-2 text-body text-hoshi">
            <li>
              Latin — Ubuntu, by Dalton Maag (Ubuntu Font Licence), self-hosted.
            </li>
            <li>
              CJK — Noto Sans CJK (SIL OFL), subset to this site's glyphs in
              both Simplified-Chinese and Japanese forms, so every title keeps
              its own regional letterforms.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-lead font-medium">Machinery</h2>
          <p className="mt-4 text-body text-hoshi">
            React, Vite, Tailwind CSS, Motion, OGL — one WebGL sky, native
            scroll, no trackers, no analytics, no cookies.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-lead font-medium">License</h2>
          <p className="mt-4 text-body text-hoshi">
            Text and curation{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              rel="license noopener"
              className="link-draw hover:text-tsuki"
            >
              CC BY-SA 4.0
            </a>
            ; code{" "}
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              rel="license noopener"
              className="link-draw hover:text-tsuki"
            >
              AGPL-3.0-only
            </a>
            , with{" "}
            <a
              href="https://github.com/uigleki/collection"
              rel="noopener"
              className="link-draw hover:text-tsuki"
            >
              source on GitHub ↗
            </a>
            . Cover art remains the property of its creators, shown reduced with
            credit — any rights holder&rsquo;s removal request will be honored
            immediately.
          </p>
        </section>
      </div>
    </main>
  );
}

export { Credits as Component };
