// TEST-112 (REQ-112): TEST-110's stand-in + project P3 = TEST-106's Health Board spec (tests/harness/test-106/step2-changeset.mjs, keys as
// Blueprint numbers them) whose part context carries `decisions` and — in mode `contract` — `relatedDecisions` computed by SPEC-106 § REQ-112
// addition (mode `none` = today, before TASK-117: the field is absent). /qa/related {mode} switches it; it does NOT change the revision
// (shipping TASK-117 changes Blueprint's answers, not the spec).
// TEST-110 (REQ-105): QA's OWN stand-in for blueprint-back, written from SPEC-106 § "Seam contract v2" — NOT Team B's test fake.
// Seeded with the worked seed RECORDED from a real blueprint-back (caw-back test/fixtures/blueprint: project-200 + the v1 contexts).
// Editable by QA (/qa/* routes), state kept in a JSON file so a stop + start (AC-5) resumes where it was. Logs every call.
// Real Blueprint v2 (Team A's TASK-113) is not built yet: this proves CAW against QA's reading of the contract, not against Blueprint.
// usage: bun bp-standin.mjs <port> <fixtures dir> <state file> <call log>
import fs from 'node:fs';
const [port, FIX, STATE, LOG] = process.argv.slice(2);
const fixture = (n) => JSON.parse(fs.readFileSync(`${FIX}/${n}.json`, 'utf8'));
const SEED = fixture('project-200');
export const P1 = SEED.project.id;
const P2 = '00000000-0000-4000-8000-0000000000c2'; // a second Blueprint project (CAW allows one CAW project per Blueprint project)
export const P3 = '00000000-0000-4000-8000-0000000001c2';
// TEST-106's spec, as entered there (same titles, bodies and links), keyed in Blueprint's order of appearance per kind
const o = { date: '2026-10-29', stamp: 'operator' };
const SVC = [['SYS-001', 'Blueprint API', 'http://127.0.0.1:4200/health'], ['SYS-002', 'Blueprint เว็บ', 'http://127.0.0.1:3100'], ['SYS-003', 'CAW API', 'http://127.0.0.1:4500/health'], ['SYS-004', 'CAW เว็บ', 'http://127.0.0.1:3500']];
const P = (key, kind, title, body = {}) => ({ key, kind, title, body, origin: o });
const L = (kind, fromKey, toKey) => ({ kind, fromKey, toKey, label: null, origin: o });
const SPEC112 = {
  parts: [P('WRK-001', 'work', 'I-Space Health Board', { goal: 'หน้าเว็บเดียว ดูว่าบริการของ I-Space ตัวไหนเปิดอยู่' }), P('ROLE-001', 'role', 'ผู้ดูแลระบบ', { duty: 'เปิดหน้าดูสถานะบริการของ I-Space' }),
    P('SCR-001', 'screen', 'หน้า Health Board', { fields: [], actions: [{ name: 'checkNow', label: 'เช็คตอนนี้' }], states: [] }),
    ...SVC.map(([k, n]) => P(k, 'system', n)), P('DATA-001', 'data', 'ServiceStatus', { fields: [{ name: 'name' }, { name: 'url' }] }),
    P('STEP-001', 'step', 'เปิดหน้า Health Board', { ends: false }), P('STEP-002', 'step', 'เช็คสถานะทั้ง 4 บริการ', { ends: false }), P('STEP-003', 'step', 'แสดงสถานะ', { ends: true }),
    P('INT-001', 'interaction', 'เปิด http://127.0.0.1:3900', { text: 'เปิด http://127.0.0.1:3900' }),
    ...SVC.map(([, n, u], i) => P(`INT-00${i + 2}`, 'interaction', `เช็ค ${n} (${u})`, { text: `เช็ค ${u}` })),
    P('INT-006', 'interaction', 'แสดงชื่อ · สถานะ · ms · เวลาที่เช็คล่าสุด ของแต่ละบริการ', { text: 'แสดงชื่อ · สถานะ · ms · เวลาที่เช็คล่าสุด' }),
    P('DEC-001', 'decision', 'แสดง 4 บริการ', { rule: 'แสดง 4 บริการ: ' + SVC.map(([, n, u]) => `${n} (${u})`).join(', ') }),
    P('DEC-002', 'decision', 'เช็คใหม่เองทุก 10 วินาที และมีปุ่ม "เช็คตอนนี้"', { rule: 'เช็คใหม่เองทุก 10 วินาที และมีปุ่ม "เช็คตอนนี้"' }),
    P('DEC-003', 'decision', 'ไม่ตอบภายใน 3 วินาที = "ไม่ตอบ"', { rule: 'ถ้าบริการไม่ตอบภายใน 3 วินาที ให้ถือว่า "ไม่ตอบ"' }),
    P('DEC-004', 'decision', 'รันที่ http://127.0.0.1:3900 ไม่ต้อง login ไม่ต้องมีฐานข้อมูล', { rule: 'รันในเครื่องที่ http://127.0.0.1:3900 ไม่ต้อง login ไม่ต้องมีฐานข้อมูล' }),
    P('DEC-005', 'decision', 'ข้อความบนหน้าเป็นภาษาไทย', { rule: 'ข้อความบนหน้าเป็นภาษาไทย' }),
    P('DEC-006', 'decision', 'ไม่ทำ: login, การแจ้งเตือน, เก็บประวัติ, deploy', { rule: 'ไม่ทำ: login, การแจ้งเตือน, เก็บประวัติ, deploy' })],
  links: [L('has_step', 'WRK-001', 'STEP-001'), L('has_step', 'WRK-001', 'STEP-002'), L('has_step', 'WRK-001', 'STEP-003'), L('next', 'STEP-001', 'STEP-002'), L('next', 'STEP-002', 'STEP-003'),
    L('has_interaction', 'STEP-001', 'INT-001'), L('from', 'INT-001', 'ROLE-001'), L('to', 'INT-001', 'SCR-001'),
    ...SVC.flatMap(([k], i) => [L('has_interaction', 'STEP-002', `INT-00${i + 2}`), L('from', `INT-00${i + 2}`, 'SCR-001'), L('to', `INT-00${i + 2}`, k)]),
    L('has_interaction', 'STEP-003', 'INT-006'), L('from', 'INT-006', 'SCR-001'), L('to', 'INT-006', 'ROLE-001'), L('shows', 'SCR-001', 'DATA-001'),
    L('covers', 'DEC-001', 'STEP-002'), L('covers', 'DEC-002', 'STEP-002'), L('covers', 'DEC-003', 'STEP-002'), L('covers', 'DEC-004', 'WRK-001'), L('covers', 'DEC-005', 'SCR-001'), L('covers', 'DEC-006', 'WRK-001')],
};
// QA's reading of SPEC-106 § REQ-112 addition: flows[].at = the steps whose interactions the part is in (a step: itself); flows[].work = the
// works that have those steps (a work: itself). relatedDecisions = decisions covering those steps/works, minus `decisions`; via = lowest key.
const ctx112 = (key, mode) => {
  const { parts, links } = SPEC112; const part = parts.find((p) => p.key === key);
  const covers = (k) => links.filter((l) => l.kind === 'covers' && l.toKey === k).map((l) => l.fromKey);
  const own = covers(key);
  const ints = links.filter((l) => (l.kind === 'from' || l.kind === 'to') && l.toKey === key).map((l) => l.fromKey).concat(part.kind === 'interaction' ? [key] : []);
  const at = [...new Set(links.filter((l) => l.kind === 'has_interaction' && ints.includes(l.toKey)).map((l) => l.fromKey).concat(part.kind === 'step' ? [key] : []))].sort();
  const works = [...new Set(links.filter((l) => l.kind === 'has_step' && at.includes(l.toKey)).map((l) => l.fromKey).concat(part.kind === 'work' ? [key] : []))].sort();
  const related = new Map();
  for (const via of [...at, ...works].sort()) for (const d of covers(via)) if (!own.includes(d) && !related.has(d)) related.set(d, via);
  const body = { part, neighbours: [], decisions: own.sort().map((k) => parts.find((p) => p.key === k)), flows: works.map((w) => ({ work: w, at })), questions: [] };
  if (mode === 'contract') { body.relatedDecisions = [...related].sort(([a], [b]) => a.localeCompare(b)).slice(0, 50).map(([k, via]) => ({ via, decision: parts.find((p) => p.key === k) })); body.relatedDecisionsMore = related.size > 50; }
  return body;
};
const now = () => new Date().toISOString();
const fresh = () => ({ revision: 1, savedAt: now(), label: null, parts: Object.fromEntries(SEED.parts.map((p) => [p.key, p])), removed: [],
  changes: [{ rev: 1, at: now(), by: 'โด่ง', cause: 'message', added: SEED.parts.map((p) => p.key), changed: [], removed: [] }] });
