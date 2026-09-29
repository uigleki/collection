import why from "virtual:why";

// docs/why.md, read at build time (src/content): every word is the essay's.
export const { meta, data } = why;

/**
 * The essay's first and last sentences, broken where the home page breaks
 * them: the hero asks, the dawn answers, each on two masked display lines.
 *
 * The break is authored rather than found at runtime by searching the
 * sentence for a comma or a question mark. Where a display line turns is
 * typography; punctuation is prose. A sentence the owner is free to repunc-
 * tuate must not be able to silently reshape the largest type on the site.
 * why.test.ts holds each couplet against the sentence it came from, so the
 * copy stays verbatim without the layout depending on its commas.
 */
export const couplets = {
  opening: [
    "If we're here to experience beauty,",
    "what beauty is worth our finite time?",
  ],
  closing: ["The beauty you were born to experience?", "You've found it."],
} as const satisfies Record<string, readonly [string, string]>;
