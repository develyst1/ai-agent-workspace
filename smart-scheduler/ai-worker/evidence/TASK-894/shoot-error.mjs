// TASK-894 error-state evidence (Flash): fake OFF, API URL http://localhost:4310/api where nothing listens ⇒ the pick list's call fails.
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = "http://localhost:3310";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task894-evidence", role: "ceo" })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
const page = await ctx.newPage();
await page.goto(`${BASE}/revenue/refund`);
await page.getByRole("button", { name: "Retry" }).first().waitFor({ timeout: 60000 }); // the shared QueryClient retries a few times first
const alerts = (await page.getByRole("alert").allInnerTexts()).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
const saveDisabled = await page.getByRole("button", { name: "Save", exact: true }).isDisabled();
await page.screenshot({ path: join(here, "error-1280.png"), fullPage: true });
console.log(JSON.stringify({ alerts, saveDisabled }, null, 2));
await browser.close();
