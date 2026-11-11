export interface PageMeta {
  title: string;
  description: string;
  footer?: string;
}

export interface ReviewPoint {
  label: string;
  text: string;
}

/**
 * BCP-47 language of a title that is not Latin. Set by hand per title and
 * never detected: Han unification means 少女終末旅行 and 世末积雨云 are both
 * kanji-only yet need different regional letterforms and line-breaking
 * (DESIGN.md — languages are data, not heuristics).
 */
export type TitleLang = "ja" | "zh-Hans";

/** An item whose title is shown in its original language. */
export interface Titled {
  title: string;
  subtitle: string;
  lang?: TitleLang;
}

export interface Work extends Titled {
  /**
   * The work's stable identifier, set in src/content/catalog.ts. The work
   * page's URL, the cover asset's file name and the cover's animated
   * transition between pages (src/lib/coverTransition.ts) are all keyed by it.
   */
  slug: string;
  /**
   * The color the work itself is known by (heroine, key visual, studio
   * branding). Chosen by hand for contrast against the dark background,
   * never sampled from the cover. Used only in this work's row and work
   * page.
   */
  accent: string;
  readonly review: readonly ReviewPoint[];
  readonly flaws?: readonly ReviewPoint[];
}

export interface WorkCategory {
  name: string;
  readonly works: readonly Work[];
}

export interface Track extends Titled {
  /** the performer's name, in its original spelling */
  artist: string;
  /**
   * Language of the performer's name, set separately from the song's:
   * 凛々咲 sings "Letters From Heaven", and 朝香智子 sings "post-script".
   * A single `lang` for both would render a Latin title in Japanese
   * letterforms, or a Japanese name in Simplified-Chinese ones.
   */
  artistLang?: TitleLang;
}

export interface WhyConcept {
  title: string;
  readonly explanation: readonly (string | ReviewPoint)[];
}

export interface WhySection {
  title: string;
  intro: string;
  readonly concepts: readonly WhyConcept[];
  outro: string;
}

export interface WhyData {
  readonly opening: readonly string[];
  readonly sections: readonly WhySection[];
  readonly closing: readonly string[];
}
