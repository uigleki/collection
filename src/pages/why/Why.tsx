import { siteMeta } from "@/data/site.ts";
import type { ReviewPoint } from "@/data/types.ts";
import { data, meta } from "@/data/why.ts";
import { renderEmphasis } from "@/lib/emphasis.tsx";
import { FULL_NIGHT } from "@/lib/moon.ts";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { TextPage } from "@/ui/TextPage.tsx";

export function Why() {
  const h1 = usePage(`${meta.title} — ${siteMeta.title}`);

  useSky({ dim: 0.75, night: FULL_NIGHT });

  return (
    <TextPage>
      <p className="enter text-center text-lead text-muted italic">
        {meta.description}
      </p>

      <h1
        ref={h1}
        tabIndex={-1}
        className="mt-16 text-title font-light tracking-tight"
      >
        {meta.title}
      </h1>

      <div className="mt-8 space-y-6">
        {data.opening.map((line, i) => (
          <p
            key={line}
            className="enter text-lead leading-relaxed"
            style={{ "--at": `${200 + i * 100}ms` } as React.CSSProperties}
          >
            {renderEmphasis(line)}
          </p>
        ))}
      </div>

      {data.sections.map((section) => (
        <section key={section.title} className="relative mt-24 md:mt-32">
          <h2 className="max-w-xl text-title font-light tracking-tight">
            {section.title}
          </h2>
          <p className="mt-4 text-body text-muted">{section.intro}</p>

          <div className="mt-12 space-y-14">
            {section.concepts.map((concept) => (
              <article key={concept.title} className="reveal">
                <h3 className="text-lead font-medium">{concept.title}</h3>
                <div className="mt-4 space-y-4">
                  {concept.explanation.map((item) =>
                    typeof item === "string" ? (
                      <p key={item} className="text-body text-muted">
                        {renderEmphasis(item)}
                      </p>
                    ) : (
                      <LabeledPoint key={item.label} point={item} />
                    ),
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="reveal-fade mt-14 text-center text-lead text-muted italic">
            {section.outro}
          </p>
        </section>
      ))}

      <div className="mt-28 space-y-6 md:mt-36">
        {data.closing.map((line) => (
          <p key={line} className="reveal text-lead leading-relaxed">
            {renderEmphasis(line)}
          </p>
        ))}
      </div>

      <p className="mt-24 border-t border-border/60 pt-6 text-center text-caption text-muted italic">
        {meta.footer}
      </p>
    </TextPage>
  );
}

function LabeledPoint({ point }: { point: ReviewPoint }) {
  return (
    <p className="text-body text-muted">
      <strong className="font-medium text-foreground">{point.label}: </strong>
      {renderEmphasis(point.text)}
    </p>
  );
}

export { Why as Component };
