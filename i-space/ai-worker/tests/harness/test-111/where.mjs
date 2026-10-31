// TEST-111: where does a reader find the 4 addresses? Every page link of the project, counted. usage: bun where.mjs <front dir> <projectId>
import { createRequire } from 'node:module';
const [front, id] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3141';
const URLS = ['http://127.0.0.1:4200/health', 'http://127.0.0.1:3100', 'http://127.0.0.1:4500/health', 'http://127.0.0.1:3500'];
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(`${WEB}/p/${id}`, { waitUntil: 'networkidle' });
const hrefs = [...new Set((await p.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))).filter((h) => h.startsWith(`/p/${id}`)))];
for (const h of hrefs) {
  await p.goto(WEB + h, { waitUntil: 'networkidle' }); const t = await p.textContent('body');
  const n = URLS.filter((u) => t.includes(u)).length;
  console.log(`${h.replace(`/p/${id}`, '') || '/'} — ${n}/4`);
  if (n > 0) await p.screenshot({ path: `where${h.replace(`/p/${id}`, '').replace(/\//g, '-') || '-overview'}.png`, fullPage: true });
}
await b.close();
