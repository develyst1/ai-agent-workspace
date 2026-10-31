// TEST-122 round 2: the second open plan ปลา left after acceptance (reworded titles, other anchors) — does its "ตกลง เริ่มงาน" start the same work again? (REQ-126 req 3)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(process.argv[2] + '/package.json')('@playwright/test');
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const call = async (p) => (await fetch('http://127.0.0.1:4500' + p, { headers: { 'x-caw-actor': 'operator' } })).json();
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const before = (await call(`/v1/projects/${pid}/cards`)).cards.filter((c) => c.kind === 'work').length;
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(`http://127.0.0.1:3500/p/${pid}/chat`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
const btn = p.getByRole('button', { name: /ตกลง เริ่มงาน/ }); log(`second plan: ${await btn.count()} button(s), disabled ${(await btn.count()) ? await btn.first().isDisabled() : '-'}`);
let res = '';
p.on('response', async (r) => { if (r.url().includes('/accept')) res = `${r.status()} ${(await r.text().catch(() => '')).slice(0, 200)}`; });
if ((await btn.count()) && !(await btn.first().isDisabled())) { await btn.first().click(); await p.waitForTimeout(2500); }
await p.screenshot({ path: 'out/r2-second-plan-pressed.png', fullPage: true });
const cards = (await call(`/v1/projects/${pid}/cards`)).cards.filter((c) => c.kind === 'work');
log(`pressed: accept response ${JSON.stringify(res)} · work cards ${before} → ${cards.length} · ${JSON.stringify(cards.slice(before).map((c) => `#${c.number} ${c.title}`))}`);
await b.close();
