/**
 * ════════════════════════════════════════════════════════════════════════════
 *  OPERATOR TOOL — RUN BY THE OPERATOR (or a launchd/cron job the operator owns).
 *  NOT an AI session. QA / any AI role NEVER runs this file.
 *  QA only CONSUMES the token this writes, via `sit-session.mjs inject`.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * SIT login is AIS's OWN identity service (sit-federated-auth.assistedchannel.ais.th,
 * "AIS Identity Service" / WSO2) — not Microsoft directly. It offers two paths:
 *   • "Sign In With Username-Password"  → AIS's own user store. THIS is what we use.
 *   • "Sign In With EntraID"            → redirects to Microsoft. We do NOT use it.
 * So when YOU run this, you authenticate to your own org's test IdP with your test
 * account — the creds stay in your file; this tool never prints the password or token.
 *
 * ── Prereq: Flutter SERVES the app; a SEPARATE Chrome owns the CDP port ───────
 *   1) serve only:   fvm flutter run -t lib/main_sit.dart -d web-server --web-port=4200
 *   2) your Chrome:  open -na "Google Chrome" --args \
 *        --user-data-dir=/tmp/chrome-sit-9222 --disable-web-security \
 *        --remote-debugging-port=9222 http://localhost:4200
 *   3) wait until the tab is on the AIS "Sign In" page, then:
 *   4) node scripts/sit/refresh-sit-token.mjs
 *
 * Creds file (outside any repo), default ~/oda-sit-creds.txt:
 *   SIT_USERNAME=<test user>
 *   SIT_PASSWORD=<test pass>
 *
 * Node >= 22 (built-in WebSocket); no npm dependencies.
 *
 * ⚠️ Verify once: the app's token storage key (APP_TOKEN_READ) — same slot the
 *    mock-token splash writes. If this run can't read it, it prints the diagnostic.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const CDP_PORT = process.env.CDP_PORT ?? "9222";
const APP_ORIGIN = "http://localhost:4200";
const CREDS_FILE = process.env.SIT_CREDS_FILE ?? path.join(homedir(), "oda-sit-creds.txt");
const TOKEN_FILE = process.env.SIT_TOKEN_FILE ?? path.join(homedir(), "oda-sit-token.txt");

// Candidate selectors (first that exists wins). AIS/WSO2 customised the page, so we try
// several and, if none match, dump what IS on the page so we can pin the real ones.
const USERNAME_SEL = ["input[name='username']", "#usernameUserInput", "#username", "input[type='email']", "input[type='text']:not([type='hidden'])"];
const PASSWORD_SEL = ["input[name='password']", "#password", "input[type='password']"];
const SUBMIT_SEL = ["#loginForm button[type='submit']", "button[type='submit']", "input[type='submit']", ".btn-primary"];

// TODO(verify once): the app's access-token storage key (the slot mock-token writes).
const APP_TOKEN_READ = `(() => {
  try {
    for (const store of [localStorage, sessionStorage]) {
      for (const k of Object.keys(store)) {
        if (/access[_-]?token|id[_-]?token/i.test(k)) return store.getItem(k);
      }
    }
  } catch {}
  return null;
})()`;

function readCreds() {
  const out = {};
  for (const line of readFileSync(CREDS_FILE, "utf8").split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z_0-9]*)=(.*)$/.exec(line.trim());
    if (m && !(m[1] in out)) out[m[1]] = m[2];
  }
  if (!out.SIT_USERNAME || !out.SIT_PASSWORD || /^REPLACE_ME/.test(out.SIT_PASSWORD)) {
    throw new Error(`Put real SIT_USERNAME and SIT_PASSWORD in ${CREDS_FILE} (not the REPLACE_ME placeholder).`);
  }
  return out;
}

async function connect() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json`)).json();
  const pages = targets.filter((t) => t.type === "page");
  const page =
    pages.find((t) => /assistedchannel\.ais\.th|login\.microsoftonline\.com/.test(t.url)) ??
    pages.find((t) => t.url.startsWith(APP_ORIGIN)) ??
    pages[0];
  if (!page) throw new Error(`no page target on :${CDP_PORT}. Relaunch Chrome with --remote-debugging-port=${CDP_PORT}.`);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  return { ws, send };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evalJs = async (send, expr) =>
  (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

/** Click the first element whose visible text contains any of `texts` (case-insensitive). Returns true if clicked. */
async function clickByText(send, texts) {
  const expr = `(() => {
    const wanted = ${JSON.stringify(texts.map((t) => t.toLowerCase()))};
    const els = [...document.querySelectorAll('button, a, div[role=button], span, input[type=button], input[type=submit]')];
    for (const el of els) {
      const t = (el.innerText || el.value || '').trim().toLowerCase();
      if (t && wanted.some((w) => t.includes(w))) { el.click(); return t.slice(0, 40); }
    }
    return null;
  })()`;
  return await evalJs(send, expr);
}

