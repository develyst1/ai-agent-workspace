// TASK-158 DoD 7: the worker's screen sheet in the `idle-session` mock state (มิ้นท์ has no hop and her CLI is open), 390 and 1280, light. Throwaway; never in a product repo.
// usage: bun tests/harness/task-158-shot.mjs <caw-front dir> <base url> <out dir>  (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const reset = (s) => fetch(`${base}/test-reset${s ? `?state=${s}` : ''}`, { method: 'POST' });
if ((await reset('idle-session')).status !== 204) throw new Error('reset');
const browser = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 760], [1280, 800]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, colorScheme: 'light' })).newPage();
  await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' });
  await page.locator('[data-watch="มิ้นท์"]').first().click();
  await page.locator('[data-screen]').waitFor();
  await page.locator('[data-screen] [data-idle]').waitFor({ timeout: 8000 });
  await page.waitForTimeout(1200); // the sheet slides in; shoot when it has settled
  await page.screenshot({ path: path.join(out, `screen-idle-${w}.png`) });
  console.log(w, 'idle:', JSON.stringify(await page.locator('[data-screen] [data-idle]').textContent()), '· none line:', await page.locator('[data-screen] [data-none]').count(), '· sideways:', await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));
  await page.close();
}
await reset();
await browser.close();
