export interface PageMeta {
  title: string;
  description: string;
  footer?: string;
}

export interface ReviewPoint {
  label: string;
  text: string;
}

export interface Work {
  title: string;
  subtitle: string;
  readonly review: readonly ReviewPoint[];
  readonly flaws?: readonly ReviewPoint[];
}

export interface WorkCategory {
  name: string;
  readonly works: readonly Work[];
}

export interface WorkTrack {
  title: string;
  subtitle: string;
  /** BCP-47 language of the title where it isn't Latin (ja / zh-Hans) */
  lang?: "ja" | "zh-Hans";
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
