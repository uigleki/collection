import type { Track, WorkCategory } from "./types";

export const categories: WorkCategory[] = [
  {
    name: "Anime",
    works: [
      {
        title: "化物語",
        subtitle: "Supernatural tales of adolescent awakening",
        color: "#9b59b6",
        review: [
          {
            label: "Dialogue as art",
            text: "Rapid-fire wordplay and philosophy layered through every exchange. Humor through tragedy, meaning created in the interplay itself.",
          },
          {
            label: "Visual storytelling reimagined",
            text: "Shinbo and Shaft transcending animation. Text flashing, impossible angles, empty cities. Color expressing psychology, art styles transforming mid-scene.",
          },
          {
            label: "Aberrations as self-confrontation",
            text: "Supernatural curses externalizing inner wounds. Each girl must confront her own burden. Only you can save yourself, though others can walk beside you.",
          },
        ],
      },
      {
        title: "偽物語",
        subtitle: "When fake becomes more genuine than real",
        color: "#8e44ad",
        review: [
          {
            label: "Continued Shinbo/Shaft mastery",
            text: "Same visual transcendence, dialogue artistry, aberrations as self-confrontation.",
          },
        ],
      },
      {
        title: "ハイスコアガール",
        subtitle: "When words fail, fighting games speak",
        color: "#e74c3c",
        review: [
          {
            label: "She never speaks, yet says everything",
            text: "Akira conveys more through her hands on the arcade stick and flickers in her eyes than dialogue ever could.",
          },
          {
            label: "He alone understands her",
            text: "Everyone sees the perfect rich girl. Only Haruo reads what her silence truly means.",
          },
          {
            label: "Fiercest rivals, unbreakable bond",
            text: "She destroys him at Street Fighter, yet competition births understanding rather than resentment.",
          },
          {
            label: "OP and ED that demand presence",
            text: "So integral to the story's soul that skipping them feels like tearing pages from a book.",
          },
        ],
      },
      {
        title: "少女終末旅行",
        subtitle: "Finding beauty in a world that has ended",
        color: "#7f8c8d",
        review: [
          {
            label: "Wondering about everything",
            text: "Chito and Yuuri ask questions about the world with pure curiosity, turning simple discoveries into gentle reflections on life.",
          },
          {
            label: "Two souls as one humanity",
            text: "Contemplative Chito and spirited Yuuri complete each other. Their bond proves connection matters more than purpose.",
          },
          {
            label: "Beauty in the mundane",
            text: "Laundry days, impromptu baths, small joys discovered. Simplicity reveals what truly matters.",
          },
        ],
      },
    ],
  },
  {
    name: "Movies",
    works: [
      {
        title: "打ち上げ花火、下から見るか？横から見るか？",
        subtitle: "The summer that refuses to end",
        color: "#3498db",
        review: [
          {
            label: "Shinbo's stream-of-consciousness mastery",
            text: "Reality and emotion interwoven beyond narrative logic. Visual language capturing how summer exists in memory rather than fact.",
          },
          {
            label: "Ultimate youth fantasy realized",
            text: "The dream every teenager carries. One perfect day that never ends, escaping with the person who matters before they vanish forever.",
          },
          {
            label: "Relentless pursuit of beautiful possibility",
            text: "Each loop reaching for what could be rather than accepting what is. Refusing to surrender perfect moments to inevitability.",
          },
          {
            label: "Poetry made tangible",
            text: "Seaside, fireworks, fantasy fused beyond description. Beauty intensified by impermanence.",
          },
        ],
      },
      {
        title: "ペンギン・ハイウェイ",
        subtitle: "Scientific wonder meets mysterious beauty",
        color: "#1abc9c",
        review: [
          {
            label: "A child's earnest investigation",
            text: "Aoyama documents every penguin, tests hypotheses, approaches the impossible with genuine scientific devotion.",
          },
          {
            label: "The Lady as pure mystery",
            text: "Beautiful, inexplicable, beyond understanding. Her presence needs no explanation.",
          },
          {
            label: "Time spent together",
            text: "Summer days investigating, discovering the world side by side. The moments matter more than answers.",
          },
        ],
      },
      {
        title: "Charlie and the Chocolate Factory",
        subtitle: "Where wonder meets weirdness",
        color: "#9b59b6",
        review: [
          {
            label: "Visual wonderland realized",
            text: "Chocolate factory as dreamscape. Kaleidoscopic colors, rivers and landscapes that feel tangibly real.",
          },
          {
            label: "Wonka's captivating strangeness",
            text: "Bizarre, unpredictable, constantly surprising. Child-like yet unsettling. Weirdness that somehow works.",
          },
          {
            label: "Innocence rewarded",
            text: "Charlie stays pure while spoiled children meet delicious consequences. Goodness prevails through dark humor.",
          },
          {
            label: "Love over indulgence",
            text: "Charlie's devotion to family versus others' selfishness. Difficult times pass when you have those who matter.",
          },
        ],
      },
    ],
  },
  {
    name: "Games",
    works: [
      {
        title: "To the Moon",
        subtitle: "A memory journey embracing final moonlight vows",
        color: "#2980b9",
        review: [
          {
            label: "Reverse chronology reveals",
            text: "Deeply moving romance unveiled through fragmentary recollections. Effect shown before cause, making each revelation increasingly heartbreaking.",
          },
          {
            label: '"For River" and everything after',
            text: "Theme song perfectly elevating emotional impact. Hauntingly melodic piano themes subtly remixed throughout, layering emotion upon emotion.",
          },
          {
            label: "Symbolic imagery threading through",
            text: "Rabbits, moonlight, lighthouses. Simple mysteries concealing surprising, devastating revelations.",
          },
        ],
      },
      {
        title: "What Remains of Edith Finch",
        subtitle: "Every room a theater of memory",
        color: "#16a085",
        review: [
          {
            label: "Each tale through unique devices",
            text: "Every story presented through distinct narrative forms. Kaleidoscope of innovative approaches.",
          },
          {
            label: "First-person fantastical journeys",
            text: "Experiencing impossible lives through your own eyes. Walking through others' moments as if your own.",
          },
          {
            label: "Fantasy and reality fused",
            text: "No boundary between imagination and truth. Memory transformed into lived experience.",
          },
        ],
      },
      {
        title: "Finding Paradise",
        subtitle: "A soul's journey toward perfect existence",
        color: "#2c3e50",
        review: [
          {
            label: "Warm life contemplation",
            text: "Thoughtful examination of ideals, reality, and regret. What it means to pursue happiness and reconcile reality with fantasy.",
          },
          {
            label: "The smallest moments matter most",
            text: "Story revealing mundane details as ultimately most significant. Characters flawed yet real, imagination woven with truth.",
          },
          {
            label: "Mementos as prisms",
            text: "Each object imbued with myriad meanings. Viewing multi-faceted lifetimes through simple things, certain items creating profoundly moving moments.",
          },
        ],
      },
      {
        title: "Steins;Gate",
        subtitle: "Fate's ultimate decree",
        color: "#e67e22",
        review: [
          {
            label: "Rigorous time travel mythology",
            text: "Complete and internally consistent scientific framework. Real-world science woven seamlessly into narrative.",
          },
          {
            label: "Everything placed with purpose",
            text: "Masterful foreshadowing from opening to conclusion. Every detail meticulously positioned, all elements converging.",
          },
          {
            label: "Salvation versus sacrifice",
            text: "Harrowing choices between saving one or another. The weight of altering fate bearing down on every decision.",
          },
          {
            label: "Bonds across world lines",
            text: "Sincere connections deepening across timelines. Understanding forged through shared impossible experiences.",
          },
        ],
        flaws: [
          {
            label: "Slow initial pacing",
            text: "Extended slice-of-life foundation requiring patience through narrative setup.",
          },
          {
            label: "Cryptic true ending requirements",
            text: "Key decision points designed with excessive subtlety, nearly demanding outside guidance.",
          },
        ],
      },
      {
        title: "7 年後で待ってる",
        subtitle: '"I\'ll be waiting for you, 7 years from now"',
        color: "#e91e63",
        review: [
          {
            label: "Cross-temporal commitment",
            text: "A promise made seven years ago, crystallizing the most sincere feelings.",
          },
          {
            label: "Story through recovered fragments",
            text: "Memory exploration gradually unveiling truth. Each chapter drawing you forward through carefully crafted revelations.",
          },
          {
            label: '"LIFE" strikes profound resonance',
            text: "The resolution theme at the climax. When emotions truly hit.",
          },
        ],
        flaws: [
          {
            label: "Some forced narrative turns",
            text: "Excessive pursuit of suspense occasionally resulting in less organic plot developments.",
          },
        ],
      },
      {
        title: "ASTLIBRA Revision",
        subtitle: "15 years to resurrect the golden age",
        color: "#f39c12",
        review: [
          {
            label: "Unpredictable narrative progression",
            text: "Altering the past through mystical scales produces dramatic, unexpected developments.",
          },
          {
            label: "Outstanding musical experience",
            text: "Soundtrack perfectly complementing scenes, creating full immersion from combat to story.",
          },
          {
            label: "Impactful climactic moments",
            text: "Key story beats filled with gravitas and emotional weight. Exploring fate, sacrifice, love, and the meaning of choices and regret.",
          },
          {
            label: "Golden age RPG reborn",
            text: "Capturing pure joy of side-scrolling action JRPGs. Rekindling childhood wonder.",
          },
        ],
        flaws: [
          {
            label: "Grind-heavy with punishing difficulty",
            text: "Late-game requires substantial grinding and features punishing difficulty spikes.",
          },
        ],
      },
    ],
  },
  {
    name: "Artists",
    works: [
      {
        title: "カントク",
        subtitle: "Master of moe aesthetics and light",
        color: "#ff6b9d",
        review: [
          {
            label: "Masterful light and shadow",
            text: "Strong compositional ability with exquisite lighting effects. Technical precision in every piece.",
          },
          {
            label: "Moe perfected",
            text: "Vibrant colors, lively expressions, meticulous detail. Characters leap from the page through carefully drawn faces and emotions.",
          },
          {
            label: "Unwavering consistency",
            text: "Every illustration maintains exceptional quality. Colors balanced, lines stable, anatomy precise. Professional reliability across all works.",
          },
        ],
      },
    ],
  },
];

