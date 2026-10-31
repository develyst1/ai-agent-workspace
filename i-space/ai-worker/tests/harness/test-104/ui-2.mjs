// TEST-104 UI part 2: #6 AC-3 · #7/#8 AC-4 on screen · #21 AC-10 overview + PDF · #22b AC-11 rename · history page · #19 390.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const WEB = 'http://127.0.0.1:3121', API = 'http://127.0.0.1:4221';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const H = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('ผู้ตั้งค่า QA') };
const fresh = await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: H, body: JSON.stringify({ name: 'TEST-104 ไม่มีป้าย', theme: 'clean-blue' }) })).json();
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const page = await ctx.newPage(); page.setDefaultTimeout(30000);
const shot = (n) => page.screenshot({ path: `${n}.png`, fullPage: true });

// #6 AC-3
await page.goto(`${WEB}/p/${fresh.id}/ready`, { waitUntil: 'networkidle' });
const build = page.getByRole('link', { name: 'ส่งไปสร้างที่ CAW' }).first();
const href = await build.getAttribute('href');
note('#6 AC-3 button enabled with no label', (await build.isVisible()) && href === `http://127.0.0.1:3521/start?project=${fresh.id}`, `href ${href}`);
await build.click(); await page.waitForLoadState('networkidle');
const lands = (await page.textContent('body')).includes('ลิงก์นี้ไม่ครบ');
note('#6 click lands on CAW /start (REQ-103 Q2 accepted: "ลิงก์นี้ไม่ครบ" until REQ-105)', page.url().startsWith('http://127.0.0.1:3521/start'), `url ${page.url()}; shows "ลิงก์นี้ไม่ครบ" ${lands}`);
await shot('06-caw-start-no-version');

