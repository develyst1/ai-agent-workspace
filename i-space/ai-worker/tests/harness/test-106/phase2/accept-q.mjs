// REQ-108 phase 2: answer the entry worker's question with its own proposed answer ("ตามนั้น"), wait for the reply hop, then "ตกลง เริ่มงาน".
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const call = async (p) => (await fetch('http://127.0.0.1:4500' + p, { headers: { 'x-caw-actor': 'operator' } })).json();
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); p.setDefaultTimeout(30000);
await p.goto(`http://127.0.0.1:3500/p/${pid}/chat`, { waitUntil: 'networkidle' });
const h0 = (await call(`/v1/projects/${pid}/hops`)).hops.length;
await p.getByRole('button', { name: /^ตามนั้น$/ }).first().click(); log('operator: "ตามนั้น" on ปลา\'s question (its own proposed answer: start as proposed)');
for (let i = 0; i < 120; i++) { const hs = (await call(`/v1/projects/${pid}/hops`)).hops; if (hs.length > h0 && hs[0].endedAt) break; await p.waitForTimeout(2000); }
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
const btn = p.getByRole('button', { name: /ตกลง เริ่มงาน/ }).last();
log(`after the reply: "ตกลง เริ่มงาน" enabled ${!(await btn.isDisabled())}; open proposals ${JSON.stringify((await call(`/v1/projects/${pid}/proposals`)).proposals.filter((x) => x.status === 'open').map((x) => x.items.map((i) => `${i.title} @${i.anchor.key}`)))}`);
await p.screenshot({ path: 'out/ac2-after-answer.png', fullPage: true });
if (!(await btn.isDisabled())) { await btn.click(); await p.waitForTimeout(2500); }
const cards = (await call(`/v1/projects/${pid}/cards`)).cards;
log(`cards: ${JSON.stringify(cards.map((c) => `#${c.number} ${c.title} @${c.anchor.key} ${c.status}`))}`);
for (const c of cards) { const ctx = await call(`/v1/cards/${c.id}/context`); fs.writeFileSync(`out/card-${c.number}-context.json`, JSON.stringify(ctx, null, 1)); const s = JSON.stringify(ctx.spec); log(`card #${c.number} @${c.anchor.key}: has 4200 ${s.includes('4200')} · 10 วินาที ${s.includes('10 วินาที')} · 3 วินาที ${s.includes('3 วินาที')} · 3900 ${s.includes('3900')}`); }
await p.goto(`http://127.0.0.1:3500/p/${pid}`, { waitUntil: 'networkidle' }); await p.screenshot({ path: 'out/ac2-board.png', fullPage: true });
await b.close();
