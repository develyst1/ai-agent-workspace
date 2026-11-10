/**
 * QA harness helper (Twenty) — an authenticated sid API client WITHOUT a login.
 * Loads PokerVault's sid session file AS-IS (never read/printed/copied), lets the page make its own
 * first API call, and reuses that request's Authorization header IN MEMORY only.
 * Refuses any host but som.develyst.online.
 *
 * CLI: node sid-twenty-api.mjs <METHOD> <path-under-/api> [json-body]
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const STATE = path.resolve(here, "../../../../picklocker/state/som.json");
const FRONT_REPO = "H:/scheduler/smart-scheduler-front";
const SID = "https://som.develyst.online";

export async function openApi() {
  const { chromium } = await import(pathToFileURL(`${FRONT_REPO}/node_modules/playwright/index.mjs`).href);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ storageState: STATE });
  const page = await ctx.newPage();
  let auth = null;
  page.on("request", (req) => {
    const u = new URL(req.url());
    if (u.hostname === "som.develyst.online" && u.pathname.startsWith("/api/") && !u.pathname.startsWith("/api/auth")) {
      const h = req.headers()["authorization"];
      if (h && !auth) auth = h;
    }
  });
  await page.goto(`${SID}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 90000 });
  if (new URL(page.url()).hostname !== "som.develyst.online") throw new Error("Refusing: left sid");
  if (/login|signin/i.test(page.url())) throw new Error("SESSION NOT VALID: login page");
  if (!auth) throw new Error("no Authorization header observed");
  async function call(method, p, body) {
    // 🔒 Playwright's fetch error prints the whole request (Authorization + cookies). Never let it out:
    // rethrow a NEW error carrying only the method, path and the error's first line before any header.
    let r;
    try {
      r = await page.request.fetch(`${SID}/api${p}`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: auth },
        data: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      const first = String(e?.message ?? e).split("\n")[0].replace(/Bearer\s+\S+/g, "Bearer [redacted]").slice(0, 120);
      const err = new Error(`${method} ${p} failed: ${first}`);
      err.stack = err.message;
      throw err;
    }
    const text = await r.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: r.status(), json, text };
  }
  return { browser, page, call };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [method, p, body] = process.argv.slice(2);
  const { browser, call } = await openApi();
  const r = await call(method, p, body ? JSON.parse(body) : undefined);
  console.log(`${method} ${p} → ${r.status}`);
  console.log(r.text.slice(0, Number(process.env.MAX ?? 4000)));
  await browser.close();
}
