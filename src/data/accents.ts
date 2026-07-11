/**
 * Each work's canonical color — the color the work itself is known by
 * (heroine, key visual, studio branding), researched from the web and
 * calibrated by hand to read against the night ground. This is art
 * direction, not extraction: the cover-derived accent remains only as a
 * fallback for anything unlisted.
 *
 * Sources (per research, confidence varies — see git history for the
 * full sourced table):
 * - 化物語: Senjougahara's anime-purple (bakemonogatari.fandom.com)
 * - 偽物語: the Fire Sisters' 火 — between Karen's bee-yellow and
 *   Tsukihi's phoenix-red (dic.pixiv.net)
 * - ハイスコアガール: Street Fighter II arcade red (capcom red)
 * - 少女終末旅行: deliberately desaturated work — a muted overcast slate
 *   is the honest choice (ANN, art-of interview)
 * - 打ち上げ花火: the indigo firework night, lifted to read as accent
 * - ペンギン・ハイウェイ: the Ocean's blue (Studio Colorido)
 * - Charlie…: Wonka's aubergine velvet, brightened for the dark ground
 * - To the Moon: the moon's gold over Freebird's night navy
 * - Edith Finch: Pacific-Northwest teal
 * - Finding Paradise: the warm "paradise" gold of Kan Gao's palette
 * - Steins;Gate: Kurisu's auburn red (steins-gate.fandom.com)
 * - 7年後で待ってる: the rooftop starlight teal
 * - ASTLIBRA: the golden scales (生きた証)
 * - カントク: his signature vivid pink (5年目の放課後)
 */
export const CANON_ACCENT: Record<string, string> = {
  bakemonogatari: "#9b59d0",
  nisemonogatari: "#f4653f",
  "hi-score-girl": "#e4002b",
  "girls-last-tour": "#5b7a8c",
  fireworks: "#3f7fd9",
  "penguin-highway": "#00a0e9",
  "charlie-chocolate-factory": "#7d4bc0",
  "to-the-moon": "#f4d35e",
  "edith-finch": "#3f8f7d",
  "finding-paradise": "#f5a623",
  "steins-gate": "#b33a3a",
  "7-years-from-now": "#3aa3a3",
  astlibra: "#d4af37",
  kantoku: "#ff6fa5",
};
