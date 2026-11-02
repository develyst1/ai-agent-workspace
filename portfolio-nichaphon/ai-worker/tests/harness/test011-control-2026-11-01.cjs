/*
 * TEST-011 control (Tanya, QA — 2026-11-01). ZERO real calls. Same probe on OLD (HEAD build) and NEW (store) so a
 * reading is judged against the pre-switch site, not in the abstract:
 *   - failed requests on a clean load of / and /blog, with the browser's errorText (aborted prefetch vs real failure);
 *   - H10: hero bottom vs Ask top at scrollTop 0, and the two chips (buttons whose text is a chip question).
 * Usage: NODE_PATH=<dir>/node_modules node test011-control-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');

const BASES = { old: 'http://127.0.0.1:3073', new: 'http://127.0.0.1:3072' };
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  for (const [name, base] of Object.entries(BASES)) {
    for (const vp of [{ width: 1280, height: 900 }, { width: 360, height: 740 }]) {
      const p = await browser.newPage({ viewport: vp });
      const failed = [];
      p.on('requestfailed', (q) => failed.push(`${q.url().replace(base, '')} ${q.failure() && q.failure().errorText}`));
      await p.goto(base + '/', { waitUntil: 'networkidle' });
      await p.waitForTimeout(2500);
      const h10 = await p.evaluate(() => {
        const ask = document.querySelector('section:has(#ask-heading)');
        const prev = ask.previousElementSibling;
        const chips = [...ask.querySelectorAll('button')].map((b) => b.innerText.trim()).filter((t) => t.endsWith('?'));
        return { prevBottom: prev && prev.getBoundingClientRect().bottom, askTop: ask.getBoundingClientRect().top, chips };
      });
      console.log(`${name} ${vp.width} H10 ${JSON.stringify(h10)} failed(before close)=${JSON.stringify(failed)}`);
      await p.close();
      console.log(`${name} ${vp.width} failed(after close)=${failed.length} kinds=${JSON.stringify([...new Set(failed.map((f) => f.split(' ').slice(1).join(' ')))])}`);
    }
  }
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
