// TEST-111 ROUND 2 (REQ-114 E14) — TEST-111's stub (all modes kept) plus: `live111r1` / `live111r2` = QA's rebuilds of TEST-111's live
// rounds (from the parts they stored: ../ac1-round1-spec.json, ../ac1-round2-spec.json — the live replies were readable, so not kept),
// `live111r1-no3900` (the same, WRK-001's goal without :3900), `none` (a reply with no change), `holds31000` (one part holding :31000).
// TEST-111 (REQ-114), copied from TEST-107 round 4's stub (all its modes kept, for AC-3), plus `replay114` and `paths`.
// TEST-107 round 4: a local stand-in LLM gateway, mode read from a file on EVERY request — never the real gateway.
// usage: bun gateway-r4.mjs <port> <log file> <mode file>
//   feature / good / partial / replay / unreadable — as round 3 (gateway-r3.mjs)
//   sleep    — never answers in time: answers only after 200 s (past the round-4 first-answer limit of 180 s, SPEC-105 E12)
//   slow120  — answers a protocol-correct `good` reply after 120 s (REQ-110 AC-9)
//   live-r2  — rebuilds the state the LIVE round-3 project had after its applied round (7 parts as stored, Q-001 offered),
//              from ../r3/ac1-round2-spec.json, so the recorded accept reply can be replayed against the same keys
//   accept   — the LIVE accept reply the real model sent in round 3 (`type` for `op`), from ../r3/ac1-round3-accept-messages.json
//              `roundRaw`, cut at 4000 chars inside its last key; closed with `": [] }` (QA's addition, as SPEC-105 § Round 4 says)
import fs from 'node:fs';
const [port, log, modeFile] = process.argv.slice(2);
const QUOTE = 'ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const reply = (changes, text, questions = []) => JSON.stringify({ reply: text, changes, questions, contradictions: [] });
const answer = (content) => json({ success: true, data: { provider: 'fake', model: 'qa-stub', content, usage: {}, latency_ms: 1 } });
const item = (change, quote = QUOTE) => ({ change, saidBy: 'user', quote, sure: true });
const add = (ref, kind, title, body) => item({ op: 'part.add', ref, kind, title, ...(body === undefined ? {} : { body }) });
const link = (kind, from, to) => item({ op: 'link.add', kind, from, to });
const r3 = new URL('../test-107/r3/', import.meta.url);
const r4 = new URL('../test-107/r4/', import.meta.url);
const T111 = new URL('../test-111/', import.meta.url);
const LIVE = JSON.parse(fs.readFileSync(new URL('ac1-round2-spec.json', r3), 'utf8'));
const msgs = JSON.parse(fs.readFileSync(new URL('ac1-round3-accept-messages.json', r3), 'utf8'));
const ACCEPT = (msgs.messages ?? msgs).find((m) => m.roundRaw).roundRaw + '": [] }';
JSON.parse(ACCEPT); // fail at start, not mid-test, if the closing is wrong
const LIVE_MSG = 'ทำหน้า Health Board แสดงสถานะบริการ I-Space ให้หน่อย';
const liveR2 = () => {
  const order = ['work', 'role', 'screen', 'step', 'interaction'];
  const parts = LIVE.parts.filter((p) => p.kind !== 'question').sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.key.localeCompare(b.key));
  // every live part was stamped team-proposed (the model inferred it) — so `saidBy: inferred`, no quote, as the live reply had
  const changes = parts.map((p) => ({ change: { op: 'part.add', ref: '$' + p.key.replace('-', '_').toLowerCase(), kind: p.kind, title: p.title, body: p.body }, saidBy: 'inferred', sure: true }));
  const q = LIVE.parts.find((p) => p.kind === 'question');
  return reply(changes, 'บันทึกโครงหน้า Health Board แล้วครับ', [{ text: q.body.text, proposedAnswer: q.body.proposedAnswer, cases: q.body.cases }]);
};
// replay114 — QA's REBUILD of the live round-1 answer of TEST-107 round 4 (REQ-114 AC-1). The reply itself was not kept (it was
// readable, so no roundRaw); rebuilt from what the record does keep: the parts it stored (r4/ac1-round1-spec.json, all inferred) + its 2
// questions + the 4 `api` parts it sent, with the recorded ref and title and the spec's own URL in `path` (the refusal detail says `path`
// failed "must start with /"). The 4 `covers` links are left out: they hung on a decision that is in neither the stored parts nor the record.
const R4S = JSON.parse(fs.readFileSync(new URL('ac1-round1-spec.json', r4), 'utf8'));
const inferred = (change) => ({ change, saidBy: 'inferred', sure: true });
const API4 = [['$api_blueprint_api_health', 'Blueprint API Health', 'http://127.0.0.1:4200/health'], ['$api_blueprint_web', 'Blueprint เว็บ', 'http://127.0.0.1:3100'],
  ['$api_caw_api_health', 'CAW API Health', 'http://127.0.0.1:4500/health'], ['$api_caw_web', 'CAW เว็บ', 'http://127.0.0.1:3500']];
