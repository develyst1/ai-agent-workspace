// TASK-894 evidence (Flash): the Refund screen against the dev FAKE (USE_FAKE_REVENUE=true for this run only), BF on :3310 with
// NEXT_PUBLIC_BACKOFFICE_API_URL forced local (.env.local points at a real server). Local dummy route-guard cookie, no credential.
// NO REAL REFUND is possible here: a real one cancels a plan and tells a family (TASK-894 DoD: the real run is Tanya's, on sid, C-TEST plan).
// Run: PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = process.env.BASE ?? "http://localhost:3310";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task894-evidence", role: "ceo" })}.x`;
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
  const body = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
  const pickSale = async (re) => { await page.getByRole("combobox", { name: "From" }).click(); await page.getByRole("option", { name: re }).first().click(); };
  const run = { width: w, hscroll: {} };

  await page.goto(`${BASE}/revenue/refund`);
  await page.getByText("Refund Record").waitFor();
  run.saveDisabledAtStart = await page.getByRole("button", { name: "Save", exact: true }).isDisabled();
  run.hscroll.start = await hscroll();
  await shot("1-start");

  // pick a course: amount defaults to the fee, the record + session boxes fill in
  await pickSale(/Inline Private 10 Hr/);
  await page.getByText("Cancelled on save").waitFor();
  run.afterPick = { amount: await page.getByLabel("Amount").inputValue(), recordRefund: (await body()).match(/Refund\) EXPENSE (−[\d,]+ ฿)/)?.[1] ?? null, session: (await body()).match(/Attended \d+ Kept Not attended yet \d+ Cancelled on save/)?.[0] ?? null };
  run.hscroll.pick = await hscroll();
  await shot("2-pick");

  // over the fee: the field's `max` clamps it back to the fee when the user leaves it (the API refuses over-fee anyway)
  await page.getByLabel("Amount").fill("9501");
  await page.getByLabel("Amount").press("Tab");
  run.overFeeClampedTo = await page.getByLabel("Amount").inputValue();
  // zero is refused on the form
  await page.getByLabel("Amount").fill("0");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByText("Enter an amount above 0").waitFor();
  run.zeroRefused = true;
  await page.getByLabel("Amount").fill("9500");

  // Save → confirm
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByText("Save this refund?").waitFor();
  await page.waitForTimeout(500);
  run.confirmText = (await page.getByRole("dialog").innerText()).replace(/\s+/g, " ");
  await shot("3-confirm");
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
  await page.getByText(/Refund saved/).waitFor({ timeout: 15000 });
  run.saved = { note: (await page.getByText(/Refund saved/).innerText()).replace(/\s+/g, " "), badgeRefunded: await page.getByText("Refunded", { exact: true }).count(), saveDisabled: await page.getByRole("button", { name: "Save", exact: true }).isDisabled(), cancelledBadge: await page.getByText("Cancelled", { exact: true }).count() };
  run.hscroll.saved = await hscroll();
  await shot("4-saved");

  // an already-refunded sale: marked, Save disabled
  await pickSale(/already refunded/);
  await page.getByText("This sale has already been refunded").first().waitFor();
  run.alreadyRefunded = { saveDisabled: await page.getByRole("button", { name: "Save", exact: true }).isDisabled(), badge: await page.getByText("Refunded", { exact: true }).count() };
  await shot("5-already-refunded");

  // refusals the API gives at save time
  const refuse = async (re, expect_) => {
    await pickSale(re);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
    await page.getByRole("alert").filter({ hasText: expect_ }).waitFor({ timeout: 15000 });
    return true;
  };
  run.r409 = await refuse(/refunded elsewhere/, "This sale has already been refunded");
  await shot("6-409-already-refunded");
  run.r502 = await refuse(/scheduler down/, "Could not cancel the sessions; nothing was saved");
  await shot("7-502");
  run.r503 = await refuse(/not configured/, "Not configured");

  run.summaryLink = await (async () => { await page.goto(`${BASE}/revenue/summary`); await page.getByText("Total Revenue").or(page.getByText("No revenue in this period")).first().waitFor(); return page.getByRole("link", { name: "Refund" }).count(); })();
  run.pageErrors = errors;
  out.runs.push(run);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
