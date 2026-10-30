// TEST-111 round 2 (REQ-114 E14, SPEC-111 § Round 2) — AC-4 through the real chat page (QA's rebuilds of TEST-111's live rounds), then E14's
// edges through the API the page posts to. Web :3141, API :4231, stub gateway-r2.mjs :4398. usage (from this folder): bun r2.mjs <front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3141', API = 'http://127.0.0.1:4231';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const info = (s) => console.log(`    ${s}`);
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const SPEC = fs.readFileSync('../test-106/spec.txt', 'utf8').trim();
const URLS = ['http://127.0.0.1:4200/health', 'http://127.0.0.1:3100', 'http://127.0.0.1:4500/health', 'http://127.0.0.1:3500'];
const KEPT = (u, k) => `${u} — Blueprint เก็บไว้ใน ${k} ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)`;
const chats = () => fs.readFileSync('gateway-modes.log', 'utf8').split('\n').filter((l) => l.includes('POST /chat')).length;
const mode = (m) => fs.writeFileSync('mode.txt', m);
const spec = async (id) => (await fetch(`${API}/v1/projects/${id}`)).json();
const lastBot = async (id, n) => { for (let i = 0; i < 60; i++) { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); const b = (m.messages ?? m).filter((x) => x.role === 'bot' && x.roundStatus); if (b.length >= n) return b[b.length - 1]; await new Promise((r) => setTimeout(r, 1000)); } return null; };
const project = async (name) => (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name, theme: 'clean-blue' }) })).json()).id;
const round = async (id, body) => (await fetch(`${API}/v1/projects/${id}/rounds`, { method: 'POST', headers: by, body: JSON.stringify(body) })).json();
const apis = (s) => s.parts.filter((p) => p.kind === 'api');
const holders = (s, u) => s.parts.filter((p) => p.kind !== 'question' && JSON.stringify(p).includes(u)).map((p) => p.key);

const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const p = await ctx.newPage(); p.setDefaultTimeout(30000);

// ---------------- AC-4 ----------------
mode('live111r1');
const id = await project('TEST-111 r2 AC-4 replay');
await p.goto(`${WEB}/p/${id}/chat`, { waitUntil: 'networkidle' });
let c0 = chats();
const box = p.locator('textarea').first(); await box.fill(SPEC); await box.press('Enter');
const r1 = await lastBot(id, 1); await p.reload({ waitUntil: 'networkidle' });
const s1 = await spec(id);
note('AC-4 round 1 (the live answer, rebuilt: no api part) → applied, 1 call, nothing refused', r1?.roundStatus === 'applied' && chats() - c0 === 1 && !(r1?.roundRefused?.length), `${r1?.roundStatus}; calls ${chats() - c0}; refused ${JSON.stringify(r1?.roundRefused ?? null)}`);
note('AC-4 all 4 addresses are now in stored non-question parts', URLS.every((u) => holders(s1, u).length > 0), URLS.map((u) => `${u.replace('http://127.0.0.1', '')}→${holders(s1, u).join(',') || '—'}`).join(' '));
note('AC-4 Blueprint kept them as GET api parts', URLS.every((u) => apis(s1).some((a) => a.body.method === 'GET' && a.body.path === u)), JSON.stringify(apis(s1).map((a) => `${a.key} ${a.body.method} ${a.body.path} [${a.origin?.stamp}]`)));
note('AC-4 :3900 (held by WRK-001) is not duplicated', !apis(s1).some((a) => a.body.path.includes(':3900')), `holders of :3900 ${JSON.stringify(holders(s1, ':3900'))}`);
const kept = (r1?.roundAdjusted ?? []).filter((a) => a.what === 'url_kept');
note('AC-4 the record names each kept address with its key', kept.length === 4 && kept.every((a) => a.key && a.title), JSON.stringify(kept.map((a) => `${a.key}:${a.title}`)));
const more = p.getByText('ดูรายละเอียด').first(); if (await more.count()) { await more.click(); await p.waitForTimeout(500); } // the bubble's existing collapse (TEST-107 Q7, accepted)
const body1 = await p.innerText('body');
const lines = URLS.map((u) => { const k = apis(s1).find((a) => a.body.path === u)?.key; return [KEPT(u, k), body1.includes(KEPT(u, k))]; });
note('AC-4 the chat names each one (PM\'s line)', lines.every(([, ok]) => ok), JSON.stringify(lines.filter(([, ok]) => !ok).map(([l]) => l)));
note('AC-4 the bot does not claim "nothing saved"', !body1.includes('รอบนี้ยังไม่ได้บันทึกอะไรเลย'), '');
await p.screenshot({ path: 'ac4-round1.png', fullPage: true });
// round 2: "ตามนั้นทั้ง n ข้อ" in the page
mode('live111r2');
c0 = chats();
const all = p.getByRole('button', { name: /^ตามนั้นทั้ง/ }).first();
const one = p.getByRole('button', { name: /^ตามนั้น$/ }).first();
info(`accept buttons: all ${await all.count()} · one ${await one.count()}`);
await ((await all.count()) ? all : one).click();
const r2 = await lastBot(id, 2); await p.reload({ waitUntil: 'networkidle' });
const s2 = await spec(id);
note('AC-4 round 2 ("ตามนั้น") → applied, adds no api part again', r2?.roundStatus === 'applied' && apis(s2).length === apis(s1).length && !(r2?.roundAdjusted ?? []).some((a) => a.what === 'url_kept'), `${r2?.roundStatus}; api parts ${apis(s1).length}→${apis(s2).length}; calls ${chats() - c0}`);
note('AC-4 after the 2 rounds: the 4 addresses still stored', URLS.every((u) => holders(s2, u).length > 0), '');
fs.writeFileSync('ac4-spec.json', JSON.stringify(s2, null, 1)); fs.writeFileSync('ac4-r1-row.json', JSON.stringify(r1, null, 1));
await p.screenshot({ path: 'ac4-round2.png', fullPage: true });

