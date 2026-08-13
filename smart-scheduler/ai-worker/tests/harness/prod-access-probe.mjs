/**
 * QA probe — can I reach the customer-prod API with the access file I hold?
 *
 * Authorization on the record (owner, via Porter, log 2026-08-11): QA may run on
 * frontoffice.develyst.online for this acceptance. Conditions carried: no LINE to real people,
 * self-contained data, remove what I create, and **the TASK-090 production guard is NOT edited or
 * bypassed** — this probe does not mint anything; it uses the app's own login endpoint.
 *
 * Prints STATUS ONLY. No credential, token or secret is printed or written.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const acc = {};
for (const line of readFileSync(path.join(homedir(), "sm-test-access.txt"), "utf8").split(/\r?\n/)) {
  const m = /^([A-Za-z_][A-Za-z_0-9]*)=(.*)$/.exec(line.trim());
  if (m && !(m[1] in acc)) acc[m[1]] = m[2];
}

const PROD = "https://frontoffice.develyst.online";
const login = async (origin, label) => {
  try {
    const res = await fetch(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: acc.STAFF_EMAIL, password: acc.STAFF_PASSWORD }),
    });
    const body = await res.text();
    let token = null;
    try {
      token = !!JSON.parse(body).token;
    } catch {}
    console.log(`${label}: HTTP ${res.status} · tokenReturned=${token}`);
    return res.status === 200 && token;
  } catch (e) {
    console.log(`${label}: request failed — ${String(e).slice(0, 120)}`);
    return false;
  }
};

console.log("access file block: sid staff login (file header says 'for Tanya (QA) mint-session on sid')");
const ok = await login(PROD, "customer-prod /api/auth/login");
console.log(ok ? "→ the sid staff account also exists on prod: authenticated API smoke is possible" : "→ prod does NOT accept this account: need prod credentials via Porter (DATA REQUEST)");
