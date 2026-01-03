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
  color: string;
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
  color: string;
}

export interface WhyConcept {
  title: string;
  color: string;
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