const replay114 = () => {
  const own = R4S.parts.filter((p) => p.kind !== 'question');
  const refOf = (k) => '$' + k.replace('-', '_').toLowerCase();
  const changes = [...own.map((p) => inferred({ op: 'part.add', ref: refOf(p.key), kind: p.kind, title: p.title, body: p.body })),
    ...API4.map(([ref, title, path]) => inferred({ op: 'part.add', ref, kind: 'api', title, body: { method: 'GET', path } })),
    ...R4S.links.map((l) => inferred({ op: 'link.add', kind: l.kind, from: refOf(l.fromKey), to: refOf(l.toKey) }))];
  const qs = R4S.parts.filter((p) => p.kind === 'question').map((q) => ({ text: q.body.text, proposedAnswer: q.body.proposedAnswer, cases: q.body.cases }));
  return reply(changes, 'บันทึกโครงหน้า Health Board แล้วครับ', qs);
};
// paths — REQ-114 neighbours: one api part per address form, each on its own so a refusal names exactly one
const PATHS = [['/rooms', 'p_slash'], ['https://example.test/api/v1', 'p_https'], ['127.0.0.1:4200/health', 'p_hostport'], ['localhost:3100', 'p_localhost'],
  ['ftp://127.0.0.1/x', 'p_ftp'], ['javascript:alert(1)', 'p_js'], ['https://', 'p_empty_host'], ['http://127.0.0.1:4200/health?x=1#y', 'p_query']];
const paths = () => reply(PATHS.map(([path, r]) => inferred({ op: 'part.add', ref: '$' + r, kind: 'api', title: `QA path ${path}`, body: { method: 'GET', path } })), 'บันทึกให้แล้วครับ');
const L1 = JSON.parse(fs.readFileSync(new URL('ac1-round1-spec.json', T111), 'utf8'));
const L2 = JSON.parse(fs.readFileSync(new URL('ac1-round2-spec.json', T111), 'utf8'));
const refOf111 = (k) => '$' + k.replace('-', '_').toLowerCase();
const rebuild = (parts, links, extraQuestions = []) => reply(
  [...parts.filter((p) => p.kind !== 'question').map((p) => inferred({ op: 'part.add', ref: refOf111(p.key), kind: p.kind, title: p.title, body: p.body })),
   ...links.map((l) => inferred({ op: 'link.add', kind: l.kind, from: refOf111(l.fromKey), to: refOf111(l.toKey) }))],
  'บันทึกให้แล้วครับ', [...parts.filter((p) => p.kind === 'question').map((q) => ({ text: q.body.text, proposedAnswer: q.body.proposedAnswer, cases: q.body.cases })), ...extraQuestions]);
// questions travel as `questions` (not part.add), so links that point at a question key are left out of the rebuild (QA's rebuild, not the model's)
const qKeys = new Set(L1.parts.filter((p) => p.kind === 'question').map((p) => p.key));
const live111r1 = (no3900 = false) => rebuild(L1.parts.map((p) => (no3900 && p.key === 'WRK-001' ? { ...p, body: { ...p.body, goal: 'หน้าเว็บภาษาไทยหน้าเดียว ดูสถานะบริการ I-Space 4 รายการ' } } : p)), L1.links.filter((l) => !qKeys.has(l.fromKey) && !qKeys.has(l.toKey)));
// round 2 = the accept: what the live round-2 spec holds that round 1 did not (DEC-003 + 2 new questions), links to existing keys by key
const k1 = new Set(L1.parts.map((p) => p.key));
const live111r2 = () => { const fresh = L2.parts.filter((p) => !k1.has(p.key)); const fk = new Set(fresh.map((p) => p.key));
  return reply([...fresh.filter((p) => p.kind !== 'question').map((p) => inferred({ op: 'part.add', ref: refOf111(p.key), kind: p.kind, title: p.title, body: p.body })),
    ...L2.links.filter((l) => fk.has(l.fromKey) && !fk.has(l.toKey) ? true : false).map((l) => inferred({ op: 'link.add', kind: l.kind, from: refOf111(l.fromKey), to: l.toKey }))],
    'บันทึกคำตอบแล้วครับ', fresh.filter((p) => p.kind === 'question').map((q) => ({ text: q.body.text, proposedAnswer: q.body.proposedAnswer, cases: q.body.cases }))); };
