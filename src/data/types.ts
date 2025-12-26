export type Line = string | { label: string; text: string };

export interface Item {
  title: string;
  preview: string;
  color: string;
  lines?: Line[];
  flaws?: Line[];
}

export interface Category {
  name: string;
  items: Item[];
}

export interface Section {
  title: string;
  intro: string;
  items: Item[];
  outro: string;
}