/** Fill the first matching selector with value (via DOM + input events). Returns the selector used, or null. */
async function fillFirst(send, selectors, value) {
  const expr = `(() => {
    const sels = ${JSON.stringify(selectors)};
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el && el.offsetParent !== null) {
        el.focus(); el.value = ${JSON.stringify(value)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return s;
      }
    }
    return null;
  })()`;
  return await evalJs(send, expr);
}

/** Read-only diagnostic: what inputs and buttons are on the page right now. No values read. */
async function dumpForm(send) {
  const expr = `(() => {
    const inputs = [...document.querySelectorAll('input')].map((e) => ({ id: e.id, name: e.name, type: e.type, ph: e.placeholder, shown: e.offsetParent !== null }));
    const buttons = [...document.querySelectorAll('button, a[role=button], input[type=submit], input[type=button]')].map((e) => ({ text: (e.innerText || e.value || '').trim().slice(0, 40), id: e.id }));
    return { url: location.href.split('?')[0], inputs, buttons };
  })()`;
  return await evalJs(send, expr);
}

async function main() {
  const creds = readCreds(); // stays in this process; never printed
  const { ws, send } = await connect();
  try {
    await send("Runtime.enable");

    // 0 — dismiss the cookie banner if present
    await clickByText(send, ["got it", "accept"]);
    await sleep(400);

    // 1 — if on the AIS choice screen, pick the username-password path (NOT EntraID)
    const picked = await clickByText(send, ["sign in with username", "username-password", "username / password"]);
    if (picked) await sleep(1800);

    // 2 — fill the WSO2 username/password form
    const uSel = await fillFirst(send, USERNAME_SEL, creds.SIT_USERNAME);
    if (!uSel) {
      console.log("DIAGNOSTIC (username field not found) — page contents:");
      console.log(JSON.stringify(await dumpForm(send), null, 1));
      throw new Error("username field not found — send the diagnostic above so the selectors can be pinned.");
    }
    const pSel = await fillFirst(send, PASSWORD_SEL, creds.SIT_PASSWORD);
    if (!pSel) {
      console.log("DIAGNOSTIC (password field not found) — page contents:");
      console.log(JSON.stringify(await dumpForm(send), null, 1));
      throw new Error("password field not found — send the diagnostic above.");
    }

    // 3 — submit
    const submitted = (await evalJs(send, `(() => {
      const sels = ${JSON.stringify(SUBMIT_SEL)};
      for (const s of sels) { const el = document.querySelector(s); if (el && el.offsetParent !== null) { el.click(); return s; } }
      return null;
    })()`)) || (await clickByText(send, ["sign in", "login", "log in", "continue"]));
    if (!submitted) throw new Error("could not find the submit button — send a diagnostic (re-run; it prints on field errors).");
    await sleep(4000);

    // 4 — back to the app, read the token
    let url = await evalJs(send, "location.href");
    if (!url.startsWith(APP_ORIGIN)) { await send("Page.navigate", { url: APP_ORIGIN }); await sleep(5000); }
    const tok = await evalJs(send, APP_TOKEN_READ);
    if (!tok) {
      console.log("Logged in, but could not read the app token. Storage keys present:");
      console.log(await evalJs(send, "JSON.stringify(Object.keys(localStorage).concat(Object.keys(sessionStorage)))"));
      throw new Error("set APP_TOKEN_READ to the real key (see the keys printed above).");
    }

    writeFileSync(TOKEN_FILE, String(tok), { mode: 0o600 });
    console.log(`token refreshed → ${TOKEN_FILE} (length ${String(tok).length})`); // never prints the token
  } finally {
    ws.close();
  }
}

await main();
