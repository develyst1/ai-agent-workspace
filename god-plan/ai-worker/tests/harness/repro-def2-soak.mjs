// DEF-2 soak (QA, TEST-001 round 5): owner sign-in every STEP seconds for MIN minutes on the REAL back, alternating
// direct (127.0.0.1:4310) and through the front's /api (localhost:4300). A built-in stall detector (500 ms timer, logs when > 3 s late)
// runs in the same process, so every result carries whether the machine froze during it. Owner sign-in from env, never printed.
// Run: MIN=30 STEP=20 node tests/harness/repro-def2-soak.mjs
const MIN = Number(process.env.MIN || 30), STEP = Number(process.env.STEP || 20);
const body = JSON.stringify({ email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD });
const iso = () => new Date().toISOString().slice(11, 19);
const stalls = []; let last = Date.now();
const det = setInterval(() => { const now = Date.now(); if (now - last > 3000) { stalls.push({ end: now, ms: now - last - 500 }); console.log(`  [stall ${now - last - 500} ms ending ${iso()} UTC]`); } last = now; }, 500);
const bases = ["http://127.0.0.1:4310", "http://localhost:4300"];
const out = { ok: 0, fail: [] };
const end = Date.now() + MIN * 60000;
for (let i = 0; Date.now() < end; i++) {
  const base = bases[i % 2], t0 = Date.now(), s = iso();
  let status, text = "";
  try { const r = await fetch(base + "/api/auth/sign-in", { method: "POST", headers: { "content-type": "application/json" }, body, signal: AbortSignal.timeout(60000) }); status = r.status; text = await r.text(); }
  catch (e) { status = `ERR ${e.name}`; }
  const ms = Date.now() - t0, inStall = stalls.some((x) => x.end >= t0 && x.end - x.ms <= Date.now());
  if (status === 200) out.ok++; else { out.fail.push({ at: s, base, status, ms, inStall, body: text.slice(0, 60) }); console.log(`FAIL [${s} UTC] ${base} → ${status} ${ms} ms stall-overlap=${inStall} ${text.slice(0, 60)}`); }
  await new Promise((r) => setTimeout(r, STEP * 1000));
}
clearInterval(det);
console.log(JSON.stringify({ calls: out.ok + out.fail.length, ok: out.ok, fail: out.fail.length, failQuiet: out.fail.filter((f) => !f.inStall).length, stalls: stalls.length, longestStallMs: Math.max(0, ...stalls.map((x) => x.ms)) }));
