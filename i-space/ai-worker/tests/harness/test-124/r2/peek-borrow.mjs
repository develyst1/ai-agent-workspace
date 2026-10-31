import { createRequire } from 'node:module';
const { chromium } = createRequire(process.argv[2] + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://127.0.0.1:3930/', { waitUntil: 'networkidle' });
const row = p.locator('li, tr, article, .book').filter({ hasText: 'ทำงานอย่างมืออาชีพ' }).first();
console.log('row tag/html:', (await row.evaluate((e) => e.outerHTML)).slice(0, 500));
await row.getByRole('button', { name: 'ยืม' }).click(); await p.waitForTimeout(600);
console.log('after ยืม:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button,input')].filter((e) => e.offsetParent).map((e) => `${e.tagName}${e.id ? '#' + e.id : ''}{${e.getAttribute('type') || ''}} "${(e.textContent || e.placeholder || '').trim().slice(0, 30)}"`))));
await p.screenshot({ path: 'out/peek-borrow.png', fullPage: true }); await b.close();
