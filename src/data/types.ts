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

export interface Track {
  title: string;
  subtitle: string;
  color: string;
}

export interface Concept {
  title: string;
  subtitle: string;
  color: string;
  explanation: (string | ReviewPoint)[];
}

export interface WhySection {
  title: string;
  intro: string;
  concepts: Concept[];
  outro: string;
}

export interface WhyData {
  epigraph: string;
  opening: string[];
  sections: WhySection[];
  closing: string[];
  footer: string;
}
