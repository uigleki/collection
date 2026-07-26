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
 * BCP-47 language of a title where it isn't Latin. Judged per title and
 * never detected: Han unification means 少女終末旅行 and 世末积雨云 are both
 * kanji-only yet want different regional letterforms and line-breaking
 * (DESIGN.md — languages are data, not heuristics).
 */
export type TitleLang = "ja" | "zh-Hans";

/** Anything the collection names in its own language. */
export interface Titled {
  title: string;
  subtitle: string;
  lang?: TitleLang;
}

export interface Work extends Titled {
  /**
   * The work's stable identity, authored here beside the title. Its room's
   * URL, its cover asset, its accent, and its cover morph's
   * `view-transition-name` are all this one string.
   */
  slug: string;
  readonly review: readonly ReviewPoint[];
  readonly flaws?: readonly ReviewPoint[];
}

export interface WorkCategory {
  name: string;
  readonly works: readonly Work[];
}

export interface Track extends Titled {
  /** the performer, as they write their own name */
  artist: string;
  /**
   * Language of the performer's name, judged independently of the song's:
   * 凛々咲 sings "Letters from Heaven", and 朝香智子 sings "post-script".
   * One `lang` over both would dress a Latin title in Japanese letterforms,
   * or leave a Japanese name in Simplified-Chinese ones.
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
