import { expect, test } from "@playwright/test";

// A touch screen keeps :hover on whatever it last touched — on iOS a tapped
// button stays lifted until something else is tapped. Emulators do not
// reproduce that, so the rule is checked where it lives: every hover style
// the site ships must stand inside a query for a device that can hover.
test("hover styles apply only where there is a pointer to hover", async ({
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
