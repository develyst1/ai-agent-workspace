// TASK-165 DoD 9: the board page at 1280, light, on the default mock seed — run once on the old build (label "before") and once on the new (label "after").
// Throwaway; never in a product repo.
// usage: bun tests/harness/task-165-shot.mjs <caw-front dir> <base url> <out dir> <before|after>  (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, base, out, label] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const reset = (s) => fetch(`${base}/test-reset${s ? `?state=${s}` : ''}`, { method: 'POST' });
if ((await reset()).status !== 204) throw new Error('reset');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' })).newPage();
await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, `board-1280-${label}.png`) });
const fam = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`));
console.log(label, 'body font-family:', fam.slice(0, 90), '· loaded faces:', JSON.stringify(loaded));
await reset();
await browser.close();
