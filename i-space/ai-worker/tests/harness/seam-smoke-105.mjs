// REQ-105 / REQ-112 seam smoke — CAW (caw-back) against the REAL blueprint-back v2 (TASK-113), before QA's joint run. Silver (SA, Team B), 2026-10-30.
// Expects, started beforehand, both in-memory, both on 127.0.0.1:
//   blueprint-back on BP  (DATABASE_URL=pglite:memory, CAW_NOTIFY_URL=<CAW>/v1/notify)
//   caw-back       on CAW (DATABASE_URL=pglite:memory, BLUEPRINT_URL=<BP>, CAW_POLL_MS=0 — so only the push moves CAW; no runner)
// usage: bun tests/harness/seam-smoke-105.mjs <blueprint-front dir (for its seed)> [BP=http://127.0.0.1:4211] [CAW=http://127.0.0.1:4531]
// Writes only into those two in-memory back ends. Prints one OK/BAD line per check.
import path from 'node:path';

const [front, BP = 'http://127.0.0.1:4211', CAW = 'http://127.0.0.1:4531'] = process.argv.slice(2);
for (const u of [BP, CAW]) if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(u)) throw new Error(`refused ${u}`);
const { large } = await import(path.join(front, 'tests/seed/large.ts'));
const by = { 'x-blueprint-by': encodeURIComponent('Silver smoke') }, op = { 'x-caw-actor': 'operator' };
async function call(base, method, route, body, headers = {}) {
  const res = await fetch(base + route, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
}
let bad = 0;
const note = (step, ok, detail) => { if (!ok) bad++; console.log(`${ok ? 'OK ' : 'BAD'} ${step} — ${detail}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 8000) { const end = Date.now() + ms; let v; while (Date.now() < end) { v = await fn(); if (v) return v; await sleep(250); } return v; }

// 1 Blueprint: a project, the large seed, NO label yet
const p = await call(BP, 'POST', '/v1/projects', { name: 'seam smoke 105', theme: 'clean-blue' }, by);
const bp = p.json?.id;
const cs = await call(BP, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: large }, by);
note('1 Blueprint seed', p.status === 201 && cs.status < 300, `project ${p.status}, change-set ${cs.status}`);
const spec = await call(BP, 'GET', `/v1/projects/${bp}/spec`);
note('1b real /spec', spec.status === 200 && Number.isInteger(spec.json?.revision) && spec.json.latestLabel === null, `revision ${spec.json?.revision}, latestLabel ${JSON.stringify(spec.json?.latestLabel)}, parts ${spec.json?.parts?.length}`);
const screen = spec.json.parts.find((x) => x.kind === 'screen') ?? spec.json.parts.find((x) => x.kind === 'step');
const step = spec.json.parts.find((x) => x.kind === 'step' && x.key !== screen.key);

// 2 CAW: a project with no label (AC-3), then cards on two parts
const cp = await call(CAW, 'POST', '/v1/projects', { blueprintProjectId: bp }, op);
const pid = cp.json?.id;
note('2 CAW create, no label', cp.status === 201 && cp.json.latestLabel === null && cp.json.spec?.revision === spec.json.revision, `status ${cp.status}, latestLabel ${JSON.stringify(cp.json?.latestLabel)}, spec ${JSON.stringify(cp.json?.spec)}`);
const c1 = await call(CAW, 'POST', `/v1/projects/${pid}/cards`, { title: 'งาน 1', todo: 'ทำ', anchor: { key: screen.key } }, op);
const c2 = await call(CAW, 'POST', `/v1/projects/${pid}/cards`, { title: 'งาน 2', todo: 'ทำ', anchor: { key: step.key } }, op);
note('2b cards on real keys', c1.status === 201 && c2.status === 201, `${screen.key} → ${c1.status}, ${step.key} → ${c2.status} ${c1.status !== 201 ? JSON.stringify(c1.json) : ''}`);

// 3 context through CAW (v2 route 2) + locate (route 3)
const ctx = await call(CAW, 'GET', `/v1/cards/${c1.json.id}/context`, null, op);
note('3 card context via real route 2', ctx.status === 200 && ctx.json?.spec?.revision === spec.json.revision && ctx.json?.specRead?.fromCache === false, `status ${ctx.status}, spec.revision ${ctx.json?.spec?.revision}, specRead ${JSON.stringify(ctx.json?.specRead)}`);
const loc = await call(BP, 'POST', `/v1/projects/${bp}/spec/locate`, { request: screen.title });
note('3b real route 3 shape', loc.status === 200 && 'revision' in (loc.json ?? {}) && Array.isArray(loc.json?.candidates), `status ${loc.status}, keys ${Object.keys(loc.json ?? {}).join(',')}`);

// 4 a label in Blueprint → push → CAW shows it (AC-4)
await call(BP, 'POST', `/v1/projects/${bp}/versions`, { label: 'v1' }, by);
const labelled = await until(async () => { const r = await call(CAW, 'GET', `/v1/projects/${pid}`, null, op); return r.json?.latestLabel?.label === 'v1' ? r : null; });
note('4 label v1 reaches CAW', !!labelled, labelled ? JSON.stringify(labelled.json.latestLabel) : 'not within 8 s (push or pull missing)');

// 5 edit the screen part → push spec.changed → CAW flags card 1 only (AC-1, CAW side)
const before = (await call(BP, 'GET', `/v1/projects/${bp}/spec`)).json.revision;
const ed = await call(BP, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.update', key: screen.key, title: `${screen.title} (แก้)` }] }, by);
const flagged = await until(async () => { const r = await call(CAW, 'GET', `/v1/projects/${pid}/cards`, null, op); const a = r.json?.cards?.find((c) => c.id === c1.json.id); return a?.specChangedVersion != null ? r.json.cards : null; });
const other = flagged?.find((c) => c.id === c2.json.id);
note('5 edit → push → card flagged', ed.status < 300 && !!flagged && other?.specChangedVersion == null, `change-set ${ed.status}, revision ${before}→${before + 1}; card1 ${JSON.stringify(flagged?.find((c) => c.id === c1.json.id)?.specChangedVersion)}, card2 ${JSON.stringify(other?.specChangedVersion)}`);
const ctx2 = await call(CAW, 'GET', `/v1/cards/${c1.json.id}/context`, null, op);
note('5b CAW reads the new text', ctx2.json?.spec?.part?.title === `${screen.title} (แก้)`, `title ${JSON.stringify(ctx2.json?.spec?.part?.title)}`);
const chg = await call(BP, 'GET', `/v1/projects/${bp}/spec/changes?after=${before}`);
note('5c real route 4 shape', chg.status === 200 && chg.json?.changes?.[0]?.changed?.includes(screen.key) && typeof chg.json.more === 'boolean', `changes ${JSON.stringify(chg.json?.changes?.map((c) => ({ rev: c.rev, changed: c.changed, added: c.added, removed: c.removed, cause: c.cause, by: c.by })))}`);

// 6 remove the step part → CAW: card 2 not workable, context 404 anchor_removed (Q4 / D12)
const rm = await call(BP, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.remove', key: step.key }] }, by);
const gone = await until(async () => { const r = await call(CAW, 'GET', `/v1/projects/${pid}/cards`, null, op); const b = r.json?.cards?.find((c) => c.id === c2.json.id); return b?.anchorRemoved ? b : null; });
const ctx3 = await call(CAW, 'GET', `/v1/cards/${c2.json.id}/context`, null, op);
note('6 remove → anchorRemoved + 404', rm.status < 300 && !!gone && gone.workable === false && ctx3.status === 404 && ctx3.json?.error?.code === 'anchor_removed', `change-set ${rm.status} ${rm.status >= 300 ? JSON.stringify(rm.json).slice(0, 200) : ''}; card2 anchorRemoved ${gone?.anchorRemoved} workable ${gone?.workable}; context ${ctx3.status} ${ctx3.json?.error?.code}`);

// 7 REQ-112: coverage against the real /spec (no relatedDecisions until TASK-117)
const cov = await call(CAW, 'GET', `/v1/projects/${pid}/coverage`, null, op);
note('7 coverage on the real spec', cov.status === 200 && Array.isArray(cov.json?.uncovered), `status ${cov.status}, revision ${cov.json?.revision}, uncovered ${cov.json?.uncovered?.length} (${(cov.json?.uncovered ?? []).slice(0, 3).map((u) => u.key).join(',')}…)`);

// 8 REQ-112 with the REAL relatedDecisions (TASK-117, added 2026-10-30): DEC-A covers a step card 1's screen takes part in → it reaches
//   the card's context as related and counts as covered; DEC-B covers a step no card touches → coverage lists it.
const ctxA = (await call(BP, 'GET', `/v1/projects/${bp}/spec/parts/${screen.key}/context`)).json;
const atSteps = new Set((ctxA?.flows ?? []).flatMap((f) => f.at));
const allSteps = (await call(BP, 'GET', `/v1/projects/${bp}/spec`)).json.parts.filter((x) => x.kind === 'step').map((x) => x.key);
const stepA = [...atSteps][0], stepB = allSteps.find((k) => !atSteps.has(k) && k !== step.key);
const origin = { stamp: 'operator', date: '2026-10-30' };
const dec = await call(BP, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: [
  { op: 'part.add', ref: '$decA', kind: 'decision', title: 'กฎ A (smoke)', body: { rule: 'ตอบภายใน 3 วิ' }, origin },
  { op: 'part.add', ref: '$decB', kind: 'decision', title: 'กฎ B (smoke)', body: { rule: 'เก็บ 10 ปี' }, origin },
  { op: 'link.add', kind: 'covers', from: '$decA', to: stepA, origin },
  { op: 'link.add', kind: 'covers', from: '$decB', to: stepB, origin },
] }, by);
const decs = (await call(BP, 'GET', `/v1/projects/${bp}/spec`)).json.parts.filter((x) => x.kind === 'decision' && /smoke/.test(x.title));
const keyA = decs.find((d) => d.title.startsWith('กฎ A'))?.key, keyB = decs.find((d) => d.title.startsWith('กฎ B'))?.key;
note('8 decisions added in Blueprint', dec.status < 300 && keyA && keyB, `change-set ${dec.status} ${dec.status >= 300 ? JSON.stringify(dec.json).slice(0, 200) : ''}; A=${keyA} covers ${stepA} (card 1's step), B=${keyB} covers ${stepB}`);
const ctx8 = await until(async () => { const r = await call(CAW, 'GET', `/v1/cards/${c1.json.id}/context`, null, op); return r.json?.spec?.relatedDecisions?.some?.((x) => x.decision?.key === keyA) ? r : null; });
const rel = ctx8?.json?.spec;
note('8b real relatedDecisions reach the card', !!ctx8 && typeof rel.relatedDecisionsMore === 'boolean', `relatedDecisions ${JSON.stringify(rel?.relatedDecisions?.map((x) => ({ via: x.via, decision: x.decision?.key })))}, more ${rel?.relatedDecisionsMore}`);
const cov8 = await call(CAW, 'GET', `/v1/projects/${pid}/coverage`, null, op);
const unc = cov8.json?.uncovered ?? [];
const listedB = unc.some((u) => u.decisions.includes(keyB)), listedA = unc.some((u) => u.decisions.includes(keyA));
note('8c coverage: A covered via related, B listed', cov8.status === 200 && listedB && !listedA, `uncovered ${JSON.stringify(unc.map((u) => ({ key: u.key, decisions: u.decisions })))}`);

console.log(bad === 0 ? 'ALL OK' : `${bad} BAD`);
process.exit(bad === 0 ? 0 : 1);
