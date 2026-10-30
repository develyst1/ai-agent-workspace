// TEST-107 round 2 — AC-6 (5 changes, 1 invalid → 4 stored, the 1 named with its reason) and AC-7 (the stored round says which and why).
// Mode stub `partial` (work, role, screen, system valid + `feature` invalid). Through blueprint-front :3141; record via the API.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3141', API = 'http://127.0.0.1:4231';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const MSG = 'ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย';
const chats = () => fs.readFileSync('gateway-modes.log', 'utf8').split('\n').filter((l) => l.includes('POST /chat')).length;
fs.writeFileSync('mode.txt', 'partial');
const id = (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name: 'TEST-107 r2 partial', theme: 'clean-blue' }) })).json()).id;
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const p = await ctx.newPage(); p.setDefaultTimeout(30000);
await p.goto(`${WEB}/p/${id}/chat`, { waitUntil: 'networkidle' });
const c0 = chats();
const box = p.locator('textarea').first(); await box.fill(MSG); await box.press('Enter');
let bot = null;
for (let i = 0; i < 40 && !bot; i++) { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); bot = (m.messages ?? m).find((x) => x.role === 'bot' && x.roundStatus); if (!bot) await p.waitForTimeout(1000); }
await p.reload({ waitUntil: 'networkidle' });
const parts = (await (await fetch(`${API}/v1/projects/${id}`)).json()).parts;
const titles = parts.map((x) => `${x.kind}:${x.title}`);
note('AC-6 the 4 valid changes are stored', parts.length === 4 && ['work', 'role', 'screen', 'system'].every((k) => parts.some((x) => x.kind === k)) && !parts.some((x) => x.kind === 'feature'), `${parts.length} parts: ${JSON.stringify(titles)}; round ${bot?.roundStatus}; gateway calls ${chats() - c0}`);
const body = await p.textContent('body');
const line = body.match(/บันทึกแล้ว 4 รายการ — ยังไม่ได้บันทึก 1 รายการ:[^]{0,160}/)?.[0];
note('AC-6 the chat says 4 saved, 1 not, and names it with its reason', !!line && line.includes('feature'), JSON.stringify(line));
note('AC-6 no blanket "saved" claim from the model', !body.includes('บันทึกให้แล้วครับ'), '');
await p.screenshot({ path: 'ac6-partial.png', fullPage: true });
fs.writeFileSync('ac7-bot-row.json', JSON.stringify(bot, null, 2));
const ref = bot?.roundRefused ?? [];
note('AC-7 the stored round record says which change and why', bot?.roundSaved === 4 && ref.length === 1 && ref[0].reason === 'unknown_kind' && JSON.stringify(ref[0]).includes('feature'), `roundSaved ${bot?.roundSaved}; roundRefused ${JSON.stringify(ref).slice(0, 300)}`);
note('AC-7 no key or secret in the record', !/sk-|api[_-]?key|authorization/i.test(JSON.stringify(bot)), '');
await b.close();
