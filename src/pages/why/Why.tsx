import { motion, useReducedMotion } from "motion/react";
import { siteMeta } from "@/data/site.ts";
import type { ReviewPoint } from "@/data/types.ts";
import { data, meta } from "@/data/why.ts";
import { renderEmphasis } from "@/lib/emphasis.tsx";
import { FULL_NIGHT } from "@/lib/moon.ts";
import { ENTER } from "@/lib/motion.ts";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { Reading } from "@/ui/Reading.tsx";

/**
 * The essay, read under a full moon — the page the koan points to.
 */
export function Why() {
  const reduced = useReducedMotion();
  const h1 = usePage(`${meta.title} — ${siteMeta.title}`);

  useSky({ dim: 0.75, night: FULL_NIGHT });

  return (
    <Reading>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        className="text-center text-lead text-hoshi italic"
      >
        {meta.description}
      </motion.p>

      <h1
        ref={h1}
        tabIndex={-1}
        className="mt-16 text-title font-light tracking-tight"
      >
        {meta.title}
      </h1>

      <motion.div
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
          },
        }}
        className="mt-8 space-y-6"
      >
        {data.opening.map((line) => (
          <motion.p
            key={line}
            variants={paragraph}
            className="text-lead leading-relaxed"
          >
            {renderEmphasis(line)}
          </motion.p>
        ))}
      </motion.div>

      {data.sections.map((section) => (
        <section key={section.title} className="relative mt-24 md:mt-32">
          <h2 className="max-w-xl text-title font-light tracking-tight">
            {section.title}
          </h2>
          <p className="mt-4 text-body text-hoshi">{section.intro}</p>

          <div className="mt-12 space-y-14">
            {section.concepts.map((concept) => (
              <motion.article
                key={concept.title}
                initial={reduced ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={ENTER}
              >
                <h3 className="text-lead font-medium">{concept.title}</h3>
                <div className="mt-4 space-y-4">
                  {concept.explanation.map((item) =>
                    typeof item === "string" ? (
                      <p key={item} className="text-body text-hoshi">
                        {renderEmphasis(item)}
                      </p>
                    ) : (
                      <LabeledPoint key={item.label} point={item} />
                    ),
                  )}
                </div>
              </motion.article>
            ))}
          </div>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1 }}
            className="mt-14 text-center text-lead text-hoshi italic"
          >
            {section.outro}
          </motion.p>
        </section>
      ))}

      <motion.div
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="mt-28 space-y-6 md:mt-36"
      >
        {data.closing.map((line) => (
          <motion.p
            key={line}
            variants={paragraph}
            className="text-lead leading-relaxed"
          >
            {renderEmphasis(line)}
          </motion.p>
        ))}
      </motion.div>

      <p className="mt-24 border-t border-border/60 pt-6 text-center text-caption text-hoshi italic">
        {meta.footer}
      </p>
    </Reading>
  );
}

const paragraph = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: ENTER,
  },
};

function LabeledPoint({ point }: { point: ReviewPoint }) {
  return (
    <p className="text-body text-hoshi">
      <strong className="font-medium text-tsuki">{point.label}: </strong>
      {renderEmphasis(point.text)}
    </p>
  );
}

export { Why as Component };
