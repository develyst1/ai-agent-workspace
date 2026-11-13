// TASK-891 evidence (Flash): the ECA Payment screen against the dev FAKE (USE_FAKE_REVENUE=true for this run only), BF on :3310 with
// NEXT_PUBLIC_BACKOFFICE_API_URL forced to a local URL (.env.local points at a real server). A local dummy route-guard cookie, no credential.
// Proves layout/render/form behaviour incl. the live Total Amount, validation, save -> history. NOT the real API (TASK-890).
// Run: PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = process.env.BASE ?? "http://localhost:3310";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task891-evidence", role: "ceo" })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = { runs: [] };
for (const [w, h] of [[1280, 900], [768, 1024], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  const shot = (n) => page.screenshot({ path: join(here, `fake-${w}-${n}.png`), fullPage: true });
  const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const total = async () => (await page.getByText("Total Amount", { exact: true }).first().locator("xpath=following-sibling::*[1]").innerText()).trim();
  const run = { width: w, hscroll: {} };

  await page.goto(`${BASE}/revenue/eca`);
  await page.getByText("ECA Payment History").waitFor();
  await page.getByText("30/10/26").waitFor({ timeout: 15000 });
  run.historyRowsBefore = await page.locator("tbody tr").count();
  run.totalEmpty = await total();
  run.hscroll.form = await hscroll();

  // validation: Save with everything empty
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("Choose a school").waitFor();
  run.validation = (await page.locator("form, body").first().innerText()).includes("Enter the term");
  await shot("2-validation");

  // fill: STA · Term 3 · 400 ฿ × 18 × 5  ⇒ 36,000 ฿ (live)
  await page.getByRole("combobox", { name: "School" }).click();
  await page.getByRole("option", { name: "STA", exact: true }).click();
  await page.getByLabel("Term", { exact: true }).fill("Term 3");
  await page.getByLabel("Price per class").fill("400");
  await page.getByLabel("Student").fill("18");
  await page.getByLabel("Class / Term").fill("5");
  await page.waitForTimeout(300);
  run.totalLive = await total();
  await shot("1-form-total");

  // overflow guard: 1,000,000 ฿ × 1,000 × 1 does not fit a 32-bit int
  await page.getByLabel("Price per class").fill("1000000");
  await page.getByLabel("Student").fill("1000");
  await page.getByLabel("Class / Term").fill("1");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("The total is too large").waitFor();
  run.overflowMessage = true;
  // back to the good numbers, save
  await page.getByLabel("Price per class").fill("400");
  await page.getByLabel("Student").fill("18");
  await page.getByLabel("Class / Term").fill("5");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("ECA payment saved").waitFor({ timeout: 15000 });
  run.note = (await page.getByText("ECA payment saved").locator("xpath=..").innerText()).replace(/\s+/g, " ");
  await page.waitForFunction(() => document.querySelectorAll("tbody tr").length >= 3, null, { timeout: 15000 });
  run.historyRowsAfter = await page.locator("tbody tr").count();
  run.firstRow = (await page.locator("tbody tr").first().innerText()).replace(/\s+/g, " ");
  run.formCleared = (await page.getByLabel("Term", { exact: true }).inputValue()) === "";
  await shot("3-history-after-save");

  // the Summary header offers the screen
  await page.goto(`${BASE}/revenue/summary`);
  await page.getByText("Total Revenue").or(page.getByText("No revenue in this period")).first().waitFor();
  run.summaryLink = await page.getByRole("link", { name: "ECA Payment" }).count();

  run.pageErrors = errors;
  out.runs.push(run);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
