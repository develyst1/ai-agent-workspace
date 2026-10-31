/*
 * TEST-010 harness (Tanya, QA — 2026-11-01). WITH THE REAL back/ THIS SPENDS THE OWNER'S REAL CALLS.
 * SPEC-009 §Call ledger rows 11–25. ONE press per run, never a retry, never a re-ask.
 * Derived from test009-2026-09-13.cjs; headless (owner: no visible Chrome pop-ups).
 *
 * MODE=type → types QUESTION key by key into the input and presses Ask once.
 * MODE=chip → clicks the starter chip whose text equals QUESTION once (a chip submits on click).
 * Records: pictures while the steps land, the answered picture (1280x900), the answered state at
 * 360x740 (same page), answer paragraphs, the Sources block's text (AC-e), every WS frame.
 *
 * Usage: NODE_PATH=<dir>/node_modules BASE_URL=http://127.0.0.1:3072 OUT=<dir> MODE=type QUESTION="…" node test010-2026-11-01.cjs
 * Exits 0 whatever the chain returned — the result is the result.
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const MODE = process.env.MODE || 'type';
const QUESTION = process.env.QUESTION;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!QUESTION) { console.error('QUESTION is required'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log(...a);
const shoot = (page, name) => page.screenshot({ path: path.join(OUT, name), fullPage: false });

const frames = [];
const counts = { consoleErrors: [], pageErrors: [], failedRequests: [], nonLocalRequests: [], wsUrls: [] };

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') counts.consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => counts.pageErrors.push(String(e).slice(0, 200)));
  page.on('requestfailed', (r) => counts.failedRequests.push(`${r.url().slice(0, 120)} ${r.failure() && r.failure().errorText}`));
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('about:') && !u.startsWith('blob:')) counts.nonLocalRequests.push(u.slice(0, 160)); });
  page.on('websocket', (ws) => {
    counts.wsUrls.push(ws.url());
    ws.on('framesent', (f) => frames.push({ t: Date.now(), dir: 'sent', payload: f.payload }));
    ws.on('framereceived', (f) => frames.push({ t: Date.now(), dir: 'recv', payload: f.payload }));
    ws.on('close', () => frames.push({ t: Date.now(), dir: 'close', payload: '' }));
  });

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, '_throwaway.png') });
  log(`[wake] document.hidden=${await page.evaluate(() => document.hidden)}`);
  await page.waitForTimeout(1500);

  const h = page.locator('#ask-heading');
  await h.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  await page.waitForTimeout(300);
  await shoot(page, '00-idle-desktop.png');

  let t0;
  if (MODE === 'chip') {
    const chip = page.locator('section:has(#ask-heading) button', { hasText: QUESTION }).first();
    t0 = Date.now();
    log(`[press] chip clicked ONCE at ${new Date(t0).toISOString()} chip=${JSON.stringify(QUESTION)}`);
    await chip.click();
  } else {
    const input = page.locator('input[name="question"]');
    await input.click();
    await page.keyboard.type(QUESTION, { delay: 15 });
    await shoot(page, '01-typed-desktop.png');
    t0 = Date.now();
    log(`[press] Ask pressed ONCE at ${new Date(t0).toISOString()} question=${JSON.stringify(QUESTION)}`);
    await page.locator('section:has(#ask-heading) form button[type="submit"]').click();
  }

  const settled = () =>
    page.evaluate(() => {
      const live = document.querySelector('section:has(#ask-heading) [aria-live]');
      if (!live) return false;
      const failed = !!live.querySelector('[role="status"]');
      const btn = document.querySelector('section:has(#ask-heading) form button[type="submit"]');
      const idle = btn && btn.getAttribute('data-loading') !== 'true';
      return failed || idle;
    });
  let i = 2;
  let lastSteps = '';
  while (Date.now() - t0 < 120000) {
    const steps = await page.$$eval('section:has(#ask-heading) ol li', (lis) => lis.map((li) => li.innerText.replace(/\n/g, ' | ')));
    const key = JSON.stringify(steps);
    if (key !== lastSteps) {
      log(`[+${Date.now() - t0} ms] steps=${key}`);
      await shoot(page, `${String(i).padStart(2, '0')}-steps-${Date.now() - t0}ms-desktop.png`);
      i++;
      lastSteps = key;
    }
    if (await settled()) break;
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(600);
  const live = page.locator('section:has(#ask-heading) [aria-live]');
  const liveText = await live.innerText();
  log(`[final +${Date.now() - t0} ms] live=${JSON.stringify(liveText)}`);
  const links = await page.$$eval('section:has(#ask-heading) [aria-live] a', (as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.innerText.replace(/\s+/g, ' ') })));
  log(`[final] links=${JSON.stringify(links)}`);
  const answerPs = await page.$$eval('section:has(#ask-heading) [aria-live] p', (ps) => ps.map((p) => p.innerText));
  log(`[final] paragraphs=${JSON.stringify(answerPs)}`);
  const failed = await page.$('section:has(#ask-heading) [role="status"]');
  log(`[final] failure panel present=${!!failed}`);
  // AC-e: raw marks anywhere in the rendered answer region
  for (const p of ['**', '__', '`', '](', '\n- ', '\n* ', '#']) log(`[ac-e] live text contains ${JSON.stringify(p)}: ${liveText.split(p).length - 1}`);
  await live.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-desktop.png`); i++;
  await h.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-from-heading-desktop.png`); i++;
  await page.screenshot({ path: path.join(OUT, 'answered-desktop-full.png'), fullPage: true });

  await page.setViewportSize({ width: 360, height: 740 });
  await page.waitForTimeout(800);
  await live.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-phone.png`); i++;
  const sw = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  log(`[phone] scrollWidth=${sw.scrollWidth} innerWidth=${sw.innerWidth}`);
  await page.screenshot({ path: path.join(OUT, 'answered-phone-full.png'), fullPage: true });

  fs.writeFileSync(path.join(OUT, 'frames.jsonl'), frames.map((f) => JSON.stringify(f)).join('\n') + '\n');
  const raw = frames.map((f) => f.payload).join('\n');
  for (const p of ['ai.develyst.online', 'api_key', 'apiKey', 'Bearer', 'Authorization']) log(`[ac-g] frames contain ${JSON.stringify(p)}: ${raw.split(p).length - 1}`);
  log(`[ws] received=${frames.filter((f) => f.dir === 'recv').length} sent=${frames.filter((f) => f.dir === 'sent').length} wsUrls=${JSON.stringify(counts.wsUrls)}`);
  for (const f of frames) log(`[frame ${f.dir} +${f.t - t0} ms] ${f.payload.slice(0, 1500)}`);

  log('=== counts ' + JSON.stringify(counts));
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(0); });
