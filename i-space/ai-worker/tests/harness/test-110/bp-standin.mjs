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
const now = () => new Date().toISOString();
const fresh = () => ({ revision: 1, savedAt: now(), label: null, parts: Object.fromEntries(SEED.parts.map((p) => [p.key, p])), removed: [],
  changes: [{ rev: 1, at: now(), by: 'โด่ง', cause: 'message', added: SEED.parts.map((p) => p.key), changed: [], removed: [] }] });
let db = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { [P1]: fresh(), [P2]: fresh() };
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
    if (path === '/qa/remove') { s.removed.push(b.key); commit(s, 'โด่ง', 'operator', { removed: [b.key] }); return json({ revision: s.revision }); }
    if (path === '/qa/restore') { s.removed = s.removed.filter((k) => k !== b.key); commit(s, 'โด่ง', 'undo', { added: [b.key] }); return json({ revision: s.revision }); }
    return err(404, 'not_found', 'qa route');
  }
  const m = /^\/v1\/projects\/([^/]+)(\/.*)?$/.exec(path);
  if (!m || !db[m[1]]) return err(404, 'not_found', 'project');
  const id = m[1], s = db[id], rest = m[2] ?? '';
  if (req.method === 'GET' && rest === '') return json({ project: { ...SEED.project, id }, parts: live(s), links: SEED.links }); // v1, unchanged
  // route 1
  if (req.method === 'GET' && rest === '/spec') return json({ projectId: id, revision: s.revision, savedAt: s.savedAt, latestLabel: latestLabel(s), parts: live(s), links: SEED.links });
  // route 2
  const ctx = /^\/spec\/parts\/([^/]+)\/context$/.exec(rest);
  if (req.method === 'GET' && ctx) {
    const key = decodeURIComponent(ctx[1]);
    if (!s.parts[key] || s.removed.includes(key)) return err(404, 'not_found', `part ${key}`);
    let base = { part: null, neighbours: [], decisions: [], flows: [], questions: [] };
    try { const { projectId: _p, version: _v, confirmedAt: _c, ...r } = fixture(`context-v1-${key.toLowerCase()}`); base = r; } catch {}
    return json({ projectId: id, revision: s.revision, savedAt: s.savedAt, latestLabel: latestLabel(s), ...base, part: s.parts[key] });
  }
  // route 3
  if (req.method === 'POST' && rest === '/spec/locate') {
    const b = await req.json(); if (typeof b.request !== 'string') return err(400, 'validation', 'request');
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
