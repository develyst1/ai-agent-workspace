// TASK-144 DoD 6: the board at 390 in the `review-holds` state, light. Throwaway; never in a product repo.
// usage: bun tests/harness/task-144-shot.mjs <caw-front dir> <base url> <out dir>  (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const reset = (s) => fetch(`${base}/test-reset${s ? `?state=${s}` : ''}`, { method: 'POST' });
if ((await reset('review-holds')).status !== 204) throw new Error('reset');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 390, height: 900 }, colorScheme: 'light' })).newPage();
await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, 'board-review-holds-390.png'), fullPage: false });
const el = page.locator('[data-review-hold]');
const b = await el.boundingBox();
console.log('line:', JSON.stringify(await el.textContent()), `${Math.round(b.width)}x${Math.round(b.height)}`, '· sideways:', await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));
await reset();
await browser.close();
