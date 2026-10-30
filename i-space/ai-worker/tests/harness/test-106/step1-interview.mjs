// TEST-106 step 1: create the project in blueprint-front and send the REQ-108 spec as the first interview message (real gateway, owner 13:05).
// usage: bun step1-interview.mjs <blueprint-front dir> <out dir>
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const [front, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const BASE = 'http://127.0.0.1:3100';
const SPEC = [
  'ชื่อ: I-Space Health Board — หน้าเว็บเดียว ดูว่าบริการของ I-Space ตัวไหนเปิดอยู่',
  '1. แสดง 4 บริการ: Blueprint API (http://127.0.0.1:4200/health), Blueprint เว็บ (http://127.0.0.1:3100), CAW API (http://127.0.0.1:4500/health), CAW เว็บ (http://127.0.0.1:3500).',
  '2. แต่ละบริการแสดง: ชื่อ · สถานะ "ทำงาน" (เขียว) หรือ "ไม่ตอบ" (แดง) · เวลาตอบเป็น ms · เวลาที่เช็คล่าสุด.',
  '3. เช็คใหม่เองทุก 10 วินาที และมีปุ่ม "เช็คตอนนี้".',
  '4. ถ้าบริการไม่ตอบภายใน 3 วินาที ให้ถือว่า "ไม่ตอบ".',
  '5. รันในเครื่องที่ http://127.0.0.1:3900 ไม่ต้อง login ไม่ต้องมีฐานข้อมูล.',
  '6. ข้อความบนหน้าเป็นภาษาไทย.',
  'ไม่ทำ: login, การแจ้งเตือน, เก็บประวัติ, deploy.',
].join('\n');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /โปรเจกต์ใหม่|สร้างโปรเจกต์|เริ่มโปรเจกต์/ }).first().click();
await page.getByRole('dialog').getByRole('textbox').first().fill('I-Space Health Board');
await page.getByRole('dialog').getByRole('button', { name: /^สร้าง$/ }).last().click();
await page.waitForLoadState('networkidle');
const res = await fetch('http://127.0.0.1:4200/v1/projects'); const list = await res.json();
const p = list.find((x) => x.name === 'I-Space Health Board');
console.log('project', p?.id);
fs.writeFileSync(path.join(out, 'project-id.txt'), p.id);
await page.goto(`${BASE}/p/${p.id}/chat`, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, '1-chat-empty.png'), fullPage: true });
const box = page.locator('textarea').first();
await box.fill(SPEC);
const t0 = Date.now();
await box.press('Control+Enter').catch(() => {});
// fall back to a visible send button if Ctrl+Enter is not bound
await page.waitForTimeout(1500);
if ((await box.inputValue()).length > 0) await page.getByRole('button', { name: /ส่ง/ }).first().click();
// wait for the round to finish: the bot's reply appears (poll messages via API)
for (let i = 0; i < 180; i++) {
  const m = await (await fetch(`http://127.0.0.1:4200/v1/projects/${p.id}/messages?limit=50`)).json();
  const arr = m.messages ?? m;
  const last = arr[arr.length - 1];
  if (last && last.role !== 'user' && last.roundStatus !== 'pending') { console.log('round done in', Math.round((Date.now() - t0) / 1000), 's; status', last.roundStatus, 'model', last.model); break; }
  await new Promise((r) => setTimeout(r, 1000));
}
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, '1-chat-after-round1.png'), fullPage: true });
await browser.close();
