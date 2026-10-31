// TEST-106: ask 5 quiz questions on the ready screen (real gateway, REQ-108 permission), save the answers for QA to judge.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const API = 'http://127.0.0.1:4200';
const id = fs.readFileSync('project-id.txt', 'utf8').trim();
const QS = ['แสดงกี่บริการ อะไรบ้าง', 'เช็คใหม่ทุกกี่วินาที', 'ไม่ตอบภายในกี่วินาทีถือว่าไม่ตอบ', 'รันที่พอร์ตอะไร', 'อะไรบ้างที่ไม่ทำ'];
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(150000);
await page.goto(`http://127.0.0.1:3100/p/${id}/ready`, { waitUntil: 'networkidle' });
for (const q of QS) {
  const input = page.locator('input[type="text"], textarea').first();
  await input.fill(q);
  const t0 = Date.now();
  await page.getByRole('button', { name: /^ถาม$/ }).first().click();
  for (let i = 0; i < 150; i++) {
    const r = await fetch(`${API}/v1/projects/${id}/quizzes/latest`);
    const quiz = r.ok ? await r.json() : null;
    const it = quiz?.items?.find((x) => x.question === q);
    if (it && it.status !== 'pending') { console.log(`Q "${q}" → ${it.status} in ${Math.round((Date.now() - t0) / 1000)} s: ${String(it.answer).slice(0, 220)} | notInSpec=${it.notInSpec}`); break; }
    await new Promise((res) => setTimeout(res, 1000));
  }
  await page.reload({ waitUntil: 'networkidle' });
}
await page.screenshot({ path: '6-quiz-asked.png', fullPage: true });
fs.writeFileSync('quiz-after-ask.json', JSON.stringify(await (await fetch(`${API}/v1/projects/${id}/quizzes/latest`)).json(), null, 2));
await browser.close();
