// TEST-106: send one chat message as a user would (fill + Enter), wait for the round, save messages + screenshot.
// usage: bun send-msg.mjs <blueprint-front dir> <out dir> <tag> <message file>
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const [front, out, tag, file] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const BASE = 'http://127.0.0.1:3100', API = 'http://127.0.0.1:4200';
const id = fs.readFileSync(path.join(out, 'project-id.txt'), 'utf8').trim();
const text = fs.readFileSync(path.join(out, file), 'utf8').trim();
const msgs = async () => { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); return m.messages ?? m; };
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);
await page.goto(`${BASE}/p/${id}/chat`, { waitUntil: 'networkidle' });
const before = (await msgs()).length;
const box = page.locator('textarea').first();
await box.click(); await box.fill(text);
const t0 = Date.now();
await box.press('Enter');
let done = null;
for (let i = 0; i < 300 && !done; i++) {
  const arr = await msgs();
  const bot = arr.slice(before).find((m) => m.role !== 'user' && m.roundStatus !== 'pending' && m.roundStatus !== 'running');
  if (bot) done = bot; else await new Promise((r) => setTimeout(r, 1000));
}
console.log(done ? `${tag}: round done in ${Math.round((Date.now() - t0) / 1000)} s; status ${done.roundStatus}; model ${done.model}; changeSet ${done.changeSetId}\nbot: ${String(done.content).slice(0, 700)}` : `${tag}: not done in 300 s`);
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, `${tag}.png`), fullPage: true });
fs.writeFileSync(path.join(out, `messages-${tag}.json`), JSON.stringify(await msgs(), null, 2));
await browser.close();
