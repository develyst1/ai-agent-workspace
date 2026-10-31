// TEST-107 round 4 — REQ-110 AC-8 (the live accept reply with `type` for `op`, replayed through the real UI) and AC-9 (a first
// answer at 120 s is stored). Stub gateway-r4.mjs on :4398. Web :3141, API :4231. usage (from this folder): bun r4.mjs <front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3141', API = 'http://127.0.0.1:4231';
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const LIVE_MSG = 'ทำหน้า Health Board แสดงสถานะบริการ I-Space ให้หน่อย';
const URLS = ['http://127.0.0.1:4200/health', 'http://127.0.0.1:3100', 'http://127.0.0.1:4500/health', 'http://127.0.0.1:3500'];
const chats = () => fs.readFileSync('gateway-modes.log', 'utf8').split('\n').filter((l) => l.includes('POST /chat')).length;
const mode = (m) => fs.writeFileSync('mode.txt', m);
const msgs = async (id) => { const m = await (await fetch(`${API}/v1/projects/${id}/messages?limit=50`)).json(); return m.messages ?? m; };
const spec = async (id) => (await fetch(`${API}/v1/projects/${id}`)).json();
const bots = async (id) => (await msgs(id)).filter((m) => m.role === 'bot' && m.roundStatus);
const waitBot = async (id, n, secs) => { for (let i = 0; i < secs; i++) { const b = await bots(id); if (b.length >= n) return b; await new Promise((r) => setTimeout(r, 1000)); } return bots(id); };

const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const p = await ctx.newPage(); p.setDefaultTimeout(30000);

// AC-8 — rebuild the live state, then "ตามนั้น" on Q-001 in the page; the stub answers with the recorded live reply.
mode('live-r2');
const id = (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name: 'TEST-107 r4 AC-8 live accept', theme: 'clean-blue' }) })).json()).id;
await p.goto(`${WEB}/p/${id}/chat`, { waitUntil: 'networkidle' });
let box = p.locator('textarea').first(); await box.fill(LIVE_MSG); await box.press('Enter');
let bb = await waitBot(id, 1, 60);
const s1 = await spec(id);
note('AC-8 setup: the live round-2 state rebuilt (7 parts, all team-proposed as live, Q-001 open)', bb[0]?.roundStatus === 'applied' && s1.parts.length === 7 && s1.parts.every((x) => x.origin?.stamp === 'team-proposed'), `${bb[0]?.roundStatus}; ${JSON.stringify(s1.parts.map((x) => `${x.key}:${x.origin?.stamp}`))}; refused ${JSON.stringify(bb[0]?.roundRefused ?? null)}`);
await p.reload({ waitUntil: 'networkidle' });
mode('accept');
const c0 = chats();
const acceptBtn = p.getByRole('button', { name: /^ตามนั้น/ }).first();
note('AC-8 the page offers "ตามนั้น" for Q-001', (await acceptBtn.count()) > 0, JSON.stringify((await p.locator('button').allTextContents()).map((s) => s.trim()).filter((s) => /ตามนั้น/.test(s))));
await acceptBtn.click();
bb = await waitBot(id, 2, 90);
await p.reload({ waitUntil: 'networkidle' });
const row = bb[bb.length - 1];
const s2 = await spec(id);
const added = s2.parts.filter((x) => !s1.parts.some((y) => y.key === x.key));
note('AC-8 round applied, 1 call, nothing refused', row?.roundStatus === 'applied' && chats() - c0 === 1 && !(row?.roundRefused?.length), `${row?.roundStatus} / ${row?.roundReason ?? '-'}; calls ${chats() - c0}; refused ${JSON.stringify(row?.roundRefused ?? null)}`);
note('AC-8 the new parts stored (data + 3 decisions; the 2 new questions of the reply too)', added.filter((x) => x.kind !== 'question').length === 4 && added.filter((x) => x.kind === 'decision').length === 3 && added.some((x) => x.kind === 'data'), JSON.stringify(added.map((x) => `${x.key} ${x.title}`)));
const data = added.find((x) => x.kind === 'data');
note('AC-8 the data part holds all 4 URLs', URLS.every((u) => JSON.stringify(data?.body ?? {}).includes(u)), URLS.map((u) => `${u}:${JSON.stringify(data?.body ?? {}).includes(u)}`).join(' '));
const scr = s2.parts.find((x) => x.key === 'SCR-001');
note('AC-8 SCR-001 updated (fields now carry ms / status enum)', JSON.stringify(scr?.body).includes('responseMs'), JSON.stringify(scr?.body).slice(0, 160));
note('AC-8 Q-001 answered, no longer open', s2.parts.find((x) => x.key === 'Q-001')?.body?.status !== 'open', JSON.stringify(s2.parts.find((x) => x.key === 'Q-001')?.body?.status));
const newLinks = (s2.links?.length ?? 0) - (s1.links?.length ?? 0);
note('AC-8 the 4 links stored', newLinks >= 4, `links ${s1.links?.length} → ${s2.links?.length}`);
const adj = row?.roundAdjusted ?? [];
note('AC-8 the record names each `type`→`op` repair', adj.filter((a) => a.what === 'op_renamed').length === 9, JSON.stringify(adj.map((a) => a.what)));
const body = await p.textContent('body');
note('AC-8 no "nothing saved" claim on a stored round', !body.includes('รอบนี้ยังไม่ได้บันทึกอะไรเลย') && !body.includes('บอทตอบไม่ได้ตอนนี้'), JSON.stringify(body.match(/บันทึกคำตอบของ Q-001[^\n]{0,80}/)?.[0]));
fs.writeFileSync('ac8-bot-row.json', JSON.stringify(row, null, 1)); fs.writeFileSync('ac8-spec.json', JSON.stringify(s2, null, 1));
await p.screenshot({ path: 'ac8-accept.png', fullPage: true });

if (process.env.ONLY_AC8) { await b.close(); process.exit(0); }
// AC-9 — a first answer at 120 s is stored (API, the route the chat page posts to)
mode('slow120');
const id9 = (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name: 'TEST-107 r4 AC-9 slow 120', theme: 'clean-blue' }) })).json()).id;
const c9 = chats(), t0 = Date.now();
const r9 = await (await fetch(`${API}/v1/projects/${id9}/rounds`, { method: 'POST', headers: by, body: JSON.stringify({ message: 'ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย' }) })).json();
const secs = Math.round((Date.now() - t0) / 1000);
note('AC-9 a 120 s first answer is stored, not dropped', r9.status === 'applied' && (await spec(id9)).parts.length === 1 && chats() - c9 === 1 && secs >= 115, `${r9.status} / ${r9.reason ?? '-'} after ${secs} s; parts ${(await spec(id9)).parts.length}; calls ${chats() - c9}`);
fs.writeFileSync('ac9-slow120.json', JSON.stringify(r9, null, 1));
await b.close();
