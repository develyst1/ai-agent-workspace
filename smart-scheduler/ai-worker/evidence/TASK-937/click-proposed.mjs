// TASK-937 evidence (Flash): clicks every control of the 7 PROPOSED pages in the BUILT single file (file://, offline), as CEO, and reports console errors / warnings.
// Run: DIST=<path to dist/index.html> PW_PATH=... node click-proposed.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const URL0 = pathToFileURL(process.env.DIST).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const problems = [];
const requests = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on("request", (r) => { if (!r.url().startsWith("file:") && !r.url().startsWith("data:")) requests.push(r.url().slice(0, 100)); });
const res = {};
const go = async (slug) => { await page.goto(`${URL0}#/proposed/${slug}`); await page.locator("[data-proposed-banner]").waitFor({ timeout: 15000 }); };
const toast = async () => (await page.locator(".mantine-Notification-description").last().innerText()).trim();

await page.goto(`${URL0}#/`);
await page.getByText("CEO", { exact: true }).first().click();

// 1 Payment Setting
await go("payment-setting");
res.p1_banner = (await page.locator("[data-proposed-banner]").innerText()).replace(/\s+/g, " ");
await page.getByRole("button", { name: "Edit" }).click();
const inputs = page.getByRole("textbox");
res.p1_inputs = await inputs.count();
await page.getByLabel("Extra Hour — Rate per hour").fill("400");
await page.getByRole("button", { name: "Save" }).click();
res.p1_savedToast = await toast();
res.p1_showsNew = (await page.locator("body").innerText()).includes("400 ฿");
await page.getByRole("button", { name: "Edit" }).click();
await page.getByLabel("Extra Hour — Rate per hour").fill("999");
await page.getByRole("button", { name: "Cancel" }).click();
res.p1_cancelKeeps400 = (await page.locator("body").innerText()).includes("400 ฿") && !(await page.locator("body").innerText()).includes("999");

// 2 Conversion + filters
await go("conversion");
res.p2_total_all = (await page.locator("[data-conv-total]").innerText()).replace(/\s+/g, " ");
await page.getByRole("combobox", { name: "Coach" }).click();
await page.getByRole("option", { name: "Pete", exact: true }).click();
res.p2_total_pete = (await page.locator("[data-conv-total]").innerText()).replace(/\s+/g, " ");
await page.getByRole("button", { name: "Reset" }).click();
res.p2_total_reset = (await page.locator("[data-conv-total]").innerText()).replace(/\s+/g, " ");

// 3 Conversion export
await go("conversion-export");
res.p3_rowsOct = await page.locator("tbody tr").count();
await page.getByRole("button", { name: "Excel" }).click();
res.p3_excelToast = await toast();
await page.getByRole("button", { name: "PDF" }).click();
res.p3_pdfToast = await toast();
await page.getByRole("button", { name: "Next month" }).click();
res.p3_rowsNov = await page.locator("tbody tr").count();

// 4 Revenue Summary export
await go("revenue-export");
await page.getByRole("button", { name: "Excel" }).click();
res.p4_excelToast = await toast();
res.p4_total_mtd_shown = (await page.locator("tfoot").innerText()).replace(/\s+/g, " ");

// 5 Move course
await go("move-course");
res.p5_before = await page.locator("[data-course-card='k1'] [data-branch]").innerText();
await page.locator("[data-course-card='k1']").getByRole("button", { name: /Move course to branch/ }).click();
await page.getByRole("dialog").getByRole("button", { name: "Move", exact: true }).click();
res.p5_after = await page.locator("[data-course-card='k1'] [data-branch]").innerText();
res.p5_toast = await toast();

// 6 Stock report filters
await go("stock-report");
res.p6_rows_all = await page.locator("tbody tr").count();
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "Sale", exact: true }).click();
res.p6_rows_sale = await page.locator("tbody tr").count();
await page.getByRole("button", { name: "Reset" }).click();
await page.getByRole("textbox", { name: "Search" }).fill("helmet");
await page.getByRole("button", { name: "Search" }).click();
res.p6_rows_helmet = await page.locator("tbody tr").count();
await page.getByRole("textbox", { name: "Search" }).fill("zzz");
await page.getByRole("button", { name: "Search" }).click();
res.p6_nomatch = (await page.locator("body").innerText()).includes("No movement matches");
await page.getByRole("tab", { name: "Balance" }).click();
res.p6_balanceTab = (await page.locator("body").innerText()).includes("Balance is as built");

// 7 Report Revenue + Conversion
await go("report-revenue-conversion");
res.p7_banner = (await page.locator("[data-proposed-banner]").innerText()).replace(/\s+/g, " ");
await page.getByRole("button", { name: "Excel" }).click();
await page.getByText("report-revenue.xlsx").first().waitFor({ timeout: 10000 });
res.p7_excel_rev = (await page.getByText("report-revenue.xlsx").first().innerText()).trim();
await page.getByRole("tab", { name: "Report Conversion" }).click();
await page.getByRole("button", { name: "Excel" }).click();
res.p7_excel_conv = await toast();
res.p7_convRows = await page.locator("tbody tr").count();

res.consoleProblems = problems;
res.networkRequests = requests;
console.log(JSON.stringify(res, null, 1));
await browser.close();
