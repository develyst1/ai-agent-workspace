// TEST-107 round 3 — SPEC-105 E8/E9 (the live model's shapes, replayed through the real UI) and E10 (an unreadable reply).
// Stub gateway-r3.mjs on :4398 (modes `replay`, `unreadable`). Through blueprint-front :3141; records via the API :4231.
// usage (from this folder): bun r3.mjs <blueprint-front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3141', API = 'http://127.0.0.1:4231';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const MSG = 'ทำหน้า Health Board แสดงสถานะบริการให้หน่อย';
const chats = () => fs.readFileSync('gateway-modes.log', 'utf8').split('\n').filter((l) => l.includes('POST /chat')).length;
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const p = await ctx.newPage(); p.setDefaultTimeout(30000);
const round = async (mode, theme) => {
  fs.writeFileSync('mode.txt', mode);
  const id = (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name: `TEST-107 r3 ${mode} ${theme}`, theme }) })).json()).id;
  await p.goto(`${WEB}/p/${id}/chat`, { waitUntil: 'networkidle' });
  const c0 = chats();
  const box = p.locator('textarea').first(); await box.fill(MSG); await box.press('Enter');
  let bot = null;
  for (let i = 0; i < 60 && !bot; i++) { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); bot = (m.messages ?? m).find((x) => x.role === 'bot' && x.roundStatus); if (!bot) await p.waitForTimeout(1000); }
  await p.reload({ waitUntil: 'networkidle' });
  const spec = await (await fetch(`${API}/v1/projects/${id}`)).json();
  return { id, bot, spec, calls: chats() - c0, body: await p.textContent('body') };
};

// E8 / E9 — replay, three themes
for (const theme of ['clean-blue', 'luxury-gold', 'minimal-mono']) {
  const r = await round('replay', theme);
  const kinds = r.spec.parts.map((x) => x.kind).sort();
  note(`E8 ${theme}: all 8 parts stored, nothing refused, 1 call`, r.bot?.roundStatus === 'applied' && r.spec.parts.length === 8 && !(r.bot?.roundRefused?.length) && r.calls === 1, `${r.bot?.roundStatus}; ${r.spec.parts.length} parts ${JSON.stringify(kinds)}; links ${r.spec.links?.length}; refused ${JSON.stringify(r.bot?.roundRefused ?? null)}; calls ${r.calls}`);
  const body = (k) => r.spec.parts.find((x) => x.kind === k)?.body;
  note(`E8 ${theme}: system body {} · decision cases wrapped, open dropped · screen lists dropped`, JSON.stringify(body('system')) === '{}' && Array.isArray(body('decision')?.cases) && !('open' in (body('decision') ?? {})) && !(typeof body('screen')?.fields === 'string'), JSON.stringify({ system: body('system'), decision: body('decision'), screen: body('screen') }));
  const adj = r.bot?.roundAdjusted ?? [];
  note(`E8 ${theme}: the record names every repair with title`, adj.filter((a) => a.what === 'ref_renamed').length === 3 && adj.some((a) => a.what === 'body_defaulted' && a.title === 'ตัวตรวจสถานะ QA') && adj.some((a) => a.what === 'wrapped_in_list' && a.field === 'cases') && adj.every((a) => a.title), JSON.stringify(adj.map((a) => [a.what, a.title, a.field ?? a.to ?? ''])));
  const lines = ['fields', 'actions', 'states'].map((f) => `หน้าแดชบอร์ด QA — บันทึกแล้ว แต่ตัดช่อง ${f} ออก`).concat('เกณฑ์สถานะ QA — บันทึกแล้ว แต่ตัดช่อง open ออก');
  const missing = lines.filter((l) => !r.body.includes(l));
  note(`E9 ${theme}: one "saved, but field X left out" line per dropped field (Q5 wording)`, missing.length === 0, missing.length ? `missing ${JSON.stringify(missing)}` : '4 lines shown');
  note(`E9 ${theme}: no "not saved" claim for a saved round`, !r.body.includes('ยังไม่ได้บันทึก') && !r.body.includes('รอบนี้ยังไม่ได้บันทึกอะไรเลย'), '');
  fs.writeFileSync(`e8-${theme}-bot-row.json`, JSON.stringify(r.bot, null, 1));
  await p.screenshot({ path: `e9-replay-${theme}.png`, fullPage: true });
}

// E10 — unreadable twice
const u = await round('unreadable', 'clean-blue');
note('E10 stored row: bot_could_not_answer / protocol, raw kept, content empty', u.bot?.roundStatus === 'bot_could_not_answer' && u.bot?.roundReason === 'protocol' && (u.bot?.roundRaw ?? '').startsWith('QA-UNREADABLE') && u.bot?.content === '', JSON.stringify({ s: u.bot?.roundStatus, r: u.bot?.roundReason, n: u.bot?.roundNote, raw: u.bot?.roundRaw, c: u.bot?.content, calls: u.calls }));
note('E10 nothing stored, no saved claim, raw text not shown to the user', u.spec.parts.length === 0 && !u.body.includes('บันทึกให้แล้ว') && !u.body.includes('QA-UNREADABLE'), `parts ${u.spec.parts.length}`);
console.log('E10 chat text near the bot row:', JSON.stringify(u.body.match(/(AI|รอบนี้)[^\n]{0,140}/g)?.slice(0, 3)));
fs.writeFileSync('e10-bot-row.json', JSON.stringify(u.bot, null, 1));
await p.screenshot({ path: 'e10-unreadable.png', fullPage: true });
await b.close();
