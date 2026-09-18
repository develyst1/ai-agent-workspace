#!/usr/bin/env node
// measure-login-link.mjs — TASK-022 measuring instrument (DoD 5, 6, 7, 9).
//
// Usage:
//   PW=<abs path to a playwright-core install> \
//   node measure-login-link.mjs <base-url> <label: BEFORE|AFTER> [--behaviour]
//
// Drives the REAL Chrome on this machine (playwright-core + executablePath).
// For each theme (light/dark, via localStorage dte-theme), same viewport:
//   - GET /login status
//   - a[href="/forgot-password"] count + whether body text contains ลืมรหัสผ่าน
//   - getBoundingClientRect() of (a) the จดจำฉัน row div, (b) the checkbox
//     input, (c) the submit button
//   - a screenshot `login-<label>-<theme>.png` next to this script
// With --behaviour it also drives the form twice:
//   - wrong password: the app's fetch to <api>/auth/login is answered 401 by a
//     Playwright route (no backend runs on this machine; the app's own catch path
//     turns any failure into the red banner) — reads the banner text.
//   - demo login: the same route answers 200 with a minimal AuthResponse, and
//     the script reports the URL after submit. THIS IS A MOCKED BACKEND — it
//     proves the frontend's submit path, not the real credentials.
//
// Throwaway verification script. Lives in the coordination repo, not in front/.

import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(
  pathToFileURL(`${process.env.PW}/node_modules/playwright-core/index.mjs`).href
);

const BASE = process.argv[2];
const LABEL = process.argv[3];
const BEHAVIOUR = process.argv.includes('--behaviour');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HERE = dirname(fileURLToPath(import.meta.url));
if (!BASE || !LABEL) { console.error('usage: node measure-login-link.mjs <base-url> <BEFORE|AFTER> [--behaviour]'); process.exit(1); }

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

const open = async (theme, width = 1280, height = 1050) => {
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.addInitScript((t) => localStorage.setItem('dte-theme', t), theme);
  const page = await ctx.newPage();
  const resp = await page.goto(`${BASE}/login`, { waitUntil: 'load' });
  await page.waitForFunction(() => /\b(light|dark)\b/.test(document.documentElement.className));
  await page.waitForTimeout(1200); // let the theme transition land (TASK-021 F1)
  return { ctx, page, status: resp.status() };
};

const rect = (r) => r && `x=${r.x} y=${r.y} w=${r.width} h=${r.height}`;

for (const theme of ['light', 'dark']) {
  const { ctx, page, status } = await open(theme);
  const g = await page.evaluate(() => {
    const cb = document.querySelector('form input[type="checkbox"]');
    const row = cb && cb.closest('div.flex.items-center.justify-between');
    const submit = document.querySelector('form button[type="submit"]');
    const j = (el) => el && el.getBoundingClientRect().toJSON();
    return {
      htmlClass: document.documentElement.className,
      forgotAnchors: document.querySelectorAll('a[href="/forgot-password"]').length,
      bodyHasForgotText: document.body.innerText.includes('ลืมรหัสผ่าน'),
      rowText: row && row.innerText.replace(/\s+/g, ' ').trim(),
      rowChildren: row && row.children.length,
      row: j(row), checkbox: j(cb), submit: j(submit),
    };
  });
  console.log(`=== ${LABEL} / ${theme} (html="${g.htmlClass}") GET /login -> ${status} ===`);
  console.log(`a[href="/forgot-password"].length = ${g.forgotAnchors}`);
  console.log(`body.innerText.includes('ลืมรหัสผ่าน') = ${g.bodyHasForgotText}`);
  console.log(`row children=${g.rowChildren} text="${g.rowText}"`);
  console.log(`(a) row div   ${rect(g.row)}`);
  console.log(`(b) checkbox  ${rect(g.checkbox)}`);
  console.log(`(c) submit    ${rect(g.submit)}`);
  const file = join(HERE, `login-${LABEL}-${theme}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`screenshot: ${file}`);
  await ctx.close();
}

if (BEHAVIOUR) {
  console.log('\n=== DoD 7 — behaviour (backend MOCKED by page.route, none runs here) ===');
  const drive = async (mock, email, password) => {
    const { ctx, page } = await open('light');
    const calls = [];
    await page.route('**/auth/login', async (route) => {
      calls.push(route.request().url());
      await route.fulfill(mock);
    });
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('form button[type="submit"]');
    await page.waitForTimeout(1500);
    const out = await page.evaluate(() => ({
      url: location.href,
      banner: (document.querySelector('form .text-red-500') || {}).innerText || null,
      bodyHasWrong: document.body.innerText.includes('อีเมลหรือรหัสผ่านไม่ถูกต้อง'),
      user: localStorage.getItem('dte_user'),
    }));
    await ctx.close();
    return { calls, ...out };
  };
  const wrong = await drive(
    { status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid credentials' }) },
    'john@example.com', 'wrong-password'
  );
  console.log('wrong password ->', JSON.stringify(wrong));
  const demo = await drive(
    { status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'mock-token', user: { id: 'u1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', display_name: 'John Doe', avatar: null, bio: null, role: 'student', subscriptionTier: 'free', subscriptionExpiry: null } }) },
    'john@example.com', 'password123'
  );
  console.log('demo login    ->', JSON.stringify(demo));
}

await browser.close();
