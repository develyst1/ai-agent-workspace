// TEST-107 #1–#7 — the honest interview, through blueprint-front (:3141) on REQ-110's build, the mode stub gateway (:4398).
// usage: bun ui.mjs <blueprint-front dir> <mode file>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [front, modeFile] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const WEB = 'http://127.0.0.1:3141', API = 'http://127.0.0.1:4231';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const mode = (m) => fs.writeFileSync(modeFile, m);
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const MSG = 'ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย';
const gwLog = () => fs.readFileSync(path.join(path.dirname(modeFile), 'gateway-modes.log'), 'utf8').split('\n').filter((l) => l.includes('POST /chat'));
const msgs = async (id) => { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); return m.messages ?? m; };
const parts = async (id) => (await (await fetch(`${API}/v1/projects/${id}`)).json()).parts;
const p0 = await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name: 'TEST-107 honest', theme: 'clean-blue' }) })).json();
const id = p0.id;

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const page = await ctx.newPage(); page.setDefaultTimeout(30000);
const send = async (text, waitMs) => {
  await page.goto(`${WEB}/p/${id}/chat`, { waitUntil: 'networkidle' });
  const before = (await msgs(id)).length;
  const box = page.locator('textarea').first(); await box.click(); await box.fill(text);
  const t0 = Date.now(); await box.press('Enter');
  let bot = null;
  for (let i = 0; i < waitMs / 1000 && !bot; i++) { const a = (await msgs(id)).slice(before); bot = a.find((m) => m.role === 'bot' && m.roundStatus); if (!bot) await page.waitForTimeout(1000); }
  await page.reload({ waitUntil: 'networkidle' });
  return { bot, secs: Math.round((Date.now() - t0) / 1000) };
};

// #1 / #3 feature
mode('feature');
let n0 = gwLog().length;
let { bot } = await send(MSG, 60000);
const body1 = await page.textContent('body');
note('#1 stored row: changes_rejected, empty content, unknown_kind, note feature', bot?.roundStatus === 'changes_rejected' && bot?.content === '' && bot?.roundReason === 'unknown_kind' && bot?.roundNote === 'feature', JSON.stringify({ s: bot?.roundStatus, c: bot?.content, r: bot?.roundReason, n: bot?.roundNote }));
const sentence = body1.match(/รอบนี้ยังไม่ได้บันทึกอะไรเลย — [^\n]*?ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ/)?.[0];
note('#1 chat shows the "nothing saved" sentence, naming feature', !!sentence && sentence.includes('feature'), JSON.stringify(sentence));
note('#1 no "saved" claim anywhere on the page', !body1.includes('บันทึกให้แล้ว') && !body1.includes('แก้ไขให้ถูกต้องแล้ว'), '');
note('#3 rejected and named, nothing stored', (await parts(id)).length === 0, `parts ${(await parts(id)).length}; gateway calls this round ${gwLog().length - n0} (round + one correction)`);
await page.screenshot({ path: path.join(path.dirname(modeFile), '01-feature-rejected.png'), fullPage: true });

// #2 other themes
for (const theme of ['luxury-gold', 'minimal-mono']) {
  const tp = await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name: `TEST-107 ${theme}`, theme }) })).json();
  mode('feature');
  await page.goto(`${WEB}/p/${tp.id}/chat`, { waitUntil: 'networkidle' });
  const tb = page.locator('textarea').first(); await tb.click(); await tb.fill(MSG); await tb.press('Enter');
  for (let i = 0; i < 40; i++) { const a = await msgs(tp.id); if (a.some((m) => m.role === 'bot' && m.roundStatus)) break; await page.waitForTimeout(1000); }
  await page.reload({ waitUntil: 'networkidle' });
  const cur = (await (await fetch(`${API}/v1/projects/${tp.id}`)).json()).project.theme;
  const t = await page.textContent('body');
  note(`#2 theme ${cur}: sentence shown, no model text`, cur === theme && t.includes('รอบนี้ยังไม่ได้บันทึกอะไรเลย') && !t.includes('บันทึกให้แล้ว'), JSON.stringify(t.match(/รอบนี้ยังไม่ได้บันทึกอะไรเลย[^\n]{0,80}/)?.[0]));
  await page.screenshot({ path: path.join(path.dirname(modeFile), `02-${cur}.png`), fullPage: true });
}

