import { createRequire } from 'node:module';
import path from 'node:path';
const [front, url, shot, w = '1440'] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: Number(w), height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.screenshot({ path: shot, fullPage: true });
console.log(JSON.stringify(await p.$$eval('button, a, input, textarea', (els) => els.map((e) => `${e.tagName}:${(e.textContent || e.getAttribute('placeholder') || '').trim().slice(0, 40)}`).filter((s) => s.length > 6))));
await b.close();