// ---------------- E14 edges (API) ----------------
mode('none');
let e = await project('TEST-111 r2 edges');
let r = await round(e, { message: 'ตรวจ (http://127.0.0.1:4200/health), http://127.0.0.1:3100. และ http://127.0.0.1:3100 อีกที' });
let s = await spec(e);
note('edge: brackets, trailing "." and "," stripped; a URL twice → one part', JSON.stringify(apis(s).map((a) => a.body.path).sort()) === JSON.stringify(['http://127.0.0.1:3100', 'http://127.0.0.1:4200/health']), JSON.stringify(apis(s).map((a) => a.body.path)));
r = await round(e, { message: 'ย้ำอีกครั้ง http://127.0.0.1:3100 นะครับ' });
note('edge: an address an earlier round already stored is not stored again', apis(await spec(e)).length === 2, `${apis(await spec(e)).length} api parts; adjusted ${JSON.stringify(r.adjusted)}`);
e = await project('TEST-111 r2 thai-glued');
r = await round(e, { message: 'ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที' });
s = await spec(e);
note('edge: Thai written right after the URL (no space, usual in Thai)', apis(s).some((a) => a.body.path === 'http://127.0.0.1:4500/health'), `stored ${JSON.stringify(apis(s).map((a) => a.body.path))}`);
e = await project('TEST-111 r2 thai-before');
r = await round(e, { message: 'ช่วยตรวจที่ http://127.0.0.1:4500/health ทุก 10 วินาที' });
note('edge: the same with spaces → the exact address', apis(await spec(e)).some((a) => a.body.path === 'http://127.0.0.1:4500/health'), JSON.stringify(apis(await spec(e)).map((a) => a.body.path)));
mode('holds31000');
e = await project('TEST-111 r2 prefix');
r = await round(e, { message: 'ตรวจ http://127.0.0.1:3100 ด้วยครับ' });
s = await spec(e);
note('edge: a part holding :31000 does not count as holding :3100', apis(s).some((a) => a.body.path === 'http://127.0.0.1:3100'), `parts ${JSON.stringify(s.parts.map((x) => `${x.key} ${x.title}`))}`);
mode('none');
e = await project('TEST-111 r2 ftp');
r = await round(e, { message: 'ไฟล์อยู่ที่ ftp://127.0.0.1/x และ https://example.test/api?q=1' });
note('edge: ftp not caught; an https URL with a query kept whole', JSON.stringify(apis(await spec(e)).map((a) => a.body.path)) === '["https://example.test/api?q=1"]', JSON.stringify(apis(await spec(e)).map((a) => a.body.path)));
mode('live111r1-no3900');
e = await project('TEST-111 r2 no-3900');
r = await round(e, { message: SPEC });
s = await spec(e);
info(`when no part holds :3900 (the app's own address): ${JSON.stringify(apis(s).filter((a) => a.body.path.includes('3900')).map((a) => `${a.key} ${a.body.method} ${a.body.path}`))}`);
await b.close();
