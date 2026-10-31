// TEST-106 setup through CAW's API (the calls the team screen makes; the screen itself is covered by caw-front's e2e):
// 2 workers (FE, QA) on haiku/low with the one neutral skill, chain FE→QA, entry FE, build folder.
import fs from 'node:fs';
const API = 'http://127.0.0.1:4500', H = { 'content-type': 'application/json', 'X-CAW-Actor': 'operator' };
const P = '458a8293-6e60-4e88-9991-d9e90a857b43';
const call = async (method, path, body) => { const r = await fetch(API + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined }); const j = await r.json().catch(() => null); console.log(method, path, r.status, r.ok ? '' : JSON.stringify(j).slice(0, 300)); return j; };
const fe = await call('POST', '/v1/workers', { name: 'ฟ้า', roles: ['FE'], skills: ['i-space-builder'], model: 'haiku', effort: 'low' });
const qa = await call('POST', '/v1/workers', { name: 'ดิน', roles: ['QA'], skills: ['i-space-builder'], model: 'haiku', effort: 'low' });
const feId = fe.id ?? fe.worker?.id, qaId = qa.id ?? qa.worker?.id;
await call('POST', `/v1/projects/${P}/chain/members`, { workerId: feId });
await call('POST', `/v1/projects/${P}/chain/members`, { workerId: qaId });
await call('POST', `/v1/projects/${P}/chain/edges`, { from: feId, to: qaId });
await call('POST', `/v1/projects/${P}/chain/edges`, { from: qaId, to: feId });
await call('PUT', `/v1/projects/${P}/chain/entry`, { workerId: feId });
await call('PATCH', `/v1/projects/${P}/workspace`, { roots: ['/workspace/caw-workspaces/health-board'] });
fs.writeFileSync('workers.json', JSON.stringify({ feId, qaId }, null, 2));
const ts = await call('GET', '/v1/team-status');
console.log('team-status', JSON.stringify(ts).slice(0, 300));
