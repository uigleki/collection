// subset-font ships no types. Only the one call subset-cjk.ts makes is
// declared: anything more would be a guess.
declare module "subset-font" {
  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: {
      targetFormat?: "sfnt" | "woff" | "woff2";
      keepFeatures?: string[];
    },
  ): Promise<Buffer>;
}
