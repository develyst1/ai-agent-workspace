// TASK-116 DoD 7: screenshots at 1280 and 390 of the project header with a label / with none, a card cut before a label, a card cut at one,
// the removed-part card and the unreachable sentence — plus sideways scroll and the label tag's box. Throwaway; never in a product repo.
// usage: bun tests/harness/task-116-shots.mjs <caw-front dir> <base url> <out dir>   (a mock server with CAW_TEST_RESET=1 that someone started)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const PID = '10000000-0000-4000-8000-000000000001';
const reset = async (state) => { const r = await fetch(`${base}/test-reset${state ? `?state=${state}` : ''}`, { method: 'POST' }); if (r.status !== 204) throw new Error(`reset ${state}: ${r.status}`); };

const browser = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1280, 900], [390, 844]]) {
  const shot = async (page, name) => {
    await page.screenshot({ path: path.join(out, `${name}-${w}.png`), fullPage: true });
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    const tag = await page.locator('[data-label-tag], [data-cut-label], [data-anchor-removed], [data-blueprint-unreachable]').evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return `${e.getAttribute('data-label-tag') !== null ? 'label' : e.getAttribute('data-cut-label') !== null ? 'cut' : e.getAttribute('data-anchor-removed') !== null ? 'removed' : 'unreachable'} ${Math.round(b.width)}x${Math.round(b.height)} "${e.textContent}"`; }));
    console.log(`${name} @${w}: sideways=${sideways} · ${tag.join(' | ')}`);
  };
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const cardLink = async (text) => { await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' }); await page.locator('[data-card]', { hasText: text }).first().click(); await page.waitForURL(/\/c\//); await page.waitForLoadState('networkidle'); };

  await reset();
  await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' }); await shot(page, 'header-with-label');
  await page.goto(`${base}/`, { waitUntil: 'networkidle' }); await shot(page, 'projects-chip-label');
  await cardLink('ทำ API ค้นหาห้องว่าง'); await shot(page, 'card-cut-at-label');
  await cardLink('ตั้งข้อมูล Room'); await shot(page, 'card-cut-before-label');

  await reset('no-label');
  await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' }); await shot(page, 'header-no-label');

  await reset('blueprint-down');
  await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' }); await shot(page, 'unreachable-board');
  await cardLink('ทำ API ค้นหาห้องว่าง'); await shot(page, 'unreachable-card');

  await reset('anchor-removed');
  await page.goto(`${base}/p/${PID}`, { waitUntil: 'networkidle' }); await shot(page, 'board-removed-part');
  await page.locator('[data-card]', { has: page.locator('[data-anchor-removed]') }).first().click(); await page.waitForURL(/\/c\//); await page.waitForLoadState('networkidle'); await shot(page, 'card-removed-part');
  await ctx.close();
}
await reset();
await browser.close();