const fresh112 = () => ({ revision: 1, savedAt: now(), label: null, related: 'none', spec112: true, parts: Object.fromEntries(SPEC112.parts.map((p) => [p.key, p])), removed: [],
  changes: [{ rev: 1, at: now(), by: 'โด่ง', cause: 'operator', added: SPEC112.parts.map((p) => p.key), changed: [], removed: [] }] });
let db = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { [P1]: fresh(), [P2]: fresh(), [P3]: fresh112() };
const save = () => fs.writeFileSync(STATE, JSON.stringify(db));
save();
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const err = (status, code, message) => json({ error: { code, message } }, status);
const latestLabel = (s) => s.label; // { version, label, labelledAt, by } | null
const live = (s) => Object.values(s.parts).filter((p) => !s.removed.includes(p.key)).sort((a, b) => a.key.localeCompare(b.key));
const commit = (s, by, cause, d) => { s.revision += 1; s.savedAt = now(); s.changes.push({ rev: s.revision, at: s.savedAt, by, cause, added: [], changed: [], removed: [], ...d }); save(); };
Bun.serve({ hostname: '127.0.0.1', port: Number(port), async fetch(req) {
  const u = new URL(req.url); const path = u.pathname;
  fs.appendFileSync(LOG, `${now()} ${req.method} ${path}${u.search}\n`);
  // ---- QA admin (not Blueprint) ----
  if (path.startsWith('/qa/')) {
    const b = req.method === 'POST' ? await req.json() : {}; const s = db[b.project ?? u.searchParams.get('project') ?? P1];
    if (path === '/qa/state') return json({ revision: s.revision, label: s.label, removed: s.removed, titles: Object.fromEntries(Object.entries(s.parts).map(([k, p]) => [k, p.title])) });
    if (path === '/qa/edit') { s.parts[b.key] = { ...s.parts[b.key], title: b.title ?? s.parts[b.key].title, body: b.body ?? s.parts[b.key].body }; commit(s, 'โด่ง', 'operator', { changed: [b.key] }); return json({ revision: s.revision }); }
    if (path === '/qa/label') { s.label = { version: (s.label?.version ?? 0) + 1, label: b.label, labelledAt: now(), by: 'โด่ง' }; save(); return json({ label: s.label, revision: s.revision }); } // a label is not a spec change (SPEC-106 V2)
    if (path === '/qa/related') { s.related = b.mode; save(); return json({ related: s.related, revision: s.revision }); }
    if (path === '/qa/remove') { s.removed.push(b.key); commit(s, 'โด่ง', 'operator', { removed: [b.key] }); return json({ revision: s.revision }); }
    if (path === '/qa/restore') { s.removed = s.removed.filter((k) => k !== b.key); commit(s, 'โด่ง', 'undo', { added: [b.key] }); return json({ revision: s.revision }); }
    return err(404, 'not_found', 'qa route');
  }
  const m = /^\/v1\/projects\/([^/]+)(\/.*)?$/.exec(path);
  if (!m || !db[m[1]]) return err(404, 'not_found', 'project');
  const id = m[1], s = db[id], rest = m[2] ?? '';
  const linksOf = (s) => (s.spec112 ? SPEC112.links : SEED.links);
  if (req.method === 'GET' && rest === '') return json({ project: { ...SEED.project, id }, parts: live(s), links: linksOf(s) }); // v1, unchanged
  // route 1
  if (req.method === 'GET' && rest === '/spec') return json({ projectId: id, revision: s.revision, savedAt: s.savedAt, latestLabel: latestLabel(s), parts: live(s), links: linksOf(s) });
  // route 2
  const ctx = /^\/spec\/parts\/([^/]+)\/context$/.exec(rest);
  if (req.method === 'GET' && ctx) {
    const key = decodeURIComponent(ctx[1]);
    if (!s.parts[key] || s.removed.includes(key)) return err(404, 'not_found', `part ${key}`);
    if (s.spec112) return json({ projectId: id, revision: s.revision, savedAt: s.savedAt, latestLabel: latestLabel(s), ...ctx112(key, s.related) });
    let base = { part: null, neighbours: [], decisions: [], flows: [], questions: [] };
    try { const { projectId: _p, version: _v, confirmedAt: _c, ...r } = fixture(`context-v1-${key.toLowerCase()}`); base = r; } catch {}
    return json({ projectId: id, revision: s.revision, savedAt: s.savedAt, latestLabel: latestLabel(s), ...base, part: s.parts[key] });
  }
  // route 3
  if (req.method === 'POST' && rest === '/spec/locate') {
    const b = await req.json(); if (typeof b.request !== 'string') return err(400, 'validation', 'request');
    // TEST-112: for TEST-106's spec, QA's minimal locate — every live part whose title shares a word (≥ 3 chars) with the request, score 1
    if (s.spec112) { const words = b.request.split(/\s+/).filter((x) => x.length >= 3); const candidates = live(s).filter((p) => words.some((w) => p.title.includes(w))).map((p) => ({ key: p.key, kind: p.kind, title: p.title, score: 1, matched: words.filter((w) => p.title.includes(w)), where: ['title'] })); return json({ revision: s.revision, notInSpec: candidates.length === 0, candidates }); }
    const name = b.request.includes('ห้องใหญ่') ? 'locate-room' : b.request.includes('ค้นหาห้อง') ? 'locate-search' : 'locate-none';
    const { version: _v, ...r } = fixture(name); return json({ revision: s.revision, ...r });
  }
  // route 4
  if (req.method === 'GET' && rest === '/spec/changes') {
    const raw = u.searchParams.get('after') ?? '0';
    if (!/^\d+$/.test(raw)) return err(400, 'validation', 'after must be an integer ≥ 0');
    const after = Number(raw);
    const changes = s.changes.filter((c) => c.rev > after).sort((a, b) => a.rev - b.rev).slice(0, 500);
    return json({ revision: s.revision, latestLabel: latestLabel(s), changes, more: s.changes.filter((c) => c.rev > after).length > 500 });
  }
  if (req.method === 'POST' && rest === '/amendments') return json(fixture('amendment-201'), 201); // v1, unchanged (recorded)
  return err(404, 'not_found', `QA stand-in serves no ${req.method} ${rest} (logged)`); // any other v1 call shows up in the log
} });
console.log(`bp stand-in on 127.0.0.1:${port} · P1 ${P1} · P2 ${P2} · state ${STATE}`);
