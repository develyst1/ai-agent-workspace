// REQ-108 phase 2: what the requirements page offers (QA reads the screen before scripting it). usage: bun peek.mjs <front dir> <path>
import { createRequire } from 'node:module';
const [front, p] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: 'http://127.0.0.1:3100' }]);
const page = await ctx.newPage(); await page.goto('http://127.0.0.1:3100' + p, { waitUntil: 'networkidle' });
if (process.env.CLICK) { await page.getByText(process.env.CLICK).first().click(); await page.waitForTimeout(800); }
console.log('buttons', JSON.stringify((await page.locator('button').allTextContents()).map((s) => s.trim()).filter(Boolean)));
console.log('inputs', JSON.stringify(await page.$$eval('input,textarea,select', (els) => els.map((e) => `${e.tagName}:${e.getAttribute('name') ?? ''}:${e.getAttribute('placeholder') ?? ''}`))));
await page.screenshot({ path: 'out/peek.png', fullPage: true }); await b.close();
