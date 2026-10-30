// TEST-106 step 1b: send the REQ-108 spec into the existing project's chat (real gateway), wait for the round, screenshot.
// usage: bun step1b-send.mjs <blueprint-front dir> <out dir>
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const [front, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const BASE = 'http://127.0.0.1:3100', API = 'http://127.0.0.1:4200';
const id = fs.readFileSync(path.join(out, 'project-id.txt'), 'utf8').trim();
const SPEC = fs.readFileSync(path.join(out, 'spec.txt'), 'utf8').trim();
const msgs = async () => { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); return m.messages ?? m; };
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);
await page.goto(`${BASE}/p/${id}/chat`, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, '1-chat-empty.png'), fullPage: true });
const before = (await msgs()).length;
const box = page.locator('textarea').first();
await box.fill(SPEC);
const send = page.getByRole('button', { name: /^ส่ง/ }).first();
const t0 = Date.now();
await send.click();
let done = null;
for (let i = 0; i < 240 && !done; i++) {
  const arr = await msgs();
  const bot = arr.slice(before).find((m) => m.role !== 'user' && m.roundStatus !== 'pending' && m.roundStatus !== 'running');
  if (bot) done = bot;
  else await new Promise((r) => setTimeout(r, 1000));
}
console.log(done ? `round done in ${Math.round((Date.now() - t0) / 1000)} s; status ${done.roundStatus}; model ${done.model}; changeSet ${done.changeSetId}` : 'round not done in 240 s');
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, '1-chat-after-round1.png'), fullPage: true });
fs.writeFileSync(path.join(out, 'messages-after-round1.json'), JSON.stringify(await msgs(), null, 2));
await browser.close();
