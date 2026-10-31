import { createRequire } from 'node:module';
const [front, id] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' });
for (const [tag, port] of [['before', 3173], ['after', 3174]]) {
  const p = await (await b.newContext({ viewport: { width: 1280, height: 200 }, deviceScaleFactor: 3 })).newPage();
  await p.goto(`http://127.0.0.1:${port}/p/${id}/requirements`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const info = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '\u2713'); return e ? { text: e.textContent, aria: e.getAttribute('aria-label'), font: getComputedStyle(e).fontFamily } : null; });
  await p.screenshot({ path: `ac10-zoom-check-${tag}.png`, clip: { x: 1060, y: 70, width: 190, height: 60 } });
  console.log(tag, JSON.stringify(info));
}
await b.close();
