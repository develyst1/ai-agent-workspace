/**
 * QA harness — the live sites hit by the alpha-modifier regression (REQ-041 / TASK-128).
 * Before: `content1: "#ffffff"` and `default-100: "#f1f5f9"` were literal hex → Tailwind composed the
 * `/NN` alpha fine. After: both are `var(--…)` → in Tailwind v3 the modifier cannot compose, so the
 * class paints NOTHING. This measures each affected element as it renders.
 */
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL("C:/Users/Admin/develyst/smart-scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href
);

const BASE = "http://localhost:3016";
const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

const findByClass = (cls) =>
  page.evaluate((cls) => {
    const el = [...document.querySelectorAll("*")].find((x) => (x.className?.toString?.() ?? "").split(/\s+/).includes(cls));
    if (!el) return { note: "not on this screen" };
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, tag: el.tagName.toLowerCase(), text: (el.innerText ?? "").slice(0, 30).replace(/\n/g, " ") };
  }, cls);

await page.goto(`${BASE}/login?next=/scheduler/bookings`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.locator("input").first().fill("qa-local");
await page.locator('input[type="password"]').fill("qa-local-mock");
await page.locator('button[type="submit"]').click();
await page.waitForURL(/\/scheduler\//, { timeout: 30000 });
await page.waitForLoadState("networkidle");

const out = {};
out["Header.tsx:27 bg-content1/80 (app header backdrop)"] = await findByClass("bg-content1/80");
await page.screenshot({ path: `${OUT}/alpha-1-header.png`, clip: { x: 0, y: 0, width: 1280, height: 120 } });

await page.goto(`${BASE}/scheduler/teachers`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
out["TeachersContent bg-muted-100/60"] = await findByClass("bg-muted-100/60");
await page.screenshot({ path: `${OUT}/alpha-2-teachers.png` });

await page.goto(`${BASE}/scheduler/reports`, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(3000);
out["ReportsContent bg-muted-100/50"] = await findByClass("bg-muted-100/50");
await page.screenshot({ path: `${OUT}/alpha-3-reports.png` });

// what those two SHOULD paint, if the modifier composed
out.expected = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    "--color-surface": cs.getPropertyValue("--color-surface").trim(),
    "--color-muted-100": cs.getPropertyValue("--color-muted-100").trim(),
    "--color-muted-50": cs.getPropertyValue("--color-muted-50").trim(),
  };
});

console.log(JSON.stringify(out, null, 2));
await browser.close();
