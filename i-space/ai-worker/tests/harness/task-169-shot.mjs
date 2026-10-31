// TASK-169 DoD 5: the chat in the `entry-asked-four` mock state, light — (a) after ตามนั้น on question 1, (b) after the 4th answer (the one message sent).
// Throwaway; never in a product repo.
// usage: bun tests/harness/task-169-shot.mjs <caw-front dir> <base url> <out dir>  (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const reset = (s) => fetch(`${base}/test-reset${s ? `?state=${s}` : ''}`, { method: 'POST' });
const browser = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 1700], [1280, 1500]]) {
  if ((await reset('entry-asked-four')).status !== 204) throw new Error('reset');
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, colorScheme: 'light' })).newPage();
  await page.goto(`${base}/p/${PID}/chat`, { waitUntil: 'networkidle' });
  const open = () => page.locator('[data-message="worker"]').last();
  const q = (i) => open().locator('[data-question]').nth(i);
  await q(0).locator('[data-accept]').click();
  await q(0).locator('[data-kept]').waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, `a-after-q1-${w}.png`) });
  console.log(w, 'a: agree why:', JSON.stringify(await page.locator('[data-proposal="open"] [data-agree-why]').last().textContent()), '· agree disabled:', await page.locator('[data-proposal="open"] [data-create]').last().isDisabled());
  const before = await page.locator('[data-message="operator"]').count();
  await q(1).locator('[data-accept]').click();
  await q(2).locator('[data-accept]').click();
  await q(3).locator('[data-accept]').click();
  await page.waitForFunction((n) => document.querySelectorAll('[data-message="operator"]').length === n + 1, before);
  await page.waitForTimeout(600);
  const sent = page.locator('[data-message="operator"]').last();
  await sent.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(out, `b-sent-${w}.png`) });
  console.log(w, 'b: sent text:', JSON.stringify(await sent.locator('p').first().textContent()), '· operator messages', before, '->', await page.locator('[data-message="operator"]').count(), '· sideways:', await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));
  await page.close();
}
await reset();
await browser.close();
