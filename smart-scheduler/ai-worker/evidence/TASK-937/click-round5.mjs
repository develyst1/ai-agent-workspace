// TASK-937 Batch 5 (GR round 5) evidence (Flash): Revenue Summary (Unit + Category box), Stock Demo (balanced rows + Add Demo), Bonus (Conversion) in the BUILT final-ui (file://, offline).
// Run: DIST=<dist/index.html> PW_PATH=... node click-round5.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];
const requests = [];
const res = { roles: {}, flows: {} };
const hook = (page, tag) => {
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${tag} ${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => problems.push(`${tag} pageerror: ${String(e).slice(0, 200)}`));
  page.on("request", (r) => { if (!r.url().startsWith("file:") && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) requests.push(r.url().slice(0, 100)); });
};
const setRole = async (page, role) => { await page.goto(`${BASE}#/`); await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 }); /* round-5 shell: "Viewing as" is a Select now */ await page.locator("header input, input").first().click(); await page.getByRole("option", { name: new RegExp(`^${role}`) }).first().click(); /* options: CEO · Admin (Khwan) · Admin (Kung) · Coach */ await page.waitForTimeout(300); };
const num = (s) => Number(String(s).replace(/[^\d−-]/g, "").replace("−", "-"));
const PAGES = [["revenue/summary", "Summary"], ["stock/demo", "Stock Demo"], ["proposed/conversion", "Bonus (Conversion)"]];

