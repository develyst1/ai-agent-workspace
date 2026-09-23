// Harness (Tanya, 2026-09-23): TEST-006 AC-5 — as h1 (who already hired idea A at tier
// Ordinary/0%), submit a strong second idea so the USER tier rises; the existing
// hire_requests row must stay at the snapshot. Prints before/after /auth/me.
// Run: QA_PW='<password>' node tests/harness/sit-test-006-ac5-tier-rise.mjs
// Proves only: user tier after a new idea. The snapshot assertion is the DB select (sit-test-006-hire-select.ts).
const BASE = "https://possibility.develyst.online/api/v1";
const PW = process.env.QA_PW;
if (!PW) { console.error("set QA_PW"); process.exit(2); }
const IDEA_HIGH =
  "[QA] A community platform that matches retired engineers and doctors in rural Thailand with village schools that have no science teachers, scheduling live video mentoring sessions and measuring student progress over a school year.";

const login = await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "qa-tanya-hire1@example.com", password: PW }) });
if (login.status !== 200) throw new Error(`login ${login.status}`);
const cookie = login.headers.get("set-cookie").split(";")[0];
const me1 = await (await fetch(`${BASE}/auth/me`, { headers: { cookie } })).json();
console.log("before:", me1.user.tier, me1.user.discountPercent);
const idea = await fetch(`${BASE}/ideas`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ text: IDEA_HIGH, lang: "en" }) });
const ideaJson = await idea.json();
console.log("idea:", idea.status, JSON.stringify({ id: ideaJson.idea?.id, ideaTier: ideaJson.idea?.ideaTier, scores: ideaJson.idea?.scores }));
const me2 = await (await fetch(`${BASE}/auth/me`, { headers: { cookie } })).json();
console.log("after:", me2.user.tier, me2.user.discountPercent);
