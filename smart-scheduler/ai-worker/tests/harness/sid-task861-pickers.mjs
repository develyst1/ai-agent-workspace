// TEST-142 F5 pickers (Twenty): open the booking modal from a real coach's cell and from No Teacher's cell; read the
// teacher options; never submit anything (Escape closes). Also names any 404 the page loads.
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
const here = path.dirname(fileURLToPath(import.meta.url));
const STATE = path.resolve(here, "../../../../picklocker/state/som.json");
const OUT = path.resolve(here, "../../../project-docs/qa-2026-11-09");
const { chromium } = await import(pathToFileURL("H:/scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ storageState: STATE, timezoneId: "Asia/Bangkok", viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
page.on("response", (r) => { if (r.status() === 404) console.log(`404: ${new URL(r.url()).pathname}`); });
await page.goto("https://som.develyst.online/scheduler/calendar", { waitUntil: "networkidle", timeout: 90000 });
await page.getByText("Daily", { exact: true }).first().click();
await page.waitForLoadState("networkidle"); await page.waitForTimeout(1200);

async function cellPlus(teacher, hourIdx) {
  const head = page.getByText(teacher, { exact: true }).first();
  await head.scrollIntoViewIfNeeded();
  const hb = await head.boundingBox();
  const time = page.getByText(["10:00", "11:00", "12:00"][hourIdx], { exact: true }).first();
  const tb = await time.boundingBox();
  return { x: hb.x + hb.width / 2, y: tb.y + 25 };
}
async function readModal(label) {
  await page.waitForTimeout(1200);
  const dlg = page.locator("[role=dialog]").last();
  const visible = await dlg.count();
  const tabs = visible ? await dlg.locator("[role=tab]").allInnerTexts() : [];
  console.log(`${label}: dialog=${visible} tabs=[${tabs.join(" | ")}]`);
  await page.screenshot({ path: path.join(OUT, `task861-modal-${label}.png`) });
  return dlg;
}
async function teacherOptions(dlg, label) {
  // open every combobox in the dialog whose label mentions teacher / ครู and list the options
  const boxes = dlg.locator("input[role=combobox], [role=combobox]");
  const n = await boxes.count();
  for (let i = 0; i < n; i++) {
    const b = boxes.nth(i);
    if (!(await b.isVisible())) continue;
    await b.click({ force: true }); await page.waitForTimeout(500);
    const opts = await page.locator("[role=option]").allInnerTexts();
    const hasNT = opts.some((o) => o.includes("No Teacher"));
    console.log(`  ${label} combobox#${i}: ${opts.length} options; No Teacher listed: ${hasNT}; first: ${opts.slice(0, 4).map((o) => o.replace(/\s+/g, " ").slice(0, 30)).join(" / ")}`);
    if (opts.length && /Kid|Bank|Tarb|Mu/.test(opts.join(" "))) await page.screenshot({ path: path.join(OUT, `task861-picker-${label}-${i}.png`) });
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  }
}

// 1) a real coach's empty cell (Tarb, 10:00)
let p = await cellPlus("Tarb", 0);
await page.mouse.click(p.x, p.y);
let dlg = await readModal("tarb-cell");
for (const tab of await dlg.locator("[role=tab]").all()) {
  const name = (await tab.innerText()).trim();
  await tab.click(); await page.waitForTimeout(600);
  await teacherOptions(dlg, `tarb-${name.replace(/[^A-Za-z0-9ก-๙]+/g, "_")}`);
}
await page.keyboard.press("Escape"); await page.waitForTimeout(600);
if (await page.locator("[role=dialog]").count()) { await page.keyboard.press("Escape"); await page.waitForTimeout(600); }

// 2) No Teacher's empty cell (11:00)
p = await cellPlus("No Teacher", 1);
await page.mouse.click(p.x, p.y);
dlg = await readModal("noteacher-cell");
await teacherOptions(dlg, "noteacher");
await page.keyboard.press("Escape");
await browser.close();
