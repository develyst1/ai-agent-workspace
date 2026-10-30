// TASK-139 DoD 6: the project header at 390 in the `nameless-label` state, light. Throwaway; never in a product repo.
// usage: bun tests/harness/task-139-shot.mjs <caw-front dir> <base url> <out dir>  (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const reset = (s) => fetch(`${base}/test-reset${s ? `?state=${s}` : ''}`, { method: 'POST' });
if ((await reset('nameless-label')).status !== 204) throw new Error('reset');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 390, height: 700 }, colorScheme: 'light' })).newPage();
await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, 'header-nameless-label-390.png') });
console.log('header tag:', JSON.stringify(await page.locator('header [data-label-tag]').textContent()), '· sideways:', await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));
await reset();
await browser.close();
