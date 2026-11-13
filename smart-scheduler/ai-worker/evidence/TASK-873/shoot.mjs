// TASK-873 evidence (Flash): wording + zero-refund colour, against the dev FAKE (USE_FAKE_REVENUE=true for this run only).
// Proves render + computed colour of the Refund cell for a 0 day (15/10/26) and a -5,000 day (16/10/26). Not API behaviour.
// Run: PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot.mjs   (BF on :3310, API URL forced local)
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = "http://localhost:3310";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task873-evidence", role: "ceo" })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
const page = await ctx.newPage();
const out = {};
const pick = async (day) => {
  await page.goto(`${BASE}/revenue/summary`);
  await page.getByRole("button", { name: "Date" }).click();
  await page.evaluate(async (d) => {
    document.querySelector('[data-direction="previous"]').click();
    await new Promise((r) => setTimeout(r, 300));
    [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === d && !b.hasAttribute("data-outside")).click();
  }, String(day));
  await page.getByRole("button", { name: "Apply filters" }).click();
  await page.getByText("Total Revenue").waitFor();
};
const refundCell = () => page.getByText("Refund (Expense)").locator("xpath=following-sibling::td[1]");
const colour = async () => ({ text: (await refundCell().innerText()).trim(), color: await refundCell().evaluate((e) => getComputedStyle(e).color) });
const bodyColor = await page.evaluate(() => getComputedStyle(document.body).color);

await pick(15);
out.zeroRefund = await colour(); out.bodyColor = bodyColor;
out.heading = (await page.locator("h1.text-2xl").innerText()).trim(); // the page's own h1 (the shell header is another h1)
await page.screenshot({ path: join(here, "1-summary-zero-refund.png"), fullPage: true });
await pick(16);
out.minusRefund = await colour();
await page.screenshot({ path: join(here, "2-summary-minus-refund.png"), fullPage: true });

// Detail: the link back to the page is now "Summary"; the −5,000 row is red
await page.goto(`${BASE}/revenue/detail?from=2026-10-16&to=2026-10-16`);
await page.getByText("Total Revenue (").waitFor();
out.detailLink = await page.getByRole("link", { name: "Summary" }).count();
out.detailRefundRow = (await page.getByText("Refund (Expense)").locator("xpath=..").innerText()).replace(/\s+/g, " ");
await page.screenshot({ path: join(here, "3-detail-minus-refund.png"), fullPage: true });

await page.goto(`${BASE}/revenue/manual`);
out.manualLink = await page.getByRole("link", { name: "Summary" }).count();

await page.goto(`${BASE}/revenue/categories`);
await page.getByText("Other Type").waitFor();
out.addButton = await page.getByRole("button", { name: "Add", exact: true }).count();
out.addCategoryButton = await page.getByRole("button", { name: "Add category", exact: true }).count();
await page.screenshot({ path: join(here, "4-categories-add-button.png"), fullPage: true });
await page.getByRole("button", { name: "Add", exact: true }).click();
out.dialogTitle = (await page.getByRole("dialog").locator("h2").innerText()).trim();
await browser.close();
console.log(JSON.stringify(out, null, 2));
