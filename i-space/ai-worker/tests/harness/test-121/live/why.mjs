// REQ-108 phase 2: why is "ตกลง เริ่มงาน" disabled? Read the text the button points at, and screenshot. usage: bun why.mjs <front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const b = await chromium.launch({ channel: 'chrome' }); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(`http://127.0.0.1:3500/p/${pid}/chat`, { waitUntil: 'networkidle' });
const btn = p.getByRole('button', { name: /ตกลง เริ่มงาน/ }).first();
const desc = await btn.getAttribute('aria-describedby'); console.log('disabled', await btn.isDisabled(), 'describedby', desc);
if (desc) console.log('reason:', JSON.stringify(await p.locator(`[id="${desc}"]`).first().innerText().catch(() => '(not found)')));
await p.screenshot({ path: 'out/ac2-proposal-disabled.png', fullPage: true }); await b.close();
