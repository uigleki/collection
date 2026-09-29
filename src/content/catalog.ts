import type { Catalog } from "./collection.ts";

/**
 * What the Markdown cannot say about each name it lists: the address a work
 * lives at and the language its name is written in. Keyed by the name
 * exactly as the README writes it.
 */
export const catalog = {
  works: {
    化物語: { slug: "bakemonogatari", lang: "ja" },
    偽物語: { slug: "nisemonogatari", lang: "ja" },
    ハイスコアガール: { slug: "hi-score-girl", lang: "ja" },
    少女終末旅行: { slug: "girls-last-tour", lang: "ja" },
    "打ち上げ花火、下から見るか？横から見るか？": {
      slug: "fireworks",
      lang: "ja",
    },
    "ペンギン・ハイウェイ": {
      slug: "penguin-highway",
      lang: "ja",
    },
    "Charlie and the Chocolate Factory": {
      slug: "charlie-chocolate-factory",
    },
    "To the Moon": { slug: "to-the-moon" },
    "What Remains of Edith Finch": { slug: "edith-finch" },
    "Finding Paradise": { slug: "finding-paradise" },
    "Steins;Gate": { slug: "steins-gate" },
    "7年後で待ってる": {
      slug: "7-years-from-now",
      lang: "ja",
    },
    "ASTLIBRA Revision": { slug: "astlibra" },
    カントク: { slug: "kantoku", lang: "ja" },
  },
  songs: {
    "COP - 世末积雨云": { lang: "zh-Hans" },
    "COP - 凉雨": { lang: "zh-Hans" },
    "COP - 同归世界线": { lang: "zh-Hans" },
    "COP - 灰烬": { lang: "zh-Hans" },
    "Capchii & 凛々咲 - Letters from Heaven": { artistLang: "ja" },
    "Ceui - 今、歩き出す君へ。": { lang: "ja" },
    "ClariS - ヒトリゴト": { lang: "ja" },
    "ClariS - 桜咲く": { lang: "ja" },
    "DECO＊27 & 初音ミク - 初嵐": { lang: "ja", artistLang: "ja" },
    "JUSF周存 - 心跳同步的时光 (Memory Ver.)": {
      lang: "zh-Hans",
      artistLang: "zh-Hans",
    },
    "MIMI - 水音とカーテン": { lang: "ja" },
    "azusa - 真夏のフォトグラフ": { lang: "ja" },
    "daniwellP - てすてすブロードキャスト.proj": { lang: "ja" },
    "daniwellP - 夏の終わりの彼女は": { lang: "ja" },
    "doriko - ロミオとシンデレラ": { lang: "ja" },
    "doriko - 歌に形はないけれど": { lang: "ja" },
    "doriko - 茜コントラスト": { lang: "ja" },
    "himmel - 远枫": { lang: "zh-Hans" },
    "minato & 初音ミク - 朧月": { lang: "ja", artistLang: "ja" },
    "niki feat. Lily - ジッタードール": { lang: "ja" },
    "niki feat. Lily - テロリスト": { lang: "ja" },
    "あやりす - 愛を誓いしヒメ飾り": { lang: "ja", artistLang: "ja" },
    "いとうかなこ - アマデウス": { lang: "ja", artistLang: "ja" },
    "やくしまるえつこ - アンノウン・ワールドマップ": {
      lang: "ja",
      artistLang: "ja",
    },
    "上村叶恵 - 雨霧": { lang: "ja", artistLang: "ja" },
    "朝香智子 - post-script": { artistLang: "ja" },
    "清漪 - 但叹清风错": { lang: "zh-Hans", artistLang: "zh-Hans" },
    "甘茶の音楽工房 - 赤い風船とメリーゴーランド": {
      lang: "ja",
      artistLang: "ja",
    },
    "竹達彩奈 & 巽悠衣子 - バランスKISS": { lang: "ja", artistLang: "ja" },
    "纯白P - 海棠仙 (Album Version)": {
      lang: "zh-Hans",
      artistLang: "zh-Hans",
    },
    "茶太 - 夢笑顔": { lang: "ja", artistLang: "ja" },
    "高橋李依 - 気まぐれロマンティック": { lang: "ja", artistLang: "ja" },
  },
} as const satisfies Catalog;
