// REQ-108 phase 3 AC-4 — the dashboard the team built, run as its README says, read from the PAINTED page (not the API alone).
// 1. the 4 services each with its status, ms and check time · 2. QA stops its own caw-web (:3500, by the pid given) and times how long
// until the page shows CAW เว็บ "ไม่ตอบ" (spec: re-check every 10 s, no answer in 3 s = ไม่ตอบ → at most ~13 s).
// usage (from this folder): bun ac4.mjs <caw-front dir (for playwright)> <pid of QA's caw-web on :3500>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front, webPid] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const note = (c, ok, d) => log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
try {
  await p.goto('http://127.0.0.1:3900/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const rows = async () => (await p.locator('li, article.service').allInnerTexts()).map((s) => s.replace(/\s*\n\s*/g, ' · ')).map((s) => s.trim());
  const r0 = await rows(); fs.writeFileSync('out/ac4-rows-up.json', JSON.stringify(r0, null, 1));
  await p.screenshot({ path: 'out/ac4-all-up.png', fullPage: true });
  const body = await p.innerText('body');
  log(`page: ${JSON.stringify(body).slice(0, 600)}`);
  const NAMES = ['Blueprint API', 'Blueprint เว็บ', 'CAW API', 'CAW เว็บ'];
  note('AC-4 the 4 services of the spec, in order, each "ทำงาน" (all 4 are up)', r0.length === 4 && NAMES.every((n, i) => r0[i]?.startsWith(n)) && r0.every((r) => r.includes('ทำงาน')), JSON.stringify(r0));
  note('AC-4 each row shows its response time (ms) and its check time', r0.every((r) => /\d+\s*ms/.test(r)) && r0.every((r) => /\d{1,2}:\d{2}/.test(r)), JSON.stringify(r0));
  note('AC-4 a "เช็คตอนนี้" button on the page', (await p.getByRole('button', { name: 'เช็คตอนนี้' }).count()) === 1, '');
  // stop caw-web and time the painted change, polling every 250 ms
  const caw = () => rows().then((r) => r.find((x) => x.startsWith('CAW เว็บ')) ?? '');
  const t0 = Date.now(); process.kill(Number(webPid)); log(`QA stopped its caw-web (pid ${webPid}) at ${new Date(t0).toISOString()}`);
  let seen = -1, row = '';
  while (Date.now() - t0 < 30_000) { row = await caw(); if (row.includes('ไม่ตอบ')) { seen = (Date.now() - t0) / 1000; break; } await p.waitForTimeout(250); }
  await p.screenshot({ path: 'out/ac4-caw-web-down.png', fullPage: true });
  const r1 = await rows(); fs.writeFileSync('out/ac4-rows-down.json', JSON.stringify(r1, null, 1));
  note('AC-4 after caw-web stops, the page shows CAW เว็บ "ไม่ตอบ" within 10 + 3 s, by itself (no click)', seen > 0 && seen <= 13, `${seen} s · ${JSON.stringify(row)}`);
  note('AC-4 the other 3 still "ทำงาน"', r1.filter((r) => !r.startsWith('CAW เว็บ')).every((r) => r.includes('ทำงาน')), JSON.stringify(r1));
} finally { await b.close(); }
