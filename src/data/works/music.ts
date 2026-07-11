import type { WorkTrack } from "../types";

// Each title carries its language where it isn't Latin, judged per track —
// script detection cannot do this: 朧月 and 夢笑顔 are kanji-only Japanese,
// while 世末积雨云 and 但叹清风错 are Simplified Chinese. The tag picks the
// regional Han glyph forms (and line-breaking) the title deserves.
export const music: readonly WorkTrack[] = [
  {
    title: "COP - 世末积雨云",
    subtitle: "Even as the world crumbles, I remain standing to witness it all",
    lang: "zh-Hans",
  },
  {
    title: "COP - 凉雨",
    subtitle: "When the rain finally stops, I will find you waiting there",
    lang: "zh-Hans",
  },
  {
    title: "COP - 同归世界线",
    subtitle: "This time when the world ends, I won't let you face it alone",
    lang: "zh-Hans",
  },
  {
    title: "COP - 灰烬",
    subtitle: "I chose to burn with you rather than exist without you",
    lang: "zh-Hans",
  },
  {
    title: "Capchii & 凛々咲 - Letters from Heaven",
    subtitle: "Rain connects us across the distance between earth and sky",
    lang: "ja",
  },
  {
    title: "Ceui - 今、歩き出す君へ。",
    subtitle: "Your existence alone taught me that hope never fades",
    lang: "ja",
  },
  {
    title: "ClariS - With You",
    subtitle: "Under the same sky, you're never truly alone",
  },
  {
    title: "ClariS - ヒトリゴト",
    subtitle: "These words I cannot say, yet I hope you'll notice them",
    lang: "ja",
  },
  {
    title: "ClariS - 桜咲く",
    subtitle: "Open this door and you can go anywhere you dream",
    lang: "ja",
  },
  {
    title: "Cream puff - Mermaid girl (Extended RRver.)",
    subtitle: "I found my heavenly world the moment I reached for you",
  },
  {
    title: "DECO＊27 & 初音ミク - 初嵐",
    subtitle: "Thank you for singing with me, let's move forward together",
    lang: "ja",
  },
  {
    title: "EGOIST - The Everlasting Guilty Crown",
    subtitle: "You exist to understand others, to hold the hands that matter",
  },
  {
    title: "JUSF 周存 - 心跳同步的时光 (Memory Ver.)",
    subtitle: "I'll treasure this moment when our hearts beat as one",
    lang: "zh-Hans",
  },
  {
    title: "Ken Arai - NEXT TO YOU",
    subtitle: "Gentle melodies remain even as the world turns cruel",
  },
  {
    title: "MIMI - 水音とカーテン",
    subtitle: "Rain made this moment ours alone",
    lang: "ja",
  },
  {
    title: "Mili - Nine Point Eight",
    subtitle: "The wind sings for our reunion as I climb to find you",
  },
  {
    title: "MoreanP - Feeling The Rain",
    subtitle: "Some experience the rain, others simply endure it",
  },
  {
    title: "Neuro-sama - LIFE",
    subtitle: "Though uncertain of myself, I reach for you and call this life",
  },
  {
    title: "Poppin'Party - Returns",
    subtitle: "Thank you for being the place I can always return to",
  },
  {
    title: "SOUNDORBIS - LIFE",
    subtitle: "When this melody plays, you understand what living means",
  },
  {
    title: "Schnuffel - Häschenparty",
    subtitle: "Life is a party when you're here with me",
  },
  {
    title: "Schnuffel - Ich hab' dich lieb",
    subtitle: "Simply being with you is all I need",
  },
  {
    title: "Schnuffel - Nur mit Dir",
    subtitle: "Everything shines brighter when you're beside me",
  },
  {
    title: "Shirfine - Illusionary Daytime",
    subtitle: "Dreams don't wait for nightfall",
  },
  {
    title: "Supercell - My Dearest",
    subtitle: "Even when the world abandons you, I will stand beside you",
  },
  {
    title: "Xad - Birds",
    subtitle: "Some souls are meant to soar",
  },
  {
    title: "azusa - 真夏のフォトグラフ",
    subtitle: "This irreplaceable now was worth every yesterday",
    lang: "ja",
  },
  {
    title: "daniwellP - UZ",
    subtitle: "The universe speaks in frequencies",
  },
  {
    title: "daniwellP - てすてすブロードキャスト.proj",
    subtitle: "Even through static, I'll find your frequency",
    lang: "ja",
  },
  {
    title: "daniwellP - 夏の終わりの彼女は",
    subtitle: "The cloudy sky may rain, but I believe it will clear someday",
    lang: "ja",
  },
  {
    title: "doriko - ロミオとシンデレラ",
    subtitle: "Take me far away where only our story matters",
    lang: "ja",
  },
  {
    title: "doriko - 歌に形はないけれど",
    subtitle: "What has no form cannot fade with time",
    lang: "ja",
  },
  {
    title: "doriko - 茜コントラスト",
    subtitle: "Unspoken love stays perfect in memory",
    lang: "ja",
  },
  {
    title: "himmel - 远枫",
    subtitle: "Autumn teaches us to let go so spring can return",
    lang: "zh-Hans",
  },
  {
    title: "iolli - Through Mist and Fog",
    subtitle: "I walk through fog because stopping is not an option",
  },
  {
    title: "minato & 初音ミク - 朧月",
    subtitle: "My light may blur with distance but never disappears",
    lang: "ja",
  },
  {
    title: "niki feat. Lily - ジッタードール",
    subtitle: "Love exists because it defies logic, not despite it",
    lang: "ja",
  },
  {
    title: "niki feat. Lily - テロリスト",
    subtitle: "Choosing to love yourself is the bravest uprising",
    lang: "ja",
  },
  {
    title: "あやりす - 愛を誓いしヒメ飾り",
    subtitle: "If freedom means forgetting you, I choose captivity",
    lang: "ja",
  },
  {
    title: "いとうかなこ - アマデウス",
    subtitle:
      "Even if miracles defy logic, I will rewrite them as your destiny",
    lang: "ja",
  },
  {
    title: "やくしまるえつこ - アンノウン・ワールドマップ",
    subtitle: "My heart races as the unknown world unfolds before me",
    lang: "ja",
  },
  {
    title: "上村叶恵 - 雨霧",
    subtitle: "Raindrops race faster than thoughts can follow",
    lang: "ja",
  },
  {
    title: "朝香智子 - post-script",
    subtitle: "Time moved on, my heart stayed with you",
    lang: "ja",
  },
  {
    title: "清漪 - 但叹清风错",
    subtitle: "Time changes everything beautiful, but not what it meant",
    lang: "zh-Hans",
  },
  {
    title: "甘茶の音楽工房 - 赤い風船とメリーゴーランド",
    subtitle: "Joy preserved in a music box sounds like longing",
    lang: "ja",
  },
  {
    title: "竹達彩奈 & 巽悠衣子 - バランス KISS",
    subtitle: "Happiness needs no explanation to those who feel it",
    lang: "ja",
  },
  {
    title: "纯白 P - 海棠仙 (Album Version)",
    subtitle: "I crossed a thousand years just to understand your wait",
    lang: "zh-Hans",
  },
  {
    title: "茶太 - 夢笑顔",
    subtitle: "I'll keep smiling so you remember warmth, not goodbye",
    lang: "ja",
  },
  {
    title: "高橋李依 - 気まぐれロマンティック",
    subtitle: "My whims hide what my heart can't yet confess",
    lang: "ja",
  },
];
