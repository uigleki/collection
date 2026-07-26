// subset-font ships no types. Only the one call subset-cjk.ts makes is
// declared — a wider guess would be fiction.
declare module "subset-font" {
  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: { targetFormat?: "sfnt" | "woff" | "woff2" },
  ): Promise<Buffer>;
}
