// TEST-122 (REQ-124 add-on): the clean-blue "✓" confirm button after the fonts went back to Google — 3× zoom + the font it uses. usage: bun check-tick.mjs <front dir> <project id>
import { createRequire } from 'node:module';
const [front, id] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1280, height: 200 }, deviceScaleFactor: 3 })).newPage();
await p.goto(`http://127.0.0.1:3100/p/${id}/requirements`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
const info = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '✓'); const r = e?.getBoundingClientRect(); return e ? { font: getComputedStyle(e).fontFamily, x: r.x, y: r.y } : null; });
console.log(JSON.stringify(info));
await p.screenshot({ path: 'out/tick-now.png', clip: { x: (info?.x ?? 1060) - 20, y: (info?.y ?? 70) - 6, width: 190, height: 60 } });
await b.close();