export const music: Track[] = [
  {
    title: "COP - 世末积雨云",
    subtitle: "Even as the world crumbles, I remain standing to witness it all",
    color: "#5d6d7e",
  },
  {
    title: "COP - 凉雨",
    subtitle: "When the rain finally stops, I will find you waiting there",
    color: "#85929e",
  },
  {
    title: "COP - 同归世界线",
    subtitle: "This time when the world ends, I won't let you face it alone",
    color: "#6c7a89",
  },
  {
    title: "COP - 灰烬",
    subtitle: "I chose to burn with you rather than exist without you",
    color: "#e74c3c",
  },
  {
    title: "Capchii & 凛々咲 - Letters from Heaven",
    subtitle: "Rain connects us across the distance between earth and sky",
    color: "#5dade2",
  },
  {
    title: "Ceui - 今、歩き出す君へ。",
    subtitle: "Your existence alone taught me that hope never fades",
    color: "#aed6f1",
  },
  {
    title: "ClariS - With You",
    subtitle: "Under the same sky, you're never truly alone",
    color: "#f9e79f",
  },
  {
    title: "ClariS - ヒトリゴト",
    subtitle: "These words I cannot say, yet I hope you'll notice them",
    color: "#fadbd8",
  },
  {
    title: "ClariS - 桜咲く",
    subtitle: "Open this door and you can go anywhere you dream",
    color: "#f5b7b1",
  },
  {
    title: "Cream puff - Mermaid girl (Extended RRver.)",
    subtitle: "I found my heavenly world the moment I reached for you",
    color: "#abebc6",
  },
  {
    title: "DECO＊27 & 初音ミク - 初嵐",
    subtitle: "Thank you for singing with me, let's move forward together",
    color: "#85c1e9",
  },
  {
    title: "EGOIST - The Everlasting Guilty Crown",
    subtitle: "You exist to understand others, to hold the hands that matter",
    color: "#c39bd3",
  },
  {
    title: "JUSF 周存 - 心跳同步的时光 (Memory Ver.)",
    subtitle: "I'll treasure this moment when our hearts beat as one",
    color: "#f1948a",
  },
  {
    title: "Ken Arai - NEXT TO YOU",
    subtitle: "Gentle melodies remain even as the world turns cruel",
    color: "#d7bde2",
  },
  {
    title: "MIMI - 水音とカーテン",
    subtitle: "Rain made this moment ours alone",
    color: "#a9cce3",
  },
  {
    title: "Mili - Nine Point Eight",
    subtitle: "The wind sings for our reunion as I climb to find you",
    color: "#a3e4d7",
  },
  {
    title: "MoreanP - Feeling The Rain",
    subtitle: "Some experience the rain, others simply endure it",
    color: "#7fb3d5",
  },
  {
    title: "Neuro-sama - LIFE",
    subtitle: "Though uncertain of myself, I reach for you and call this life",
    color: "#bb8fce",
  },
  {
    title: "Poppin'Party - Returns",
    subtitle: "Thank you for being the place I can always return to",
    color: "#f7dc6f",
  },
  {
    title: "SOUNDORBIS - LIFE",
    subtitle: "When this melody plays, you understand what living means",
    color: "#82e0aa",
  },
  {
    title: "Schnuffel - Häschenparty",
    subtitle: "Life is a party when you're here with me",
    color: "#f8b500",
  },
  {
    title: "Schnuffel - Ich hab' dich lieb",
    subtitle: "Simply being with you is all I need",
    color: "#ffb6c1",
  },
  {
    title: "Schnuffel - Nur mit Dir",
    subtitle: "Everything shines brighter when you're beside me",
    color: "#ffd700",
  },
  {
    title: "Shirfine - Illusionary Daytime",
    subtitle: "Dreams don't wait for nightfall",
    color: "#d4ac0d",
  },
  {
    title: "Supercell - My Dearest",
    subtitle: "Even when the world abandons you, I will stand beside you",
    color: "#a569bd",
  },
  {
    title: "Xad - Birds",
    subtitle: "Some souls are meant to soar",
    color: "#76d7c4",
  },
  {
    title: "azusa - 真夏のフォトグラフ",
    subtitle: "This irreplaceable now was worth every yesterday",
    color: "#f5b041",
  },
  {
    title: "daniwellP - UZ",
    subtitle: "The universe speaks in frequencies",
    color: "#5499c7",
  },
  {
    title: "daniwellP - てすてすブロードキャスト.proj",
    subtitle: "Even through static, I'll find your frequency",
    color: "#48c9b0",
  },
  {
    title: "daniwellP - 夏の終わりの彼女は",
    subtitle: "The cloudy sky may rain, but I believe it will clear someday",
    color: "#f0b27a",
  },
  {
    title: "doriko - ロミオとシンデレラ",
    subtitle: "Take me far away where only our story matters",
    color: "#ec7063",
  },
  {
    title: "doriko - 歌に形はないけれど",
    subtitle: "What has no form cannot fade with time",
    color: "#af7ac5",
  },
  {
    title: "doriko - 茜コントラスト",
    subtitle: "Unspoken love stays perfect in memory",
    color: "#e59866",
  },
  {
    title: "himmel - 远枫",
    subtitle: "Autumn teaches us to let go so spring can return",
    color: "#dc7633",
  },
  {
    title: "iolli - Through Mist and Fog",
    subtitle: "I walk through fog because stopping is not an option",
    color: "#99a3a4",
  },
  {
    title: "minato & 初音ミク - 朧月",
    subtitle: "My light may blur with distance but never disappears",
    color: "#d5d8dc",
  },
  {
    title: "niki feat. Lily - ジッタードール",
    subtitle: "Love exists because it defies logic, not despite it",
    color: "#f1c40f",
  },
  {
    title: "niki feat. Lily - テロリスト",
    subtitle: "Choosing to love yourself is the bravest uprising",
    color: "#e74c3c",
  },
  {
    title: "あやりす - 愛を誓いしヒメ飾り",
    subtitle: "If freedom means forgetting you, I choose captivity",
    color: "#d98880",
  },
  {
    title: "いとうかなこ - アマデウス",
    subtitle:
      "Even if miracles defy logic, I will rewrite them as your destiny",
    color: "#7d3c98",
  },
  {
    title: "やくしまるえつこ - アンノウン・ワールドマップ",
    subtitle: "My heart races as the unknown world unfolds before me",
    color: "#45b39d",
  },
  {
    title: "上村叶恵 - 雨霧",
    subtitle: "Raindrops race faster than thoughts can follow",
    color: "#5d6d7e",
  },
  {
    title: "朝香智子 - post-script",
    subtitle: "Time moved on, my heart stayed with you",
    color: "#aab7b8",
  },
  {
    title: "清漪 - 但叹清风错",
    subtitle: "Time changes everything beautiful, but not what it meant",
    color: "#7dcea0",
  },
  {
    title: "甘茶の音楽工房 - 赤い風船とメリーゴーランド",
    subtitle: "Joy preserved in a music box sounds like longing",
    color: "#c0392b",
  },
  {
    title: "竹達彩奈 & 巽悠衣子 - バランス KISS",
    subtitle: "Happiness needs no explanation to those who feel it",
    color: "#ff69b4",
  },
  {
    title: "纯白 P - 海棠仙 (Album Version)",
    subtitle: "I crossed a thousand years just to understand your wait",
    color: "#f1948a",
  },
  {
    title: "茶太 - 夢笑顔",
    subtitle: "I'll keep smiling so you remember warmth, not goodbye",
    color: "#fad7a0",
  },
  {
    title: "高橋李依 - 気まぐれロマンティック",
    subtitle: "My whims hide what my heart can't yet confess",
    color: "#f5b7b1",
  },
];
