/*
 * TEST-011 down-states (Tanya, QA — 2026-11-01). ZERO real calls. One state per run (MODE):
 *   gateway-dead → back/ up, stub killed: Home loads, one Ask → H11(2) "The AI gateway could not be reached."
 *   back-down    → back/ stopped: what each public route shows (D4/TASK-040: "Content is unavailable right now."),
 *                  and Home's Ask section (H11(1) as written assumed the page still renders it).
 * Usage: NODE_PATH=<dir>/node_modules BASE_URL=http://127.0.0.1:3072 OUT=<dir> MODE=gateway-dead|back-down node test011-down-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const MODE = process.env.MODE;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  if (MODE === 'gateway-dead') {
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.locator('#ask-heading').scrollIntoViewIfNeeded();
    await p.locator('input[name="question"]').click();
    await p.keyboard.type('What do you build?', { delay: 5 });
    await p.locator('section:has(#ask-heading) form button[type="submit"]').click();
    await p.waitForSelector('section:has(#ask-heading) [role="status"]', { timeout: 90000 }).catch(() => {});
    await p.waitForTimeout(500);
    const live = await p.locator('section:has(#ask-heading) [aria-live]').innerText();
    await p.screenshot({ path: path.join(OUT, 'h11-2-gateway-dead.png') });
    console.log('H11(2) gateway dead', JSON.stringify({ live }));
  } else if (MODE === 'back-down') {
    for (const r of ['/', '/about', '/services', '/portfolio', '/blog', '/contact', '/blog/qa-t011-published-post']) {
      const res = await p.goto(BASE + r, { waitUntil: 'networkidle' });
      const s = await p.evaluate(() => ({ h1: (document.querySelector('h1') || {}).innerText || null, unavailable: /Content is unavailable right now/.test(document.body.innerText), ask: !!document.querySelector('#ask-heading'), text: document.querySelector('main') ? document.querySelector('main').innerText.slice(0, 160) : null }));
      const tag = r === '/' ? 'home' : r.slice(1).replace(/\//g, '-');
      await p.screenshot({ path: path.join(OUT, `back-down-${tag}.png`) });
      console.log(`back-down ${r}`, JSON.stringify({ status: res.status(), ...s }));
    }
  }
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
