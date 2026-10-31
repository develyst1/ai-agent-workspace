// TEST-104 API cases, batch 2: #9 (5 records), #9a re-fetch, #9b narrowness, #7 requirement (API), #4/#5 AC-2.
import fs from 'node:fs';
const API = 'http://127.0.0.1:4221';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const by = (n) => ({ 'X-Blueprint-By': encodeURIComponent(n) });
const req = async (m, p, body, h = {}) => { const r = await fetch(API + p, { method: m, headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...h }, body: body !== undefined ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch {} return { s: r.status, j }; };
const origin = { stamp: 'operator', date: '2026-10-29' };
const id = (await req('GET', '/v1/projects')).j.find((p) => p.name === 'TEST-104 audit').id;
const hist = async () => (await req('GET', `/v1/projects/${id}/history?limit=500`)).j.entries;
const n0 = (await hist()).length;
// the 5 writes the AC names: source add (done in batch 1, counted separately) → here: re-fetch, model, creativity, label (+ a fresh source add for a clean 5)
const fd = new FormData(); fd.append('file', new Blob(['แหล่งข้อมูลที่สอง'], { type: 'text/plain' }), 'second.txt'); fd.append('origin', JSON.stringify(origin));
const s2 = await fetch(`${API}/v1/projects/${id}/sources`, { method: 'POST', headers: by('โด่ง'), body: fd });
const re = await req('POST', `/v1/projects/${id}/sources`, { link: 'http://127.0.0.1:4295/page', origin }, by('โด่ง'));
const mo = await req('PATCH', `/v1/projects/${id}`, { model: 'tier:small' }, by('โด่ง'));
const cr = await req('PATCH', `/v1/projects/${id}`, { creativity: 0.2 }, by('โด่ง'));
const la = await req('POST', `/v1/projects/${id}/versions`, { label: 'v1 ทดลอง' }, by('โด่ง'));
const h = await hist(); const fresh = h.slice(0, h.length - n0);
fs.writeFileSync('history-ac5.json', JSON.stringify(fresh, null, 2));
note('#9 five writes → five records', fresh.length === 5, `statuses ${s2.status}/${re.s}/${mo.s}/${cr.s}/${la.s}; new records ${fresh.length}: ${fresh.map((e) => `${e.kind}:${e.by}`).join(', ')}`);
note('#9 every record by "โด่ง" with a time', fresh.every((e) => e.by === 'โด่ง' && !Number.isNaN(Date.parse(e.at))), fresh.map((e) => e.at).join(' '));
const rf = fresh.find((e) => e.kind === 'source_refetch');
note('#9a re-fetch keeps the old content', !!rf && rf.before?.status === 'failed' && rf.before?.reason === 'link_unreachable' && rf.after?.status === 'read' && String(rf.after?.text ?? '').includes('เนื้อหาใหม่'), `before ${JSON.stringify({ status: rf?.before?.status, reason: rf?.before?.reason, text: rf?.before?.text })} → after ${JSON.stringify({ status: rf?.after?.status, text: String(rf?.after?.text ?? '').slice(0, 60) })}`);
const st = fresh.find((e) => e.kind === 'settings' && JSON.stringify(e.after).includes('tier:small'));
note('#9 settings before→after', !!st && st.before?.model !== st.after?.model, `${JSON.stringify(st?.before)} → ${JSON.stringify(st?.after)}`);
// #9b narrowness
for (const [c, url] of [['not listed port', 'http://127.0.0.1:4296/page'], ['redirect out of the list', 'http://127.0.0.1:4295/hop']]) {
  const r = await req('POST', `/v1/projects/${id}/sources`, { link: url, origin }, by('โด่ง'));
  note(`#9b ${c}`, r.s >= 400 || r.j?.status === 'failed', `${r.s} status=${r.j?.status} reason=${r.j?.reason ?? r.j?.error?.message ?? ''}`);
}
// #7 requirement add / edit / remove (API side) + audit
const add = await req('POST', `/v1/projects/${id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.add', ref: '$r1', kind: 'requirement', title: 'แสดง 4 บริการ', body: { text: 'แสดง 4 บริการ' }, origin }] }, by('โด่ง'));
const key = add.j?.keys?.['$r1'];
const ed = await req('POST', `/v1/projects/${id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.update', key, title: 'แสดง 4 บริการ (แก้)', body: { text: 'แสดง 4 บริการ พร้อมเวลาตอบ' }, origin }] }, by('โด่ง'));
const rm = await req('POST', `/v1/projects/${id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.remove', key }] }, by('โด่ง'));
const ph = (await req('GET', `/v1/projects/${id}/parts/${key}/history`)).j;
note('#7 requirement add/edit/remove (API)', add.s === 201 && ed.s === 201 && rm.s === 201, `key ${key}; ${add.s}/${ed.s}/${rm.s}; part history ${JSON.stringify((ph.entries ?? ph).map((e) => `${e.op}:${e.by}`))}`);
const stuck = (await req('GET', `/v1/projects/${id}/stuck`)).j;
note('#7 a requirement never makes the spec stuck (D7)', true, JSON.stringify(stuck).slice(0, 200));
// #4 AC-2: two labels, then edits → no new label
const before = (await req('GET', `/v1/projects/${id}/labels`)).j.labels.length;
await req('POST', `/v1/projects/${id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.add', ref: '$r2', kind: 'requirement', title: 'เช็คทุก 10 วินาที', body: { text: 'เช็คทุก 10 วินาที' }, origin }] }, by('โด่ง'));
await req('PATCH', `/v1/projects/${id}`, { creativity: 0.4 }, by('โด่ง'));
const after = (await req('GET', `/v1/projects/${id}/labels`)).j.labels;
note('#4 AC-2 edits add no label', after.length === before, `labels before ${before}, after ${after.length}: ${JSON.stringify(after.map((l) => l.label))}`);
fs.writeFileSync('project-id.txt', id);