Bun.serve({ hostname: '127.0.0.1', port: Number(port), idleTimeout: 255, async fetch(req) {
  const p = new URL(req.url).pathname;
  const mode = (() => { try { return fs.readFileSync(modeFile, 'utf8').trim(); } catch { return 'feature'; } })();
  fs.appendFileSync(log, `${new Date().toISOString()} ${mode} ${req.method} ${p}\n`);
  if (p.startsWith('/models')) return json({ fake: ['qa-stub'] });
  if (mode === 'sleep') { await new Promise((r) => setTimeout(r, 200_000)); return answer(reply([], 'ช้าเกินไป')); }
  if (mode === 'slow120') { await new Promise((r) => setTimeout(r, 120_000)); return answer(reply([add('$w', 'work', 'งานที่ตอบช้า 120 วินาที', {})], 'เพิ่มงานให้แล้วครับ')); }
  if (mode === 'live-r2') return answer(liveR2());
  if (mode === 'replay114') return answer(replay114());
  if (mode === 'live111r1') return answer(live111r1());
  if (mode === 'live111r1-no3900') return answer(live111r1(true));
  if (mode === 'live111r2') return answer(live111r2());
  if (mode === 'none') return answer(reply([], 'รับทราบครับ'));
  // TEST-114 (REQ-116): `holds:<address>` — the reply adds one system part whose title holds exactly that address
  if (mode.startsWith('holds:')) return answer(reply([inferred({ op: 'part.add', ref: '$sys', kind: 'system', title: `บริการทดสอบ ${mode.slice(6)}` })], 'บันทึกให้แล้วครับ'));
  if (mode === 'holds31000') return answer(reply([inferred({ op: 'part.add', ref: '$sys', kind: 'system', title: 'บริการทดสอบ http://127.0.0.1:31000' })], 'บันทึกให้แล้วครับ'));
  if (mode === 'paths') return answer(paths());
  if (mode === 'accept') return answer(ACCEPT);
  if (mode === 'unreadable') return answer('QA-UNREADABLE นี่ไม่ใช่ JSON {{{');
  if (mode === 'replay') return answer(reply([
    add('$work', 'work', 'QA Health Board', { goal: 'หน้าเว็บแสดงสถานะบริการ' }),
    add('$role', 'role', 'ผู้ใช้ภายใน QA', { duty: 'เปิดแดชบอร์ด' }),
    add('$monitor', 'system', 'ตัวตรวจสถานะ QA'),
    add('$status-data', 'data', 'สถานะบริการ QA', {}),
    add('$dashboard', 'screen', 'หน้าแดชบอร์ด QA', { fields: 'ชื่อบริการ, สถานะ', actions: 'เช็คตอนนี้', states: 'ปกติ, ล่ม' }),
    add('$availability', 'decision', 'เกณฑ์สถานะ QA', { rule: 'ตอบ 200 ภายใน 3 วิ = ปกติ', cases: '200 = ปกติ', open: true }),
    add('$step-view', 'step', 'ดูสถานะ QA', { ends: false }),
    add('$open-dashboard', 'interaction', 'เปิดแดชบอร์ด QA', { text: 'เปิดแดชบอร์ด' }),
    link('has_step', '$work', '$step-view'), link('has_interaction', '$step-view', '$open-dashboard'),
    link('from', '$open-dashboard', '$role'), link('to', '$open-dashboard', '$dashboard'),
    link('shows', '$dashboard', '$status-data'), link('covers', '$availability', '$monitor'),
  ], 'บันทึกให้แล้วครับ'));
  if (mode === 'partial') {
    const c = (ref, kind, title) => add(ref, kind, title, {});
    return answer(reply([c('$w', 'work', 'งานทดสอบ AC-6'), c('$r', 'role', 'ผู้ใช้ทดสอบ'), c('$s', 'screen', 'หน้าทดสอบ AC-6'), c('$y', 'system', 'ระบบทดสอบ'), c('$f', 'feature', 'ฟีเจอร์ที่ไม่มีจริง')], 'บันทึกให้แล้วครับ'));
  }
  if (mode === 'good') return answer(reply([add('$w', 'work', 'งานทดสอบ TEST-107', {})], 'เพิ่มงานให้แล้วครับ'));
  return answer(reply([add('$x', 'feature', 'ฟีเจอร์ใหม่', {})], 'บันทึกให้แล้วครับ'));
} });
console.log(`gateway r4 stub on 127.0.0.1:${port}`);
