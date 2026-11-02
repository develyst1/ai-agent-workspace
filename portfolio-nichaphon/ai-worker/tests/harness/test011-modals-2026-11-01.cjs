/*
 * TEST-011 AC-a, the part a page sweep cannot see (Tanya, QA — 2026-11-01). ZERO real calls.
 * Opens every /portfolio project modal on the OLD site (HEAD b068fba) and the NEW site (store copy) at 1280x900,
 * and compares each dialog's innerText, every image src inside it, and every link href inside it.
 * Usage: NODE_PATH=<dir>/node_modules BASE_OLD=… BASE_NEW=… OUT=<dir> node test011-modals-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OLD = process.env.BASE_OLD || 'http://127.0.0.1:3073';
const NEW = process.env.BASE_NEW || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TRIGGER = 'button[aria-label^="Open project detail for"]';

async function readAll(page, base) {
  await page.goto(base + '/portfolio', { waitUntil: 'networkidle' });
  const n = (await page.$$(TRIGGER)).length;
  const out = [];
  for (let i = 0; i < n; i++) {
    await page.goto(base + '/portfolio', { waitUntil: 'networkidle' });
    const t = await page.$$(TRIGGER);
    const label = await t[i].getAttribute('aria-label');
    await t[i].click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(500);
    const d = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return {
        text: dlg.innerText,
        imgs: [...dlg.querySelectorAll('img')].map((im) => im.getAttribute('src') + (im.complete && im.naturalWidth > 0 ? '' : ' [NOT LOADED]')),
        hrefs: [...dlg.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      };
    });
    out.push({ label, ...d });
  }
  return out;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const a = await readAll(page, OLD);
  const b = await readAll(page, NEW);
  console.log(`modals old=${a.length} new=${b.length}`);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || {}; const y = b[i] || {};
    console.log(`#${i + 1} ${y.label} text=${x.text === y.text} imgs=${JSON.stringify(x.imgs) === JSON.stringify(y.imgs)}(${(y.imgs || []).length}) hrefs=${JSON.stringify(x.hrefs) === JSON.stringify(y.hrefs)} ${JSON.stringify(y.hrefs)} ${JSON.stringify(y.imgs)}`);
  }
  fs.writeFileSync(path.join(OUT, 'modals.json'), JSON.stringify({ old: a, new: b }, null, 2));
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
