// TEST-104 UI part 1: #12 (AC-6 no name), #1/#2 (AC-1 warning + label), #6 (AC-3 CAW button, no label), #22 (AC-11 button text).
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const WEB = 'http://127.0.0.1:3121', API = 'http://127.0.0.1:4221';
const sid = fs.readFileSync('stuck-project-id.txt', 'utf8').trim();
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const count = async () => {
  const [l, h, s] = await Promise.all([fetch(`${API}/v1/projects/${sid}/labels`), fetch(`${API}/v1/projects/${sid}/history?limit=500`), fetch(`${API}/v1/projects/${sid}`)]);
  return { labels: (await l.json()).labels.length, history: (await h.json()).entries.length, parts: (await s.json()).parts.length };
};
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage(); page.setDefaultTimeout(20000);
const shot = (n) => page.screenshot({ path: `${n}.png`, fullPage: true });

// #12 AC-6 — no name: try a label, a quiz question, a requirement
await page.goto(`${WEB}/p/${sid}/ready`, { waitUntil: 'networkidle' });
let c0 = await count();
await page.getByPlaceholder('ตั้งชื่อป้าย เช่น v1 ทดลอง').fill('v1 ทดลอง');
await page.getByRole('button', { name: 'ใส่ป้าย version' }).click();
await page.waitForTimeout(1500);
const promptVisible = await page.getByPlaceholder('พิมพ์ชื่อคุณก่อน ระบบจะบันทึกว่าใครแก้').isVisible();
const promptText = (await page.textContent('body')).includes('พิมพ์ชื่อคุณก่อน');
let c1 = await count();
note('#12 label with no name → asked, nothing saved', promptVisible && c1.labels === c0.labels && c1.history === c0.history, `prompt visible ${promptVisible} (text on page ${promptText}); labels ${c0.labels}→${c1.labels}, history ${c0.history}→${c1.history}`);
await shot('12-noname-label');
const q = page.locator('input[type="text"], textarea').filter({ hasNot: page.getByPlaceholder('ตั้งชื่อป้าย เช่น v1 ทดลอง') });
await page.getByRole('button', { name: /^ถาม$/ }).click().catch(() => {});
await page.waitForTimeout(1000);
c1 = await count();
note('#12 quiz ask with no name → nothing saved', c1.history === c0.history, `history ${c0.history}→${c1.history}`);
const reqLink = page.getByRole('link', { name: /^requirement/i }).first();
await reqLink.click(); await page.waitForLoadState('networkidle');
await shot('12-requirements-page-noname');
const addBtn = page.getByRole('button', { name: /เพิ่ม requirement/ }).first();
if (await addBtn.count()) {
  await addBtn.click(); await page.waitForTimeout(500);
  const fields = page.locator('form input[type="text"], form textarea, dialog input, dialog textarea, [role="dialog"] input, [role="dialog"] textarea');
  const n = await fields.count();
  for (let i = 0; i < n; i++) await fields.nth(i).fill(i === 0 ? 'ไม่มีชื่อ' : 'ไม่ควรถูกบันทึก');
  await page.getByRole('button', { name: /บันทึก|เพิ่ม|ตกลง/ }).last().click().catch(() => {});
  await page.waitForTimeout(1500);
  c1 = await count();
  note('#12 requirement add with no name → nothing saved', c1.parts === c0.parts && c1.history === c0.history, `fields ${n}; parts ${c0.parts}→${c1.parts}, history ${c0.history}→${c1.history}; prompt on page ${(await page.textContent('body')).includes('พิมพ์ชื่อคุณก่อน')}`);
  await shot('12-noname-requirement');
} else note('#12 requirement add', false, 'no "เพิ่ม requirement" button found on ' + page.url());

// set the name
await page.goto(`${WEB}/p/${sid}/ready`, { waitUntil: 'networkidle' });
await page.getByPlaceholder('พิมพ์ชื่อคุณก่อน ระบบจะบันทึกว่าใครแก้').fill('โด่ง');
await page.getByPlaceholder('พิมพ์ชื่อคุณก่อน ระบบจะบันทึกว่าใครแก้').press('Enter'); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
const cookie = (await ctx.cookies()).find((k) => k.name === 'bp_by');
const btnText = (await page.locator('button').allTextContents()).find((t) => t.includes('เปลี่ยนชื่อ'));
note('#22 AC-11 name button text', btnText?.replace(/\s+/g, ' ').trim() === 'โด่ง · เปลี่ยนชื่อ', `button ${JSON.stringify(btnText)}; cookie bp_by=${cookie?.value}`);
await shot('22-name-set');

// #1/#2 AC-1 — label on the stuck project: warning first
c0 = await count();
await page.getByPlaceholder('ตั้งชื่อป้าย เช่น v1 ทดลอง').fill('v1 ทดลอง');
await page.getByRole('button', { name: 'ใส่ป้าย version' }).click();
await page.waitForTimeout(1200);
const body = await page.textContent('body');
const warn = body.match(/ยังมี[^—]*—[^.]*?ไม่พร้อม/)?.[0];
c1 = await count();
note('#1 warning shown before saving', !!warn && c1.labels === c0.labels, `warning ${JSON.stringify(warn)}; labels after first click ${c0.labels}→${c1.labels}`);
note('#2 warning exact words', warn === 'ยังมี 10 จุดค้าง และ quiz ยังไม่ครบ — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม', `expected "ยังมี 10 จุดค้าง และ quiz ยังไม่ครบ — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม"`);
await shot('01-warning');
const buttons = await page.locator('button').allTextContents();
const go = buttons.find((t) => /ใส่ป้าย|ยืนยัน|ตกลง/.test(t) && !t.includes('version'));
if (go) await page.getByRole('button', { name: go.trim() }).first().click(); else await page.getByRole('button', { name: 'ใส่ป้าย version' }).click();
await page.waitForLoadState('networkidle'); await page.waitForTimeout(1200);
const labels = (await (await fetch(`${API}/v1/projects/${sid}/labels`)).json()).labels;
note('#1 label saved after the warning', labels.some((l) => l.label === 'v1 ทดลอง' && l.by === 'โด่ง'), `second click on ${JSON.stringify(go ?? 'ใส่ป้าย version')}; labels ${JSON.stringify(labels.map((l) => [l.label, l.by]))}`);
const listed = (await page.textContent('body')).includes('v1 ทดลอง');
note('#1 label in the label list on screen', listed, `buttons seen: ${JSON.stringify(buttons.map((t) => t.trim()).filter(Boolean))}`);
await shot('01-labelled');
await browser.close();
