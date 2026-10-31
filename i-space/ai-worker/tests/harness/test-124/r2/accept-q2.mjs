// TEST-122 round 2 (REQ-124 r2, REQ-126 AC-5): answer EVERY open question with its own "ตามนั้น", one by one, WITHOUT reloading (REQ-126 holds the answers on the
// screen until the last one, then sends one message); check after each click that only that question is marked; wait for ปลา's reply; then "ตกลง เริ่มงาน".
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const call = async (p) => (await fetch('http://127.0.0.1:4500' + p, { headers: { 'x-caw-actor': 'operator' } })).json();
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.setDefaultTimeout(30000);
await p.goto(`http://127.0.0.1:3500/p/${pid}/chat`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
const qs = p.locator('[data-question]'); const n = await qs.count(); log(`chat: ${n} question(s) on screen`);
const h0 = (await call(`/v1/projects/${pid}/hops`)).hops.length;
for (let i = 0; i < n; i++) {
  const pair = qs.nth(i).getByRole('button', { name: 'ตามนั้น' });
  if ((await pair.count()) === 0) { log(`question ${i + 1}: no "ตามนั้น" (already answered)`); continue; }
  await pair.click(); await p.waitForTimeout(600);
  const marked = []; for (let k = 0; k < n; k++) marked.push((await qs.nth(k).innerText()).includes('ตอบแล้ว'));
  const left = ((await p.innerText('body')).match(/เหลืออีก (\d+) ข้อ/) ?? [])[1] ?? '-';
  log(`operator: "ตามนั้น" on question ${i + 1} → marked ${JSON.stringify(marked)} · "เหลืออีก" ${left}`);
}
await p.screenshot({ path: 'out/r2-questions-answered.png', fullPage: true });
const ops = ((await call(`/v1/projects/${pid}/chat`)).messages ?? []).filter((m) => m.author === 'operator');
log(`answers message: ${JSON.stringify(ops.at(-1)?.text ?? '').slice(0, 400)}`);
for (let i = 0; i < 120; i++) { const hs = (await call(`/v1/projects/${pid}/hops`)).hops; if (n === 0 || (hs.length > h0 && hs[0].endedAt)) break; await p.waitForTimeout(2000); }
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
const btns = p.getByRole('button', { name: /ตกลง เริ่มงาน/ }); log(`after the reply: ${await btns.count()} "ตกลง เริ่มงาน" button(s); open proposals ${(await call(`/v1/projects/${pid}/proposals`)).proposals.filter((x) => x.status === 'open').length}`);
await p.screenshot({ path: 'out/r2-before-accept.png', fullPage: true });
if ((await btns.count()) > 0 && !(await btns.first().isDisabled())) { await btns.first().click(); await p.waitForTimeout(2500); }
const cards = (await call(`/v1/projects/${pid}/cards`)).cards.filter((c) => c.kind === 'work');
log(`cards: ${JSON.stringify(cards.map((c) => `#${c.number} ${c.title} @${c.anchor.key} ${c.status}`))}`);
await b.close();
