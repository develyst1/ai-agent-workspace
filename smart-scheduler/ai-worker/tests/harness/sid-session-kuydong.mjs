/**
 * QA harness helper — an authenticated `sid` browser session, adapted from sid-session.mjs
 * for machine KUYDONG (repo paths differ; access file is the project-docs copy).
 *
 *   project-docs/sm-test-access.txt (URL/user/pass/AUTH_SECRET)
 *     → POST /api/auth/login  → backend token          (in memory only)
 *     → node scripts/mint-session.mjs (the operator tool, unmodified) → cookie   (in memory only)
 *     → playwright context.addCookies → a painted, logged-in sid browser
 *
 * NOTHING is written to disk: no token, no cookie, no secret — not in a file, not in stdout.
 * Refuses any host that is not `som.develyst.online` (production is never in scope for QA).
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import path from "node:path";

const FRONT_REPO = "H:/scheduler/smart-scheduler-front";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ACCESS_FILE =
  process.env.ACCESS_FILE ?? path.resolve(HERE, "../../../project-docs/sm-test-access.txt");
const SID_HOST = "som.develyst.online";

/** Parse the project-docs access file: `URL:`, `user:`, `pass:`, `AUTH_SECRET:` lines. */
function readAccess() {
  const out = {};
  for (const line of readFileSync(ACCESS_FILE, "utf8").split(/\r?\n/)) {
    const m = /^([A-Za-z_]+)\s*:\s*(.*)$/.exec(line.trim());
    if (m && !(m[1] in out)) out[m[1]] = m[2].trim();
  }
  if (!out.URL || !out.user || !out.pass || !out.AUTH_SECRET)
    throw new Error("access file missing one of URL/user/pass/AUTH_SECRET");
  return { APP_URL: out.URL, STAFF_EMAIL: out.user, STAFF_PASSWORD: out.pass, AUTH_SECRET: out.AUTH_SECRET };
}

export async function openSidSession({ viewport = { width: 1280, height: 900 } } = {}) {
  const acc = readAccess();
  const url = new URL(acc.APP_URL);
  if (url.hostname !== SID_HOST) throw new Error(`Refusing: APP_URL host is ${url.hostname}, not ${SID_HOST}`);

  // 1 — backend token (in memory)
  const res = await fetch(`${url.origin}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: acc.STAFF_EMAIL, password: acc.STAFF_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: HTTP ${res.status}`);
  const { token } = await res.json();
  if (!token) throw new Error("login returned no token");

  // 2 — mint the NextAuth cookie with the sanctioned tool, capturing stdout (never a file)
  const printed = execFileSync(process.execPath, ["scripts/mint-session.mjs"], {
    cwd: FRONT_REPO,
    env: { ...process.env, BACKEND_TOKEN: token, AUTH_SECRET: acc.AUTH_SECRET, APP_URL: url.origin },
    encoding: "utf8",
  });
  const name = /Cookie name\s*:\s*(\S+)/.exec(printed)?.[1];
  const value = /Cookie value\s*:\s*(\S+)/.exec(printed)?.[1];
  if (!name || !value) throw new Error("could not parse the minted cookie");

  // 3 — a real compositing Chrome carrying that session
  const { chromium } = await import(
    pathToFileURL(`${FRONT_REPO}/node_modules/playwright/index.mjs`).href
  );
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport });
  await ctx.addCookies([
    { name, value, domain: url.hostname, path: "/", httpOnly: true, secure: true, sameSite: "Lax" },
  ]);
  const page = await ctx.newPage();
  return { browser, ctx, page, origin: url.origin, apiToken: token };
}

/** Authenticated API call against sid (same token the browser session carries). */
export async function api(origin, token, method, path_, body) {
  const res = await fetch(`${origin}/api${path_}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json, text: text.slice(0, 600) };
}
