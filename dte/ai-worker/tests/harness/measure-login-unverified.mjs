#!/usr/bin/env node
// measure-login-unverified.mjs — TASK-024 measuring instrument (DoD 5c, 6, 7, 8b, 8c).
//
// Usage:
//   PW=<abs path to a dir with node_modules/playwright-core> \
//   node measure-login-unverified.mjs <front-base-url>
//
// Drives the REAL Chrome on this machine (playwright-core + executablePath) against
// `npx next start` which was BUILT with NEXT_PUBLIC_API_URL pointing at a LOCAL back/
// on a LOCAL throwaway Postgres. NOTHING IS MOCKED — every /auth/* call reaches that
// local backend and the printed request/response bodies are its real answers.
//
//   DoD 5c  unverified user (registered by curl before this runs) → banner text, both
//           themes, screenshot login-unverified-<theme>.png next to this script
//   DoD 6   the resend button inside the banner → click → the real request to
//           /auth/resend-verification (method + body) → the antd toast text
//   DoD 7   wrong password / unknown email → generic banner, no button;
//           correct seeded password → URL + localStorage.dte_user
//   DoD 8b  /register a second throwaway → success state → resend → alert text
//   DoD 8c  /verify-email?token=bogus → error state innerText
//
// Throwaway verification script. Lives in the coordination repo, not in front/.

import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const { chromium } = await import(
  pathToFileURL(`${process.env.PW}/node_modules/playwright-core/index.mjs`).href
);

const BASE = process.argv[2];
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HERE = dirname(fileURLToPath(import.meta.url));
if (!BASE) { console.error('usage: node measure-login-unverified.mjs <front-base-url>'); process.exit(1); }

const UNVERIFIED = { email: 'task024-unverified@example.test', password: 'password123' };
const SEEDED = { email: 'student.one@example.com', password: 'Demo1234!' };
const SECOND = { name: 'Task 024', email: 'task024-second@example.test', password: 'Second024!' }; // /register's own strength rules need upper+lower+digit+special

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

const open = async (path, theme = 'light') => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1050 } });
  await ctx.addInitScript((t) => localStorage.setItem('dte-theme', t), theme);
  const page = await ctx.newPage();
  const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForFunction(() => /\b(light|dark)\b/.test(document.documentElement.className));
  await page.waitForTimeout(1200);
  return { ctx, page, status: resp.status() };
};

const readBanner = (page) => page.evaluate(() => ({
  url: location.href,
  bannerInnerText: document.querySelector('form div.text-red-500')?.innerText ?? null,
  bannerButtons: document.querySelectorAll('form div.text-red-500 button').length,
  bannerButtonText: document.querySelector('form div.text-red-500 button')?.innerText ?? null,
  user: localStorage.getItem('dte_user'),
}));

const submitLogin = async (page, { email, password }) => {
  await page.fill('#email', email);
  await page.fill('#password', password);
  const respP = page.waitForResponse((r) => r.url().includes('/auth/login'));
  await page.click('form button[type="submit"]');
  const resp = await respP;
  const body = await resp.text();
  await page.waitForTimeout(1500);
  return { status: resp.status(), body };
};

