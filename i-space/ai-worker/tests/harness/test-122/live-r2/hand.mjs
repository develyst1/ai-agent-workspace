// REQ-108 PHASE 2 AC-1 — the Health Board spec entered BY HAND on Blueprint's requirements page (REQ-103), one requirement per point of
// tests/harness/test-106/spec.txt (verbatim), then a label. No gateway. usage (from this folder): bun hand.mjs <blueprint-front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3100', API = 'http://127.0.0.1:4200';
const id = fs.readFileSync('out/bp-project-id.txt', 'utf8').trim();
const lines = fs.readFileSync('../../test-106/spec.txt', 'utf8').trim().split('\n');
const items = [
  ['สิ่งที่สร้าง: I-Space Health Board', lines[0]],
  ['1. บริการ 4 ตัวที่แสดง', lines[1]], ['2. สิ่งที่แสดงต่อบริการ', lines[2]], ['3. เช็คใหม่ทุก 10 วินาที + ปุ่มเช็คตอนนี้', lines[3]],
  ['4. ไม่ตอบใน 3 วินาที = ไม่ตอบ', lines[4]], ['5. รันที่ :3900 ไม่ต้อง login ไม่มีฐานข้อมูล', lines[5]], ['6. ข้อความภาษาไทย', lines[6]],
  ['ไม่ทำ', lines[7]],
];
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const p = await ctx.newPage(); p.setDefaultTimeout(30000);
for (const [title, text] of items) {
  await p.goto(`${WEB}/p/${id}/requirements`, { waitUntil: 'networkidle' });
  await p.getByText('เพิ่ม requirement').first().click(); await p.waitForTimeout(400);
  await p.locator('input').first().fill(title); await p.locator('textarea').first().fill(text);
  await p.getByRole('button', { name: 'เพิ่ม', exact: true }).click(); await p.waitForTimeout(1200);
}
const spec = await (await fetch(`${API}/v1/projects/${id}`)).json();
const reqs = spec.parts.filter((x) => x.kind === 'requirement');
log(`AC-1 requirements entered by hand: ${reqs.length} — ${JSON.stringify(reqs.map((r) => `${r.key} ${r.title}`))}`);
await p.goto(`${WEB}/p/${id}/requirements`, { waitUntil: 'networkidle' }); await p.screenshot({ path: 'out/ac1-requirements.png', fullPage: true });
const page = await p.innerText('body');
const pts = [['4 บริการ', '4200/health'], ['ทำงาน', 'ms'], ['10 วินาที', 'เช็คตอนนี้'], ['3 วินาที'], ['3900', 'login'], ['ภาษาไทย'], ['ไม่ทำ', 'deploy']];
log(`AC-1 the requirements page shows each point: ${JSON.stringify(pts.map((ws) => ws.every((w) => page.includes(w))))}`);
// a label: the ready page ("พร้อมสร้างหรือยัง") — whatever control the page gives for it
await p.goto(`${WEB}/p/${id}/ready`, { waitUntil: 'networkidle' });
const btns = (await p.locator('button').allTextContents()).map((s) => s.trim()).filter(Boolean);
log(`ready page buttons: ${JSON.stringify(btns)}`);
await p.screenshot({ path: 'out/ac1-ready.png', fullPage: true });
await b.close();
