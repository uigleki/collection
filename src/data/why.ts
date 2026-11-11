import why from "virtual:why";

// Parsed from docs/why.md at build time (src/content); the text is verbatim.
export const { meta, data } = why;

/**
 * The essay's first and last sentences, each split into the two masked
 * display lines the home page shows it on: the first sentence in Hero, the
 * last in DawnClose.
 *
 * The split point is written here, not found at runtime by searching the
 * sentence for a comma or a question mark. The essay's punctuation may be
 * edited freely, and such an edit must not change where the largest text on
 * the site breaks. why.test.ts checks each pair against the sentence it
 * came from, so the text stays verbatim.
 */
export const couplets = {
  opening: [
    "If we're here to experience beauty,",
    "what beauty is worth our finite time?",
  ],
  closing: ["The beauty you were born to experience?", "You've found it."],
} as const satisfies Record<string, readonly [string, string]>;
