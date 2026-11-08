// TASK-859 error-state evidence (Flash). Fake OFF, API URL forced to http://localhost:4310/api where nothing listens,
// so every call fails with the transport error: proves the error state + Retry on all four screens.
// Run: PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot-error.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = process.env.BASE ?? "http://localhost:3310";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task859-evidence", role: "ceo" })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
const page = await ctx.newPage();
const out = {};
for (const [name, path] of [["summary", "/revenue/summary"], ["detail", "/revenue/detail"], ["manual", "/revenue/manual"], ["categories", "/revenue/categories"]]) {
  await page.goto(`${BASE}${path}`);
  if (name === "manual") {
    await page.getByRole("combobox", { name: "Type" }).click();
    await page.getByRole("option", { name: "OTHER", exact: true }).click();
  }
  // The shared QueryClient retries a failed call a few times before the error state shows; wait for the Retry button.
  if (name !== "manual") await page.screenshot({ path: join(here, `loading-1280-${name}.png`), fullPage: true });
  const retry = page.getByRole("button", { name: "Retry" });
  await retry.waitFor({ timeout: 40000 });
  out[name] = { message: (await retry.locator("xpath=preceding-sibling::*[1]").innerText()).replace(/\s+/g, " "), retryButton: await retry.count() };
  await page.screenshot({ path: join(here, `error-1280-${name}.png`), fullPage: true });
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
