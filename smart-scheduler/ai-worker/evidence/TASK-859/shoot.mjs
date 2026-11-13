// TASK-859 evidence harness (Flash). Reads the running app from the outside; writes only into this folder.
// Proves: the four screens render at 1280/768/375 against the dev FAKE (USE_FAKE_REVENUE=true), with their states.
// Does NOT prove: behaviour against the real API (the fake resolves instantly and returns one shape).
// Run: PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs BASE=http://localhost:3310 node shoot.mjs <tag>
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = process.env.BASE ?? "http://localhost:3310";
const TAG = process.argv[2] ?? "fake";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task859-evidence", role: "ceo" })}.x`; // local dummy; never a real credential

const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = { tag: TAG, runs: [] };
for (const [w, h] of [[1280, 900], [768, 1024], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  const shot = (name) => page.screenshot({ path: join(here, `${TAG}-${w}-${name}.png`), fullPage: true });
  const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const run = { width: w, hscroll: {} };

  // 1 Summary, all 8 rows (example day 16/10/26)
  await page.goto(`${BASE}/revenue/summary`);
  await page.getByRole("button", { name: "Date" }).click();
  await page.evaluate(async () => {
    document.querySelector('[data-direction="previous"]').click();
    await new Promise((r) => setTimeout(r, 300));
    [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "16" && !b.hasAttribute("data-outside")).click();
  });
  await page.getByRole("button", { name: "Apply filters" }).click();
  await page.getByText("Total Revenue").waitFor();
  run.summaryRows = await page.locator("tbody tr").count();
  run.hscroll.summary = await hscroll();
  await shot("1-summary");

  // 2 Detail with a filter applied (type SALES, 14–16/10/26 via the Summary's View link shape)
  await page.goto(`${BASE}/revenue/detail?from=2026-10-14&to=2026-10-16&type=SALES`);
  await page.getByText("Total Revenue (").waitFor();
  run.detailRows = await page.locator("tbody tr").count();
  run.hscroll.detail = await hscroll();
  // Review 1: no column may be clipped by the card. The table must fit its scroll viewport at 1280 (and 768).
  run.detailTableFits = await page.evaluate(() => {
    const t = document.querySelector("table");
    const vp = t.closest(".mantine-ScrollArea-viewport") ?? t.parentElement;
    return { tableWidth: Math.round(t.getBoundingClientRect().width), viewportWidth: Math.round(vp.clientWidth), scrolls: vp.scrollWidth > vp.clientWidth + 1 };
  });
  await shot("2-detail-filtered");
  // Review 1: Total Revenue (revenueMinor) + Refund (Expense) (refundsMinor) rows, example day with a refund
  await page.goto(`${BASE}/revenue/detail?from=2026-10-16&to=2026-10-16`);
  await page.getByText("Total Revenue (").waitFor();
  run.detailTotals = (await page.locator("tbody tr").last().innerText()).replace(/\s+/g, " ") + " | " + (await page.getByText("Total Revenue (").locator("xpath=..").innerText()).replace(/\s+/g, " ");
  await shot("2b-detail-with-refund");

  // 3 Add Manually, validation message
  await page.goto(`${BASE}/revenue/manual`);
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("Choose a type").waitFor();
  run.hscroll.manual = await hscroll();
  await shot("3-manual-validation");

  // 4 Type and Category with the add dialog open, then the 409 message
  await page.goto(`${BASE}/revenue/categories`);
  await page.getByRole("button", { name: "Add category" }).click();
  await page.getByLabel("New category").fill("Roller derby");
  await shot("4-categories-dialog");
  await page.getByRole("combobox", { name: "Type" }).click();
  await page.getByRole("option", { name: "OTHER", exact: true }).click();
  await page.getByLabel("New category").fill("Shirt");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("This category already exists").waitFor();
  run.conflictShown = true;
  await shot("4b-categories-409");
  run.hscroll.categories = await hscroll();

  // 5 Add Manually happy path: save → lands on Detail for that date showing the new line
  await page.goto(`${BASE}/revenue/manual`);
  await page.getByRole("combobox", { name: "Type" }).click();
  await page.getByRole("option", { name: "OTHER", exact: true }).click();
  await page.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option", { name: "Shirt", exact: true }).click();
  await page.getByLabel("Amount").fill("1250");
  await page.getByLabel("Remark").fill("TASK-859 evidence line");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/revenue\/detail\?from=/);
  await page.getByText("TASK-859 evidence line").waitFor();
  run.savedLandedOn = page.url().replace(BASE, "");
  await shot("5-manual-saved-detail");

  run.consoleErrors = errors;
  out.runs.push(run);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
