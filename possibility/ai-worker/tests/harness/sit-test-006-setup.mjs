// Harness (Tanya, 2026-09-23): TEST-006 setup on SIT — registers two fresh QA accounts
// (idempotent: falls back to login on 409) and submits one idea each so the UI round has
// result pages to click. Prints JSON { h1: {email, ideaA}, h2: {email, ideaA} } on stdout.
// Run: QA_PW='<password>' node tests/harness/sit-test-006-setup.mjs
// Proves: nothing by itself — setup only. Does NOT prove any AC.
const BASE = "https://possibility.develyst.online/api/v1";
const PW = process.env.QA_PW;
if (!PW) { console.error("set QA_PW"); process.exit(2); }

const IDEA_LOW =
  "[QA] A simple note-taking web page for my family so we can write down grocery lists and small reminders. Nothing new, just a basic page with text fields.";
const IDEA_HIGH =
  "[QA] A community platform that matches retired engineers and doctors in rural Thailand with village schools that have no science teachers, scheduling live video mentoring sessions and measuring student progress over a school year.";

async function call(method, path, { body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get("set-cookie");
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json, setCookie };
}

async function account(email, displayName, ideaText) {
  let r = await call("POST", "/auth/register", { body: { email, password: PW, displayName } });
  if (r.status === 409) r = await call("POST", "/auth/login", { body: { email, password: PW } });
  if (![200, 201].includes(r.status)) throw new Error(`auth ${email}: ${r.status} ${JSON.stringify(r.json)}`);
  const cookie = r.setCookie.split(";")[0];
  const me = r.json.user;
  const idea = await call("POST", "/ideas", { body: { text: ideaText, lang: "en" }, cookie });
  if (idea.status !== 201) throw new Error(`idea ${email}: ${idea.status} ${JSON.stringify(idea.json)}`);
  const me2 = await call("GET", "/auth/me", { cookie });
  return { email, cookie, user: me, tierAfterIdea: me2.json.user.tier, idea: idea.json.idea };
}

const h1 = await account("qa-tanya-hire1@example.com", "QA Tanya Hire1", IDEA_LOW);
console.log("h1:", JSON.stringify({ email: h1.email, tier: h1.tierAfterIdea, ideaId: h1.idea.id, ideaTier: h1.idea.ideaTier, scores: h1.idea.scores, hireRequested: h1.idea.hireRequested }));
const h2 = await account("qa-tanya-hire2@example.com", "QA Tanya Hire2", IDEA_LOW);
console.log("h2:", JSON.stringify({ email: h2.email, tier: h2.tierAfterIdea, ideaId: h2.idea.id, ideaTier: h2.idea.ideaTier, scores: h2.idea.scores, hireRequested: h2.idea.hireRequested }));
