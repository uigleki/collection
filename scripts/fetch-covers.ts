/**
 * Fetches true-colour cover art from official, no-key sources and pre-bakes
 * optimised assets so the Vite build stays free of native deps.
 *
 *   AniList (anime + anime films) · Steam CDN (games)
 *
 * For each work it writes:
 *   src/assets/works/<slug>.webp        — optimised cover (≤640w)
 *   src/data/generated/covers.ts        — { thumbhash, accent, w, h, source }
 *
 * Run:  LD_LIBRARY_PATH=<gcc-lib> bun scripts/fetch-covers.ts
 * (libvips/sharp needs libstdc++ on PATH; the nix dev shell provides it.)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";

const ROOT = resolve(import.meta.dir, "..");
const ASSETS = resolve(ROOT, "src/assets/works");
const GEN = resolve(ROOT, "src/data/generated");

interface AnimeRef {
  kind: "anilist";
  title: string;
  slug: string;
  search: string;
}
interface SteamRef {
  kind: "steam";
  title: string;
  slug: string;
  appid: number;
}
type Ref = AnimeRef | SteamRef;

const REFS: Ref[] = [
  // anime
  {
    kind: "anilist",
    title: "化物語",
    slug: "bakemonogatari",
    search: "Bakemonogatari",
  },
  {
    kind: "anilist",
    title: "偽物語",
    slug: "nisemonogatari",
    search: "Nisemonogatari",
  },
  {
    kind: "anilist",
    title: "ハイスコアガール",
    slug: "hi-score-girl",
    search: "Hi Score Girl",
  },
  {
    kind: "anilist",
    title: "少女終末旅行",
    slug: "girls-last-tour",
    search: "Shoujo Shuumatsu Ryokou",
  },
  // anime films
  {
    kind: "anilist",
    title: "打ち上げ花火、下から見るか？横から見るか？",
    slug: "fireworks",
    search: "Uchiage Hanabi",
  },
  {
    kind: "anilist",
    title: "ペンギン・ハイウェイ",
    slug: "penguin-highway",
    search: "Penguin Highway",
  },
  // games (Steam appid)
  { kind: "steam", title: "To the Moon", slug: "to-the-moon", appid: 206440 },
  {
    kind: "steam",
    title: "What Remains of Edith Finch",
    slug: "edith-finch",
    appid: 501300,
  },
  {
    kind: "steam",
    title: "Finding Paradise",
    slug: "finding-paradise",
    appid: 337340,
  },
  { kind: "steam", title: "Steins;Gate", slug: "steins-gate", appid: 412830 },
  {
    kind: "steam",
    title: "7 年後で待ってる",
    slug: "7-years-from-now",
    appid: 1562920,
  },
  {
    kind: "steam",
    title: "ASTLIBRA Revision",
    slug: "astlibra",
    appid: 1718570,
  },
];

interface CoverMeta {
  title: string;
  slug: string;
  width: number;
  height: number;
  thumbhash: string;
  placeholder: string;
  accent: string;
  credit: string;
  sourceUrl: string;
}

const hex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

async function anilist(search: string) {
  const query = `query($s:String){Media(search:$s,type:ANIME){coverImage{extraLarge color} siteUrl}}`;
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: { s: search } }),
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = (await res.json()) as {
    data?: {
      Media?: {
        coverImage?: { extraLarge?: string; color?: string };
        siteUrl?: string;
      };
    };
  };
  const m = json.data?.Media;
  if (!m?.coverImage?.extraLarge) throw new Error("no cover");
  return {
    url: m.coverImage.extraLarge,
    fallbackAccent: m.coverImage.color,
    credit: "AniList",
    sourceUrl: m.siteUrl ?? "https://anilist.co",
  };
}

function steam(appid: number) {
  return {
    url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`,
    fallbackAccent: undefined as string | undefined,
    credit: "Steam",
    sourceUrl: `https://store.steampowered.com/app/${appid}/`,
  };
}

async function download(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "perfect-collection/1.0 (personal, non-commercial)",
    },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function process(
  ref: Ref,
  meta: {
    url: string;
    fallbackAccent?: string;
    credit: string;
    sourceUrl: string;
  },
): Promise<CoverMeta> {
  const raw = await download(meta.url);
  const dest = resolve(ASSETS, `${ref.slug}.webp`);
  const out = sharp(raw).resize({ width: 640, withoutEnlargement: true });
  const { width = 0, height = 0 } = await out
    .clone()
    .webp({ quality: 82 })
    .toFile(dest)
    .then(() => out.metadata());

  // thumbhash from a downscaled RGBA
  const small = await sharp(raw)
    .resize(90, 90, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hashBytes = rgbaToThumbHash(
    small.info.width,
    small.info.height,
    small.data,
  );
  const thumbhash = Buffer.from(hashBytes).toString("base64");
  const placeholder = thumbHashToDataURL(hashBytes);

  // accent: dominant colour (fallback to source-provided accent)
  let accent = meta.fallbackAccent ?? "#6e8ca0";
  try {
    const d = (await sharp(raw).stats()).dominant;
    accent = hex(d.r, d.g, d.b);
  } catch {}

  const m = await sharp(dest).metadata();
  return {
    title: ref.title,
    slug: ref.slug,
    width: m.width ?? width,
    height: m.height ?? height,
    thumbhash,
    placeholder,
    accent,
    credit: meta.credit,
    sourceUrl: meta.sourceUrl,
  };
}

async function main() {
  await mkdir(ASSETS, { recursive: true });
  await mkdir(GEN, { recursive: true });

  const covers: CoverMeta[] = [];
  for (const ref of REFS) {
    try {
      const meta =
        ref.kind === "anilist" ? await anilist(ref.search) : steam(ref.appid);
      const cover = await process(ref, meta);
      covers.push(cover);
      console.log(
        `✓ ${ref.slug}  ${cover.width}x${cover.height}  ${cover.accent}  (${cover.credit})`,
      );
      if (ref.kind === "anilist") await new Promise((r) => setTimeout(r, 800)); // rate-limit
    } catch (e) {
      console.warn(`✗ ${ref.slug}: ${(e as Error).message}`);
    }
  }

  const body = `// GENERATED by scripts/fetch-covers.ts — do not edit by hand.
export interface CoverMeta {
  title: string;
  slug: string;
  width: number;
  height: number;
  thumbhash: string;
  placeholder: string;
  accent: string;
  credit: string;
  sourceUrl: string;
}

export const covers = ${JSON.stringify(covers, null, 2)} as const satisfies readonly CoverMeta[];

export const coverByTitle: Record<string, CoverMeta> = Object.fromEntries(
  covers.map((c) => [c.title, c]),
);
`;
  await writeFile(resolve(GEN, "covers.ts"), body);
  console.log(
    `\nWrote ${covers.length}/${REFS.length} covers → src/data/generated/covers.ts`,
  );
}

await main();
