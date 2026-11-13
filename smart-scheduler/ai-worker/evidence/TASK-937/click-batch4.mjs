// TASK-937 batch 4 evidence (Flash): Stock Report + Low Stock + Stock Demo in the BUILT final-ui (file://, offline): roles, console, network, flows, shots, 375 px.
// Run: DIST=<dist/index.html> PW_PATH=... node click-batch4.mjs
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
const setRole = async (page, role) => { await page.goto(`${BASE}#/`); await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 }); await page.getByText(role, { exact: true }).first().click(); await page.waitForTimeout(300); };
const PAGES = [["stock/reports", "Stock Report"], ["stock/low-stock", "Low Stock"], ["stock/demo", "Stock Demo"]];

for (const role of ["CEO", "Admin", "Coach"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  hook(page, role);
  await setRole(page, role);
  const out = [];
  for (const [slug, title] of PAGES) {
    await page.goto(`${BASE}#/${slug}`);
    await page.waitForTimeout(400);
    const h = (await page.locator("h2").first().innerText().catch(() => "")).trim();
    out.push(`${slug}:${h === title ? "opens" : "cannot-see"}`);
  }
  res.roles[role] = out;
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
hook(page, "flows");
await setRole(page, "CEO");
const text = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
const rowsOf = (sel) => page.locator(`${sel} tbody tr`).count();

// ---- Stock Report
await page.goto(`${BASE}#/stock/reports`);
await page.locator("[data-movement-table]").waitFor();
res.flows.report_movement_oct = await rowsOf("[data-movement-table]");
res.flows.report_caption = (await page.locator("[data-period-caption]").innerText()).trim();
await page.screenshot({ path: join(here, "batch4-1280-ceo-stock-report-movement.png"), fullPage: true });
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "Adjustment", exact: true }).click();
res.flows.report_type_adjustment = await rowsOf("[data-movement-table]");
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "Sale", exact: true }).click();
res.flows.report_type_sale = await rowsOf("[data-movement-table]");
await page.getByRole("tab", { name: "Sales History" }).click();
await page.locator("[data-sales-table]").waitFor();
res.flows.report_sales_rows = await rowsOf("[data-sales-table]");
res.flows.report_walkin = (await text()).includes("Walk-in");
await page.getByRole("combobox", { name: "Customer" }).click();
const custOptions = await page.getByRole("option").allInnerTexts();
res.flows.report_customers = custOptions;
await page.getByRole("option", { name: "น้องข้าวหอม" }).click();
res.flows.report_sales_one_customer = await rowsOf("[data-sales-table]");
await page.screenshot({ path: join(here, "batch4-1280-ceo-stock-report-sales.png"), fullPage: true });
await page.getByRole("tab", { name: "Balance" }).click();
await page.locator("[data-balance-table]").waitFor();
res.flows.report_balance_rows = await rowsOf("[data-balance-table]");
res.flows.report_balance_note = (await page.locator("[data-balance-note]").innerText()).trim();
res.flows.report_no_location_col = !(await page.locator("[data-balance-table] thead").innerText()).toLowerCase().includes("location");
await page.screenshot({ path: join(here, "batch4-1280-ceo-stock-report-balance.png"), fullPage: true });
// period: Day, Custom with From > To, reset
await page.getByRole("tab", { name: "Movement" }).click();
await page.getByText("Day", { exact: true }).click();
await page.waitForTimeout(300);
res.flows.report_day_caption = (await page.locator("[data-period-caption]").innerText()).trim();
await page.getByText("Custom", { exact: true }).click();
await page.waitForTimeout(200);
res.flows.report_custom_caption = (await page.locator("[data-period-caption]").innerText()).trim();

