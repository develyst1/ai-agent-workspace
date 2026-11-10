// TASK-937 evidence (Flash): the 7 PROPOSED pages of final-ui, clicked headless as CEO / admin / coach and shot at 1280 (+375).
// Runs against the build of a SCRATCH copy of final-ui whose shell has the edits Sober owns ("PROPOSED" in Group + GROUP_ICON + the registry line).
// Run: DIST=<path to dist/index.html> PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot-proposed.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href; // the BUILT single file (offline), so the bundled font is used
const PAGES = [
  ["payment-setting", "Payment Setting (Edit)"],
  ["conversion", "Conversion (Total + filters)"],
  ["conversion-export", "Conversion export"],
  ["revenue-export", "Revenue Summary export"],
  ["move-course", "Move course to branch"],
  ["stock-report", "Stock Report filters"],
  ["report-revenue-conversion", "Report Revenue + Conversion"],
];
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = { roles: {}, interactions: {} };
const consoleProblems = [];
for (const role of ["CEO", "Admin", "Coach"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) consoleProblems.push(`${role}: ${m.type()}: ${m.text().slice(0, 160)}`); });
  page.on("pageerror", (e) => consoleProblems.push(`${role}: pageerror: ${String(e).slice(0, 160)}`));
  await page.goto(`${BASE}#/`);
  await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
  // the role switcher (a SegmentedControl in the header)
  await page.getByText(role, { exact: true }).first().click();
  await page.waitForTimeout(400);
  const opened = [];
  for (const [slug, title] of PAGES) {
    await page.goto(`${BASE}#/proposed/${slug}`);
    await page.waitForTimeout(500);
    const banner = await page.locator("[data-proposed-banner]").count();
    const cannot = /cannot see|ไม่สามารถ|cannot/i.test(await page.locator("body").innerText()) && banner === 0;
    opened.push(`${slug}:${banner ? "opens" : cannot ? "cannot-see" : "??"}`);
    if (role === "CEO" || (role === "Admin" && slug === "stock-report")) await page.screenshot({ path: join(here, `proposed-1280-${role.toLowerCase()}-${slug}.png`), fullPage: true });
  }
  out.roles[role] = opened;
  await ctx.close();
}
out.consoleProblems = consoleProblems;
await browser.close();
console.log(JSON.stringify(out, null, 1));