// #4 timeout
mode('sleep');
n0 = gwLog().length;
const r4 = await send('ลองถามอีกเรื่องหนึ่งครับ', 230000); // round 4: the first-answer limit is 180 s (SPEC-105 E12)
const body4 = await page.textContent('body');
note('#4 stored row: bot_could_not_answer / timeout', r4.bot?.roundStatus === 'bot_could_not_answer' && r4.bot?.roundReason === 'timeout', `${JSON.stringify({ s: r4.bot?.roundStatus, r: r4.bot?.roundReason })} after ~${r4.secs} s`);
note('#4 exactly one gateway call (no retry on timeout)', gwLog().length - n0 === 1, `calls ${gwLog().length - n0}`);
note('#4 the timeout sentence shows', body4.includes('AI ตอบไม่ทันเวลา — ยังไม่ได้บันทึกอะไร ลองใหม่ หรือเปลี่ยนเป็นรุ่นที่เร็วกว่า'), '');
const buttons = (await page.locator('button').allTextContents()).map((s) => s.trim()).filter(Boolean);
note('#4 a retry control and a model control are there', buttons.some((b) => /ลองใหม่/.test(b)) && buttons.some((b) => /เปลี่ยนโมเดล|โมเดล/.test(b)), JSON.stringify(buttons.slice(0, 20)));
await page.screenshot({ path: path.join(path.dirname(modeFile), '04-timeout.png'), fullPage: true });

// #6 switch to a lower tier from there
const modelBtn = page.getByRole('button', { name: /เปลี่ยนโมเดล/ }).first();
if (await modelBtn.count()) {
  await modelBtn.click(); await page.waitForTimeout(800);
  console.log('after "เปลี่ยนโมเดล": focused =', await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 120)), '| url', page.url());
  let opt = page.getByRole('option', { name: 'เร็ว' }).first();
  if (!(await opt.count())) { await page.getByText('สมดุล', { exact: true }).first().click().catch(() => {}); await page.waitForTimeout(600); opt = page.getByRole('option', { name: 'เร็ว' }).first(); }
  if (await opt.count()) { await opt.click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500); }
}
const proj = (await (await fetch(`${API}/v1/projects/${id}`)).json()).project;
const lastAudit = (await (await fetch(`${API}/v1/projects/${id}/history?limit=5`)).json()).entries.find((e) => e.kind === 'settings');
note('#6 the model control leads to a lower tier, audited', proj.model === 'tier:small' && lastAudit?.by === 'โด่ง', `model ${proj.model}; settings record ${JSON.stringify(lastAudit?.after)} by ${lastAudit?.by}`);

// #5 retry with the model answering
mode('good');
await page.goto(`${WEB}/p/${id}/chat`, { waitUntil: 'networkidle' });
const retry = page.getByRole('button', { name: /ลองใหม่/ }).first();
const before5 = (await msgs(id)).length;
if (await retry.count()) { await retry.click(); }
let applied = null;
for (let i = 0; i < 30 && !applied; i++) { const a = (await msgs(id)).slice(before5 - 1); applied = a.find((m) => m.role === 'bot' && m.roundStatus === 'applied'); if (!applied) await page.waitForTimeout(1000); }
note('#5 retry → the round runs again and is applied', !!applied && (await parts(id)).some((p) => p.title === 'งานทดสอบ TEST-107'), `retry button ${await retry.count()}; applied ${!!applied}; parts ${(await parts(id)).length}`);

// #7 send → applied → undo
const r7 = await send(MSG, 60000);
const cs = r7.bot?.changeSetId;
const nParts = (await parts(id)).length;
const undoBtn = page.getByRole('button', { name: /ย้อนกลับ/ }).last();
const hasUndo = await undoBtn.count();
if (hasUndo) { await undoBtn.click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500); }
const after = (await parts(id)).length;
const hist = (await (await fetch(`${API}/v1/projects/${id}/history?limit=20`)).json()).entries;
note('#7 send → applied → "ย้อนกลับ" undoes it, audited', r7.bot?.roundStatus === 'applied' && !!cs && hasUndo > 0 && after === nParts - 1 && hist.some((e) => e.kind === 'undo' && e.by === 'โด่ง'), `status ${r7.bot?.roundStatus}; parts ${nParts}→${after}; undo record ${hist.some((e) => e.kind === 'undo')}`);
await page.screenshot({ path: path.join(path.dirname(modeFile), '07-after-undo.png'), fullPage: true });
await browser.close();
