// TEST-111 (REQ-114) AC-1 — QA's rebuild of the live round-1 answer (stub `replay114`) through the real chat page; then the address-form
// neighbours (stub `paths`) through the API the page posts to. Web :3141, API :4231, stub :4398. usage (from this folder): bun ac1.mjs <front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3141', API = 'http://127.0.0.1:4231';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const URLS = { 'Blueprint API Health': 'http://127.0.0.1:4200/health', 'Blueprint เว็บ': 'http://127.0.0.1:3100', 'CAW API Health': 'http://127.0.0.1:4500/health', 'CAW เว็บ': 'http://127.0.0.1:3500' };
const chats = () => fs.readFileSync('gateway-modes.log', 'utf8').split('\n').filter((l) => l.includes('POST /chat')).length;
const mode = (m) => fs.writeFileSync('mode.txt', m);
const spec = async (id) => (await fetch(`${API}/v1/projects/${id}`)).json();
const bot = async (id) => { for (let i = 0; i < 60; i++) { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); const b = (m.messages ?? m).filter((x) => x.role === 'bot' && x.roundStatus).pop(); if (b) return b; await new Promise((r) => setTimeout(r, 1000)); } return null; };
const newProject = async (name) => (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name, theme: 'clean-blue' }) })).json()).id;

const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const p = await ctx.newPage(); p.setDefaultTimeout(30000);

// AC-1
mode('replay114');
const id = await newProject('TEST-111 AC-1 rebuilt round 1');
await p.goto(`${WEB}/p/${id}/chat`, { waitUntil: 'networkidle' });
const c0 = chats();
const box = p.locator('textarea').first(); await box.fill(fs.readFileSync('../test-106/spec.txt', 'utf8').trim()); await box.press('Enter');
const row = await bot(id); await p.reload({ waitUntil: 'networkidle' });
const s = await spec(id);
const apis = s.parts.filter((x) => x.kind === 'api');
note('AC-1 round applied, 1 call, nothing refused', row?.roundStatus === 'applied' && chats() - c0 === 1 && !(row?.roundRefused?.length), `${row?.roundStatus}; calls ${chats() - c0}; refused ${JSON.stringify(row?.roundRefused ?? null)}`);
note('AC-1 the 4 services are stored as api parts with their full addresses', Object.entries(URLS).every(([t, u]) => apis.some((a) => a.title === t && a.body.path === u)), JSON.stringify(apis.map((a) => `${a.key} ${a.title} ${a.body.method} ${a.body.path}`)));
note('AC-1 everything round 1 stored live is stored again (WRK, SCR, STEP, has_step, 2 questions)', ['WRK-001', 'SCR-001', 'STEP-001', 'Q-001', 'Q-002'].every((k) => s.parts.some((x) => x.key === k)) && s.links.some((l) => l.kind === 'has_step'), JSON.stringify(s.parts.map((x) => x.key)));
fs.writeFileSync('ac1-bot-row.json', JSON.stringify(row, null, 1)); fs.writeFileSync('ac1-spec.json', JSON.stringify(s, null, 1));
await p.screenshot({ path: 'ac1-chat.png', fullPage: true });
// where a reader finds them: each api part's own page in the spec (the address shown whole)
for (const a of apis.slice(0, 1)) {
  const links = await p.locator(`a[href*="${a.key}"]`).count();
  console.log(`    ${a.key}: links on the chat page ${links}`);
}
const pages = [];
for (const path of [`/p/${id}`, `/p/${id}/technical`, `/p/${id}/flow`]) {
  try { const r = await p.goto(WEB + path, { waitUntil: 'networkidle' }); const t = await p.textContent('body'); pages.push([path, r?.status(), Object.values(URLS).filter((u) => t.includes(u)).length]); } catch (e) { pages.push([path, 'error', 0]); }
}
console.log('    pages showing the addresses (path, status, how many of 4):', JSON.stringify(pages));

// neighbours: address forms
mode('paths');
const id2 = await newProject('TEST-111 address forms');
const r = await (await fetch(`${API}/v1/projects/${id2}/rounds`, { method: 'POST', headers: by, body: JSON.stringify({ message: 'ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย' }) })).json();
const s2 = await spec(id2);
const stored = s2.parts.filter((x) => x.kind === 'api').map((x) => x.body.path);
const refused = (r.refused ?? []).map((x) => `${x.title.replace('QA path ', '')} → ${x.reason}: ${String(x.detail).split('\n')[0]}`);
console.log('    stored paths:', JSON.stringify(stored));
console.log('    refused:', JSON.stringify(refused, null, 1));
const expectStored = ['/rooms', 'https://example.test/api/v1', 'http://127.0.0.1:4200/health?x=1#y'];
const expectRefused = ['ftp://127.0.0.1/x', 'javascript:alert(1)', 'https://'];
note('neighbour: "/path", https URL and a URL with query stored', expectStored.every((u) => stored.includes(u)), '');
note('neighbour: ftp, javascript: and an empty host refused, each named', expectRefused.every((u) => refused.some((x) => x.startsWith(u + ' →'))) && expectRefused.every((u) => !stored.includes(u)), '');
note('neighbour: host:port without a scheme (REQ-114 req 1 names "host:port")', stored.includes('127.0.0.1:4200/health') && stored.includes('localhost:3100'), `127.0.0.1:4200/health ${stored.includes('127.0.0.1:4200/health') ? 'stored' : 'refused'} · localhost:3100 ${stored.includes('localhost:3100') ? 'stored' : 'refused'}`);
note('neighbour: the round is applied and the refusals are named (REQ-110 req 4 still holds)', r.status === 'applied' && refused.length === 8 - stored.length, `${r.status}, ${stored.length} stored, ${refused.length} refused`);
fs.writeFileSync('paths-round.json', JSON.stringify(r, null, 1));
await b.close();
