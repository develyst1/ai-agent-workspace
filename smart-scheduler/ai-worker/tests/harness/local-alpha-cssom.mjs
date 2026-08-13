/**
 * QA probe — read the GENERATED CSS for the alpha-modifier classes actually used in the source.
 * This is the authoritative evidence: what rule did Tailwind emit for `.bg-muted-50/40` etc.?
 * (My earlier synthetic probe included `bg-paper/50`, which is not used anywhere in src — Tailwind
 * never generates unused classes, so that one datum proved nothing. Corrected here.)
 */
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL("C:/Users/Admin/develyst/smart-scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href
);

const BASE = "http://localhost:3016";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

await page.goto(`${BASE}/login?next=/scheduler/bookings`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.locator("input").first().fill("qa-local");
await page.locator('input[type="password"]').fill("qa-local-mock");
await page.locator('button[type="submit"]').click();
await page.waitForURL(/\/scheduler\//, { timeout: 30000 });
await page.waitForLoadState("networkidle");

const res = await page.evaluate(() => {
  const wanted = ["bg-muted-50\\/40", "bg-muted-50\\/80", "bg-muted-100\\/60", "bg-muted-100\\/50", "bg-content1\\/80", "bg-muted-50", "bg-muted-100"];
  const found = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const r of rules) {
      if (!r.selectorText) continue;
      for (const w of wanted) {
        if (r.selectorText === `.${w}` && !found[w]) found[w] = r.cssText.slice(0, 160);
      }
    }
  }
  // and what each class actually paints, injected live
  const paint = {};
  for (const cls of ["bg-muted-50/40", "bg-muted-50/80", "bg-muted-100/60", "bg-muted-100/50", "bg-content1/80", "bg-muted-50", "bg-muted-100"]) {
    const el = document.createElement("div");
    el.className = cls;
    document.body.appendChild(el);
    paint[cls] = getComputedStyle(el).backgroundColor;
    el.remove();
  }
  return { generatedRules: found, painted: paint };
});

console.log(JSON.stringify(res, null, 2));
await browser.close();
