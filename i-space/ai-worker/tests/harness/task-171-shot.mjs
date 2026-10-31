// TASK-171 DoD 8: the seed's 3-item open plan on the chat page — (a) default seed: the partly-on-board line, (b) state `plan-on-board`: the copy badge. 390 and 1280, light.
// Throwaway; never in a product repo.
// usage: bun tests/harness/task-171-shot.mjs <caw-front dir> <base url> <out dir>  (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const reset = (s) => fetch(`${base}/test-reset${s ? `?state=${s}` : ''}`, { method: 'POST' });
const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, state] of [['a-partly', undefined], ['b-copy', 'plan-on-board']]) {
  for (const w of [390, 1280]) {
    if ((await reset(state)).status !== 204) throw new Error('reset');
    const page = await (await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: 'light' })).newPage();
    await page.goto(`${base}/p/${PID}/chat`, { waitUntil: 'networkidle' });
    const plan = page.locator('[data-proposal="open"]').filter({ hasText: '3 งาน ใช้ประมาณ 6 ก้าว' });
    await plan.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await plan.screenshot({ path: path.join(out, `${label}-${w}.png`) });
    const txt = async (sel) => (await plan.locator(sel).count()) ? JSON.stringify(await plan.locator(sel).first().textContent()) : 'none';
    console.log(label, w, '· onboard:', await txt('[data-agree-onboard]'), '· what:', await txt('[data-agree-what]'), '· copy:', await txt('[data-agree-copy]'), '· create buttons:', await plan.locator('[data-create]').count(), '· sideways:', await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));
    await page.close();
  }
}
await reset();
await browser.close();
