// TASK-958 (Flash, Team C): round 12 — Revenue Summary readable (cards side by side, zebra rows, whole-row click), Detail / All Report REVENUE row style, ECA history at 375.
// Run: DIST=<new dist/index.html> DIST_OLD=<round-11 dist/index.html> PW_PATH=<playwright/index.mjs> node check-958.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [], requests = [], checks = [];
const ok = (name, cond, detail = "") => checks.push({ name, pass: !!cond, detail: String(detail).slice(0, 300) });

const open = async (dist) => {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
  page.on("request", (r) => { if (!/^(file|data|blob):/.test(r.url())) requests.push(r.url().slice(0, 100)); });
  await page.goto(`${pathToFileURL(dist).href}#/`);
  await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
  return page;
};
const viewAs = async (page, re) => { await page.locator("header input").first().click(); await page.getByRole("option", { name: re }).first().click(); await page.waitForTimeout(300); };
const hash = async (page, slug) => { await page.evaluate((s) => { location.hash = `#/${s}`; }, slug); await page.waitForTimeout(450); };
const tab = async (page, name) => { await page.getByRole("tab", { name, exact: true }).click(); await page.waitForTimeout(300); };
const rowsOf = (page, box) => page.locator(`${box} tbody tr`).evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((c) => c.innerText.replace(/\s+/g, " ").trim()).filter((x, i, a) => i < a.length || x).join("|")));
const readAll = async (page) => {
  const out = {};
  for (const t of ["Today", "MTD", "YTD"]) { await tab(page, t); out[t] = { type: await rowsOf(page, "[data-type-box]"), cat: await rowsOf(page, "[data-category-box]") }; }
  return out;
};
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

/* the round-11 build, for the before/after numbers (its type box has no data-type-box: use the first card) */
const oldPage = await open(process.env.DIST_OLD);
await viewAs(oldPage, /^CEO/);
await hash(oldPage, "revenue/summary");
const before = {};
for (const t of ["Today", "MTD", "YTD"]) {
  await tab(oldPage, t);
  const type = await oldPage.locator("main .mantine-Card-root").nth(1).locator("tbody tr").evaluateAll((trs) => trs.map((tr) => [...tr.cells].slice(0, 3).map((c) => c.innerText.replace(/\s+/g, " ").trim()).join("|")));
  const cat = await oldPage.locator("[data-category-box] tbody tr").evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((c) => c.innerText.replace(/\s+/g, " ").trim()).join("|")));
  before[t] = { type, cat };
}
await oldPage.close();

const page = await open(process.env.DIST);
await viewAs(page, /^CEO/);
await hash(page, "revenue/summary");

/* numbers equal round 11's, on all three tabs */
const after = await readAll(page);
for (const t of ["Today", "MTD", "YTD"]) {
  const a = after[t].type.map((r) => r.split("|").slice(0, 3).join("|"));
  ok(`${t}: by-Type rows equal round 11's`, JSON.stringify(a) === JSON.stringify(before[t].type), `${a.length} rows; first: ${a[0]} / ${before[t].type[0]}`);
  ok(`${t}: by-Category rows equal round 11's`, JSON.stringify(after[t].cat) === JSON.stringify(before[t].cat), `${after[t].cat.length} rows`);
}
await tab(page, "Today");

