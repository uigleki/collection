import type { PageMeta, WhyData, WhySection } from "./types";

export const meta: PageMeta = {
  title: "Why These Works",
  description: "The finger pointing at the moon is not the moon.",
  footer: "I honor the creators who refuse shortcuts.",
};

const truth: WhySection = {
  title: "The Three Faces of Truth",
  intro: "Every authentic work manifests three inseparable qualities:",
  concepts: [
    {
      title: "Creative Love",
      subtitle: "The creator loved the work itself",
      color: "#e74c3c",
      explanation: [
        "The creator loved the work itself, not the response it would generate. Just as parents who truly love their children want them to be happy rather than bring glory to the family, creators who truly love their work cannot bear to inflict darkness without purpose, cannot tolerate arbitrariness, cannot accept incompleteness.",
      ],
    },
    {
      title: "Internal Coherence",
      subtitle: "Nothing is random, everything connects",
      color: "#3498db",
      explanation: [
        "Nothing is random. Everything connects. A single line advances plot, reveals character, echoes theme, and foreshadows resolution - all precisely, all intentionally. Remove any piece and the entire structure collapses. Each element strengthens all others in ways that reveal themselves through time.",
      ],
    },
    {
      title: "Authentic Beauty",
      subtitle: "The creator chose to create beauty",
      color: "#2ecc71",
      explanation: [
        "The creator chose to create beauty, not exploit emotion. This is not a byproduct of coherence but an intentional gift - the desire to leave audiences with more than they brought, to prove through the work's existence that life affirms itself through creation, not destruction.",
      ],
    },
  ],
  outro:
    "These three are one truth viewed from different angles. Love manifests as coherence. Love chooses beauty. Though we cannot observe love directly, we recognize it through the completeness and luminosity it creates.",
};

const shortcuts: WhySection = {
  title: "The Shortcuts to False Impact",
  intro:
    "Most acclaimed works achieve their effect through psychological exploitation rather than genuine excellence.",
  concepts: [
    {
      title: "Negativity Bias",
      subtitle: "Life affirms itself through creation, not destruction",
      color: "#e74c3c",
      explanation: [
        "Humans evolved to remember threats more vividly than pleasures - in ancient times, forgetting danger meant death.",
        {
          label: "The trick",
          text: "Kill the beloved character. Deploy terminal illness. Torture every childhood. Anyone can make audiences cry through suffering. It requires no skill, no vision, no love - just cruelty. These works leave you diminished. They prove only that humans can be manipulated, not that life has meaning.",
        },
        {
          label: "The truth",
          text: "True works create equally lasting impressions through elevation rather than trauma. **Life affirms itself through creation, not destruction.** **Not what makes you cry, but what makes you believe.**",
        },
      ],
    },
    {
      title: "Mere Exposure Effect",
      subtitle: "Familiarity masquerading as affection",
      color: "#9b59b6",
      explanation: [
        "Repetition breeds familiarity, and familiarity breeds preference - a psychological phenomenon where we favor what we've encountered before.",
        {
          label: "The trick",
          text: "The chorus that loops until embedded. The formula repeated across a catalog. Familiarity masquerading as affection. These works obsess then exhaust, revealing their hollowness once the chemical trick fades.",
        },
        {
          label: "The truth",
          text: "True works reveal new dimensions with each encounter rather than exhausting their one trick. Time strengthens their impact rather than exposing their emptiness.",
        },
      ],
    },
    {
      title: "Peak-End Rule",
      subtitle: "True works respect your time from the first moment",
      color: "#f39c12",
      explanation: [
        "Memory doesn't record experiences faithfully - it disproportionately weights emotional peaks and endings, forgetting the journey between.",
        {
          label: "The trick",
          text: 'Coast on emptiness, deploy one manipulative climax. "It gets good after episode X." Memory rewrites the experience, making you forget how much nothing you endured.',
        },
        {
          label: "The truth",
          text: "**True works respect your time from the first moment.** They captivate immediately while building toward earned crescendos. Every moment justified, not just the ones you'll remember.",
        },
      ],
    },
  ],
  outro:
    "Not what haunts you, but what heals you. Not what takes, but what gives.",
};

export const data: WhyData = {
  opening: [
    "**If we're here to experience beauty, what beauty is worth our finite time?**",
    'Not what critics validate. Not what defines generations. Not what "everyone should know." Only what enriches rather than diminishes. Only what proves life has meaning rather than proves humans can be manipulated.',
    "These works. Only these.",
  ],

  sections: [truth, shortcuts],

  closing: [
    "I created this because I needed to know these works existed. I needed proof that creative love could triumph over calculated exploitation. **I needed to believe that somewhere, creators refused the easy path and chose the true one.**",
    "They did. They're here.",
    "After experiencing these works, you'll know what I know: that humans at their best can create beauty that enriches rather than diminishes, elevates rather than exploits, lasts rather than fades. You'll have touched the genuine pinnacle - not the marketed one, not the academic one, but the real one.",
    "Most importantly, you can rest. You won't lie awake wondering what you've missed. You've experienced what matters. The search can end.",
    "The beauty you were born to experience? You've found it.",
  ],
};
