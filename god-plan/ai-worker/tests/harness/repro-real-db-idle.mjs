// QA probe (TEST-001 round 4): does the REAL back (god_plan dev DB) fail the first call after an idle gap?
// Direct to 127.0.0.1:4310 (no front). Each step: wait GAP s idle, then 2 sign-ins back to back; print UTC, status, ms.
// Owner sign-in from env (out-of-repo god-plan-qa.env), never printed. Run: GAPS=5,30,60,120,240 node tests/harness/repro-real-db-idle.mjs
const gaps = (process.env.GAPS || "5,30,60,120,240").split(",").map(Number);
const body = JSON.stringify({ email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD });
const iso = () => new Date().toISOString().slice(11, 19);
const call = async () => { const t0 = Date.now(); try { const r = await fetch("http://127.0.0.1:4310/api/auth/sign-in", { method: "POST", headers: { "content-type": "application/json" }, body, signal: AbortSignal.timeout(60000) }); const t = await r.text(); return `${r.status} ${Date.now() - t0}ms${r.status >= 400 ? " " + t.slice(0, 50) : ""}`; } catch (e) { return `ERR ${e.name} ${Date.now() - t0}ms`; } };
for (const g of gaps) { await new Promise((r) => setTimeout(r, g * 1000)); console.log(`[${iso()} UTC] after ${g}s idle → 1st: ${await call()} · 2nd: ${await call()}`); }
