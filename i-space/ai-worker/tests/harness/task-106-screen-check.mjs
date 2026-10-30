// TASK-106 DoD "opened in the running app": open the board on the mock, press ดูหน้าจอ on the running worker at 375 / 768 / 1280, and record
// sideways scroll, hit-target size, the sheet's size, focus-visible on the button, and a screenshot. Throwaway; never in a product repo.
// usage: bun tests/harness/task-106-screen-check.mjs <caw-front dir> <base url> <out dir>
// Read-only against a mock server (CAW_API=mock) someone started; it clicks only ดูหน้าจอ and ปิด.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const BOARD = `${base}/p/10000000-0000-4000-8000-000000000001`;

const browser = await chromium.launch({ channel: 'chrome' });
const result = [];
for (const [w, h] of [[375, 800], [768, 900], [1280, 900]]) {
  for (const reduced of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    await page.goto(BOARD, { waitUntil: 'networkidle' });
    // REWORK DoD 5: the corner button must not cover a seat's name or role marks, keeps >= 44x44, and the seat keeps its old height
    const seatsCheck = await page.locator('[data-crew] > li').evaluateAll((lis) => lis.map((li) => {
      const r = (el) => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
      const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
      const btn = r(li.querySelector('[data-watch]')), name = li.querySelector('[data-name]'), nameR = r(name), roles = r(name.nextElementSibling), seat = r(li.querySelector('[data-seat]'));
      const line = li.querySelector('[data-seat-line]');
      return { seat: li.querySelector('[data-seat]').dataset.seat, btn: `${Math.round(btn.w)}x${Math.round(btn.h)}`, seatH: Math.round(seat.h), coversName: hit(btn, nameR), coversRoles: hit(btn, roles),
        coversSeatLine: hit(btn, r(line)), nameTruncated: name.scrollWidth > name.clientWidth, inside: btn.r <= seat.r + 0.5 && btn.t >= seat.t - 0.5 };
    }));
    console.log(`SEATS ${w}: ${JSON.stringify(seatsCheck)}`);
    if (!reduced) await page.locator('[data-crew-wrap]').screenshot({ path: path.join(out, `crew-${w}.png`) });
    const sideways = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const btn = page.locator('[data-watch="ฝน"]');
    await btn.scrollIntoViewIfNeeded();
    const box = await btn.boundingBox();
    // keyboard: Tab to the button and read whether it shows a focus ring
    // a real Tab, so :focus-visible applies (a script's .focus() does not set it)
    await page.locator('[data-seat="ปลา"]').focus();
    for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); if (await btn.evaluate((el) => el === document.activeElement)) break; }
    await page.waitForTimeout(400); // the shadcn Button transitions its ring; read it after that
    const ring = await btn.evaluate((el) => { const s = getComputedStyle(el); return `active=${el === document.activeElement} focus-visible=${el.matches(':focus-visible')} | ring-layers-with-colour=${s.boxShadow.split(/,(?![^(]*\))/).filter((x) => !/rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\)/.test(x)).join(' ;').trim() || 'none'}`; });
    const before = await sideways();
    await btn.click();
    await page.locator('[data-screen] [data-kind="line"]').first().waitFor();
    await page.waitForTimeout(2600);
    const sheet = await page.locator('[data-screen]').boundingBox();
    const lines = await page.locator('[data-screen] [data-kind="line"]').count();
    const scroller = await page.locator('[data-screen-lines]').evaluate((el) => ({ atBottom: el.scrollHeight - el.scrollTop - el.clientHeight < 24, overflowX: el.scrollWidth > el.clientWidth }));
    const close = await page.getByRole('button', { name: 'ปิด' }).first().boundingBox();
    const row = { width: w, reducedMotion: reduced, watchButton: box && `${Math.round(box.width)}x${Math.round(box.height)}`, focusRing: ring, sidewaysBefore: before, sidewaysAfter: await sideways(),
      sheet: sheet && `${Math.round(sheet.width)}x${Math.round(sheet.height)}`, lines, ...scroller, closeButton: close && `${Math.round(close.width)}x${Math.round(close.height)}` };
    result.push(row);
    console.log(JSON.stringify(row));
    if (!reduced) await page.screenshot({ path: path.join(out, `screen-${w}.png`) });
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