/* layout: 1280 side by side; 1024 and 375 stacked with maw 720 */
const box = async (sel) => page.locator(sel).boundingBox();
let bt = await box("[data-type-box]"), bc = await box("[data-category-box]");
ok("1280: the two cards are side by side (Type left, Category right, same top)", bc.x > bt.x + bt.width - 2 && Math.abs(bc.y - bt.y) < 4, `type x${Math.round(bt.x)} w${Math.round(bt.width)} · cat x${Math.round(bc.x)} w${Math.round(bc.width)} · y ${Math.round(bt.y)}/${Math.round(bc.y)}`);
ok("1280: Type card is narrower than Category (5 / 7)", bt.width < bc.width, `${Math.round(bt.width)} < ${Math.round(bc.width)}`);
await page.setViewportSize({ width: 1280, height: 1000 });
await page.screenshot({ path: join(here, "r12-1280-ceo-summary-side-by-side.png") });
for (const w of [1024, 375]) {
  await page.setViewportSize({ width: w, height: 1400 });
  await page.waitForTimeout(400);
  bt = await box("[data-type-box]"); bc = await box("[data-category-box]");
  ok(`${w}: the cards stack (Category under Type), each at most 720 wide`, bc.y >= bt.y + bt.height - 2 && bt.width <= 721 && bc.width <= 721, `type w${Math.round(bt.width)} · cat w${Math.round(bc.width)} · cat y${Math.round(bc.y)} ≥ ${Math.round(bt.y + bt.height)}`);
  ok(`${w}: no horizontal overflow`, (await overflow(page)) <= 0, await overflow(page));
  if (w === 375) await page.screenshot({ path: join(here, "r12-375-ceo-summary.png") });
}
await page.setViewportSize({ width: 1280, height: 900 });
await page.waitForTimeout(300);

/* rows read as rows: zebra, hover, Total row style */
ok("Both Summary tables are striped and highlight on hover", (await page.locator("[data-type-box] tbody tr[data-striped][data-hover]").count()) > 0 && (await page.locator("[data-category-box] tbody tr[data-striped][data-hover]").count()) > 0, await page.locator("[data-type-box] tbody tr[data-striped]").count());
const tot = await page.locator("[data-type-box] [data-total-row]").evaluate((tr) => { const s = getComputedStyle(tr); return { bt: s.borderTopWidth, bg: s.backgroundColor, fw: getComputedStyle(tr.cells[0]).fontWeight }; });
ok("Total Revenue row: 2 px top border, tinted, bold", tot.bt === "2px" && tot.bg !== "rgba(0, 0, 0, 0)" && Number(tot.fw) >= 700, JSON.stringify(tot));

/* whole-row click, all three tabs */
for (const t of ["Today", "MTD", "YTD"]) {
  await tab(page, t);
  const types = await page.locator("[data-type-row]").evaluateAll((els) => els.map((e) => e.getAttribute("data-type-row")));
  const chev = await page.locator("[data-type-box] [data-row-chevron]").count();
  ok(`${t}: «View» button is gone; one chevron per Type row (${types.length})`, (await page.getByRole("button", { name: "View", exact: true }).count()) === 0 && chev === types.length, `${chev} chevrons`);
  const ty = types[0];
  await page.locator(`[data-type-row="${ty}"]`).click();
  await page.waitForTimeout(400);
  const h1 = await page.evaluate(() => location.hash);
  ok(`${t}: a click on the ${ty} row opens Detail filtered to it`, h1.includes("revenue/lines") && h1.includes(`type=${encodeURIComponent(ty)}`), h1);
  await hash(page, "revenue/summary");
  await tab(page, t);
  await page.locator(`[data-type-row="${ty}"]`).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  const h2 = await page.evaluate(() => location.hash);
  ok(`${t}: Enter on the focused ${ty} row does the same`, h2.includes("revenue/lines") && h2.includes(`type=${encodeURIComponent(ty)}`), h2);
  await hash(page, "revenue/summary");
  await tab(page, t);
  const h0 = await page.evaluate(() => location.hash);
  await page.locator("[data-category-box] tbody tr").first().click();
  await page.locator("[data-type-box] [data-total-row]").click();
  const refund = page.locator("[data-type-box] tbody tr", { hasText: "Refund (Expense)" });
  if (await refund.count()) await refund.click();
  await page.waitForTimeout(300);
  ok(`${t}: Category, Total and Refund rows do not navigate; Category has no chevron`, (await page.evaluate(() => location.hash)) === h0 && (await page.locator("[data-category-box] svg.lucide-chevron-right").count()) === 0, h0);
}

