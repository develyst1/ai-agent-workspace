// TEST-122 (REQ-124) — QA as the OWNER at the review step, THROUGH THE SCREEN (req 2: no hand API call to act). Every 3 s it looks for a card in
// `review` (an API read, only to notice — the owner would see the board), opens that card's page, saves its text (what the worker says it did —
// AC-3), and sets "สถานะ" to "เสร็จ" with the card screen's own control. Ends when the project's latest run has ended. usage: bun reviewer.mjs <caw-front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const API = 'http://127.0.0.1:4500', WEB = 'http://127.0.0.1:3500', H = { 'x-caw-actor': 'operator' };
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const get = async (p) => (await fetch(API + p, { headers: H })).json();
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.setDefaultTimeout(30000);
const done = new Set(); let started = false;
try {
  for (;;) {
    const runs = (await get(`/v1/projects/${pid}/runs`)).runs ?? []; if (runs.length) started = true;
    for (const c of (await get(`/v1/projects/${pid}/cards`)).cards.filter((c) => c.kind === 'work' && c.status === 'review' && !done.has(c.id))) {
      await p.goto(`${WEB}/p/${pid}/c/${c.id}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
      const text = await p.innerText('main').catch(() => p.innerText('body'));
      fs.writeFileSync(`out/review-card-${c.number}.txt`, text); await p.screenshot({ path: `out/review-card-${c.number}.png`, fullPage: true });
      await p.locator('[data-control="status"]').first().click(); await p.getByRole('option', { name: 'เสร็จ' }).click(); await p.waitForTimeout(1500);
      const after = (await get(`/v1/cards/${c.id}`)).status;
      done.add(c.id);
      log(`owner (QA, through the card screen): #${c.number} ${c.title} — read the card, set สถานะ → เสร็จ → now ${after}`);
    }
    if (started && runs[0]?.endedAt) { log(`reviewer: run ended (${runs[0].stopReason}) — ${done.size} review(s) done through the screen`); break; }
    await new Promise((r) => setTimeout(r, 3000));
  }
} finally { await b.close(); }
