// TASK-122 DoD 6: the seeded open proposal and the board with the uncovered line, light + dark, at 390 and 1280; sideways scroll and the line's box.
// Throwaway; never in a product repo.  usage: bun tests/harness/task-122-shots.mjs <caw-front dir> <base url> <out dir>  (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const r = await fetch(`${base}/test-reset`, { method: 'POST' }); if (r.status !== 204) throw new Error(`reset ${r.status}`);
const host = new URL(base).hostname;

const browser = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [1280, 900]]) {
  for (const dark of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light' });
    if (dark) await ctx.addCookies([{ name: 'caw-theme', value: 'dark', domain: host, path: '/' }]);
    const page = await ctx.newPage();
    for (const [name, url] of [['proposal', `${base}/p/${PID}/chat`], ['board', `${base}/p/${PID}`]]) {
      await page.goto(url, { waitUntil: 'networkidle' });
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark') || getComputedStyle(document.body).backgroundColor);
      await page.screenshot({ path: path.join(out, `${name}-${dark ? 'dark' : 'light'}-${w}.png`), fullPage: true });
      const sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      const lines = await page.locator('[data-uncovered-part]').evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(), a = e.querySelector('a').getBoundingClientRect(); return `${Math.round(b.width)}x${Math.round(b.height)} link ${Math.round(a.width)}x${Math.round(a.height)} "${e.textContent}"`; }));
      console.log(`${name} ${dark ? 'dark' : 'light'} @${w}: sideways=${sideways} bg=${isDark} · ${lines.length} line(s): ${lines.join(' | ')}`);
    }
    await ctx.close();
  }
}
await fetch(`${base}/test-reset`, { method: 'POST' });
await browser.close();
