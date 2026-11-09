// TASK-859 real-API evidence (Flash). Fake OFF; BF on :3310 with NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api;
// BB on :4310 started with SKIP_ADMIN_AUTH=true (local process, dev ceo, no token). BB's DATABASE_URL host = sid (checked).
// Writes on sid = Team C test data only, exactly one line `[C-TEST] …` (branch Other) and one category `C-TEST flash 859`.
// Guarded: it reads first and refuses to write a second time. Run: PW_PATH=<front>/node_modules/playwright/index.mjs node shoot-real.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = "http://localhost:3310", API = "http://localhost:4310/api/v1/revenue";
const REMARK = "[C-TEST] flash TASK-859 evidence", CAT = "C-TEST flash 859";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task859-evidence", role: "ceo" })}.x`;
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
const out = { today, wrote: {} };

const cats = (await (await fetch(`${API}/categories?type=OTHER&includeInactive=true`)).json()).categories;
const lines = (await (await fetch(`${API}/lines?from=${today}&to=${today}&branch=OTHER`)).json()).lines;
const haveCat = cats.some((c) => c.name === CAT), haveLine = lines.some((l) => (l.remark ?? "").startsWith("[C-TEST]"));
out.before = { haveCat, haveLine };
if (haveCat || haveLine) { console.log(JSON.stringify({ ...out, refused: "test data already exists; not writing a second one" }, null, 2)); process.exit(0); }

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
const shot = (n) => page.screenshot({ path: join(here, `real-1280-${n}.png`), fullPage: true });

// 1 Summary (read) — all 8 rows from the real API
await page.goto(`${BASE}/revenue/summary`);
// An empty ledger shows the empty state ("No revenue in this period"), not the table; either is a valid render.
await page.getByText(/Total Revenue|No revenue in this period/).first().waitFor({ timeout: 40000 });
out.summaryRowsBefore = await page.locator("tbody tr").count();
out.summaryBeforeText = (await page.getByText(/Total Revenue|No revenue in this period/).first().innerText()).trim();
await shot("1-summary-before");

// 3 Add Manually, validation (no write)
await page.goto(`${BASE}/revenue/manual`);
await page.getByRole("button", { name: "Save" }).click();
await page.getByText("Choose a type").waitFor();
await shot("3-manual-validation");

// 4 Type and Category, dialog open (no write)
await page.goto(`${BASE}/revenue/categories`);
await page.getByRole("button", { name: "Add category" }).click();
await page.getByLabel("New category").fill("C-TEST preview only");
await page.getByText("Other Type").waitFor({ timeout: 40000 }); // the real tree has loaded behind the dialog
await shot("4-categories-dialog");
await page.getByRole("button", { name: "Cancel" }).click();

// WRITE 1: one manual line (Other branch, [C-TEST])
await page.goto(`${BASE}/revenue/manual`);
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "OTHER", exact: true }).click();
await page.getByRole("combobox", { name: "Category" }).click();
await page.getByRole("option", { name: "Shirt", exact: true }).click();
await page.getByLabel("Amount").fill("100");
await page.getByRole("combobox", { name: "Branch" }).click();
await page.getByRole("option", { name: "Other", exact: true }).click();
await page.getByLabel("Remark").fill(REMARK);
await page.getByRole("button", { name: "Save" }).click();
await page.waitForURL(/\/revenue\/detail\?from=/, { timeout: 40000 });
await page.getByText(REMARK).waitFor();
out.wrote.line = page.url().replace(BASE, "");
await shot("5-manual-saved-detail");

// WRITE 2: one category, then the same name again → 409 message
await page.goto(`${BASE}/revenue/categories`);
await page.getByRole("button", { name: "Add category" }).click();
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "OTHER", exact: true }).click();
await page.getByLabel("New category").fill(CAT);
await page.getByRole("button", { name: "Save" }).click();
await page.getByText(CAT).first().waitFor({ timeout: 40000 });
out.wrote.category = CAT;
await page.getByRole("button", { name: "Add category" }).click();
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "OTHER", exact: true }).click();
await page.getByLabel("New category").fill(CAT);
await page.getByRole("button", { name: "Save" }).click();
await page.getByText("This category already exists").waitFor({ timeout: 40000 });
out.conflictShown = true;
await shot("4b-categories-409");

// 2 Detail with a filter applied (type OTHER, branch Other, today) — shows the written line and the real totals
await page.goto(`${BASE}/revenue/detail?from=${today}&to=${today}&type=OTHER&branch=OTHER`);
await page.getByText("Total Revenue (").waitFor({ timeout: 40000 });
out.detailTotals = (await page.getByText("Total Revenue (").locator("xpath=..").innerText()).replace(/\s+/g, " ");
await shot("2-detail-filtered");

// 1b Summary after the write: OTHER row moved by 100 ฿
await page.goto(`${BASE}/revenue/summary`);
await page.getByText("Total Revenue").waitFor({ timeout: 40000 });
out.summaryAfter = (await page.locator("tbody tr").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim());
await shot("1b-summary-after");

out.consoleErrors = errors;
await browser.close();
console.log(JSON.stringify(out, null, 2));
