// TEST-106: in CAW's chat screen, ask the entry worker (real Claude CLI) to break the confirmed spec into cards; wait for its reply/proposal.
import { createRequire } from 'node:module';
import path from 'node:path';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const P = '458a8293-6e60-4e88-9991-d9e90a857b43', API = 'http://127.0.0.1:4500', H = { 'X-CAW-Actor': 'operator' };
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);
await page.goto(`http://127.0.0.1:3500/p/${P}/chat`, { waitUntil: 'networkidle' });
await page.screenshot({ path: '11-caw-chat-empty.png', fullPage: true });
const box = page.locator('textarea').first();
await box.fill('ช่วยแตกงานจาก spec เวอร์ชัน 1 ของ I-Space Health Board เป็นการ์ดให้ทีมทำ (ฟ้า FE สร้างหน้าเว็บ, ดิน QA ตรวจ) แล้วเสนอมาให้ผมตกลงครับ');
await page.getByRole('button', { name: /^ส่ง/ }).first().click();
const t0 = Date.now();
for (let i = 0; i < 600; i++) {
  const props = await (await fetch(`${API}/v1/projects/${P}/proposals`, { headers: H })).json();
  const chat = await (await fetch(`${API}/v1/projects/${P}/chat`, { headers: H })).json();
  const msgs = chat.messages ?? chat;
  const n = (props.proposals ?? props).length;
  if (i % 30 === 0) console.log(`t=${Math.round((Date.now() - t0) / 1000)}s chat=${msgs.length} proposals=${n}`);
  if (n > 0 || msgs.some((m) => m.from !== 'operator' && m.author !== 'operator' && m.role !== 'operator' && m.workerId)) break;
  await new Promise((r) => setTimeout(r, 2000));
}
console.log('waited', Math.round((Date.now() - t0) / 1000), 's');
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: '12-caw-chat-after.png', fullPage: true });
await browser.close();
