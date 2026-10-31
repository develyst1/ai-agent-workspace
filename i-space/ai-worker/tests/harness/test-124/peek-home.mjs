import { createRequire } from 'node:module';
const { chromium } = createRequire(process.argv[2] + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
await c.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: 'http://127.0.0.1:3100' }]);
const p = await c.newPage(); await p.goto('http://127.0.0.1:3100/', { waitUntil: 'networkidle' });
console.log(JSON.stringify((await p.innerText('body')).slice(0, 600)));
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button,a,input,select,textarea')].map((e) => `${e.tagName}${e.getAttribute('type') ? '[' + e.getAttribute('type') + ']' : ''} "${(e.textContent || e.getAttribute('placeholder') || e.getAttribute('aria-label') || '').trim().slice(0, 40)}"`))));
await p.screenshot({ path: 'out/bp-home.png', fullPage: true }); await b.close();
