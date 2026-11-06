// sid-people-screenshot.mjs — look-only screenshot of one sid frontoffice page (owner asks 2026-11-06 via Porter).
// Run from the workspace root:
//   node smart-scheduler/ai-worker/tests/harness/sid-people-screenshot.mjs [path] [label] [--links]
//   path defaults to /scheduler/people; --links also prints every same-origin link and tab label on the page.
// Reuses the owner-provisioned session picklocker/state/som.json as storageState; types nothing, logs in nowhere,
// writes nothing. Never prints the session. Refuses any host that is not sid's frontoffice.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.resolve('picklocker/package.json'));
const { chromium } = require('playwright-core');

const args = process.argv.slice(2);
const wantLinks = args.includes('--links');
const [pagePath = '/scheduler/people', label = 'people'] = args.filter((a) => !a.startsWith('--'));

const SID_HOST = 'som.develyst.online';
const TARGET = `https://${SID_HOST}${pagePath}`;
const STATE = 'picklocker/state/som.json';
const OUT_DIR = 'smart-scheduler/ai-worker/tests/evidence';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT = path.join(OUT_DIR, `sid-${label}-${stamp}.png`);

if (new URL(TARGET).host !== SID_HOST) throw new Error('refused: not sid');
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ storageState: STATE, viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
// Look-only: abort every non-GET request so nothing can be written.
await page.route('**/*', (route) => (route.request().method() === 'GET' ? route.continue() : route.abort()));

const resp = await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 90_000 });
const finalUrl = new URL(page.url());
if (finalUrl.host !== SID_HOST) { await browser.close(); throw new Error(`refused: redirected off sid to ${finalUrl.host}`); }
await page.waitForTimeout(2000);
// --open-plan: click the first "Manage plan" (opens a course's plan window; GETs only, nothing saved).
if (args.includes('--open-plan')) {
  await page.getByRole('button', { name: 'Manage plan' }).first().click();
  await page.waitForTimeout(3000);
}
await page.screenshot({ path: OUT, fullPage: false });

console.log(JSON.stringify({ status: resp?.status(), finalUrl: finalUrl.origin + finalUrl.pathname + finalUrl.search, out: OUT, at: new Date().toString() }));
if (wantLinks) {
  const found = await page.evaluate(() => ({
    links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h.startsWith('/')))],
    tabs: [...document.querySelectorAll('[role=tab], button')].map((b) => b.textContent.trim()).filter(Boolean).slice(0, 60),
  }));
  console.log(JSON.stringify(found));
}
await browser.close();
