// TEST-104 API batch 3: #5 labels keep their state · #10 every other write path audited (fake gateway on :4397).
const API = 'http://127.0.0.1:4221';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const by = (n) => ({ 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent(n) });
const req = async (m, p, body, n = 'โด่ง') => { const r = await fetch(API + p, { method: m, headers: by(n), body: body !== undefined ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch {} return { s: r.status, j }; };
const origin = { stamp: 'operator', date: '2026-10-29' };
const p = (await req('POST', '/v1/projects', { name: 'TEST-104 paths', theme: 'clean-blue' })).j; const id = p.id;
const front = '/tmp/claude-1000/-workspace-ai-agent-workspace/21b28d09-3370-41ac-9c27-df688495b18b/scratchpad/t104/src/blueprint-front';
const { large } = await import(`${front}/tests/seed/large.ts`);
const cs = await req('POST', `/v1/projects/${id}/change-sets`, { cause: { kind: 'operator' }, changes: large });
// #5: L1, edit X, L2 → L1 shows old X, L2 the new
const live = (await req('GET', `/v1/projects/${id}`)).j; const step = live.parts.find((x) => x.kind === 'step');
const L1 = (await req('POST', `/v1/projects/${id}/versions`, { label: 'L1' })).j;
await req('POST', `/v1/projects/${id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.update', key: step.key, title: `${step.title} (หลัง L1)`, origin }] });
const L2 = (await req('POST', `/v1/projects/${id}/versions`, { label: 'L2' })).j;
const v1 = (await req('GET', `/v1/projects/${id}/versions/${L1.version}`)).j.parts.find((x) => x.key === step.key).title;
const v2 = (await req('GET', `/v1/projects/${id}/versions/${L2.version}`)).j.parts.find((x) => x.key === step.key).title;
note('#5 each label keeps its own state', v1 === step.title && v2 === `${step.title} (หลัง L1)`, `L1 v${L1.version} "${v1}" · L2 v${L2.version} "${v2}"`);
// #10 other write paths
const hist = async () => (await req('GET', `/v1/projects/${id}/history?limit=500`)).j.entries;
const n0 = (await hist()).length;
const round = await req('POST', `/v1/projects/${id}/rounds`, { message: 'ช่วยสรุปงานนี้' }, 'คนส่งแชต');
const msgs = (await req('GET', `/v1/projects/${id}/messages?limit=50`)).j; const arr = msgs.messages ?? msgs;
const userRow = arr.find((m) => m.role === 'user');
note('#10 round: user message carries the sender', userRow?.by === 'คนส่งแชต', `round ${round.s} status ${round.j?.status}; user row by ${JSON.stringify(userRow?.by)} (fake gateway answers with no changes)`);
const quiz = (await req('POST', `/v1/projects/${id}/quizzes`, {}, 'คนเริ่ม quiz')).j;
const ask = (await req('POST', `/v1/projects/${id}/quizzes/${quiz.id}/questions`, { question: 'มีกี่ขั้นตอน' }, 'คนถาม')).j;
const items = (await req('GET', `/v1/projects/${id}/quizzes/latest`)).j.items;
await req('POST', `/v1/projects/${id}/quizzes/${quiz.id}/items/${items[0].id}/mark`, { mark: 'wrong', note: 'ทดสอบ' }, 'คนตรวจ');
const h = (await hist()).slice(0, (await hist()).length - n0);
const kinds = h.map((e) => `${e.kind}:${e.by}`);
note('#10 quiz start / ask / mark audited with their names', ['quiz_start:คนเริ่ม quiz', 'quiz_ask:คนถาม', 'quiz_mark:คนตรวจ'].every((k) => kinds.includes(k)), JSON.stringify(kinds));
const wrongCs = h.find((e) => e.changeSetId && e.by === 'คนตรวจ');
note('#10 a wrong mark changes the spec under the marker\'s name', !!wrongCs, wrongCs ? `${wrongCs.kind}/${wrongCs.op} ${wrongCs.entity} by ${wrongCs.by}` : 'no change-set entry by คนตรวจ');
// undo
const lastCs = (await hist()).find((e) => e.changeSetId)?.changeSetId;
const und = await req('POST', `/v1/projects/${id}/change-sets/${lastCs}/undo`, undefined, 'คนย้อน');
const undoEntry = (await hist()).find((e) => e.by === 'คนย้อน');
note('#10 undo audited with its name', und.s < 300 && !!undoEntry, `${und.s} ${JSON.stringify(und.j?.error ?? '')}; entry ${undoEntry ? `${undoEntry.kind}:${undoEntry.op}` : 'none'}`);
// amendment from CAW: seam route, no X-Blueprint-By required (SPEC)
const am = await fetch(`${API}/v1/projects/${id}/amendments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ from: 'caw:test:operator', request: 'ทดสอบคำขอแก้จาก CAW' }) });
note('#10 CAW amendment still accepted without a typed name (seam)', am.status === 201, `${am.status}`);
// #3 warning halves (nothing stuck, quiz not complete) — read through the ready page text in a separate step
await Bun.write('paths-project-id.txt', id);
