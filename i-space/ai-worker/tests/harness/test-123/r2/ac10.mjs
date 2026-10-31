// TEST-120 round 2 AC-10 — the same page, before (round 1: Google fonts at build) and after (round 2: fonts in the repo): screenshots + the fonts the page
// actually loaded and painted. usage: bun ac10.mjs <front dir for playwright> <projects file>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front, projFile] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' });
const out = [];
for (const line of fs.readFileSync(projFile, 'utf8').trim().split('\n')) {
  const [theme, id] = line.split(' ');
  for (const [tag, port] of [['before', 3173], ['after', 3174]]) {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
    const fontReqs = []; p.on('request', (r) => { if (r.resourceType() === 'font' || /\.woff2?($|\?)/.test(r.url())) fontReqs.push(r.url().replace(/^https?:\/\/[^/]+/, (h) => (h.includes('127.0.0.1') ? '' : h)).slice(0, 90)); });
    await p.goto(`http://127.0.0.1:${port}/p/${id}/requirements`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
    await p.screenshot({ path: `ac10-${theme}-${tag}.png`, fullPage: true });
    const info = await p.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily.slice(0, 120), h1: getComputedStyle(document.querySelector('h1') ?? document.body).fontFamily.slice(0, 120), faces: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`).slice(0, 8) }));
    out.push({ theme, tag, ...info, fontFiles: [...new Set(fontReqs)] });
    await p.close();
  }
}
await b.close();
fs.writeFileSync('ac10.json', JSON.stringify(out, null, 1));
for (const o of out) console.log(`${o.theme} ${o.tag}: loaded ${JSON.stringify(o.faces)} · files ${o.fontFiles.length} (${o.fontFiles.map((u) => (u.includes('gstatic') ? 'google' : 'local')).join(',')})`);
