// TEST-112 AC-3 — does the page the real workers built re-check by itself every 10 s? (REQ-112 AC-3 / TEST-106 P1-10)
// Open http://127.0.0.1:3900, touch nothing, count the page's own /api/health requests for ~35 s and read the times it shows.
// usage (from this folder): bun ac3.mjs <caw-front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const t0 = Date.now(); const calls = [];
p.on('request', (r) => { if (r.url().includes('/api/health')) calls.push(((Date.now() - t0) / 1000).toFixed(1)); });
await p.goto('http://127.0.0.1:3900', { waitUntil: 'networkidle' });
const snap = async (n) => { await p.screenshot({ path: `out/ac3-${n}.png`, fullPage: true }); return p.innerText('body'); };
const first = await snap('t0');
await p.waitForTimeout(35_000);
const later = await snap('t35');
const gaps = calls.map(Number).slice(1).map((v, i) => (v - Number(calls[i])).toFixed(1));
console.log(`/api/health requests by the page itself (s since load, no click): ${JSON.stringify(calls)} · gaps ${JSON.stringify(gaps)}`);
const ok = calls.length >= 4 && gaps.slice(1).every((g) => Number(g) >= 9 && Number(g) <= 11.5);
console.log(`${ok ? 'OK ' : 'BAD'} AC-3 the built page re-checks by itself every ~10 s`);
const times = (s) => s.match(/\d{1,2}:\d{2}:\d{2}/g) ?? [];
console.log(`shown times at load ${JSON.stringify(times(first).slice(0, 4))} · after 35 s ${JSON.stringify(times(later).slice(0, 4))}`);
console.log(`${JSON.stringify(times(first)) !== JSON.stringify(times(later)) ? 'OK ' : 'BAD'} AC-3 the times on the page move without a click`);
console.log(`words: ทำงาน ${later.includes('ทำงาน')} · ไม่ตอบ ${later.includes('ไม่ตอบ')} · เช็คตอนนี้ ${later.includes('เช็คตอนนี้')}`);
fs.writeFileSync('out/ac3-text.txt', later);
await b.close();