const ONLY = process.argv[3]; // optional: 'later' = skip 5c/6/7 (already run)
if (ONLY !== 'later') {
// ── DoD 5c ─────────────────────────────────────────────────────────────────
console.log('=== DoD 5c — unverified login, REAL backend, both themes ===');
for (const theme of ['light', 'dark']) {
  const { ctx, page } = await open('/login', theme);
  const r = await submitLogin(page, UNVERIFIED);
  const b = await readBanner(page);
  console.log(`[${theme}] POST /auth/login -> ${r.status} ${r.body}`);
  console.log(`[${theme}] banner:`, JSON.stringify(b));
  const file = join(HERE, `login-unverified-${theme}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`[${theme}] screenshot -> ${file}`);
  await ctx.close();
}

// ── DoD 6 ──────────────────────────────────────────────────────────────────
console.log('\n=== DoD 6 — resend button inside the banner, REAL request, toast ===');
{
  const { ctx, page } = await open('/login', 'light');
  await submitLogin(page, UNVERIFIED);
  const before = await readBanner(page);
  console.log('before click:', JSON.stringify({ bannerButtons: before.bannerButtons, bannerButtonText: before.bannerButtonText }));
  const reqP = page.waitForRequest('**/auth/resend-verification');
  const respP = page.waitForResponse('**/auth/resend-verification');
  await page.click('form div.text-red-500 button');
  const req = await reqP;
  const resp = await respP;
  console.log('request :', req.method(), req.url(), 'body=', req.postData());
  console.log('response:', resp.status(), await resp.text());
  await page.waitForTimeout(800);
  const toast = await page.evaluate(() => ({
    antMessage: document.querySelector('.ant-message')?.innerText ?? null,
    antMessageCount: document.querySelectorAll('.ant-message').length,
    noticeCount: document.querySelectorAll('.ant-message-notice').length,
  }));
  console.log('toast   :', JSON.stringify(toast));
  const file = join(HERE, 'login-unverified-after-resend.png');
  await page.screenshot({ path: file });
  console.log('screenshot ->', file);
  await ctx.close();
}

// ── DoD 7 ──────────────────────────────────────────────────────────────────
console.log('\n=== DoD 7 — 401 paths unchanged + real seeded login ===');
{
  const { ctx, page } = await open('/login');
  const r = await submitLogin(page, { email: SEEDED.email, password: 'definitely-wrong' });
  console.log('wrong password ->', r.status, r.body, JSON.stringify(await readBanner(page)));
  await ctx.close();
}
{
  const { ctx, page } = await open('/login');
  const r = await submitLogin(page, { email: 'nobody-task024@example.test', password: 'whatever1' });
  console.log('unknown email  ->', r.status, r.body, JSON.stringify(await readBanner(page)));
  await ctx.close();
}
{
  const { ctx, page } = await open('/login');
  await page.fill('#email', SEEDED.email);
  await page.fill('#password', SEEDED.password);
  const respP = page.waitForResponse((r) => r.url().includes('/auth/login'));
  await page.click('form button[type="submit"]');
  const resp = await respP;
  await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  const out = await page.evaluate(() => ({ url: location.href, user: localStorage.getItem('dte_user') }));
  console.log('correct password ->', resp.status(), JSON.stringify(out));
  await ctx.close();
}

}
// ── DoD 8b ─────────────────────────────────────────────────────────────────
console.log('\n=== DoD 8b — /register second throwaway, success state, its own resend ===');
{
  const { ctx, page, status } = await open('/register');
  console.log('GET /register ->', status);
  await page.fill('#name', SECOND.name);
  await page.fill('#email', SECOND.email);
  const pw = page.locator('input[placeholder="••••••••"]'); // PasswordInput has no id
  await pw.nth(0).fill(SECOND.password);
  await pw.nth(1).fill(SECOND.password);
  // page.check('#terms') reports 'did not change its state' in headless Chrome on this screen (pre-existing, not TASK-024's);
  // it is a plain required checkbox, so set it directly — the register POST is what is under test here.
  await page.evaluate(() => { document.getElementById('terms').checked = true; });
  const respP = page.waitForResponse('**/auth/register');
  await page.click('form button[type="submit"]');
  const resp = await respP;
  console.log('POST /auth/register ->', resp.status(), await resp.text());
  await page.waitForTimeout(1200);
  const success = await page.evaluate(() => ({
    hasSentLine: document.body.innerText.includes('เราได้ส่งอีเมลยืนยันไปที่'),
    emailShown: document.body.innerText.includes('task024-second@example.test'),
  }));
  console.log('success state:', JSON.stringify(success));
  const dialogs = [];
  page.on('dialog', async (d) => { dialogs.push({ type: d.type(), message: d.message() }); await d.dismiss(); });
  const reqP = page.waitForRequest('**/auth/resend-verification');
  await page.click('button:has-text("ส่งอีเมลยืนยันอีกครั้ง")');
  const req = await reqP;
  console.log('resend request:', req.method(), 'body=', req.postData());
  await page.waitForTimeout(1500);
  console.log('alert(s):', JSON.stringify(dialogs));
  await ctx.close();
}

// ── DoD 8c ─────────────────────────────────────────────────────────────────
console.log('\n=== DoD 8c — /verify-email?token=bogus ===');
{
  const { ctx, page, status } = await open('/verify-email?token=bogus');
  const respP = page.waitForResponse('**/auth/verify-email**', { timeout: 10000 }).catch(() => null);
  const resp = await respP;
  await page.waitForTimeout(1200);
  console.log('GET /verify-email ->', status, '| backend ->', resp ? `${resp.status()} ${await resp.text()}` : 'no request seen');
  const txt = await page.evaluate(() => document.querySelector('main')?.innerText ?? document.body.innerText);
  console.log('innerText:', JSON.stringify(txt));
  await ctx.close();
}

await browser.close();
