// TASK-120 DoD 6: the seeded "stopped midway" card on the board and on its card page, light + dark at 390 (and 1280), with a sideways-scroll and chip-width check.
// usage: bun tests/harness/task-120-shots.mjs <caw-front dir> <base url> <out dir>   — read-only against a mock server (CAW_API=mock) someone started.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const P = '10000000-0000-4000-8000-000000000001', C1 = '30000000-0000-4000-8000-000000000001';

const browser = await chromium.launch({ channel: 'chrome' });
for (const w of [390, 1280]) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addCookies([{ name: 'caw-theme', value: theme, url: base }]);
    await ctx.addInitScript((t) => { try { localStorage.setItem('caw-theme', t); } catch {} }, theme);
    const page = await ctx.newPage();
    const sideways = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.goto(`${base}/p/${P}`, { waitUntil: 'networkidle' });
    const card = page.locator(`[data-card="${C1}"]`);
    await card.scrollIntoViewIfNeeded();
    const chip = card.locator('[data-stopped-midway]');
    const cb = await card.boundingBox(), kb = await chip.boundingBox();
    const cut = await chip.locator('span.truncate').evaluate((el) => el.scrollWidth > el.clientWidth);
    const a = { page: 'board', w, theme, dataTheme: await page.evaluate(() => document.documentElement.dataset.theme), sideways: await sideways(), cardW: Math.round(cb.width), chipW: Math.round(kb.width), chipInsideCard: kb.x >= cb.x - 0.5 && kb.x + kb.width <= cb.x + cb.width + 0.5, textCutWithEllipsis: cut, chipH: Math.round(kb.height) };
    console.log(JSON.stringify(a));
    await card.screenshot({ path: path.join(out, `board-card-${w}-${theme}.png`) });
    await page.goto(`${base}/p/${P}/c/${C1}`, { waitUntil: 'networkidle' });
    const m = page.locator('[data-stopped-midway]');
    const mb = await m.boundingBox();
    const b = { page: 'card', w, theme, sideways: await sideways(), markW: Math.round(mb.width), markH: Math.round(mb.height), text: await m.innerText() };
    console.log(JSON.stringify(b));
    await page.screenshot({ path: path.join(out, `card-page-${w}-${theme}.png`) });
    await ctx.close();
  }
}
await browser.close();
