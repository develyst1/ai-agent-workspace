import { createRequire } from 'node:module';
const { chromium } = createRequire(process.argv[2] + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://127.0.0.1:3930/', { waitUntil: 'networkidle' });
console.log(JSON.stringify(await p.innerText('body')));
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button,input,select,textarea,label')].map((e) => `${e.tagName}${e.id ? '#' + e.id : ''}${e.getAttribute('name') ? '[' + e.getAttribute('name') + ']' : ''}${e.getAttribute('type') ? '{' + e.getAttribute('type') + '}' : ''} "${(e.textContent || e.getAttribute('placeholder') || e.value || '').trim().slice(0, 30)}"`))));
await p.screenshot({ path: 'out/product-empty.png', fullPage: true }); await b.close();
