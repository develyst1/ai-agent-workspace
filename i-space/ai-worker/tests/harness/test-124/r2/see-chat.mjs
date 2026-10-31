import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(process.argv[2] + '/package.json')('@playwright/test');
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(`http://127.0.0.1:3500/p/${pid}/chat`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
const t = await p.innerText('body'); console.log('buttons "ตกลง เริ่มงาน":', await p.getByRole('button', { name: /ตกลง เริ่มงาน/ }).count(), '· "แผนนี้ตกลงไปแล้ว":', (t.match(/แผนนี้ตกลงไปแล้ว/g) ?? []).length);
await p.screenshot({ path: 'out/r2-chat-after-accept.png', fullPage: true }); await b.close();
