// TEST-142 F5 painted check (Twenty): sid front office, PokerVault session as-is, Bangkok clock, headless.
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
const here = path.dirname(fileURLToPath(import.meta.url));
const STATE = path.resolve(here, "../../../../picklocker/state/som.json");
const OUT = path.resolve(here, "../../../project-docs/qa-2026-11-09");
const { chromium } = await import(pathToFileURL("H:/scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href);
const fs = await import("node:fs");
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const W = Number(process.env.W ?? 1600);
const ctx = await browser.newContext({ storageState: STATE, timezoneId: "Asia/Bangkok", viewport: { width: W, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
await page.goto("https://som.develyst.online/scheduler/calendar", { waitUntil: "networkidle", timeout: 90000 });
if (/login|signin/i.test(page.url())) throw new Error("login page");
console.log(`url ${page.url()}`);
await page.getByText("Daily", { exact: true }).first().click();
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1500);
// column headers: find any element whose text is exactly a teacher nickname, in DOM order, inside the grid
const order = await page.evaluate(() => {
  const names = ["No Teacher", "Bank", "Camp", "Kid", "New", "Print", "Toth", "Tarb", "Seed", "Nay", "Dewy", "Ek", "Lewis"];
  const hits = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length) continue;
    const t = (el.textContent || "").trim();
    if (names.includes(t)) { const r = el.getBoundingClientRect(); hits.push({ t, x: Math.round(r.x), y: Math.round(r.y) }); }
  }
  return hits;
});
const heads = order.filter((h) => h.y < 1200);
const ys = {}; for (const h of heads) ys[h.y] = (ys[h.y] ?? 0) + 1;
const headY = Number(Object.entries(ys).sort((a, b) => b[1] - a[1])[0]?.[0]);
const row = heads.filter((h) => h.y === headY).sort((a, b) => a.x - b.x).map((h) => h.t);
console.log(`header row y=${headY}: ${row.join(" | ")}`);
const allHeaders = await page.evaluate((y) => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length) continue;
    const r = el.getBoundingClientRect();
    const t = (el.textContent || "").trim();
    if (t && Math.abs(r.y - y) < 3) out.push({ t, x: Math.round(r.x) });
  }
  return out.sort((a, b) => a.x - b.x).map((o) => o.t);
}, headY);
console.log(`all cells on that row (${allHeaders.length}): ${allHeaders.join(" | ")}`);
console.log(`park block text visible: ${await page.getByText("Twenty-F5 park fee test").count()}`);
await page.screenshot({ path: path.join(OUT, `task861-daily-${W}.png`), fullPage: false });
// scroll grid fully right to show the last column
await page.evaluate(() => { for (const el of document.querySelectorAll("*")) if (el.scrollWidth > el.clientWidth + 50 && getComputedStyle(el).overflowX !== "visible") el.scrollLeft = el.scrollWidth; });
await page.waitForTimeout(500);
const block = page.getByText("Twenty-F5 park fee test").first();
if (await block.count()) await block.scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, `task861-daily-right-${W}.png`), fullPage: false });
console.log(`console errors: ${errors.length}${errors.length ? " — " + errors.slice(0, 3).join(" || ") : ""}`);
await browser.close();
