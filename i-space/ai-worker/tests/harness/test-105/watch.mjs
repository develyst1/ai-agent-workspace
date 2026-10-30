// TEST-105 #1 #4 #5 #6 #7 #9 #10 #11 #16 — watch a worker's live screen in caw-front while live-view.ts drives a stub hop.
// usage: bun watch.mjs <caw-front dir> <caw-front url> <caw-back url> <projectId> <out dir> <secret value>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, WEB, API, P, out, SECRET] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const H = { 'X-CAW-Actor': 'operator' };
const get = async (p) => (await fetch(API + p, { headers: H })).json();

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(30000);
const outputReqs = [];
page.on('request', (r) => { if (/output|screenOf/i.test(r.url()) || (r.method() === 'POST' && /next-action/i.test(JSON.stringify(r.headers())))) outputReqs.push(`${r.method()} ${r.url()}`); });

// #4 nothing open, no output request, for 20 s on the board
await page.goto(`${WEB}/p/${P}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(8000);
const openNow = await page.locator('[data-screen]').count();
const actionPosts = outputReqs.filter((r) => r.startsWith('POST')).length;
note('#4 nothing open by default', openNow === 0, `[data-screen] count ${openNow}; server-action POSTs in 8 s ${actionPosts} (LiveRefresh also uses actions — see screen polls after the click for comparison)`);
const beforeClick = outputReqs.length;

// #5 open from the crew strip by a real click (hit-test)
const btn = page.getByRole('button', { name: /ดูหน้าจอ/ }).first();
note('#5 "ดูหน้าจอ" present on the board', (await btn.count()) > 0, `buttons ${await page.getByRole('button', { name: /ดูหน้าจอ/ }).count()}`);
await btn.click();
const sheet = page.locator('[data-screen]').first();
await sheet.waitFor({ state: 'visible' });
const title = (await sheet.textContent()) ?? '';
note('#5 view opens with its title', /หน้าจอของ/.test(title), JSON.stringify(title.slice(0, 80)));
const openedAt = Date.now();
note('#1 "สด" badge right after opening a running hop', ((await sheet.textContent()) ?? '').includes('สด'), '');
await page.screenshot({ path: path.join(out, '05-open.png') });

// #1 latency: lines carry "tick N" with the stub's time? measure first-seen in DOM vs the API entry's `at`
const seen = new Map();
const t0 = Date.now();
while (Date.now() - t0 < 45000) {
  const lines = await sheet.locator('pre, code, [data-line], div').allTextContents().catch(() => []);
  const text = (await sheet.textContent()) ?? '';
  const out2 = await get(`/v1/projects/${P}/hops`);
  const hop = (out2.hops ?? [])[0];
  if (hop) {
    const o = await get(`/v1/hops/${hop.id}/output?after=-1&limit=1000`);
    for (const e of o.entries ?? []) if (e.kind === 'line' && !seen.has(e.seq) && Date.parse(e.at) > openedAt + 500 && e.text && text.includes(e.text.slice(0, 40))) seen.set(e.seq, Date.now() - Date.parse(e.at));
  }
  await page.waitForTimeout(250);
}
const lags = [...seen.values()];
const worst = lags.length ? Math.max(...lags) : -1;
note('#1 lines appear ≤ 5 s after the runner saw them, without reload', lags.length >= 20 && worst <= 5000, `${lags.length} lines printed after opening matched; lag ms min ${Math.min(...lags)} / median ${lags.sort((a, b) => a - b)[Math.floor(lags.length / 2)]} / max ${worst} (DOM first-seen − entry.at; poll 250 ms)`);
const afterClick = outputReqs.length;
note('#4b polling starts only after the click', afterClick > beforeClick, `screen-ish requests before click ${beforeClick}, after ${afterClick}`);

// #7 secrets: not in the DOM, not in any stored entry
const hop = (await get(`/v1/projects/${P}/hops`)).hops[0];
const all = await get(`/v1/hops/${hop.id}/output?after=-1&limit=1000`);
const stored = JSON.stringify(all);
const dom = (await page.content());
note('#7 sk-test key not shown, not stored', !/sk-test-[a-z]{10,}/i.test(dom) && !/sk-test-[a-z]{10,}/i.test(stored), `stored has "***": ${stored.includes('***')}`);
note('#7 LIVE_VIEW_SECRET value not shown, not stored', !dom.includes(SECRET) && !stored.includes(SECRET), `secret length ${SECRET.length}`);

// #9 no way to type
const inputs = await sheet.locator('input, textarea, [contenteditable="true"], [contenteditable=""]').count();
const sendBtn = await sheet.getByRole('button', { name: /ส่ง|send/i }).count();
await sheet.click({ position: { x: 50, y: 200 } }).catch(() => {});
await page.keyboard.type('hello from QA');
await page.waitForTimeout(800);
const typedShown = ((await sheet.textContent()) ?? '').includes('hello from QA');
note('#9 no input inside the view; typing does nothing', inputs === 0 && sendBtn === 0 && !typedShown, `inputs ${inputs}, send buttons ${sendBtn}, typed text visible ${typedShown}`);

// #10 no write route for input
const oa = await (await fetch(`${API}/v1/openapi.json`)).json();
const writeRoutes = Object.entries(oa.paths).flatMap(([p, ops]) => Object.keys(ops).filter((m) => m !== 'get').map((m) => `${m.toUpperCase()} ${p}`)).filter((r) => /output|input|stdin|screen/i.test(r));
note('#10 no route that sends input to a CLI', writeRoutes.every((r) => r === 'POST /v1/hops/{hopId}/output'), JSON.stringify(writeRoutes));
const asOp = await fetch(`${API}/v1/hops/${hop.id}/output`, { method: 'POST', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ entries: [{ seq: 99999, at: new Date().toISOString(), kind: 'line', text: 'operator write' }] }) });
note('#10 an operator cannot write output (runner only)', asOp.status === 403, `${asOp.status} ${(await asOp.text()).slice(0, 120)}`);

// #11 after the hop ends: reload, reopen, full output + start/end time
for (let i = 0; i < 90; i++) { const h = (await get(`/v1/projects/${P}/hops`)).hops[0]; if (h.endedAt) break; await page.waitForTimeout(1000); }
const ended = (await get(`/v1/projects/${P}/hops`)).hops[0];
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: /ดูหน้าจอ/ }).first().click();
await page.locator('[data-screen]').first().waitFor({ state: 'visible' });
await page.waitForTimeout(3000);
const fin = (await page.locator('[data-screen]').first().textContent()) ?? '';
const fullApi = await get(`/v1/hops/${ended.id}/output?after=-1&limit=1000`);
const lastLine = [...fullApi.entries].reverse().find((e) => e.kind === 'line')?.text ?? '';
note('#11 finished hop readable with start and end time', !!ended.endedAt && fin.includes('เริ่มเมื่อ') && fin.includes('จบงานเมื่อ') && fin.includes(lastLine.slice(0, 30)), `outcome ${ended.outcome}; entries ${fullApi.entries.length}; last line on screen ${fin.includes(lastLine.slice(0, 30))}`);
const seqs = fullApi.entries.map((e) => e.seq);
note('#2 entries ordered, no duplicates', seqs.every((s, i) => i === 0 || s > seqs[i - 1]), `${seqs.length} entries, seq ${seqs[0]}…${seqs[seqs.length - 1]}`);
await page.screenshot({ path: path.join(out, '11-finished.png') });
fs.writeFileSync(path.join(out, 'output.json'), JSON.stringify(fullApi, null, 2));

// #16 390
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(`${WEB}/p/${P}`, { waitUntil: 'networkidle' });
await m.getByRole('button', { name: /ดูหน้าจอ/ }).first().click();
await m.locator('[data-screen]').first().waitFor({ state: 'visible' });
const sw = await m.evaluate(() => document.documentElement.scrollWidth);
const close = m.locator('[data-screen]').first().getByRole('button', { name: /ปิด|close/i });
note('#16 390: no sideways scroll, close reachable', sw <= 390 && (await close.count()) > 0, `scrollWidth ${sw}; close buttons ${await close.count()}`);
await m.screenshot({ path: path.join(out, '16-390.png') });
await browser.close();
