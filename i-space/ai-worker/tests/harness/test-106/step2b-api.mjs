// TEST-106 workaround, part 2: the stuck rule `screen_without_api` needs an api part on the screen. The spec names
// GET …/health on the two API services, so that is modelled as the API the screen calls (finding P1-5).
import fs from 'node:fs';
const API = 'http://127.0.0.1:4200';
const id = fs.readFileSync('project-id.txt', 'utf8').trim();
const keys = JSON.parse(fs.readFileSync('changeset-result.json', 'utf8')).keys;
const origin = { stamp: 'operator', date: '2026-10-29', note: 'TEST-106 workaround (P1-5): api part forced by screen_without_api' };
const changes = [
  { op: 'part.add', ref: '$api1', kind: 'api', title: 'เช็คสถานะ (GET /health)', body: { method: 'GET', path: '/health', responses: [{ status: 200, note: 'ทำงาน' }] }, origin },
  { op: 'part.add', ref: '$int9', kind: 'interaction', title: 'เรียก GET /health ของ Blueprint API และ CAW API', body: { text: 'เรียก GET /health ภายใน 3 วินาที' }, origin },
  { op: 'link.add', kind: 'has_interaction', from: keys['$step2'], to: '$int9', origin },
  { op: 'link.add', kind: 'from', from: '$int9', to: keys['$scr1'], origin },
  { op: 'link.add', kind: 'to', from: '$int9', to: '$api1', origin },
];
const r = await fetch(`${API}/v1/projects/${id}/change-sets`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cause: { kind: 'operator' }, changes }) });
console.log('change-set', r.status, JSON.stringify(await r.json()).slice(0, 300));
console.log('stuck', JSON.stringify(await (await fetch(`${API}/v1/projects/${id}/stuck`)).json()));