// ---- Low Stock
await page.goto(`${BASE}#/stock/low-stock`);
await page.locator("[data-low-count]").waitFor();
res.flows.low_default = { count: (await page.locator("[data-low-count]").innerText()).trim(), rows: await page.locator("[data-low-row]").count(), settingRows: await page.locator("[data-type-row]").count() };
res.flows.low_default_defaults = await page.locator("[data-type-row] input").evaluateAll((els) => els.map((e) => e.value));
await page.screenshot({ path: join(here, "batch4-1280-ceo-low-stock.png"), fullPage: true });
await page.getByLabel("Alert (Unit) of F&B").fill("5");
await page.getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(300);
res.flows.low_after_fnb5 = { count: (await page.locator("[data-low-count]").innerText()).trim(), rows: await page.locator("[data-low-row]").count() };
await page.getByLabel("Alert (Unit) of Miller").fill("");
await page.getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(300);
res.flows.low_after_miller_empty = { count: (await page.locator("[data-low-count]").innerText()).trim(), none: (await text()).includes("No product is low") };
await page.getByLabel("Alert (Unit) of Other").fill("5");
await page.getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(300);
res.flows.low_after_other5 = { count: (await page.locator("[data-low-count]").innerText()).trim(), rows: await page.locator("[data-low-row]").count() };

// ---- Stock Demo
await page.goto(`${BASE}#/stock/demo`);
await page.getByRole("button", { name: "Move A → B" }).waitFor();
const demoRows0 = await page.locator("table").first().locator("tbody tr").count();
const histRows0 = await page.locator("table").nth(1).locator("tbody tr").count();
await page.screenshot({ path: join(here, "batch4-1280-ceo-demo.png"), fullPage: true });
// Move: needs a reason
await page.getByRole("button", { name: "Move A → B" }).click();
await page.getByRole("dialog").getByRole("button", { name: "Move", exact: true }).click();
res.flows.demo_move_needs_reason = (await page.locator(".mantine-Notification-description").last().innerText()).trim();
await page.getByRole("dialog").getByPlaceholder("Why?").fill("Lesson at STA");
await page.getByRole("dialog").getByRole("button", { name: "Move", exact: true }).click();
await page.waitForTimeout(400);
res.flows.demo_move_hist = [histRows0, await page.locator("table").nth(1).locator("tbody tr").count()];
// Delete whole item
await page.getByRole("button", { name: "Delete", exact: true }).click();
await page.getByLabel("Remove this item from every location").check();
res.flows.demo_whole_hides_site_and_qty = (await page.getByRole("dialog").getByText("Qty", { exact: true }).count()) === 0;
await page.getByRole("dialog").getByPlaceholder("Why?").fill("Broken beyond use");
await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
await page.waitForTimeout(400);
res.flows.demo_rows = [demoRows0, await page.locator("table").first().locator("tbody tr").count()];
// Defect -> Demo
await page.getByRole("button", { name: "More" }).click();
await page.getByRole("menuitem", { name: "Defect Product → Demo" }).click();
await page.getByRole("dialog").getByPlaceholder(/wheel cracked/).fill("Scratched, fine for teaching");
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(400);
res.flows.demo_defect_hist = await page.locator("table").nth(1).locator("tbody tr").count();
// Add location + order
await page.getByRole("button", { name: "More" }).click();
await page.getByRole("menuitem", { name: "Add Location" }).click();
await page.getByRole("dialog").getByLabel("Location").fill("ISB");
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(300);
res.flows.demo_isb_column = (await page.locator("table").first().locator("thead").innerText()).includes("ISB");
await page.getByRole("button", { name: "More" }).click();
await page.getByRole("menuitem", { name: "Location Order" }).click();
await page.getByRole("button", { name: "Move ISB up" }).click();
await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: join(here, "batch4-1280-ceo-demo-after.png"), fullPage: true });
await ctx.close();

// ---- 375 px: no horizontal page scroll (CEO and Admin)
for (const role of ["CEO", "Admin"]) {
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
    if (role === "CEO") await p.screenshot({ path: join(here, `batch4-375-ceo-${slug.replace("/", "-")}.png`), fullPage: true });
  }
  res.flows[`hscroll_375_${role}`] = hs;
  await c2.close();
}
res.consoleProblems = problems;
res.networkRequests = requests;
console.log(JSON.stringify(res, null, 1));
await browser.close();
