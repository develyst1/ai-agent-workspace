// TEST-107 AC-1 (REQ-110), LIVE gateway through the cap proxy: paste spec.txt as the first message, then accept the bot's
// offered answers once ("ตามนั้น"), as the chat page does — at most 2 rounds. Saves every round result and the final spec.
import fs from 'node:fs';
const API = 'http://127.0.0.1:4231';
const H = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const SPEC = fs.readFileSync('../test-106/spec.txt', 'utf8').trim();
const post = async (p, b) => { const r = await fetch(API + p, { method: 'POST', headers: H, body: JSON.stringify(b) }); return { s: r.status, j: await r.json().catch(() => null) }; };
const p = (await post('/v1/projects', { name: 'TEST-107 AC-1 Health Board', theme: 'clean-blue' })).j;
console.log('project', p.id, 'model', p.model);
fs.writeFileSync('ac1-project-id.txt', p.id);
const t1 = Date.now();
const r1 = await post(`/v1/projects/${p.id}/rounds`, { message: SPEC });
fs.writeFileSync('ac1-round1.json', JSON.stringify(r1, null, 2));
console.log(`round 1: HTTP ${r1.s} in ${Math.round((Date.now() - t1) / 1000)} s · status ${r1.j?.status} · reason ${r1.j?.reason ?? '-'} · note ${r1.j?.note ?? '-'} · changeSet ${r1.j?.changeSetId ?? '-'} · questions ${JSON.stringify(r1.j?.questions ?? [])}`);
const spec1 = await (await fetch(`${API}/v1/projects/${p.id}`)).json();
console.log('parts after round 1:', spec1.parts.length);
const keys = (r1.j?.questions ?? []).filter(Boolean);
if (keys.length) {
  const t2 = Date.now();
  const r2 = await post(`/v1/projects/${p.id}/rounds`, { accept: keys });
  fs.writeFileSync('ac1-round2.json', JSON.stringify(r2, null, 2));
  console.log(`round 2 (accept ${keys.length}): HTTP ${r2.s} in ${Math.round((Date.now() - t2) / 1000)} s · status ${r2.j?.status} · reason ${r2.j?.reason ?? '-'} · changeSet ${r2.j?.changeSetId ?? '-'}`);
} else console.log('round 2: not needed (nothing offered to accept)');
const fin = await (await fetch(`${API}/v1/projects/${p.id}`)).json();
fs.writeFileSync('ac1-final-spec.json', JSON.stringify(fin, null, 2));
console.log('final parts:', fin.parts.length);
for (const x of fin.parts) console.log(` ${x.key} [${x.kind}] ${x.title} :: ${JSON.stringify(x.body).slice(0, 140)}`);
const st = await (await fetch(`${API}/v1/projects/${p.id}/stuck`)).json();
console.log('stuck', st.items.length, JSON.stringify(st.items.map((i) => i.kind)));
