// TEST-105 #13/#14 (AC-6): keep the worker's screen open while live-view stops the API for 30 s mid-hop; then check the hop, the gap entry and the screen.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, WEB, API, P, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const H = { 'X-CAW-Actor': 'operator' };
const get = async (p) => { try { return await (await fetch(API + p, { headers: H })).json(); } catch { return null; } };
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${WEB}/p/${P}`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /ดูหน้าจอ/ }).first().click();
const sheet = page.locator('[data-screen]').first(); await sheet.waitFor({ state: 'visible' });
const t0 = Date.now(); let ended = null;
while (Date.now() - t0 < 200000) {
  const h = await get(`/v1/projects/${P}/hops`);
  const hop = h?.hops?.[0];
  if (hop?.endedAt) { ended = hop; break; }
  await page.waitForTimeout(2000);
}
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(out, '13-after-outage.png'), fullPage: true });
const screenText = (await sheet.textContent()) ?? '';
note('#13 hop not killed by the outage', !!ended && ended.outcome !== 'failed' && ended.outcome !== 'interrupted', `outcome ${ended?.outcome}; note ${JSON.stringify(ended?.note)}`);
const o = await get(`/v1/hops/${ended.id}/output?after=-1&limit=1000`);
fs.writeFileSync(path.join(out, 'output.json'), JSON.stringify(o, null, 2));
const gaps = o.entries.filter((e) => e.kind === 'gap');
note('#13 a gap entry ≈ 30 s', gaps.length >= 1 && gaps.some((g) => g.gapSeconds >= 25 && g.gapSeconds <= 40), JSON.stringify(gaps.map((g) => g.gapSeconds)));
const shown = screenText.match(/ขาดช่วง (\d+) วินาที — ระหว่างนี้ไม่ได้รับข้อมูล/);
note('#13 the view shows the gap marker in the PM\'s words', !!shown, shown ? shown[0] : 'not found');
const ticks = o.entries.filter((e) => e.kind === 'line').map((e) => Number(e.text.match(/tick (\d+) of/)?.[1])).filter(Boolean);
const missing = []; for (let i = 1; i <= 90; i++) if (!ticks.includes(i)) missing.push(i);
const gi = o.entries.findIndex((e) => e.kind === 'gap');
const before = o.entries.slice(0, gi).filter((e) => e.kind === 'line').map((e) => e.text).pop();
const after = o.entries.slice(gi + 1).find((e) => e.kind === 'line')?.text;
note('#14 lines missed in the gap are marked, never missing unmarked', missing.length > 0 && gi > 0 && Number(after?.match(/tick (\d+)/)?.[1]) > Number(before?.match(/tick (\d+)/)?.[1]), `missing ticks ${missing[0]}…${missing[missing.length - 1]} (${missing.length}); around the gap: "${before}" | gap | "${after}"`);
note('#13 lines continue after the gap and the result lands', ticks.includes(90) && o.entries.some((e) => /■ success/.test(e.text)), `last tick ${Math.max(...ticks)}`);
await browser.close();
