// TASK-955 Team C slice (Flash): Revenue buttons/links are drawn only when the viewer can open the target page.
// Built single file over file://, offline. State lives in React memory, so navigation is by hash change (no reload) after the CEO ticks.
// Run: DIST=<dist/index.html> PW_PATH=<playwright/index.mjs> node check-hide-links.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [], requests = [];
const res = { ceo: {}, kungOnlySummary: {}, kungSummaryPlusDetail: {}, kungAllRevenue: {}, notes: {} };
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on("request", (r) => { if (!/^(file|data|blob):/.test(r.url())) requests.push(r.url().slice(0, 100)); });

const viewAs = async (re) => { await page.locator("header input").first().click(); await page.getByRole("option", { name: re }).first().click(); await page.waitForTimeout(300); };
const hash = async (slug) => { await page.evaluate((s) => { location.hash = `#/${s}`; }, slug); await page.waitForTimeout(450); };
// every button/link inside the page body and header actions (menu excluded)
const buttons = () => page.evaluate(() => [...document.querySelectorAll("main button, main a, header ~ * button")].filter((b) => b.getBoundingClientRect().width > 0 && !b.closest("nav") && !b.closest("aside")).map((b) => (b.innerText || b.getAttribute("aria-label") || "").trim()).filter(Boolean));
const REVENUE = ["revenue/summary", "revenue/lines", "revenue/manual", "revenue/refund", "revenue/eca-term"];
const NAMES = { "revenue/summary": "Summary", "revenue/lines": "Detail", "revenue/manual": "Add Manually", "revenue/refund": "Refund", "revenue/eca-term": "ECA Payment" };
const snapshot = async (into) => { for (const s of REVENUE) { await hash(s); into[s] = { h2: (await page.locator("h2").first().innerText().catch(() => "")).trim(), buttons: await buttons() }; } };

await page.goto(`${BASE}#/`);
await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
await viewAs(/^CEO/);
await snapshot(res.ceo);

// CEO ticks for Kung: untick every menu, then tick only Summary.
const tick = async (titles) => {
  await hash("frontoffice/coach-login");
  await page.locator('[data-menu-edit="kung"]').click();
  await page.waitForTimeout(300);
  const modal = page.locator("[data-menu-modal]");
  for (const g of await modal.locator("[data-group-check]").all()) { if (await g.isChecked()) { await g.click(); if (await g.isChecked()) await g.click(); } }
  // after the group clicks everything should be off; make sure
  for (const c of await modal.locator("[data-menu-check]").all()) if (await c.isChecked()) await c.uncheck();
  for (const t of titles) await modal.locator(`[data-menu-check="${t}"]`).check();
  res.notes[`ticked:${titles.join("+") || "none"}`] = await page.locator('[data-menu-summary="kung"]').innerText().catch(() => "");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
};
await tick(["Summary"]);
await viewAs(/^Admin \(Kung\)/);
await snapshot(res.kungOnlySummary);
await page.goto(`${BASE}#/`); // reload resets state: shot first, then re-tick below
await page.getByText("BACK OFFICE").first().waitFor();
await viewAs(/^CEO/);
await tick(["Summary"]);
await viewAs(/^Admin \(Kung\)/);
await hash("revenue/summary");
await page.screenshot({ path: join(here, "r9-1280-kung-summary-only.png"), fullPage: true });

// tick the target too => the button is back
await viewAs(/^CEO/);
await tick(["Summary", "Detail"]);
await viewAs(/^Admin \(Kung\)/);
await snapshot(res.kungSummaryPlusDetail);
await hash("revenue/summary");
await page.screenshot({ path: join(here, "r9-1280-kung-summary-detail.png"), fullPage: true });

await viewAs(/^CEO/);
await tick(["Summary", "Detail", "Add Manually", "Refund", "ECA Payment"]);
await viewAs(/^Admin \(Kung\)/);
await snapshot(res.kungAllRevenue);

// back-links: Summary NOT ticked => the Summary / Cancel buttons on the other pages are gone
res.kungDetailOnly = {};
await viewAs(/^CEO/);
await tick(["Detail"]);
await viewAs(/^Admin \(Kung\)/);
await hash("revenue/lines");
res.kungDetailOnly["revenue/lines"] = await buttons();
res.kungManualOnly = {};
await viewAs(/^CEO/);
await tick(["Add Manually"]);
await viewAs(/^Admin \(Kung\)/);
await hash("revenue/manual");
res.kungManualOnly["revenue/manual"] = await buttons();
await page.screenshot({ path: join(here, "r9-1280-kung-manual-only.png"), fullPage: true });
res.consoleProblems = problems;
res.networkRequests = requests;
console.log(JSON.stringify(res, null, 1));
await browser.close();
