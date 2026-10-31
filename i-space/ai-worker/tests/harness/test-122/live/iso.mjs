// TEST-122 AC-6, run 2 of 2 (live) — ISOLATES the defect of run 1: with the restart rule's token limit out of the way (runner started with
// RUNNER_WORKER_MAX_TOKENS=5000000), does ONE real Claude session serve two tasks in a row? A new CAW project on the same Blueprint spec; one
// worker (แบงค์, sonnet); two tiny cards; budget 2. Evidence: the hops' session ids (traces), the runner's "starting a new process" lines, ps.
// usage (from this folder): bun iso.mjs <caw-front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front] = process.argv.slice(2);
const API = 'http://127.0.0.1:4500', WEB = 'http://127.0.0.1:3500', H = { 'x-caw-actor': 'operator' };
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out2/live.log', l + '\n'); };
const call = async (m, p, b) => { const r = await fetch(API + p, { method: m, headers: { ...H, ...(b ? { 'content-type': 'application/json' } : {}) }, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); try { return { s: r.status, j: JSON.parse(t) } } catch { return { s: r.status, j: t } } };
// one CAW project per Blueprint project — so run 2 gets its own Blueprint project with the same 8 requirement texts (change-set API: a diagnostic run, not AC-6's by-hand path)
const BY = { 'content-type': 'application/json', 'x-blueprint-by': encodeURIComponent('โด่ง') };
const lines = fs.readFileSync('../../test-106/spec.txt', 'utf8').trim().split('\n');
const titles = ['สิ่งที่สร้าง: I-Space Health Board', '1. บริการ 4 ตัวที่แสดง', '2. สิ่งที่แสดงต่อบริการ', '3. เช็คใหม่ทุก 10 วินาที + ปุ่มเช็คตอนนี้', '4. ไม่ตอบใน 3 วินาที = ไม่ตอบ', '5. รันที่ :3900 ไม่ต้อง login ไม่มีฐานข้อมูล', '6. ข้อความภาษาไทย', 'ไม่ทำ'];
const bp = (await (await fetch('http://127.0.0.1:4200/v1/projects', { method: 'POST', headers: BY, body: JSON.stringify({ name: 'REQ-122 run 2 (isolation)', theme: 'clean-blue' }) })).json()).id;
await fetch(`http://127.0.0.1:4200/v1/projects/${bp}/change-sets`, { method: 'POST', headers: BY, body: JSON.stringify({ cause: { kind: 'operator' }, changes: titles.map((title, i) => ({ op: 'part.add', ref: `$r${i}`, kind: 'requirement', title, body: { text: lines[i] }, origin: { stamp: 'operator', date: '2026-10-30', note: 'TEST-122 run 2' } })) }) });
const pid = (await call('POST', '/v1/projects', { blueprintProjectId: bp })).j.id; fs.writeFileSync('out2/caw-project-id.txt', pid); log(`run 2: new CAW project ${pid} on the same Blueprint spec`);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage(); p.setDefaultTimeout(30000);
await p.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' }); await p.getByText('ใช้ทีมเริ่มต้น').first().click(); await p.waitForTimeout(2500);
const dir = '/workspace/caw-workspaces/health-board-122-iso'; fs.mkdirSync(dir, { recursive: true }); await p.reload({ waitUntil: 'networkidle' });
await p.locator('input[placeholder*="path"]').first().fill(dir); await p.getByText('เพิ่มโฟลเดอร์').first().click(); await p.waitForTimeout(1500); await b.close();
const be = (await call('GET', `/v1/projects/${pid}/chain`)).j.members.find((m) => m.roles.includes('BE')).id;
const mk = async (title, todo) => (await call('POST', `/v1/projects/${pid}/cards`, { title, todo, anchor: { key: 'REQ-006' }, assigneeId: be })).j;
const c1 = await mk('สร้างไฟล์ notes/a.txt', 'สร้างไฟล์ notes/a.txt ที่มีข้อความ A บรรทัดเดียว แล้วเปลี่ยนการ์ดเป็น done — งานเล็ก ทำแค่นี้');
const c2 = await mk('สร้างไฟล์ notes/b.txt', 'สร้างไฟล์ notes/b.txt ที่มีข้อความ B บรรทัดเดียว แล้วเปลี่ยนการ์ดเป็น done — งานเล็ก ทำแค่นี้');
log(`cards #${c1.number} #${c2.number} for แบงค์ (one worker, so its two tasks must come one after the other)`);
log(`mode: ${(await call('PATCH', `/v1/projects/${pid}/mode`, { mode: 'dispatcher', hopBudget: 2 })).s}`); // what the อัตโนมัติ dialog does first
const r = await call('POST', `/v1/projects/${pid}/runs`, { hopBudget: 2 }); log(`run started: ${r.s}`);
for (let i = 0; i < 300; i++) { const runs = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs; if (runs[0]?.endedAt) { log(`run ended: ${runs[0].stopReason} · ${(runs[0].report ?? '').split('\n').filter((l) => /ก้าว|เหตุ/.test(l)).join(' · ')}`); break; } await new Promise((res) => setTimeout(res, 2000)); }
const hops = (await call('GET', `/v1/projects/${pid}/hops`)).j.hops.filter((h) => h.cardId).reverse();
fs.writeFileSync('out2/hops.json', JSON.stringify(hops, null, 1));
log(`hops: ${hops.map((h) => `#${h.cardId === c1.id ? 1 : 2} ${h.startedAt.slice(11, 19)}–${(h.endedAt ?? '').slice(11, 19)} ${h.outcome}`).join(' · ')}`);
log(`cards: ${(await call('GET', `/v1/projects/${pid}/cards`)).j.cards.map((c) => `#${c.number} ${c.status}`).join(' · ')} · files: ${fs.readdirSync(dir, { recursive: true }).join(', ')}`);
