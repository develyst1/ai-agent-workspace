// TASK-953 (Flash, Team C): rule-7a alignment check on the BUILT final-ui (file://, offline) via the real "Viewing as" dropdown, as CEO.
// Run: DIST=<dist/index.html> PW_PATH=<playwright/index.mjs> node check-alignment.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [], requests = [];
const res = { pages: {}, forms: {}, hscroll375: {} };
const hook = (p, tag) => {
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${tag} ${m.type()}: ${m.text().slice(0, 200)}`); });
  p.on("pageerror", (e) => problems.push(`${tag} pageerror: ${String(e).slice(0, 200)}`));
  p.on("request", (r) => { if (!/^(file|data|blob):/.test(r.url())) requests.push(r.url().slice(0, 100)); });
};
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
hook(page, "ceo");
await page.goto(`${BASE}#/`);
await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
await page.locator("header input, input").first().click();
await page.getByRole("option", { name: /^CEO/ }).first().click();
await page.waitForTimeout(300);

// Audit every table on screen: numeric cells (and their header) must be right; other cells in a table with a header must be left; nothing centred.
const audit = () => page.evaluate(() => {
  const NUM = /^[−-]?[\d,]+(\.\d+)?( ฿|%)?$/;
  const bad = [];
  let tables = 0, cells = 0, numericCells = 0;
  for (const t of document.querySelectorAll("table")) {
    if (!t.getBoundingClientRect().width) continue;
    tables++;
    const hasHead = !!t.querySelector("thead");
    const rows = [...t.rows];
    const colNumeric = new Map();
    const colControl = new Map();
    for (const r of rows) {
      let c = 0;
      for (const cell of r.cells) {
        const span = cell.colSpan || 1;
        const txt = cell.innerText.replace(/\s+/g, " ").trim();
        if (cell.tagName === "TD" && span === 1 && NUM.test(txt)) colNumeric.set(c, true);
        if (cell.tagName === "TD" && span === 1 && cell.querySelector("button, input, a")) colControl.set(c, true); // action / input columns: rule 4 puts them right
        c += span;
      }
    }
    for (const r of rows) {
      let c = 0;
      for (const cell of r.cells) {
        const span = cell.colSpan || 1;
        const al = getComputedStyle(cell).textAlign;
        const txt = cell.innerText.replace(/\s+/g, " ").trim();
        cells++;
        const isNumCol = span === 1 && colNumeric.get(c);
        if (isNumCol && txt) numericCells++;
        if (al === "center") bad.push(`CENTRED «${txt.slice(0, 24)}»`);
        else if (hasHead && isNumCol && txt && al !== "right" && al !== "end") bad.push(`NUMERIC NOT RIGHT «${txt.slice(0, 24)}» (${al})`);
        else if (hasHead && !isNumCol && txt && (al === "right" || al === "end") && span === 1 && !colControl.get(c)) bad.push(`TEXT RIGHT «${txt.slice(0, 24)}»`);
        c += span;
      }
    }
  }
  return { tables, cells, numericCells, bad };
});
// Forms: no row carries more than one field (a From/To pair may share one).
const formRows = (sel) => page.evaluate((s) => {
  const root = document.querySelector(s) ?? document.body;
  const ws = [...root.querySelectorAll(".mantine-InputWrapper-root")].filter((w) => w.getBoundingClientRect().width > 0);
  const rows = new Map();
  for (const w of ws) { const k = Math.round(w.getBoundingClientRect().top / 4); rows.set(k, (rows.get(k) ?? 0) + 1); }
  return { fields: ws.length, maxPerRow: Math.max(0, ...rows.values()), labels: ws.map((w) => (w.querySelector("label")?.innerText ?? "").trim()) };
}, sel);
const go = async (slug) => { await page.goto(`${BASE}#/${slug}`); await page.waitForTimeout(500); };

const PAGES = ["stock/reports", "stock/low-stock", "stock/demo", "revenue/summary", "revenue/lines", "revenue/manual", "revenue/refund", "revenue/categories", "revenue/eca-term", "reports/home", "proposed/payment-setting", "proposed/conversion", "proposed/conversion-export", "proposed/revenue-export", "proposed/move-course", "proposed/stock-report", "proposed/report-revenue-conversion"];
for (const slug of PAGES) {
  await go(slug);
  if (slug === "stock/reports") {
    for (const tab of ["Sales History", "Balance", "Movement"]) { await page.getByRole("tab", { name: tab }).click(); await page.waitForTimeout(250); res.pages[`${slug}#${tab}`] = await audit(); }
    await page.getByRole("tab", { name: "Movement" }).click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(here, "r7a-1280-ceo-stock-report.png"), fullPage: true });
    continue;
  }
  if (slug === "reports/home") {
    for (const tab of ["REPORT", "COURSE", "STUDENT"]) {
      const t = page.getByRole("tab", { name: new RegExp(tab, "i") }).first();
      if (await t.count()) {
        await t.click();
        await page.waitForTimeout(350);
        res.pages[`${slug}#${tab}`] = await audit();
        await page.screenshot({ path: join(here, `r7a-1280-ceo-all-report-${tab.toLowerCase()}.png`), fullPage: true });
      }
    }
    continue;
  }
  if (slug === "revenue/summary") {
    for (const tab of ["Today", "MTD", "YTD"]) { await page.getByRole("tab", { name: tab }).click(); await page.waitForTimeout(250); res.pages[`${slug}#${tab}`] = await audit(); }
    await page.getByRole("tab", { name: "Today" }).click();
    await page.screenshot({ path: join(here, "r7a-1280-ceo-revenue-summary.png"), fullPage: true });
    continue;
  }
  res.pages[slug] = await audit();
  if (["revenue/manual", "revenue/eca-term", "revenue/refund"].includes(slug)) {
    res.forms[slug] = await formRows("main");
    await page.screenshot({ path: join(here, `r7a-1280-ceo-${slug.replace("/", "-")}.png`), fullPage: true });
  }
  if (slug === "proposed/payment-setting") {
    // Round 12 (Flash): the page no longer has an «Edit» button (PaymentSettingEdit was removed), so audit the edit view only if it exists, instead of timing out.
    if (await page.getByRole("button", { name: "Edit" }).count()) {
      await page.getByRole("button", { name: "Edit" }).first().click();
      await page.waitForTimeout(300);
      res.pages[`${slug} (edit)`] = await audit();
    } else console.error(`${slug}: no Edit button on this build, edit view not audited`);
    res.forms[slug] = await formRows("main");
    await page.screenshot({ path: join(here, "r7a-1280-ceo-payment-setting-edit.png"), fullPage: true });
  }
  if (slug === "stock/demo") {
    await page.screenshot({ path: join(here, "r7a-1280-ceo-demo.png"), fullPage: true });
    await page.getByRole("button", { name: "Add Demo" }).click();
    await page.waitForTimeout(300);
    res.forms["stock/demo Add dialog"] = await formRows(".mantine-Modal-content");
    await page.keyboard.press("Escape");
  }
  if (slug === "revenue/categories") {
    await page.getByRole("button", { name: /^Add/ }).first().click().catch(() => {});
    await page.waitForTimeout(300);
    if (await page.locator(".mantine-Modal-content").count()) res.forms["revenue/categories Add dialog"] = await formRows(".mantine-Modal-content");
    await page.keyboard.press("Escape");
  }
}
// 375px: no horizontal overflow
await page.setViewportSize({ width: 375, height: 812 });
for (const slug of PAGES) {
  await go(slug);
  res.hscroll375[slug] = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}
await page.setViewportSize({ width: 1280, height: 900 });
res.badTotal = Object.entries(res.pages).flatMap(([k, v]) => v.bad.map((b) => `${k}: ${b}`));
res.summary = {
  pages: Object.keys(res.pages).length,
  tables: Object.values(res.pages).reduce((a, v) => a + v.tables, 0),
  numericCells: Object.values(res.pages).reduce((a, v) => a + v.numericCells, 0),
  badCells: res.badTotal.length,
  anyHscroll375: Object.values(res.hscroll375).some(Boolean),
};
res.consoleProblems = problems;
res.networkRequests = requests;
console.log(JSON.stringify(res, null, 1));
await browser.close();
