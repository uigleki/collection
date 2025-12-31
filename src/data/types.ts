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
  review: ReviewPoint[];
  flaws?: ReviewPoint[];
}

export interface WorkCategory {
  name: string;
  works: Work[];
}

export interface WorkTrack {
  title: string;
  subtitle: string;
  color: string;
}

export interface WhyConcept {
  title: string;
  subtitle: string;
  color: string;
  explanation: (string | ReviewPoint)[];
}

export interface WhySection {
  title: string;
  intro: string;
  concepts: WhyConcept[];
  outro: string;
}

export interface WhyData {
  opening: string[];
  sections: WhySection[];
  closing: string[];
}
