// REQ-108 phase 2 AC-5: while a worker hop is running, open that worker's screen ("ดูหน้าจอ") and see its CLI output stream (REQ-104).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const call = async (p) => (await fetch('http://127.0.0.1:4500' + p, { headers: { 'x-caw-actor': 'operator' } })).json();
let hop = null; for (let i = 0; i < 90 && !hop; i++) { hop = (await call(`/v1/projects/${pid}/hops`)).hops.find((h) => !h.endedAt && h.cardId); if (!hop) await new Promise((r) => setTimeout(r, 2000)); }
if (!hop) { console.log('no running card hop seen in 180 s'); process.exit(0); }
const chain = await call(`/v1/projects/${pid}/chain`); const w = chain.members.find((m) => m.id === hop.workerId);
console.log(`running hop ${hop.id.slice(0, 13)} by ${w?.name}`);
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(`http://127.0.0.1:3500/p/${pid}`, { waitUntil: 'networkidle' });
const links = p.getByText('ดูหน้าจอ'); const n = await links.count(); const idx = chain.members.findIndex((m) => m.id === hop.workerId);
await (idx >= 0 && idx < n ? links.nth(idx) : links.first()).click(); await p.waitForLoadState('networkidle');
const t1 = await p.innerText('body'); await p.screenshot({ path: 'out/ac5-screen-1.png', fullPage: true });
await p.waitForTimeout(8000);
const t2 = await p.innerText('body'); await p.screenshot({ path: 'out/ac5-screen-2.png', fullPage: true });
console.log(`url ${p.url()} · text length ${t1.length} → ${t2.length} after 8 s (no reload) · grew ${t2.length > t1.length}`);
fs.writeFileSync('out/ac5-text.txt', t2); await b.close();
