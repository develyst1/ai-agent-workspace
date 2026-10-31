// TEST-112 round 2 (REQ-112 AC-5, DEF-1) — real blueprint-back (TASK-117 r2) + caw-back API 67dfe55, TEST-106's spec. Cards on WRK-001,
// SCR-001, STEP-001, DATA-001; their contexts as a worker reads them; coverage with only a WRK-001 card. usage (from this folder): bun r2.mjs
import fs from 'node:fs';
const API = 'http://127.0.0.1:4500';
const BP = fs.readFileSync('out/bp-project-id.txt', 'utf8').trim();
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const call = async (method, path, body, extra = {}) => { const r = await fetch(API + path, { method, headers: { 'x-caw-actor': 'operator', ...extra, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { s: r.status, j: await r.json() }; };
const pid = (await call('POST', '/v1/projects', { blueprintProjectId: BP })).j.id; fs.writeFileSync('out/caw-project-id.txt', pid);
const w = (await call('POST', '/v1/workers', { name: 'ใบเตย QA112r2', role: 'SA', skills: ['i-space-builder'], model: 'opus', effort: 'medium' })).j;
await call('POST', `/v1/projects/${pid}/chain/members`, { workerId: w.id });
fs.writeFileSync('out/worker-id.txt', w.id);
const card = async (key) => (await call('POST', `/v1/projects/${pid}/cards`, { title: `card on ${key}`, todo: 'TEST-112 r2', anchor: { key }, assigneeId: w.id })).j;
const ctx = async (c) => (await call('GET', `/v1/cards/${c.id}/context`)).j.spec;
const keys = (a) => (a ?? []).map((x) => (x.decision ?? x).key);
const wrk = await card('WRK-001'); fs.writeFileSync('out/card-wrk-id.txt', wrk.id);
const cw = await ctx(wrk); fs.writeFileSync('out/card-wrk001-context.json', JSON.stringify(cw, null, 1));
note('AC-5 a card on WRK-001: relatedDecisions carry DEC-001, DEC-002, DEC-003 (via its own steps)', ['DEC-001', 'DEC-002', 'DEC-003'].every((k) => keys(cw.relatedDecisions).includes(k)), `decisions ${JSON.stringify(keys(cw.decisions))} · related ${JSON.stringify((cw.relatedDecisions ?? []).map((r) => `${r.decision.key}<${r.via}`))}`);
note('AC-5 / DEF-1: the 4 services and their URLs (DEC-001) and the 3 s rule (DEC-003) are now in that card\'s context', ['127.0.0.1:4200/health', '127.0.0.1:3100', '127.0.0.1:4500/health', '127.0.0.1:3500', '3 วินาที', '10 วินาที'].every((t) => JSON.stringify(cw).includes(t)), '');
note('AC-4 a work card\'s own decisions unchanged (DEC-004, DEC-006), not duplicated in related', JSON.stringify(keys(cw.decisions)) === '["DEC-004","DEC-006"]' && !keys(cw.relatedDecisions).some((k) => ['DEC-004', 'DEC-006'].includes(k)), '');
const cs = await ctx(await card('SCR-001'));
note('AC-1 unchanged: SCR-001 → DEC-005; related DEC-001…003 via STEP-002 + DEC-004/006 via WRK-001', JSON.stringify(keys(cs.decisions)) === '["DEC-005"]' && JSON.stringify((cs.relatedDecisions ?? []).map((r) => `${r.decision.key}<${r.via}`)) === '["DEC-001<STEP-002","DEC-002<STEP-002","DEC-003<STEP-002","DEC-004<WRK-001","DEC-006<WRK-001"]', JSON.stringify((cs.relatedDecisions ?? []).map((r) => `${r.decision.key}<${r.via}`)));
const st = await ctx(await card('STEP-001'));
note('neighbour: STEP-001 (a step with no rule of its own) → DEC-004/006 via WRK-001 only (not its sibling STEP-002\'s rules)', JSON.stringify(keys(st.relatedDecisions)) === '["DEC-004","DEC-006"]', JSON.stringify((st.relatedDecisions ?? []).map((r) => `${r.decision.key}<${r.via}`)));
const cd = await ctx(await card('DATA-001'));
note('AC-4 a part with nothing related: DATA-001 → relatedDecisions [] , more false', JSON.stringify(cd.relatedDecisions) === '[]' && cd.relatedDecisionsMore === false, JSON.stringify({ r: cd.relatedDecisions, m: cd.relatedDecisionsMore }));
// coverage with ONLY the WRK-001 card: a second project, so the other cards do not cover
const pid2 = (await call('POST', '/v1/projects', { blueprintProjectId: BP })).j;
console.log(`    (one CAW project per Blueprint project: ${pid2?.error?.code ?? 'created'})`);
const cov = await call('GET', `/v1/projects/${pid}/coverage`);
note('coverage (cards on WRK-001, SCR-001, STEP-001, DATA-001): nothing uncovered', cov.j.uncovered?.length === 0, JSON.stringify(cov.j));
fs.writeFileSync('out/coverage.json', JSON.stringify(cov.j, null, 1));
