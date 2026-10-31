// TEST-122 (REQ-124): a new Blueprint project through the HOME SCREEN — "+ โปรเจกต์ใหม่", a name, the first theme, "สร้าง". usage: bun create.mjs <front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(process.argv[2] + '/package.json')('@playwright/test');
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const b = await chromium.launch({ channel: 'chrome' }); const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
await c.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: 'http://127.0.0.1:3100' }]);
const p = await c.newPage(); p.setDefaultTimeout(30000);
await p.goto('http://127.0.0.1:3100/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: '+ โปรเจกต์ใหม่' }).click(); await p.waitForTimeout(500);
const dlg = p.getByRole('dialog').first();
await dlg.locator('input:not([type])').first().fill('สมุดรายจ่ายประจำวัน');
const radios = dlg.locator('input[type="radio"]'); log(`new-project dialog: ${await radios.count()} theme choices`); await radios.first().check();
await p.screenshot({ path: 'out/create-dialog.png' });
await Promise.all([p.waitForURL(/\/p\/[0-9a-f-]{36}/, { timeout: 30000 }), dlg.getByRole('button', { name: 'สร้าง' }).click()]);
const id = /\/p\/([0-9a-f-]{36})/.exec(p.url())[1]; fs.writeFileSync('out/bp-project-id.txt', id);
log(`Blueprint project "สมุดรายจ่ายประจำวัน" created through the home screen: ${id} · now at ${p.url().replace(/^https?:\/\/[^/]+/, '')}`);
await p.screenshot({ path: 'out/created.png', fullPage: true }); await b.close();
