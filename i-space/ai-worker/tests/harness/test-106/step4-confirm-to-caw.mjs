// TEST-106: mark the 5 quiz answers "ถูก" (all 5 matched the spec, judged by QA from quiz-after-ask.json), press
// "ยืนยัน 100%", then click "ส่งไปสร้างที่ CAW" and land on CAW's board (AC-2).
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const API = 'http://127.0.0.1:4200';
const id = fs.readFileSync('project-id.txt', 'utf8').trim();
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);
await page.goto(`http://127.0.0.1:3100/p/${id}/ready`, { waitUntil: 'networkidle' });
for (let i = 0; i < 5; i++) {
  await page.getByRole('button', { name: /^ถูก$/ }).first().click();
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(700);
}
const quiz = await (await fetch(`${API}/v1/projects/${id}/quizzes/latest`)).json();
console.log('quiz marked', quiz.marked, 'right', quiz.right);
await page.screenshot({ path: '7-quiz-marked.png', fullPage: true });
await page.getByRole('button', { name: /ยืนยัน 100%/ }).click();
await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500);
const versions = await (await fetch(`${API}/v1/projects/${id}/versions`)).json();
console.log('latest version', JSON.stringify(versions.latest), 'changedSinceLatest', versions.changedSinceLatest);
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: '8-confirmed.png', fullPage: true });
const build = page.locator('a[data-build]');
console.log('build href', await build.getAttribute('href'));
await build.click();
await page.waitForURL(/127\.0\.0\.1:3500\/p\/[0-9a-f-]+$/, { timeout: 60000 }).catch(() => {});
await page.waitForLoadState('networkidle');
console.log('landed', page.url());
await page.screenshot({ path: '9-caw-board.png', fullPage: true });
fs.writeFileSync('caw-project-url.txt', page.url());
await browser.close();
