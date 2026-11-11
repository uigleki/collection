import { expect, test } from "./helpers.ts";

// A touch screen keeps :hover on the last element touched: on iOS a tapped
// button keeps its hover style until something else is tapped. Emulators do
// not reproduce that, so the stylesheets are checked instead: every :hover
// rule must be inside a `(hover: hover)` media query.
test("every :hover rule is inside a (hover: hover) media query", async ({
  page,
}) => {
  await page.goto("/");
  const unguarded = await page.evaluate(() => {
    const found: string[] = [];
    const walk = (rules: CSSRuleList, guarded: boolean) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          if (!guarded && rule.selectorText.includes(":hover"))
            found.push(rule.selectorText);
          if (rule.cssRules.length > 0) walk(rule.cssRules, guarded);
        } else if (rule instanceof CSSMediaRule) {
          walk(
            rule.cssRules,
            guarded || /\(hover:\s*hover\)/.test(rule.conditionText),
          );
        } else if ("cssRules" in rule) {
          walk((rule as CSSGroupingRule).cssRules, guarded);
        }
      }
    };
    for (const sheet of document.styleSheets) walk(sheet.cssRules, false);
    return found;
  });
  expect(unguarded).toEqual([]);
});
