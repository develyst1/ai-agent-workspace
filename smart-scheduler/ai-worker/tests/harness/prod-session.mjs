/**
 * QA helper — an authenticated CUSTOMER-PROD session, used only for the 2026-08-11 post-deploy smoke.
 *
 * AUTHORIZATION: given by the human directly, in QA's own session (2026-08-11), after QA declined a
 * workspace-file relay. Conditions carried and enforced here where possible:
 *   · self-contained data only · remove what QA creates · touch no row QA didn't create
 *   · no LINE to real people · NO teacher-change flow (fires dual LINE to real teachers, TASK-094)
 *   · **the TASK-090 production guard is NOT edited and NOT bypassed**
 *
 * How the browser session is obtained: the app's OWN LOGIN FORM. This deliberately does not mint a
 * NextAuth cookie — `mint-session.mjs` refuses this host by design and stays untouched. Using the front
 * door is not a workaround of that guard; it is the ordinary way a staff member signs in.
 *
 * Nothing secret is printed or written to disk.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { homedir } from "node:os";
import path from "node:path";

const FRONT_REPO = "C:/Users/Admin/develyst/smart-scheduler/smart-scheduler-front";
const PROD_HOST = "frontoffice.develyst.online";
const ORIGIN = `https://${PROD_HOST}`;

function readAccess() {
  const out = {};
  for (const line of readFileSync(path.join(homedir(), "sm-test-access.txt"), "utf8").split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z_0-9]*)=(.*)$/.exec(line.trim());
    if (m && !(m[1] in out)) out[m[1]] = m[2];
  }
  return out;
}

export async function openProdSession({ viewport = { width: 1440, height: 1000 } } = {}) {
  const acc = readAccess();

  // API token (read-only checks + verification of UI actions)
  const res = await fetch(`${ORIGIN}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: acc.STAFF_EMAIL, password: acc.STAFF_PASSWORD }),
  });
  if (!res.ok) throw new Error(`prod login failed: HTTP ${res.status}`);
  const { token } = await res.json();

  const { chromium } = await import(pathToFileURL(`${FRONT_REPO}/node_modules/playwright/index.mjs`).href);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();

  // sign in through the app's own form
  await page.goto(`${ORIGIN}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500); // hydration — an early submit posts nothing
  await page.locator("input").first().fill(acc.STAFF_EMAIL);
  await page.locator('input[type="password"]').fill(acc.STAFF_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/scheduler\//, { timeout: 30000 });
  await page.waitForLoadState("networkidle");

  return { browser, ctx, page, origin: ORIGIN, apiToken: token };
}

/** Authenticated API call against customer-prod. */
export async function api(origin, token, method, p, body) {
  const r = await fetch(`${origin}/api${p}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: r.status, json, text: text.slice(0, 600) };
}