for (const role of ["CEO", "Admin", "Coach"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  hook(page, role);
  await setRole(page, role);
  const out = [];
  for (const [slug, title] of PAGES) {
    await page.goto(`${BASE}#/${slug}`);
    await page.waitForTimeout(400);
    out.push(`${slug}:${(await page.locator("h2").first().innerText().catch(() => "")).trim() === title ? "opens" : "cannot-see"}`);
  }
  res.roles[role] = out;
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
hook(page, "flows");
await setRole(page, "CEO");
const body = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");

// ---- Summary
await page.goto(`${BASE}#/revenue/summary`);
await page.locator("[data-category-box]").waitFor();
res.flows.apply_button = await page.getByRole("button", { name: "Apply Filter", exact: true }).count();
res.flows.top_headers = (await page.locator("table").first().locator("thead").innerText()).replace(/\s+/g, " ").trim();
const check = async (label) => {
  const topUnits = num(await page.locator("[data-unit-total]").innerText());
  const topTotal = num(await page.locator("table").first().locator("tbody tr", { hasText: "Total Revenue" }).locator("td").nth(2).innerText());
  const catUnits = num(await page.locator("[data-category-unit-total]").innerText());
  const catTotal = num(await page.locator("[data-category-total]").innerText());
  const catRows = await page.locator("[data-category-row]").count();
  res.flows[`summary_${label}`] = { topUnits, topTotal, catUnits, catTotal, catRows, unitsMatch: topUnits === catUnits, revenueMatches: topTotal === catTotal };
};
await check("today");
await page.screenshot({ path: join(here, "round5-1280-ceo-summary-today.png"), fullPage: true });
await page.getByRole("tab", { name: "MTD" }).click();
await page.waitForTimeout(300);
await check("mtd");
await page.screenshot({ path: join(here, "round5-1280-ceo-summary-mtd.png"), fullPage: true });
await page.getByRole("tab", { name: "YTD" }).click();
await page.waitForTimeout(300);
await check("ytd");
await page.getByRole("tab", { name: "Today" }).click();
// Branch Bravo on Today: both boxes follow the branch
await page.getByRole("combobox", { name: "Branch" }).click();
await page.getByRole("option", { name: "Bravo", exact: true }).click();
await page.getByRole("button", { name: "Apply Filter" }).click();
await page.waitForTimeout(400);
await check("today_bravo");

// ---- Demo
await page.goto(`${BASE}#/stock/demo`);
await page.getByRole("button", { name: "Add Demo" }).waitFor();
const style = await page.locator("[data-demo-matrix]").evaluate((t) => ({ layout: getComputedStyle(t).tableLayout, headerAlign: [...t.querySelectorAll("thead th")].slice(1).map((th) => getComputedStyle(th).textAlign), cellAlign: [...t.querySelectorAll("tbody tr:first-child td")].slice(1).map((td) => getComputedStyle(td).textAlign), widths: [...t.querySelectorAll("thead th")].slice(1, -1).map((th) => Math.round(th.getBoundingClientRect().width)) }));
res.flows.demo_matrix = { layout: style.layout, allCentred: [...style.headerAlign, ...style.cellAlign].every((a) => a === "center"), siteColumnWidths: style.widths, equalWidths: new Set(style.widths).size === 1 };
await page.screenshot({ path: join(here, "round5-1280-ceo-demo.png"), fullPage: true });
const hist0 = await page.locator("table").nth(1).locator("tbody tr").count();
const cellBefore = (await page.locator("[data-demo-matrix] tbody tr").first().locator("td").nth(2).innerText()).trim(); // first item at STA
await page.getByRole("button", { name: "Add Demo" }).click();
await page.screenshot({ path: join(here, "round5-1280-ceo-add-demo-dialog.png") });
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
res.flows.add_demo_needs_reason = (await page.locator(".mantine-Notification-description").last().innerText()).trim();
await page.getByRole("combobox", { name: "Location" }).click();
await page.getByRole("option", { name: "STA", exact: true }).click();
await page.getByRole("dialog").getByLabel("Qty").fill("2");
await page.getByRole("dialog").getByPlaceholder(/bought 2 more/).fill("Bought 2 more for the school class");
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(400);
const cellAfter = (await page.locator("[data-demo-matrix] tbody tr").first().locator("td").nth(2).innerText()).trim();
res.flows.add_demo = { cellBefore, cellAfter, historyRows: [hist0, await page.locator("table").nth(1).locator("tbody tr").count()], toast: (await page.locator(".mantine-Notification-description").last().innerText()).trim(), firstHistory: (await page.locator("table").nth(1).locator("tbody tr").first().innerText()).replace(/\s+/g, " ") };
await page.screenshot({ path: join(here, "round5-1280-ceo-demo-after-add.png"), fullPage: true });

// ---- Bonus (Conversion)
await page.goto(`${BASE}#/proposed/conversion`);
await page.locator("[data-conv-total]").waitFor();
res.flows.conv = {
  title: (await page.locator("h2").first().innerText()).trim(),
  banner: await page.locator("[data-proposed-banner]").count(),
  total: (await page.locator("[data-conv-total]").innerText()).trim(),
  headers: (await page.locator("table thead").innerText()).replace(/\s+/g, " ").trim(),
};
// menu: the link sits under SALARY, immediately before Other Income
const nav = await page.locator("nav a, aside a").allInnerTexts();
const names = nav.map((t) => t.trim()).filter(Boolean);
const i = names.indexOf("Bonus (Conversion)");
res.flows.conv_menu = { before: names[i - 1], item: names[i], after: names[i + 1], salarySectionOrder: names.slice(Math.max(0, i - 3), i + 3) };
await page.screenshot({ path: join(here, "round5-1280-ceo-conversion.png"), fullPage: true });
// the Export page keeps its banner and shares the renamed columns
await page.goto(`${BASE}#/proposed/conversion-export`);
await page.locator("[data-proposed-banner]").waitFor();
res.flows.conv_export = { banner: await page.locator("[data-proposed-banner]").count(), headers: (await page.locator("table thead").innerText()).replace(/\s+/g, " ").trim() };
await ctx.close();

// ---- 375: no horizontal page scroll
for (const role of ["CEO"]) {
  const c2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c2.newPage();
  hook(p, `375-${role}`);
  await setRole(p, role);
  await p.setViewportSize({ width: 375, height: 812 });
  const hs = {};
  for (const [slug] of PAGES) {
    await p.goto(`${BASE}#/${slug}`);
    await p.waitForTimeout(500);
    hs[slug] = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    await p.screenshot({ path: join(here, `round5-375-ceo-${slug.replace("/", "-")}.png`), fullPage: true });
  }
  res.flows[`hscroll_375_${role}`] = hs;
  await c2.close();
}
res.consoleProblems = problems;
res.networkRequests = requests;
console.log(JSON.stringify(res, null, 1));
await browser.close();
