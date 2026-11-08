/**
 * QA harness (Twenty, TEST-142) — is TASK-860's code running on sid?
 *
 * Uses PokerVault's sid front-office session file AS-IS (never read, printed or copied).
 * No login, no password. Refuses any host but som.develyst.online.
 *
 * Probe: PUT /api/courses/<nil uuid>/bonus100-pick with an INVALID body {pick:"NOT_A_PICK"}.
 *   - TASK-860 code: the route exists, zValidator refuses the body → 400 (nothing written).
 *   - pre-TASK-860 code: no such route → 404 (nothing written).
 * The auth header the page itself sends is reused in memory only; nothing about it is printed.
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const STATE = path.resolve(here, "../../../../picklocker/state/som.json");
const FRONT_REPO = "H:/scheduler/smart-scheduler-front";
const SID = "https://som.develyst.online";

const { chromium } = await import(pathToFileURL(`${FRONT_REPO}/node_modules/playwright/index.mjs`).href);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ storageState: STATE });
const page = await ctx.newPage();

let authHeader = null;
const apiSeen = [];
page.on("request", (req) => {
  const u = new URL(req.url());
  if (u.hostname !== "som.develyst.online" || !u.pathname.startsWith("/api/") || u.pathname.startsWith("/api/auth")) return;
  apiSeen.push(`${req.method()} ${u.pathname}`);
  const h = req.headers()["authorization"];
  if (h && !authHeader) authHeader = h;
});

const resp = await page.goto(`${SID}/`, { waitUntil: "networkidle", timeout: 90000 });
const finalUrl = page.url();
console.log(`landing: HTTP ${resp?.status()} final URL ${finalUrl}`);
if (new URL(finalUrl).hostname !== "som.develyst.online") throw new Error("Refusing: left sid");
if (/login|signin/i.test(finalUrl)) {
  console.log("SESSION NOT VALID: landed on a login page");
  await browser.close();
  process.exit(3);
}
console.log(`api calls seen: ${apiSeen.length} (first: ${apiSeen.slice(0, 3).join(" | ")})`);
console.log(`page sends an Authorization header: ${authHeader ? "yes" : "no"}`);

const headers = { "Content-Type": "application/json" };
if (authHeader) headers.Authorization = authHeader;
const probe = await page.request.fetch(
  `${SID}/api/courses/00000000-0000-0000-0000-000000000000/bonus100-pick`,
  { method: "PUT", headers, data: JSON.stringify({ pick: "NOT_A_PICK" }) },
);
const body = (await probe.text()).slice(0, 300);
console.log(`PUT /api/courses/<nil>/bonus100-pick {pick:"NOT_A_PICK"} → HTTP ${probe.status()}`);
console.log(`body: ${body}`);
await page.screenshot({ path: path.resolve(here, "../../../project-docs/qa-2026-11-08/task860-sid-landing.png") });
await browser.close();
