// TEST-115 AC-6 (REQ-115), LIVE gateway through the cap proxy (≤ 6 calls, PM's scope DECISIONS 2026-10-30 09:5x). Copied from TEST-111's.
// usage (from this folder): bun ac6-live.mjs round1   — spec.txt, as REQ-114's live run
//                           bun ac6-live.mjs quiz     — one quiz question on the stored spec (a light call by design)
// One step per run, so QA reads the result before spending the next call. Saves every result; prints each call's model.
import fs from 'node:fs';
const API = 'http://127.0.0.1:4251';
const H = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const [step] = process.argv.slice(2);
const post = async (p, b) => { const r = await fetch(API + p, { method: 'POST', headers: H, body: JSON.stringify(b) }); return { s: r.status, j: await r.json().catch(() => null) }; };
const get = async (p) => (await fetch(API + p)).json();
const calls = (cs) => (cs ?? []).map((c) => `${c.step}/${c.weight} asked ${c.asked} → ${c.model ?? '-'}${c.fallback ? ' (fallback)' : ''} ${c.ok ? 'ok' : c.reason}`).join(' · ');
const t0 = Date.now();
if (step === 'round1') {
  const p = (await post('/v1/projects', { name: 'TEST-115 AC-6 Health Board', theme: 'clean-blue' })).j;
  fs.writeFileSync('ac6-project-id.txt', p.id); console.log('project', p.id, 'model', p.model);
  const r = await post(`/v1/projects/${p.id}/rounds`, { message: fs.readFileSync('../../test-106/spec.txt', 'utf8').trim() });
  fs.writeFileSync('ac6-round1.json', JSON.stringify(r, null, 2));
  console.log(`round1: HTTP ${r.s} in ${Math.round((Date.now() - t0) / 1000)} s · status ${r.j?.status} · reason ${r.j?.reason ?? '-'} · saved ${r.j?.saved ?? '-'} · refused ${r.j?.refused?.length ?? 0} · adjusted ${r.j?.adjusted?.length ?? 0} · questions ${r.j?.questions?.length ?? 0}`);
  console.log(`calls: ${calls(r.j?.calls)}`);
  const msgs = await get(`/v1/projects/${p.id}/messages?limit=50`);
  fs.writeFileSync('ac6-round1-messages.json', JSON.stringify(msgs, null, 1));
  console.log(`bot row roundCalls: ${calls((msgs.messages ?? msgs).filter((m) => m.role === 'bot').pop()?.roundCalls)}`);
  const fin = await get(`/v1/projects/${p.id}`);
  fs.writeFileSync('ac6-round1-spec.json', JSON.stringify(fin, null, 2));
  console.log(`parts ${fin.parts.length} · links ${fin.links?.length}`);
  for (const x of fin.parts) console.log(` ${x.key} [${x.kind}] ${x.title} :: ${JSON.stringify(x.body).slice(0, 220)}`);
  for (const x of r.j?.refused ?? []) console.log(' refused:', JSON.stringify(x).slice(0, 200));
} else if (step === 'quiz') {
  const id = fs.readFileSync('ac6-project-id.txt', 'utf8').trim();
  const q = (await post(`/v1/projects/${id}/quizzes`, {})).j;
  const item = await post(`/v1/projects/${id}/quizzes/${q.id}/questions`, { question: 'หน้า Health Board เช็คสถานะบริการใหม่ทุกกี่วินาที' });
  fs.writeFileSync('ac6-quiz.json', JSON.stringify(item, null, 2));
  console.log(`quiz: HTTP ${item.s} in ${Math.round((Date.now() - t0) / 1000)} s · status ${item.j?.status} · answer ${JSON.stringify(item.j?.answer)} · parts ${JSON.stringify(item.j?.parts)} · model ${item.j?.model}`);
  console.log(`calls: ${calls(item.j?.calls)}`);
} else { console.error('usage: round1 | quiz'); process.exit(2); }
