/*
 * TEST-009 harness (Tanya, QA — 2026-09-13). THIS ONE SPENDS THE OWNER'S REAL CALLS.
 * SPEC-007 §Call ledger rows 8–10 (reserve 11–12). ONE question, ONE press of Ask, never a retry.
 *
 * What it does, in order:
 *   1. opens Home (BASE_URL) at 1280x900 in headed Chrome, fronts the tab, throwaway shot;
 *   2. records every WebSocket frame the browser receives (AC-g), every request URL, console;
 *   3. types QUESTION by hand into the input and presses Ask ONCE;
 *   4. takes a picture every ~700 ms while the steps land (AC-a "steps painting"), then the
 *      final answered picture with the citations (AC-a);
 *   5. reads the answer text + citation hrefs off the DOM (AC-d rows are traced by hand);
 *   6. resizes the SAME page to 360x740 (no second ask — React state persists) for the
 *      answered-state phone picture (AC-h side of TEST-009);
 *   7. greps the raw frames for the gateway URL / prompt marker / key-like strings (AC-g);
 *   8. fetches each citation href on BASE_URL and reports the HTTP status (AC-g "resolves").
 *
 * Usage: NODE_PATH=<repo>/node_modules BASE_URL=http://127.0.0.1:3072 OUT=<dir> node test009-2026-09-13.cjs
 * It never retries, never re-asks, and exits 0 whatever the chain returned — the result is the result.
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const QUESTION = 'What did you build for the robotic kiosk, and how long did it take?';
fs.mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log(...a);
const shoot = (page, name) => page.screenshot({ path: path.join(OUT, name), fullPage: false });

const frames = []; // { t, dir, payload }
const counts = { consoleErrors: [], pageErrors: [], failedRequests: [], nonLocalRequests: [], wsUrls: [] };

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: false });
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
  await page.bringToFront();
  await page.screenshot({ path: path.join(OUT, '_throwaway.png') });
  log(`[wake] document.hidden=${await page.evaluate(() => document.hidden)}`);
  await page.waitForTimeout(1500);

  const h = page.locator('#ask-heading');
  await h.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  await page.waitForTimeout(300);
  await shoot(page, '00-idle-desktop.png');

  // type by hand (real key presses), then ONE press of Ask
  const input = page.locator('input[name="question"]');
  await input.click();
  await page.keyboard.type(QUESTION, { delay: 15 });
  await shoot(page, '01-typed-desktop.png');
  const t0 = Date.now();
  log(`[press] Ask pressed ONCE at ${new Date(t0).toISOString()} with question=${JSON.stringify(QUESTION)}`);
  await page.locator('section:has(#ask-heading) form button[type="submit"]').click();

  // pictures while the steps land — until the live region settles (answer links or a failure panel)
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
  while (Date.now() - t0 < 90000) {
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
  await live.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-desktop.png`);
  i++;
  await h.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-from-heading-desktop.png`);
  i++;
  await page.screenshot({ path: path.join(OUT, 'answered-desktop-full.png'), fullPage: true });

  // the answered state at 360x740 — same page, NO second ask
  await page.setViewportSize({ width: 360, height: 740 });
  await page.waitForTimeout(800);
  await h.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-phone-a.png`);
  i++;
  const ol = page.locator('section:has(#ask-heading) ol');
  await ol.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-phone-b.png`);
  i++;
  await live.scrollIntoViewIfNeeded().catch(() => {});
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.waitForTimeout(300);
  await shoot(page, `${String(i).padStart(2, '0')}-answered-phone-c.png`);
  i++;
  const sw = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  log(`[phone] scrollWidth=${sw.scrollWidth} innerWidth=${sw.innerWidth}`);
  await page.screenshot({ path: path.join(OUT, 'answered-phone-full.png'), fullPage: true });

  // AC-g — the frames
  fs.writeFileSync(path.join(OUT, 'frames.jsonl'), frames.map((f) => JSON.stringify(f)).join('\n') + '\n');
  const raw = frames.map((f) => f.payload).join('\n');
  const probes = ['ai.develyst.online', 'STEP: ', 'api_key', 'apiKey', 'Bearer', 'sk-', 'x-api-key', 'Authorization'];
  for (const p of probes) log(`[ac-g] frames contain ${JSON.stringify(p)}: ${raw.split(p).length - 1}`);
  log(`[ac-g] frames received=${frames.filter((f) => f.dir === 'recv').length} sent=${frames.filter((f) => f.dir === 'sent').length} wsUrls=${JSON.stringify(counts.wsUrls)}`);
  for (const f of frames) log(`[frame ${f.dir} +${f.t - t0} ms] ${f.payload.slice(0, 600)}`);

  // citation hrefs resolve locally?
  for (const l of links) {
    if (!l.href || !l.href.startsWith('/')) { log(`[cite] ${JSON.stringify(l)} — not a local route`); continue; }
    const res = await page.request.get(BASE + l.href);
    log(`[cite] GET ${BASE}${l.href} -> ${res.status()} (${l.text})`);
  }

  log('=== counts ' + JSON.stringify(counts));
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(0); });
