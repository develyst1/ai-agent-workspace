// Repro for TEST-001 case 21: stand-in in `hang`, AI task proposals (G1) and summary (S2), via the front proxy :4300 and direct to the back :4310.
import { writeFileSync } from 'node:fs';
const MODE = '/workspace/ai-agent-workspace/god-plan/ai-worker/tests/harness/gateway-stub/mode.txt';
const pw = process.env.GP_SEED_OWNER_PASSWORD;
async function signIn(base) {
  const r = await fetch(base + '/api/auth/sign-in', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:4300' }, body: JSON.stringify({ email: 'owner@godplan.test', password: pw }) });
  return r.headers.getSetCookie()[0].split(';')[0];
}
async function timed(base, cookie, path) {
  const t0 = Date.now(); const iso = () => new Date().toISOString().slice(11, 19);
  const startIso = iso();
  try { const r = await fetch(base + path, { method: 'POST', headers: { cookie, origin: 'http://127.0.0.1:4300' }, signal: AbortSignal.timeout(60000) }); const t = await r.text(); return `${r.status} after ${Date.now() - t0} ms [${startIso}→${iso()} UTC] ${t.slice(0, 80)}`; }
  catch (e) { return `no answer after ${Date.now() - t0} ms [${startIso}→${iso()} UTC] (${e.name})`; }
}
for (const [label, base] of [['back direct', 'http://127.0.0.1:4310'], ['front proxy', 'http://localhost:4300']]) {
  const cookie = await signIn(base);
  const list = await (await fetch(base + '/api/projects', { headers: { cookie } })).json();
  const p1 = list.projects.find(p => p.name === 'ย้ายบ้านใหม่').id, p2 = list.projects.find(p => p.name === 'งานสวนหลังบ้าน').id;
  writeFileSync(MODE, 'hang\n');
  console.log(label, 'G1 P2:', await timed(base, cookie, `/api/projects/${p2}/ai/task-proposals`));
  console.log(label, 'S2 P1:', await timed(base, cookie, `/api/projects/${p1}/summary`));
  console.log(label, 'G1 P1:', await timed(base, cookie, `/api/projects/${p1}/ai/task-proposals`));
}
writeFileSync(MODE, 'ok\n');
