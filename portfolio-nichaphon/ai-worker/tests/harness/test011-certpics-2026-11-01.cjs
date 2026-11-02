/*
 * TEST-011 (Tanya, QA — 2026-11-01). ZERO real calls. After AC-b's certificate Save rewrote the `certificates`
 * document: do all /about pictures still load and paint? Scroll, wait, then read each image + a picture of the cards.
 * Usage: NODE_PATH=<dir>/node_modules BASE_URL=http://127.0.0.1:3072 OUT=<dir> node test011-certpics-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(BASE + '/about', { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120))); } });
  await p.locator('text=QA-T011-C').first().scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -250));
  await p.waitForTimeout(3000);
  const imgs = await p.evaluate(() => [...document.images].map((i) => { const r = i.getBoundingClientRect(); return `${i.complete && i.naturalWidth > 0 && r.width > 0 ? 'PAINTED' : 'NOT'} ${decodeURIComponent(i.getAttribute('src')).slice(0, 80)}`; }));
  console.log(JSON.stringify(imgs, null, 1));
  await p.screenshot({ path: path.join(OUT, 'b3-certificate-public-about-settled.png') });
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
