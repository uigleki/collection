import type { Catalog } from "./collection.ts";

/**
 * What the Markdown cannot say about each name it lists: the address a work
 * lives at, the language its name is written in, the color it is known by,
 * and where its cover art comes from. Keyed by the name exactly as the
 * README writes it.
 *
 * Accents were researched from the web and calibrated by hand; confidence
 * varies, and git history holds the fuller sourced table. A work without
 * `art` has no licensed image source and gets a typographic panel — a valid
 * state, not an omission.
 */
export const catalog = {
  works: {
    化物語: {
      slug: "bakemonogatari",
      lang: "ja",
      // Senjougahara's anime-purple (bakemonogatari.fandom.com)
      accent: "#9b59d0",
      art: { kind: "anilist", search: "Bakemonogatari" },
    },
    偽物語: {
      slug: "nisemonogatari",
      lang: "ja",
      // the Fire Sisters' 火 — between Karen's bee-yellow and Tsukihi's
      // phoenix-red (dic.pixiv.net)
      accent: "#f4653f",
      art: { kind: "anilist", search: "Nisemonogatari" },
    },
    ハイスコアガール: {
      slug: "hi-score-girl",
      lang: "ja",
      // Street Fighter II arcade red (capcom red)
      accent: "#e4002b",
      art: { kind: "anilist", search: "Hi Score Girl" },
    },
    少女終末旅行: {
      slug: "girls-last-tour",
      lang: "ja",
      // a deliberately desaturated work — a muted overcast slate is the
      // honest choice (ANN, art-of interview)
      accent: "#5b7a8c",
      art: { kind: "anilist", search: "Shoujo Shuumatsu Ryokou" },
    },
    "打ち上げ花火、下から見るか？横から見るか？": {
      slug: "fireworks",
      lang: "ja",
      // the indigo firework night, lifted to read as accent
      accent: "#3f7fd9",
      art: { kind: "anilist", search: "Uchiage Hanabi" },
    },
    "ペンギン・ハイウェイ": {
      slug: "penguin-highway",
      lang: "ja",
      // the Ocean's blue (Studio Colorido)
      accent: "#00a0e9",
      art: { kind: "anilist", search: "Penguin Highway" },
    },
    "Charlie and the Chocolate Factory": {
      slug: "charlie-chocolate-factory",
      // Wonka's aubergine velvet, brightened for the dark ground
      accent: "#7d4bc0",
    },
    "To the Moon": {
      slug: "to-the-moon",
      // the moon's gold over Freebird's night navy
      accent: "#f4d35e",
      art: { kind: "steam", appid: 206440 },
    },
    "What Remains of Edith Finch": {
      slug: "edith-finch",
      // Pacific-Northwest teal
      accent: "#3f8f7d",
      art: { kind: "steam", appid: 501300 },
    },
    "Finding Paradise": {
      slug: "finding-paradise",
      // the warm "paradise" gold of Kan Gao's palette
      accent: "#f5a623",
      art: { kind: "steam", appid: 337340 },
    },
    "Steins;Gate": {
      slug: "steins-gate",
      // Kurisu's auburn red (steins-gate.fandom.com)
      accent: "#b33a3a",
      art: { kind: "steam", appid: 412830 },
    },
    "7年後で待ってる": {
      slug: "7-years-from-now",
      lang: "ja",
      // the rooftop starlight teal
      accent: "#3aa3a3",
      art: { kind: "steam", appid: 1562920 },
    },
    "ASTLIBRA Revision": {
      slug: "astlibra",
      // the golden scales (生きた証)
      accent: "#d4af37",
      art: { kind: "steam", appid: 1718570 },
    },
    カントク: {
      slug: "kantoku",
      lang: "ja",
      // his signature vivid pink (5年目の放課後)
      accent: "#ff6fa5",
    },
  },
  songs: {
    "COP feat. 乐正绫 - 同归世界线": { lang: "zh-Hans", artistLang: "zh-Hans" },
    "COP feat. 洛天依 & 言和 - 灰烬 (重制)": {
      lang: "zh-Hans",
      artistLang: "zh-Hans",
    },
    "COP feat. 洛天依 - 世末积雨云 (重新混缩)": {
      lang: "zh-Hans",
      artistLang: "zh-Hans",
    },
    "COP feat. 洛天依 - 凉雨": { lang: "zh-Hans", artistLang: "zh-Hans" },
    "Capchii feat. 凛々咲 - Letters From Heaven": { artistLang: "ja" },
    "Ceui - 今、歩き出す君へ": { lang: "ja" },
    "ClariS - ヒトリゴト": { lang: "ja" },
    "ClariS - 桜咲く": { lang: "ja" },
    "DECO*27 feat. 初音ミク - 初嵐": { lang: "ja", artistLang: "ja" },
    "JUSF周存 feat. 洛天依 - 心跳同步的时光 (Memory Ver.)": {
      lang: "zh-Hans",
      artistLang: "zh-Hans",
    },
    "MIMI feat. 初音ミク - 水音とカーテン": { lang: "ja", artistLang: "ja" },
    "Soda纯白 feat. 星尘 - 海棠仙 (Album Version)": {
      lang: "zh-Hans",
      artistLang: "zh-Hans",
    },
    "azusa - 真夏のフォトグラフ": { lang: "ja" },
    "daniwell feat. 初音ミク & 鏡音リン & 鏡音レン & 巡音ルカ & IA & 桃音モモ & 重音テト - UZ":
      { artistLang: "ja" },
    "daniwell feat. 初音ミク - てすてすブロードキャスト.proj": {
      lang: "ja",
      artistLang: "ja",
    },
    "daniwell feat. 初音ミク - 夏の終わりの彼女は": {
      lang: "ja",
      artistLang: "ja",
    },
    "doriko feat. 初音ミク - ロミオとシンデレラ": {
      lang: "ja",
      artistLang: "ja",
    },
    "doriko feat. 初音ミク - 歌に形はないけれど (再ミックス)": {
      lang: "ja",
      artistLang: "ja",
    },
    "doriko feat. 初音ミク - 茜コントラスト": { lang: "ja", artistLang: "ja" },
    // 瑶山百霊 writes its name with the Japanese 霊, read Yoosan Hyakurei
    "himmel feat. 瑶山百霊 - 远枫": { lang: "zh-Hans", artistLang: "ja" },
    "niki feat. Lily - ジッタードール": { lang: "ja" },
    "niki feat. Lily - テロリスト": { lang: "ja" },
    "supercell feat. こゑだ - My Dearest": { artistLang: "ja" },
    "あやりす feat. GUMI - 愛を誓いしヒメ飾り": {
      lang: "ja",
      artistLang: "ja",
    },
    "いとうかなこ - アマデウス": { lang: "ja", artistLang: "ja" },
    "やくしまるえつこ - アンノウン・ワールドマップ": {
      lang: "ja",
      artistLang: "ja",
    },
    "上村叶恵 - 雨霧": { lang: "ja", artistLang: "ja" },
    "朝香智子 - post-script": { artistLang: "ja" },
    "清漪 - 但叹清风错": { lang: "zh-Hans", artistLang: "zh-Hans" },
    "湊貴大 feat. 初音ミク - 朧月": { lang: "ja", artistLang: "ja" },
    "甘茶 - 赤い風船とメリーゴーランド": { lang: "ja", artistLang: "ja" },
    "竹達彩奈 & 巽悠衣子 - バランスKISS": { lang: "ja", artistLang: "ja" },
    "茶太 - 夢笑顔": { lang: "ja", artistLang: "ja" },
    "高橋李依 - 気まぐれロマンティック": { lang: "ja", artistLang: "ja" },
  },
} as const satisfies Catalog;
