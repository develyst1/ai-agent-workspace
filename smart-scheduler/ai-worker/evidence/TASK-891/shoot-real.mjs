// TASK-891 REAL-API run (Flash, 2026-11-09): BF on :3310 (fake OFF, NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api) → a LOCAL BB on :4310
// (SKIP_ADMIN_AUTH=true, DATABASE_URL host = sid, checked). Writes exactly ONE ECA line on sid, term `C-TEST flash 891` (kept: nothing deletes it).
// GUARD: it reads first and refuses to write if that term already exists. Run: PW_PATH=... node shoot-real.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = "http://localhost:3310", API = "http://localhost:4310/api/v1/revenue", TERM = "C-TEST flash 891";
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
const from = new Date(Date.now() - 300 * 864e5).toISOString().slice(0, 10), to = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const before = (await (await fetch(`${API}/lines?from=${from}&to=${to}&type=ECA`)).json()).lines;
if (before.some((l) => l.productName === TERM)) { console.log(JSON.stringify({ refused: "the C-TEST line already exists; not writing a second one", ecaLinesBefore: before.length })); process.exit(0); }
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task891-evidence", role: "ceo" })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
const out = { today, ecaLinesBefore: before.length };
await page.goto(`${BASE}/revenue/eca`);
await page.getByText("ECA Payment History").waitFor();
await page.getByRole("combobox", { name: "School" }).waitFor();
await page.waitForTimeout(1500);
out.historyBefore = (await page.locator("tbody tr").count());
await page.getByRole("button", { name: "Save" }).click();
await page.getByText("Choose a school").waitFor();
await page.screenshot({ path: join(here, "real-1280-1-validation.png"), fullPage: true });

await page.getByRole("combobox", { name: "School" }).click();
await page.getByRole("option", { name: "STA", exact: true }).click();
await page.getByLabel("Term", { exact: true }).fill(TERM);
await page.getByLabel("Price per class").fill("10");
await page.getByLabel("Student").fill("2");
await page.getByLabel("Class / Term").fill("3");
await page.waitForTimeout(300);
out.totalLive = (await page.getByText("Total Amount", { exact: true }).first().locator("xpath=following-sibling::*[1]").innerText()).trim();
await page.screenshot({ path: join(here, "real-1280-2-form-total.png"), fullPage: true });
await page.getByRole("button", { name: "Save" }).click();       // THE ONE WRITE
await page.getByText("ECA payment saved").waitFor({ timeout: 30000 });
out.note = (await page.getByText("ECA payment saved").locator("xpath=..").innerText()).replace(/\s+/g, " ");
await page.getByText(TERM).first().waitFor({ timeout: 30000 });
out.firstHistoryRow = (await page.locator("tbody tr").first().innerText()).replace(/\s+/g, " ");
out.historyAfter = await page.locator("tbody tr").count();
await page.screenshot({ path: join(here, "real-1280-3-saved-history.png"), fullPage: true });
out.pageErrors = errors;
await browser.close();
// read back what sid now holds (GET only)
const after = (await (await fetch(`${API}/lines?from=${from}&to=${to}&type=ECA`)).json()).lines.filter((l) => l.productName === TERM);
out.readBack = after.map((l) => ({ id: l.id, occurredOn: l.occurredOn, branch: l.branch, categoryName: l.categoryName, amountMinor: l.amountMinor, method: l.method, remark: l.remark, source: l.source }));
console.log(JSON.stringify(out, null, 2));
