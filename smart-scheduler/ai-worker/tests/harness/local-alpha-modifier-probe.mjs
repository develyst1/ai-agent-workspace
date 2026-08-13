/**
 * QA probe — decisive test for the suspected REQ-041 side-effect:
 * do Tailwind opacity modifiers still work on the new var-backed colour tokens?
 *
 * `muted: { 50: "var(--color-muted-50)" }` where the var holds a HEX. In Tailwind v3 the alpha
 * modifier (`bg-muted-50/40`) can only be composed when the colour is expressed with the
 * `<alpha-value>` placeholder. If it can't, the class silently produces NO background.
 *
 * Injects two throwaway spans into the page, reads their computed background, removes them.
 * Nothing in the app is modified.
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

const result = await page.evaluate(() => {
  const mk = (cls) => {
    const el = document.createElement("div");
    el.className = cls;
    el.style.width = "10px";
    el.style.height = "10px";
    document.body.appendChild(el);
    const bg = getComputedStyle(el).backgroundColor;
    el.remove();
    return bg;
  };
  return {
    "bg-muted-50 (plain)": mk("bg-muted-50"),
    "bg-muted-50/40 (alpha)": mk("bg-muted-50/40"),
    "bg-muted-50/80 (alpha)": mk("bg-muted-50/80"),
    "bg-muted-100 (plain)": mk("bg-muted-100"),
    "bg-paper (plain)": mk("bg-paper"),
    "bg-paper/50 (alpha)": mk("bg-paper/50"),
    varValue: getComputedStyle(document.documentElement).getPropertyValue("--color-muted-50").trim(),
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
