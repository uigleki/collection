import { describe, expect, it } from "vitest";
import { parseReadme, parseReviews, parseWhy } from "./parse.ts";

const README = `# Perfect Collection

Works that enrich rather than diminish — created from love, not manipulation.

<!-- markdownlint-disable MD013 -->

## 📺 Anime

1. 化物語
2. 偽物語

## 🎮 Games

1. To the Moon

## 🎵 Music

- COP feat. 洛天依 - 世末积雨云 (重新混缩)
- Capchii feat. 凛々咲 - Letters From Heaven

<!-- markdownlint-enable MD013 -->

## Documentation

- [Why These Works](docs/why.md)

## License

- Code: [AGPL-3.0-only](LICENSE-CODE)
`;

describe("parseReadme", () => {
  const readme = parseReadme(README);

  it("takes the tagline from the paragraph under the title", () => {
    expect(readme.tagline).toBe(
      "Works that enrich rather than diminish — created from love, not manipulation.",
    );
  });

  it("reads each medium as a shelf of titles, in order, without its emoji", () => {
    expect(readme.shelves).toEqual([
      { medium: "Anime", titles: ["化物語", "偽物語"] },
      { medium: "Games", titles: ["To the Moon"] },
    ]);
  });

  it("reads the music as songs split at the first spaced hyphen", () => {
    expect(readme.songs).toEqual([
      { artist: "COP feat. 洛天依", title: "世末积雨云 (重新混缩)" },
      { artist: "Capchii feat. 凛々咲", title: "Letters From Heaven" },
    ]);
  });
});

const REVIEWS = `<!-- markdownlint-disable MD026 -->

# Reviews

Brief impressions.

## 🎮 Games

### Steins;Gate

Fate's ultimate decree

- **Rigorous time travel mythology**:
  Complete and internally consistent scientific framework.
  Real-world science woven seamlessly into narrative.
- **"For River" and everything after**: Theme song.

**Shortcomings**:

- **Slow initial pacing**:
  Extended slice-of-life foundation.

## 🎵 Music

### COP feat. 洛天依 - 世末积雨云 (重新混缩)

Even as the world crumbles, I remain standing to witness it all
`;

describe("parseReviews", () => {
  const reviews = parseReviews(REVIEWS);

  it("keys each review by its heading, exactly as written", () => {
    expect([...reviews.keys()]).toEqual([
      "Steins;Gate",
      "COP feat. 洛天依 - 世末积雨云 (重新混缩)",
    ]);
  });

  it("reads a work's subtitle, points and shortcomings", () => {
    expect(reviews.get("Steins;Gate")).toEqual({
      subtitle: "Fate's ultimate decree",
      points: [
        {
          label: "Rigorous time travel mythology",
          text: "Complete and internally consistent scientific framework. Real-world science woven seamlessly into narrative.",
        },
        { label: '"For River" and everything after', text: "Theme song." },
      ],
      flaws: [
        {
          label: "Slow initial pacing",
          text: "Extended slice-of-life foundation.",
        },
      ],
    });
  });

  it("reads a song's one line", () => {
    expect(reviews.get("COP feat. 洛天依 - 世末积雨云 (重新混缩)")).toEqual({
      subtitle:
        "Even as the world crumbles, I remain standing to witness it all",
      points: [],
      flaws: [],
    });
  });
});

const WHY = `# Why These Works

_The finger pointing at the moon is not the moon._

## The Fundamental Question

**If we're here to experience beauty, what beauty is worth our finite time?**

These works.
Only these.

## The Shortcuts to False Impact

Most acclaimed works achieve their effect through psychological exploitation.

### Negativity Bias

Humans evolved to remember threats.

**The trick**: Kill the beloved character.
**Life affirms itself through creation, not destruction.**

Not what haunts you, but what heals you.

## The Final Recognition

They did.
They're here.

---

_I honor the creators who refuse shortcuts._
`;

describe("parseWhy", () => {
  const why = parseWhy(WHY);

  it("takes the title, the epigraph and the sign-off", () => {
    expect(why.meta).toEqual({
      title: "Why These Works",
      description: "The finger pointing at the moon is not the moon.",
      footer: "I honor the creators who refuse shortcuts.",
    });
  });

  it("opens on the first chapter and closes on the last", () => {
    expect(why.data.opening).toEqual([
      "**If we're here to experience beauty, what beauty is worth our finite time?**",
      "These works. Only these.",
    ]);
    expect(why.data.closing).toEqual(["They did. They're here."]);
  });

  it("reads each chapter between as an argument, its last paragraph the outro", () => {
    expect(why.data.sections).toEqual([
      {
        title: "The Shortcuts to False Impact",
        intro:
          "Most acclaimed works achieve their effect through psychological exploitation.",
        concepts: [
          {
            title: "Negativity Bias",
            explanation: [
              "Humans evolved to remember threats.",
              {
                label: "The trick",
                text: "Kill the beloved character. **Life affirms itself through creation, not destruction.**",
              },
            ],
          },
        ],
        outro: "Not what haunts you, but what heals you.",
      },
    ]);
  });

  it("refuses a construct it has no way to typeset", () => {
    expect(() =>
      parseWhy(WHY.replace("They did.", "- a list\n\nThey did.")),
    ).toThrow(/list/);
  });
});
