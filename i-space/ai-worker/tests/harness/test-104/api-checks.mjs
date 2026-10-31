// TEST-104 API-level cases: #5, #9, #9a, #9b, #10 (partial), #11, #13, #15, #16, #7 (API side). Local only (:4221).
import fs from 'node:fs';
const API = 'http://127.0.0.1:4221';
const out = [];
const note = (c, ok, d) => { out.push({ case: c, ok, d }); console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`); };
const by = (n) => ({ 'X-Blueprint-By': encodeURIComponent(n) });
const req = async (m, p, body, h = {}) => { const r = await fetch(API + p, { method: m, headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...h }, body: body !== undefined ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch {} return { s: r.status, j }; };
const hist = async (id) => (await req('GET', `/v1/projects/${id}/history?limit=500`)).j.entries;

// #13 — server refuses writes with no name
const noName = await req('POST', '/v1/projects', { name: 'no name', theme: 'clean-blue' });
note('#13 create project, no X-Blueprint-By', noName.s === 400 && noName.j?.error?.code === 'name_required', `${noName.s} ${JSON.stringify(noName.j)}`);
const before = (await req('GET', '/v1/projects')).j.length;
note('#13 nothing stored', before === 0, `projects=${before}`);
const P = (await req('POST', '/v1/projects', { name: 'TEST-104 audit', theme: 'clean-blue' }, by('โด่ง'))).j;
const id = P.id;
for (const [label, m, p, b] of [
  ['change-set', 'POST', `/v1/projects/${id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.add', ref: '$r', kind: 'requirement', title: 'x', body: { text: 'x' }, origin: { stamp: 'operator', date: '2026-10-29' } }] }],
  ['label', 'POST', `/v1/projects/${id}/versions`, { label: 'v' }],
  ['settings', 'PATCH', `/v1/projects/${id}`, { creativity: 1 }],
  ['quiz start', 'POST', `/v1/projects/${id}/quizzes`, {}],
]) { const r = await req(m, p, b); note(`#13 ${label} with no name`, r.s === 400 && r.j?.error?.code === 'name_required', `${r.s} ${r.j?.error?.code}`); }
const badEnc = await req('POST', `/v1/projects/${id}/versions`, { label: 'v' }, { 'X-Blueprint-By': '%E0%B8' });
note('#13 undecodable name', badEnc.s === 400 && badEnc.j?.error?.code === 'name_required', `${badEnc.s} ${badEnc.j?.error?.code}`);
const blank = await req('POST', `/v1/projects/${id}/versions`, { label: 'v' }, by('   '));
note('#13 whitespace-only name', blank.s === 400 && blank.j?.error?.code === 'name_required', `${blank.s} ${blank.j?.error?.code}`);
const labelsAfterRefusals = (await req('GET', `/v1/projects/${id}/labels`)).j.labels.length;
note('#13 refusals stored nothing', labelsAfterRefusals === 0 && (await hist(id)).length === 1, `labels=${labelsAfterRefusals} history=${(await hist(id)).length} (1 = project_create)`);

// #11 — name trimmed, Thai kept
const trimmed = await req('PATCH', `/v1/projects/${id}`, { creativity: 0.7 }, by('  โด่ง  '));
const h1 = (await hist(id))[0];
note('#11 Thai name trimmed and stored', trimmed.s === 200 && h1.by === 'โด่ง', `by=${JSON.stringify(h1.by)} kind=${h1.kind}`);

// #15 — empty / whitespace label
for (const l of ['', '   ']) { const r = await req('POST', `/v1/projects/${id}/versions`, { label: l }, by('โด่ง')); note(`#15 label ${JSON.stringify(l)}`, r.s === 400, `${r.s} ${r.j?.error?.code}`); }
note('#15 nothing saved', (await req('GET', `/v1/projects/${id}/labels`)).j.labels.length === 0, 'labels=0');

// #16 — boundaries (observe)
const long = await req('POST', `/v1/projects/${id}/versions`, { label: 'ก'.repeat(81) }, by('โด่ง'));
note('#16 81-char label', true, `${long.s} ${long.j?.error?.code ?? ''} (SPEC: 1–80)`);
const emoji = await req('POST', `/v1/projects/${id}/versions`, { label: 'v1 ทดลอง 🚀' }, by('โด่ง'));
const dup = await req('POST', `/v1/projects/${id}/versions`, { label: 'v1 ทดลอง 🚀' }, by('โด่ง'));
note('#16 Thai+emoji, then the same label twice', true, `${emoji.s}/${dup.s}; labels=${JSON.stringify((await req('GET', `/v1/projects/${id}/labels`)).j.labels.map((x) => x.label))} (SPEC D2: duplicates allowed)`);

// #9 — five writes by โด่ง: source add, re-fetch failed link, model, creativity, label
const base = (await hist(id)).length;
const fd = new FormData(); fd.append('file', new Blob(['บันทึกการประชุม ทดสอบ'], { type: 'text/plain' }), 'note.txt'); fd.append('origin', JSON.stringify({ stamp: 'operator', date: '2026-10-29' }));
const src = await fetch(`${API}/v1/projects/${id}/sources`, { method: 'POST', headers: by('โด่ง'), body: fd }); const srcJ = await src.json();
note('#9 source add (file)', src.status < 300, `${src.status} ${JSON.stringify(srcJ).slice(0, 160)}`);
const link = await req('POST', `/v1/projects/${id}/sources`, { link: 'http://127.0.0.1:4295/page', origin: { stamp: 'operator', date: '2026-10-29' } }, by('โด่ง'));
note('#9a link with nothing listening', true, `${link.s} ${JSON.stringify(link.j).slice(0, 220)}`);
fs.writeFileSync('link-add.json', JSON.stringify(link.j, null, 2));
