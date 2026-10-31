// REQ-108 phase 2 AC-1: a label through the ready page's "ใส่ป้าย version". usage: bun label.mjs <front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const id = fs.readFileSync('out/bp-project-id.txt', 'utf8').trim();
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: 'http://127.0.0.1:3100' }]);
const p = await ctx.newPage(); await p.goto(`http://127.0.0.1:3100/p/${id}/ready`, { waitUntil: 'networkidle' });
await p.getByText('ใส่ป้าย version').first().click(); await p.waitForTimeout(600);
await p.screenshot({ path: 'out/ac1-label-form.png', fullPage: true });
const inp = p.locator('input').last(); await inp.fill('v1');
const btns = (await p.locator('button').allTextContents()).map((s) => s.trim()).filter(Boolean); console.log('buttons after open', JSON.stringify(btns));
const ok = p.getByRole('button', { name: /^(ใส่ป้าย|บันทึก|ตกลง|ยืนยัน)$/ }).last(); if (await ok.count()) await ok.click(); else await inp.press('Enter');
await p.waitForTimeout(1500);
const labels = await (await fetch(`http://127.0.0.1:4200/v1/projects/${id}/labels`)).json(); console.log('labels', JSON.stringify(labels));
fs.appendFileSync('out/live.log', `${new Date().toISOString()} AC-1 label via the ready page: ${JSON.stringify(labels.labels?.map((l) => `${l.version}:${l.label} by ${l.by}`))}\n`);
await p.reload({ waitUntil: 'networkidle' }); await p.screenshot({ path: 'out/ac1-ready-labelled.png', fullPage: true });
for (const pg of ['', '/overview']) { await p.goto(`http://127.0.0.1:3100/p/${id}${pg}`, { waitUntil: 'networkidle' }); await p.screenshot({ path: `out/ac1-page${pg.replace('/', '-') || '-home'}.png`, fullPage: true }); }
await b.close();