/* the same style on Detail and All Report REVENUE */
await hash(page, "revenue/lines");
ok("Detail table is striped and highlights on hover", (await page.locator("main tbody tr[data-striped][data-hover]").count()) >= 1);
await hash(page, "reports/home");
await page.getByRole("tab", { name: "REVENUE", exact: true }).click();
await page.waitForTimeout(350);
ok("All Report REVENUE: both tables striped", (await page.locator("[data-rr-box='category'] tbody tr[data-striped]").count()) > 0 && (await page.locator("[data-rr-box='type'] tbody tr[data-striped]").count()) > 0);
const tot2 = await page.locator("[data-rr-box='category'] [data-total-row]").evaluate((tr) => { const s = getComputedStyle(tr); return { bt: s.borderTopWidth, bg: s.backgroundColor }; });
ok("All Report REVENUE: Total Revenue row has the 2 px border and the tint", tot2.bt === "2px" && tot2.bg !== "rgba(0, 0, 0, 0)", JSON.stringify(tot2));
await page.screenshot({ path: join(here, "r12-1280-ceo-allreport-revenue.png") });

/* ECA history at 375 */
await page.setViewportSize({ width: 375, height: 900 });
await hash(page, "revenue/eca-term");
await page.waitForTimeout(400);
const badge = await page.locator("[data-eca-status]").evaluateAll((els) => els.map((e) => ({ t: e.innerText.trim(), clipped: e.scrollWidth > e.clientWidth + 1, label: [...e.querySelectorAll("*")].some((x) => x.scrollWidth > x.clientWidth + 1) })));
ok("ECA 375: «Pending» / «Received» read in full, not clipped", badge.length >= 3 && badge.every((b) => ["Pending", "Received"].includes(b.t) && !b.clipped && !b.label), JSON.stringify(badge));
const termH = await page.locator("[data-eca-row] td:nth-child(2)").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
ok("ECA 375: Term stays on one line (every row the same one-line height)", termH.every((h) => h < 50), termH.join(","));
ok("ECA 375: no page overflow; the table scrolls in its own box", (await overflow(page)) <= 0 && (await page.locator(".mantine-ScrollArea-viewport, .mantine-Table-scrollContainer").evaluateAll((els) => els.some((e) => e.scrollWidth > e.clientWidth + 5))), await overflow(page));
await page.locator("[data-eca-row]").first().scrollIntoViewIfNeeded();
await page.screenshot({ path: join(here, "r12-375-ceo-eca-history.png") });
await page.setViewportSize({ width: 1280, height: 900 });

/* Admin (Kung): Summary ticked, Detail not */
await hash(page, "frontoffice/coach-login");
await page.locator('[data-menu-edit="kung"]').click();
await page.waitForTimeout(300);
const modal = page.locator("[data-menu-modal]");
for (const g of await modal.locator("[data-group-check]").all()) { if (await g.isChecked()) { await g.click(); if (await g.isChecked()) await g.click(); } }
for (const c of await modal.locator("[data-menu-check]").all()) if (await c.isChecked()) await c.uncheck();
await modal.locator('[data-menu-check="Summary"]').check();
await page.keyboard.press("Escape");
await page.waitForTimeout(250);
await viewAs(page, /^Admin \(Kung\)/);
const nProb = problems.length;
await hash(page, "revenue/summary");
const adminOnSummary = (await page.evaluate(() => location.hash)).includes("revenue/summary") && (await page.locator("[data-type-box]").count()) === 1;
ok("Admin: Summary opens when ticked", adminOnSummary, await page.evaluate(() => location.hash));
if (adminOnSummary) {
  ok("Admin (no Detail): no chevron, no pointer on the Type rows", (await page.locator("[data-row-chevron]").count()) === 0 && (await page.locator("[data-type-row]").first().evaluate((e) => getComputedStyle(e).cursor)) !== "pointer");
  const hA = await page.evaluate(() => location.hash);
  await page.locator("[data-type-row]").first().click();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  ok("Admin (no Detail): a click and Enter do nothing", (await page.evaluate(() => location.hash)) === hA, await page.evaluate(() => location.hash));
}
ok("Admin: no console error", problems.length === nProb, problems.slice(nProb).join(" ; "));

ok("0 console errors/warnings in the whole run", problems.length === 0, problems.join(" ; "));
ok("No network requests", requests.length === 0, requests.join(" ; "));
console.log(JSON.stringify({ checks, passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length, sampleBeforeAfterToday: { before: before.Today.type, after: after.Today.type } }, null, 1));
await browser.close();
