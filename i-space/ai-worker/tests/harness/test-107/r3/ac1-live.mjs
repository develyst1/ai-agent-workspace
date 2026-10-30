// TEST-107 round 3, AC-1 (REQ-110), LIVE gateway through the cap proxy (owner 2026-10-29 20:02: at most 6 calls).
// usage (from this folder): bun ac1-live.mjs round1
//                           bun ac1-live.mjs accept            — round 2: "ตามนั้น" on every question the bot offered
//                           bun ac1-live.mjs say "<message>"   — round 2: one plain message
//                           bun ac1-live.mjs retry             — "ลองใหม่": ask again for the newest failed turn
// One round per run, so QA reads the stored spec before deciding whether round 2 is spent. Saves every result.
import fs from 'node:fs';
const API = 'http://127.0.0.1:4231';
const H = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const [step, text] = process.argv.slice(2);
const post = async (p, b) => { const r = await fetch(API + p, { method: 'POST', headers: H, body: JSON.stringify(b) }); return { s: r.status, j: await r.json().catch(() => null) }; };
const get = async (p) => (await fetch(API + p)).json();
let id, body, tag;
if (step === 'round1') {
  const p = (await post('/v1/projects', { name: 'TEST-107 r3 AC-1 Health Board', theme: 'clean-blue' })).j;
  id = p.id; fs.writeFileSync('ac1-project-id.txt', id); console.log('project', id, 'model', p.model);
  body = { message: fs.readFileSync('../../test-106/spec.txt', 'utf8').trim() }; tag = 'round1';
} else {
  id = fs.readFileSync('ac1-project-id.txt', 'utf8').trim(); tag = process.env.TAG || 'round2';
  if (step === 'accept') body = { accept: JSON.parse(fs.readFileSync(process.env.FROM || 'ac1-round1.json', 'utf8')).j.questions.filter(Boolean) };
  else if (step === 'say' && text) body = { message: text };
  else if (step === 'retry') body = { retry: true }; // the chat page's "ลองใหม่" after a failed turn
  else { console.error('usage: round1 | accept | say "<message>"'); process.exit(2); }
}
const t0 = Date.now();
const r = await post(`/v1/projects/${id}/rounds`, body);
fs.writeFileSync(`ac1-${tag}.json`, JSON.stringify(r, null, 2));
console.log(`${tag}: HTTP ${r.s} in ${Math.round((Date.now() - t0) / 1000)} s · status ${r.j?.status} · reason ${r.j?.reason ?? '-'} · note ${r.j?.note ?? '-'} · saved ${r.j?.saved ?? '-'} · refused ${r.j?.refused?.length ?? 0} · adjusted ${r.j?.adjusted?.length ?? 0} · questions ${r.j?.questions?.length ?? 0}`);
const msgs = await get(`/v1/projects/${id}/messages?limit=50`);
fs.writeFileSync(`ac1-${tag}-messages.json`, JSON.stringify(msgs, null, 1));
const fin = await get(`/v1/projects/${id}`);
fs.writeFileSync(`ac1-${tag}-spec.json`, JSON.stringify(fin, null, 2));
console.log(`parts ${fin.parts.length} · links ${fin.links?.length}`);
for (const x of fin.parts) console.log(` ${x.key} [${x.kind}] ${x.title} :: ${JSON.stringify(x.body).slice(0, 220)}`);
for (const q of r.j?.questions ?? []) console.log(' question offered:', JSON.stringify(q).slice(0, 200));
for (const x of r.j?.refused ?? []) console.log(' refused:', JSON.stringify(x).slice(0, 200));