// #7 AC-4 on screen, in the audit project
const aid = fs.readFileSync('project-id.txt', 'utf8').trim();
const reqs = async () => (await (await fetch(`${API}/v1/projects/${aid}`)).json()).parts.filter((p) => p.kind === 'requirement');
const histN = async () => (await (await fetch(`${API}/v1/projects/${aid}/history?limit=500`)).json()).entries.length;
await page.goto(`${WEB}/p/${aid}/requirements`, { waitUntil: 'networkidle' });
await shot('07-requirements-before');
let r0 = (await reqs()).length, h0 = await histN();
await page.getByRole('button', { name: /เพิ่ม requirement/ }).first().click(); await page.waitForTimeout(400);
const inputs = page.locator('input:not([type]):visible, input[type="text"]:visible, textarea:visible').filter({ hasNot: page.locator('[placeholder*="พิมพ์ชื่อ"]') });
const nIn = await inputs.count();
console.log('form fields', nIn, JSON.stringify(await inputs.evaluateAll((els) => els.map((e) => e.getAttribute('placeholder') || e.getAttribute('aria-label') || e.name))));
await inputs.nth(nIn - 1).fill('ข้อความบนหน้าเป็นภาษาไทย');
if (nIn > 1) await inputs.nth(nIn - 2).fill('ภาษาไทย');
const saveBtn = page.getByRole('button', { name: /^(บันทึก|เพิ่ม|ตกลง)$/ });
await saveBtn.last().click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
let r1 = await reqs(), h1 = await histN();
note('#7 add on screen', r1.length === r0 + 1 && h1 === h0 + 1 && (await page.textContent('body')).includes('ข้อความบนหน้าเป็นภาษาไทย'), `requirements ${r0}→${r1.length}; history ${h0}→${h1}`);
await shot('07-requirement-added');
const newKey = r1.find((p) => JSON.stringify(p).includes('ข้อความบนหน้าเป็นภาษาไทย'))?.key;
// edit
const editBtn = page.getByRole('button', { name: /แก้/ });
console.log('edit buttons', await editBtn.count());
await editBtn.last().click(); await page.waitForTimeout(400);
const ein = page.locator('input:not([type]):visible, input[type="text"]:visible, textarea:visible').filter({ hasNot: page.locator('[placeholder*="พิมพ์ชื่อ"]') });
await ein.last().fill('ข้อความบนหน้าทั้งหมดเป็นภาษาไทย');
await page.locator('button[type="submit"]').filter({ hasText: /^แก้$/ }).last().click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
const r2 = await reqs(), h2 = await histN();
note('#7 edit on screen', JSON.stringify(r2).includes('ข้อความบนหน้าทั้งหมดเป็นภาษาไทย') && h2 === h1 + 1, `history ${h1}→${h2}`);
// #8 reload keeps it
await page.reload({ waitUntil: 'networkidle' });
note('#8 after reload', (await page.textContent('body')).includes('ข้อความบนหน้าทั้งหมดเป็นภาษาไทย'), `count on API ${r2.length}`);
// #21 AC-10 overview with two requirements
await page.goto(`${WEB}/p/${aid}/overview`, { waitUntil: 'networkidle' });
const ov = await page.textContent('body');
const both = r2.every((p) => ov.includes(p.title) || ov.includes(p.body?.text));
note('#21 AC-10 overview "Requirements" lists both', /Requirements/i.test(ov) && both && r2.length === 2, `requirements ${JSON.stringify(r2.map((p) => p.title))}; section word on page ${/Requirements/i.test(ov)}`);
await shot('21-overview');
// #21b PDF
try {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), page.getByRole('button', { name: /ส่งออก PDF/ }).click()]);
  const pdf = 'export-overview.pdf'; await dl.saveAs(pdf);
  note('#21b PDF downloaded', fs.statSync(pdf).size > 1000, `${pdf} ${fs.statSync(pdf).size} bytes`);
} catch (e) { note('#21b PDF', false, `no download: ${String(e.message).slice(0, 200)}`); }
// remove one → #21c
await page.goto(`${WEB}/p/${aid}/requirements`, { waitUntil: 'networkidle' });
page.once('dialog', (d) => d.accept());
await page.getByRole('button', { name: /ลบ/ }).last().click(); await page.waitForTimeout(400);
const confirm = page.getByRole('button', { name: /^(ลบ|ยืนยัน|ตกลง)$/ });
if (await confirm.count() > 1) await confirm.last().click();
await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
const r3 = await reqs(), h3 = await histN();
note('#7 remove on screen', r3.length === r2.length - 1 && h3 === h2 + 1, `requirements ${r2.length}→${r3.length}; history ${h2}→${h3}`);
await page.goto(`${WEB}/p/${aid}/overview`, { waitUntil: 'networkidle' });
const ov2 = await page.textContent('body');
note('#21c overview after removal', r2.filter((p) => !r3.some((q) => q.key === p.key)).every((p) => !ov2.includes(p.title)) && r3.every((p) => ov2.includes(p.title)), `left ${JSON.stringify(r3.map((p) => p.title))}`);
// history page
await page.goto(`${WEB}/p/${aid}/history`, { waitUntil: 'networkidle' });
const hp = await page.textContent('body');
note('history page "ประวัติการแก้ทั้งหมด" with who', hp.includes('ประวัติการแก้ทั้งหมด') && hp.includes('โด่ง'), `has title ${hp.includes('ประวัติการแก้ทั้งหมด')}; mentions โด่ง ${(hp.match(/โด่ง/g) || []).length}×`);
await shot('history-page');
// #22b rename
await page.getByRole('button', { name: /เปลี่ยนชื่อ/ }).first().click(); await page.waitForTimeout(400);
const nameIn = page.getByPlaceholder('พิมพ์ชื่อคุณก่อน ระบบจะบันทึกว่าใครแก้');
await nameIn.fill('โด่ง2'); await nameIn.press('Enter'); await page.waitForLoadState('networkidle'); await page.waitForTimeout(600);
const btn2 = (await page.locator('button').allTextContents()).find((t) => t.includes('เปลี่ยนชื่อ'))?.replace(/\s+/g, ' ').trim();
await fetch(`${API}/v1/projects/${aid}`, { method: 'GET' });
await page.goto(`${WEB}/p/${aid}/requirements`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /เพิ่ม requirement/ }).first().click(); await page.waitForTimeout(300);
const in2 = page.locator('input:not([type]):visible, input[type="text"]:visible, textarea:visible').filter({ hasNot: page.locator('[placeholder*="พิมพ์ชื่อ"]') });
await in2.last().fill('เช็คตอนนี้ได้ทุกเมื่อ'); if (await in2.count() > 1) await in2.nth((await in2.count()) - 2).fill('ปุ่มเช็คตอนนี้');
await page.getByRole('button', { name: /^(บันทึก|เพิ่ม|ตกลง)$/ }).last().click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
const hh = (await (await fetch(`${API}/v1/projects/${aid}/history?limit=500`)).json()).entries;
note('#22b rename', btn2 === 'โด่ง2 · เปลี่ยนชื่อ' && hh[0].by === 'โด่ง2' && hh.slice(1).some((e) => e.by === 'โด่ง'), `button ${JSON.stringify(btn2)}; newest record by ${hh[0].by}; older records keep "โด่ง": ${hh.slice(1).filter((e) => e.by === 'โด่ง').length}`);
// #19 390 width
const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 });
for (const pg of ['ready', 'requirements', 'history']) {
  await m.goto(`${WEB}/p/${aid}/${pg}`, { waitUntil: 'networkidle' });
  const sw = await m.evaluate(() => document.documentElement.scrollWidth);
  note(`#19 390: ${pg}`, sw <= 390, `scrollWidth ${sw}`);
  await m.screenshot({ path: `19-390-${pg}.png`, fullPage: true });
}
await browser.close();
