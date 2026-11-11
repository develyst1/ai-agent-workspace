// TASK-891 error/loading evidence (Flash): fake OFF, API URL forced to http://localhost:4310/api where nothing listens ⇒ every call fails.
// Run: PW_PATH=... node shoot-error.mjs   (BF on :3310 started with NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api)
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = "http://localhost:3310";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task891-evidence", role: "ceo" })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
const page = await ctx.newPage();
await page.goto(`${BASE}/revenue/eca`);
await page.getByRole("status").first().waitFor({ timeout: 15000 });
await page.screenshot({ path: join(here, "loading-1280.png"), fullPage: true });
// the shared QueryClient retries a few times before the error shows
await page.getByRole("button", { name: "Retry" }).first().waitFor({ timeout: 60000 });
const retries = await page.getByRole("button", { name: "Retry" }).count();
const msgs = await page.getByRole("alert").allInnerTexts();
await page.screenshot({ path: join(here, "error-1280.png"), fullPage: true });
console.log(JSON.stringify({ retryButtons: retries, alerts: msgs.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean) }, null, 2));
await browser.close();
