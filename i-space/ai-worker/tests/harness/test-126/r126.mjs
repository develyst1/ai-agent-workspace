// TEST-124 (REQ-126) — r125.mjs (S1–S17 = REQ-117…122, 125 regression) + S18 (AC-1…3, the chat on screen) and S19 (AC-4, worker temp folders). From TEST-123's — r122.mjs's S1–S15 (REQ-117/119/120/121/122 regression) + S16, S17 (REQ-125 AC-1…3). From TEST-121's — r121.mjs's S1–S9 (REQ-117/119/120/121 regression) + S10–S14 (REQ-122 AC-1…5) with an OPEN-worker stub.
// env: ONLY=S10,S11 runs just those · QA_RUNNER_ENV='{"RUNNER_WORKER_MAX_TASKS":"2"}' goes to the runner. From TEST-119's r121.mjs — (S1–S8 = REQ-119/120/117 regression) + S9 (AC-1, AC-2). From TEST-118's r120.mjs, itself r119.mjs (REQ-119's S1–S7, kept as the regression) + S8: a second "อัตโนมัติ" with the same number takes its own steps.
// Real caw-back API + runner (TASK-152 tree) + caw-front, QA's stub CLI. From TEST-119's r119.mjs.
// Blueprint = a blueprint-back export, only to give CAW a project. A fresh CAW_WORKSPACE_ROOT with the guard hooks linked.
// usage (from this folder): bun r119.mjs <export root> <guard-hooks workspace> <refusing gateway url>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const [X, HOOKS_WS, REFUSE] = process.argv.slice(2);
const OUT = path.resolve('out'); fs.mkdirSync(OUT, { recursive: true });
const BPP = 4292, CAWP = 4541, WEBP = 3541, BP = `http://127.0.0.1:${BPP}`, API = `http://127.0.0.1:${CAWP}`, WEB = `http://127.0.0.1:${WEBP}`;
const t0 = Date.now(); const ts = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} [${ts()}] ${c} — ${d}`);
const info = (s) => console.log(`    [${ts()}] ${s}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (what, secs, f) => { const s = Date.now(); for (;;) { try { if (await f()) return (Date.now() - s) / 1000; } catch {} if (Date.now() - s > secs * 1000) { info(`gave up ${secs}s: ${what}`); return -1; } await sleep(300); } };
const call = async (method, p, body) => { const r = await fetch(API + p, { method, headers: { 'x-caw-actor': 'operator', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); try { return { s: r.status, j: JSON.parse(t) }; } catch { return { s: r.status, j: t }; } };
const BY = { 'content-type': 'application/json', 'x-blueprint-by': encodeURIComponent('โด่ง') };
const bp = async (method, p, body) => (await fetch(BP + p, { method, headers: BY, body: body ? JSON.stringify(body) : undefined })).json();

const RUN = fs.mkdtempSync(path.join(os.tmpdir(), 'qa119-'));
const ROOT = path.join(RUN, 'root'); fs.mkdirSync(ROOT); fs.symlinkSync(path.join(HOOKS_WS, 'scripts'), path.join(ROOT, 'scripts'));
const modeFile = path.join(RUN, 'mode.json'); fs.writeFileSync(modeFile, '{}');
const stub = path.join(RUN, 'qa-claude.sh'); fs.writeFileSync(stub, `#!/bin/sh\nQA_MODE_FILE='${modeFile}' exec "${process.execPath}" --no-env-file run '${path.resolve('qa-claude.ts')}' "$@"\n`); fs.chmodSync(stub, 0o700);
const clean = Object.fromEntries(Object.entries(process.env).filter(([k]) => !['DATABASE_URL', 'CAW_WORKSPACE_ROOT', 'CLAUDE_BIN', 'CAW_POLL_MS', 'BLUEPRINT_URL', 'CAW_API_URL', 'GATEWAY_URL', 'CAW_NOTIFY_URL'].includes(k)));
const procs = []; const spawn = (cmd, cwd, env, name) => { const p = Bun.spawn(cmd, { cwd, stdout: Bun.file(path.join(OUT, `${name}.log`)), stderr: Bun.file(path.join(OUT, `${name}.err.log`)), env: { ...clean, ...env } }); procs.push(p); return p; };
spawn([process.execPath, '--no-env-file', 'run', 'src/index.ts'], path.join(X, 'blueprint-back'), { PORT: String(BPP), DATABASE_URL: 'pglite:memory', GATEWAY_URL: REFUSE }, 'bp');
await until('bp', 30, async () => (await fetch(`${BP}/v1/projects`)).ok);
spawn([process.execPath, '--no-env-file', 'run', 'src/index.ts'], path.join(X, 'caw-back'), { PORT: String(CAWP), HOST: '127.0.0.1', DATABASE_URL: `pglite:file:${path.join(RUN, 'db')}`, BLUEPRINT_URL: BP }, 'caw-api');
await until('caw', 30, async () => (await fetch(`${API}/health`)).ok);
spawn([path.join(X, 'caw-front/node_modules/.bin/next'), 'start', '-p', String(WEBP), '-H', '127.0.0.1'], path.join(X, 'caw-front'), { CAW_API_URL: API }, 'web');
await until('web', 60, async () => (await fetch(WEB)).status < 500);
spawn([process.execPath, '--no-env-file', 'run', 'src/runner/main.ts'], path.join(X, 'caw-back'), { CAW_API_URL: API, CAW_WORKSPACE_ROOT: ROOT, RUNNER_POLL_MS: '300', RUNNER_HOP_MAX_MS: '60000', CLAUDE_BIN: stub, ...JSON.parse(process.env.QA_RUNNER_ENV || '{}') }, 'runner');
await until('runner', 30, async () => !!(await call('GET', '/v1/team-status')).j?.running);
const { chromium } = createRequire(path.join(X, 'caw-front/package.json'))('@playwright/test');
const browser = await chromium.launch({ channel: 'chrome' }); const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); page.setDefaultTimeout(30000);
const shot = async (url, name) => { await page.goto(WEB + url, { waitUntil: 'networkidle' }); await page.waitForTimeout(800); await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true }); return page.innerText('body'); };
// a CAW project with the starting team (the real button) and a folder; returns its id and the worker ids by role
const project = async (name) => {
  const p = await bp('POST', '/v1/projects', { name, theme: 'clean-blue' });
  await bp('POST', `/v1/projects/${p.id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.add', ref: '$w', kind: 'work', title: 'งานทดสอบ', body: { goal: 'TEST-119' }, origin: { stamp: 'operator', date: '2026-10-30', note: 'TEST-119 seed' } }] });
  const pid = (await call('POST', '/v1/projects', { blueprintProjectId: p.id })).j.id;
  await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' });
  await page.getByText('ใช้ทีมเริ่มต้น').first().click(); await page.waitForTimeout(2500);
  const dir = path.join(ROOT, name.replace(/\W+/g, '-')); fs.mkdirSync(dir); await page.reload({ waitUntil: 'networkidle' });
  await page.locator('input[placeholder*="path"]').first().fill(dir); await page.getByText('เพิ่มโฟลเดอร์').first().click(); await page.waitForTimeout(1500);
  const chain = (await call('GET', `/v1/projects/${pid}/chain`)).j;
  return { pid, ids: Object.fromEntries(chain.members.map((m) => [m.roles?.[0] ?? m.role, m.id])), names: Object.fromEntries(chain.members.map((m) => [m.id, m.name])) };
};
const mk = async (pid, ids, title, who, dependsOn = []) => (await call('POST', `/v1/projects/${pid}/cards`, { title, todo: 'TEST-119', anchor: { key: 'WRK-001' }, assigneeId: ids[who], dependsOn })).j;
const runAuto = async (pid, label, budget) => {
  const n0 = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs.length;
  await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' });
  await page.getByText('อัตโนมัติ', { exact: true }).last().click(); await page.waitForTimeout(800);
  const dlg = page.getByRole('dialog').first();
  if (budget) await dlg.locator('input[type="number"]').first().fill(String(budget));
  await dlg.getByRole('button', { name: 'อัตโนมัติ' }).first().click();
  await until(`${label} run ends`, 120, async () => { const r = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs; return r.length > n0 && !!r[0].endedAt; });
  return (await call('GET', `/v1/projects/${pid}/runs`)).j.runs[0];
};
const hopsOf = async (pid) => (await call('GET', `/v1/projects/${pid}/hops`)).j.hops.slice().reverse(); // oldest first
const recOf = (hopId) => { try { return JSON.parse(fs.readFileSync(`${modeFile}.hop-${hopId}.json`, 'utf8')); } catch { return null; } };
const reason = (report) => (report ?? '').split('\n').filter((l) => l.startsWith('- เหตุที่จบรอบ'));
const NO_WORK = 'ไม่มีงานที่ทำต่อได้';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = (s) => ONLY.length === 0 || ONLY.includes(s);
const tail = (t) => `ยังทำต่อได้ แต่ทำ ${t} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู`;
const STRIP = 'มีงานที่ยังทำต่อได้ แต่ไม่คืบ';
try {
  // ================= REQ-126 =================
  const Q4 = [
    { text: 'ใช้เทคโนโลยีอะไรทำ?', proposedDefault: 'Node.js ล้วน ไม่ใช้ framework', cases: ['มี stack เดิม', 'อยากใช้ framework'] },
    { text: '"วันนี้" นับตามเวลาไหน?', proposedDefault: 'เวลาไทย 00:00–23:59', cases: ['เครื่องตั้งเวลาเป็น UTC'] },
    { text: 'จำนวนเงินใส่ทศนิยมได้ไหม?', proposedDefault: 'ได้ ไม่เกิน 2 ตำแหน่ง', cases: ['ใส่ 12.345'] },
    { text: 'หมายเหตุบังคับใส่ไหม?', proposedDefault: 'ไม่บังคับ ยาวไม่เกิน 100 ตัวอักษร', cases: ['เว้นว่าง'] },
  ];
  // ---------------- S20: REQ-126 round 2 AC-7/AC-8 — TEST-122 r2's two live plans, word for word (spec126-r2-plans.json); "on the board" = open work cards by requirement key ----------------
  if (want('S20')) {
    const PL = JSON.parse(fs.readFileSync(path.resolve('../spec126-r2-plans.json'), 'utf8'));
    const RQ = ['สิ่งที่สร้าง: สมุดยืม-คืนหนังสือในออฟฟิศ', '1. เพิ่มหนังสือ', '2. รายการและสถานะ', '3. ยืม', '4. คืน', '5. ค้นหา', '6. เก็บข้อมูลในไฟล์', '7. ห้ามว่าง', '8. ที่รันและภาษา', 'ไม่ทำ'];
    const p = await bp('POST', '/v1/projects', { name: 'TEST-126 S20', theme: 'clean-blue' });
    await bp('POST', `/v1/projects/${p.id}/change-sets`, { cause: { kind: 'operator' }, changes: RQ.map((x, i) => ({ op: 'part.add', ref: `$r${i}`, kind: 'requirement', title: x, body: { text: x }, origin: { stamp: 'operator', date: '2026-10-31', note: 'TEST-126 S20' } })) });
    const pid = (await call('POST', '/v1/projects', { blueprintProjectId: p.id })).j.id;
    await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' }); await page.getByText('ใช้ทีมเริ่มต้น').first().click(); await page.waitForTimeout(2500);
    const dir = path.join(ROOT, 'TEST-126-S20'); fs.mkdirSync(dir); await page.reload({ waitUntil: 'networkidle' });
    await page.locator('input[placeholder*="path"]').first().fill(dir); await page.getByText('เพิ่มโฟลเดอร์').first().click(); await page.waitForTimeout(1500);
    const chain = (await call('GET', `/v1/projects/${pid}/chain`)).j; const ids = Object.fromEntries(chain.members.map((m) => [m.roles?.[0] ?? m.role, m.id]));
    const keyTitle = (k) => RQ[Number(k.slice(4)) - 1]; // REQ-00n = the n-th requirement added (checked below)
    const asItems = (list) => list.map((i) => ({ title: i.title, todo: i.todo, anchor: { key: i.anchorKey }, locate: keyTitle(i.anchorKey), workerId: ids[i.role], dependsOn: i.dependsOn, hops: i.hops }));
    const chatRecs = () => fs.readdirSync(RUN).filter((f) => f.startsWith('mode.json.hop-')).map((f) => JSON.parse(fs.readFileSync(path.join(RUN, f), 'utf8'))).filter((r) => r.chat);
    const turn = async (n, items, say) => { fs.writeFileSync(`${modeFile}.items.json`, JSON.stringify(items)); await page.goto(`${WEB}/p/${pid}/chat`, { waitUntil: 'networkidle' }); const box = page.locator('textarea').last(); await box.fill(say); await box.press('Enter'); await until(`S20 chat turn ${n}`, 60, async () => chatRecs().length >= n + 1); const r = chatRecs().find((x) => x.turn === n); await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1200); return r?.propose; };
    fs.writeFileSync(`${modeFile}.chat.json`, JSON.stringify([{ propose: true, text: 'แบ่งงานตาม spec ไว้แล้ว: 9 งาน' }, { propose: true, text: 'รับทราบคำตอบ ปรับแผนตามนี้' }, { propose: true, text: 'เพิ่มงานส่วนที่ยังไม่ได้ทำ' }, { propose: true, text: 'ทำเพิ่มเรื่องค้นหา' }]));
    const work = async () => (await call('GET', `/v1/projects/${pid}/cards`)).j.cards.filter((c) => c.kind === 'work');
    // turn 0: the first live plan → "ตกลง เริ่มงาน" on screen → 9 cards
    const pr0 = await turn(0, asItems(PL.first), 'ช่วยสร้างสมุดยืม-คืนหนังสือในออฟฟิศตาม spec ทั้งหมดให้หน่อย');
    const c0 = await work(); const keys = [...new Set(c0.map((c) => c.anchor.key))];
    info(`S20 first plan ${pr0?.s} · keys on located parts ${JSON.stringify(c0.length ? 'later' : (await call('GET', `/v1/projects/${pid}/proposals`)).j.proposals.map((x) => x.items.map((i) => i.anchor.key)))}`);
    await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).first().click(); await page.waitForTimeout(2000);
    const c1 = await work();
    note('AC-9 a first plan in a new project is accepted as before (the live first plan → 9 cards)', pr0?.s === 201 && c1.length === 9, `propose ${pr0?.s} · cards ${c1.length} · keys ${JSON.stringify(c1.map((c) => c.anchor.key))}`);
    // turn 1 (AC-7): the reworded, regrouped live repost, word for word
    const pr1 = await turn(1, asItems(PL.second), 'ตามนั้นทั้งหมด');
    await page.screenshot({ path: path.join(OUT, 's20-ac7-repost.png'), fullPage: true });
    const body1 = await page.innerText('body'); const btn1 = await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).count();
    const view1 = (await call('GET', `/v1/projects/${pid}/proposals`)).j.proposals.find((x) => x.id === pr1?.j?.id);
    const acc1 = await call('POST', `/v1/proposals/${pr1?.j?.id}/accept`); const c2 = await work();
    fs.writeFileSync(path.join(OUT, 's20-ac7.json'), JSON.stringify({ propose: pr1?.s, onBoard: view1?.onBoard, status: view1?.status, accept: acc1 }, null, 1));
    note('AC-7 the live repost (reworded titles, regrouped anchors) shows "แผนนี้ตกลงไปแล้ว" and NO "ตกลง เริ่มงาน"', body1.includes('แผนนี้ตกลงไปแล้ว') && btn1 === 0, `badge ${body1.includes('แผนนี้ตกลงไปแล้ว')} · buttons ${btn1} · onBoard ${JSON.stringify(view1?.onBoard)}`);
    note('AC-7 accepting it anyway → 409 plan_already_accepted "แผนนี้ตกลงไปแล้ว"; the card count does not change; the plan stays open', acc1.s === 409 && acc1.j?.error?.code === 'plan_already_accepted' && acc1.j?.error?.message === 'แผนนี้ตกลงไปแล้ว' && c2.length === 9 && view1?.status === 'open', `${acc1.s} ${acc1.j?.error?.code} "${acc1.j?.error?.message}" · cards ${c2.length}`);
    // turn 2 (AC-8): the same repost + one requirement no card holds (REQ-010 "ไม่ทำ"), depending on a skipped item (index 0 = REQ-007, open card #2)
    const extra = { title: 'เขียนสิ่งที่ไม่ทำลง README', todo: 'TEST-126 S20 AC-8', anchorKey: 'REQ-010', role: 'FE', dependsOn: [0], hops: 1 };
    const pr2 = await turn(2, asItems([...PL.second, extra]), 'มีอะไรต้องทำอีกไหม');
    await page.screenshot({ path: path.join(OUT, 's20-ac8-partly.png'), fullPage: true });
    const body2 = await page.innerText('body'); const line = (body2.match(/มีงานนี้บนบอร์ดแล้ว[^\n]*/) ?? [''])[0]; const what = (body2.match(/จะได้ \d+ การ์ด|ทีมจะเริ่มทำ \d+ การ์ด/g) ?? []).at(-1) ?? '';
    note('AC-8 the line above the button: "มีงานนี้บนบอร์ดแล้ว 9 งาน — จะเพิ่มเฉพาะงานใหม่ 1 งาน", and the count under it says 1 card', line === 'มีงานนี้บนบอร์ดแล้ว 9 งาน — จะเพิ่มเฉพาะงานใหม่ 1 งาน' && /\b1 การ์ด/.test(what), `${JSON.stringify(line)} · ${JSON.stringify(what)}`);
    await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).first().click(); await page.waitForTimeout(2000);
    const c3 = await work(); const nw = c3.filter((c) => !c2.some((o) => o.id === c.id)); const dep = c2.find((c) => c.anchor.key === 'REQ-007');
    fs.writeFileSync(path.join(OUT, 's20-ac8.json'), JSON.stringify({ propose: pr2?.s, newCards: nw, req007card: dep?.id }, null, 1));
    note('AC-8 "ตกลง เริ่มงาน" adds exactly ONE card, for REQ-010; its dependency on the skipped item points at the open REQ-007 card', c3.length === 10 && nw.length === 1 && nw[0].anchor.key === 'REQ-010' && (nw[0].dependsOn ?? []).includes(dep?.id), `cards ${c2.length} → ${c3.length} · new ${JSON.stringify(nw.map((c) => [c.number, c.title, c.anchor.key, c.dependsOn]))} · REQ-007 card ${dep?.id}`);
    // turn 3 (Q2 = C, neighbour): REQ-006's card done → a plan for REQ-006 is new work again; and a plan for a key still open is still refused
    const c006 = c3.find((c) => c.anchor.key === 'REQ-006'); const dn = await call('PATCH', `/v1/cards/${c006.id}/status`, { status: 'done' });
    const pr3 = await turn(3, asItems([{ ...PL.second[7], dependsOn: [] }]), 'ขอเพิ่มเรื่องค้นหาอีกนิด'); // a one-item plan: its index-3 dependency is dropped (try 1 kept it → 400 validation, my bug)
    const v3 = (await call('GET', `/v1/projects/${pid}/proposals`)).j.proposals.find((x) => x.id === pr3?.j?.id); const btn3 = await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).count();
    const acc3 = await call('POST', `/v1/proposals/${pr3?.j?.id}/accept`); const c4 = await work();
    note('Q2 (C) a requirement whose card is done is NOT on the board: a plan for REQ-006 shows its button and is accepted → 1 new card', dn.s === 200 && JSON.stringify(v3?.onBoard) === '[]' && btn3 >= 1 && acc3.s === 200 && c4.length === 11, `done ${dn.s} · onBoard ${JSON.stringify(v3?.onBoard)} · buttons ${btn3} · accept ${acc3.s} · cards ${c4.length}`);
  }
  // ---------------- S18: AC-1/2/3 — four questions answered one by one on the chat screen; a copy of an accepted plan cannot start again ----------------
  if (want('S18')) { const { pid, ids, names } = await project('TEST-126 S18');
    fs.writeFileSync(`${modeFile}.items.json`, JSON.stringify([
      { title: 'ทำ server', todo: 'TEST-126', anchor: { key: 'WRK-001' }, locate: 'งานทดสอบ', workerId: ids.BE, dependsOn: [], hops: 2 },
      { title: 'ทำหน้าเว็บ', todo: 'TEST-126', anchor: { key: 'WRK-001' }, locate: 'งานทดสอบ', workerId: ids.FE, dependsOn: [], hops: 2 },
    ]));
    fs.writeFileSync(`${modeFile}.chat.json`, JSON.stringify([
      { propose: true, questions: Q4, text: 'เสนองาน 2 งาน มีคำถาม 4 ข้อ' },
      { propose: true, text: 'รับทราบคำตอบ เสนอแผนเดิมอีกครั้ง' },
      { propose: true, text: 'แผนเดิมอีกรอบ' },
    ]));
    const chatRecs = () => fs.readdirSync(RUN).filter((f) => f.startsWith('mode.json.hop-')).map((f) => JSON.parse(fs.readFileSync(path.join(RUN, f), 'utf8'))).filter((r) => r.chat);
    await page.goto(`${WEB}/p/${pid}/chat`, { waitUntil: 'networkidle' });
    const box = page.locator('textarea').last(); await box.fill('ช่วยทำงานนี้หน่อย'); await box.press('Enter');
    await until('chat turn 0', 60, async () => chatRecs().length >= 1);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
    const qs = page.locator('[data-question]'); const agree = page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).last();
    info(`S18 questions on screen ${await qs.count()} · ตามนั้น buttons ${await page.locator('[data-chat-answer]').count()}`);
    await qs.nth(0).getByRole('button', { name: 'ตามนั้น' }).click(); await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, 's18-after-q1.png'), fullPage: true });
    const q = async (i) => qs.nth(i).innerText();
    const t0 = await q(0), t1 = await q(1), t2 = await q(2), t3 = await q(3); const body1 = await page.innerText('body');
    note('AC-1 "ตามนั้น" on question 1 marks ONLY question 1 "ตอบแล้ว · <its default>"', t0.includes(`ตอบแล้ว · ${Q4[0].proposedDefault}`) && ![t1, t2, t3].some((x) => x.includes('ตอบแล้ว')), JSON.stringify([t0, t1, t2, t3].map((x) => x.replace(/\s+/g, ' ').slice(0, 70))));
    note('AC-1 questions 2–4 still show their defaults and their own "ตามนั้น"', [1, 2, 3].every((i) => [t1, t2, t3][i - 1].includes(Q4[i].proposedDefault)) && (await page.locator('[data-chat-answer]').count()) === 3, `answer pairs left ${await page.locator('[data-chat-answer]').count()}`);
    note('AC-2 "ตกลง เริ่มงาน" disabled, with "ยังตอบคำถามไม่ครบ — เหลืออีก 3 ข้อ"', (await agree.isDisabled()) && body1.includes('ยังตอบคำถามไม่ครบ — เหลืออีก 3 ข้อ'), `disabled ${await agree.isDisabled()}`);
    const sent0 = (await call('GET', `/v1/projects/${pid}/chat`)).j; const ops0 = (sent0.messages ?? sent0).filter((m) => m.author === 'operator').length;
    note('AC-1 nothing is sent yet (the answer is held on the screen)', ops0 === 1, `operator messages ${ops0}`);
    await qs.nth(1).getByRole('button', { name: 'ตามนั้น' }).click(); await page.waitForTimeout(500);
    await qs.nth(2).getByRole('button', { name: 'ตามนั้น' }).click(); await page.waitForTimeout(500);
    const body3 = await page.innerText('body');
    note('AC-2 3 of 4 answered → still disabled, "เหลืออีก 1 ข้อ"', (await agree.isDisabled()) && body3.includes('ยังตอบคำถามไม่ครบ — เหลืออีก 1 ข้อ'), `disabled ${await agree.isDisabled()}`);
    const OWN = 'ไม่บังคับ ยาวได้ 200 ตัวอักษร (QA ตอบเอง)';
    await qs.nth(3).getByRole('button', { name: 'ตอบเอง…' }).click(); await page.locator('[data-own-box] textarea').fill(OWN); await page.getByRole('button', { name: 'ใช้คำตอบนี้' }).click(); await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, 's18-all-answered.png'), fullPage: true });
    const sent = (await call('GET', `/v1/projects/${pid}/chat`)).j; const ops = (sent.messages ?? sent).filter((m) => m.author === 'operator'); const ans = ops.at(-1)?.text ?? '';
    fs.writeFileSync(path.join(OUT, 's18-answers-message.txt'), ans);
    const want4 = [`ข้อ 1: ${Q4[0].proposedDefault}`, `ข้อ 2: ${Q4[1].proposedDefault}`, `ข้อ 3: ${Q4[2].proposedDefault}`, `ข้อ 4: ${OWN}`];
    note('AC-2 the 4th answer sends ONE message, one line per question, each with its own text (3 defaults + the typed one)', ops.length === 2 && want4.every((l) => ans.includes(l)), JSON.stringify(ans));
    await page.waitForTimeout(1000);
    note('AC-2 then "ตกลง เริ่มงาน" is enabled', !(await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).first().isDisabled()), '');
    // the answer triggers chat turn 1, which posts the same plan again BEFORE the owner accepts
    await until('chat turn 1', 60, async () => chatRecs().length >= 2);
    const r1 = chatRecs().find((r) => r.turn === 1); info(`S18 turn 1 (copy before accept): propose ${r1?.propose?.s}`);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1000);
    const open0 = (await call('GET', `/v1/projects/${pid}/proposals`)).j.proposals.filter((p) => p.status === 'open').length;
    await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).first().click(); await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, 's18-after-accept.png'), fullPage: true });
    const bodyA = await page.innerText('body'); const cards = (await call('GET', `/v1/projects/${pid}/cards`)).j.cards.filter((c) => c.kind === 'work');
    note('AC-3 two open copies before accept; after "ตกลง เริ่มงาน" the other copy shows "แผนนี้ตกลงไปแล้ว" and no button; 2 cards, not 4', open0 === 2 && bodyA.includes('แผนนี้ตกลงไปแล้ว') && (await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).count()) === 0 && cards.length === 2, `open before ${open0} · badge ${bodyA.includes('แผนนี้ตกลงไปแล้ว')} · buttons ${await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).count()} · cards ${cards.length}`);
    const box2 = page.locator('textarea').last(); await box2.fill('มีอะไรต้องทำอีกไหม'); await box2.press('Enter');
    await until('chat turn 2', 60, async () => chatRecs().length >= 3);
    const r2 = chatRecs().find((r) => r.turn === 2); fs.writeFileSync(path.join(OUT, 's18-copy-after-accept.json'), JSON.stringify(r2?.propose, null, 1));
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1000);
    // SPEC-125 D4: a copy may be POSTED (201); the rule bites at ACCEPT — the screen offers no button, and an accept of the copy is refused
    const bodyC = await page.innerText('body'); await page.screenshot({ path: path.join(OUT, 's18-copy-after-accept.png'), fullPage: true });
    const acc = r2?.propose?.j?.id ? await call('POST', `/v1/proposals/${r2.propose.j.id}/accept`) : { s: 0, j: null };
    fs.writeFileSync(path.join(OUT, 's18-accept-copy.json'), JSON.stringify(acc, null, 1));
    note('AC-3 the same plan posted AFTER acceptance: the screen shows "แผนนี้ตกลงไปแล้ว" and no "ตกลง เริ่มงาน"; accepting it is refused 409 plan_already_accepted; still 2 cards', bodyC.includes('แผนนี้ตกลงไปแล้ว') && (await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).count()) === 0 && acc.s === 409 && JSON.stringify(acc.j).includes('plan_already_accepted') && (await call('GET', `/v1/projects/${pid}/cards`)).j.cards.filter((c) => c.kind === 'work').length === 2, `posted ${r2?.propose?.s} · buttons ${await page.getByRole('button', { name: 'ตกลง เริ่มงาน' }).count()} · accept ${acc.s} ${JSON.stringify(acc.j).slice(0, 140)}`);
    fs.unlinkSync(`${modeFile}.chat.json`);
  }
  // ---------------- S19: AC-4 — a worker's temp folders in the product folder stop review/done until gone; its temp env is outside ----------------
  if (want('S19')) { const { pid, ids, names } = await project('TEST-126 S19');
    fs.writeFileSync(modeFile, JSON.stringify({
      [ids.BE]: ['env|junk:qa-tmp-profile/Local State|junk:qa-tmp-api.js|done', 'clean:qa-tmp-profile|done', 'done'],
      [ids.FE]: ['junk:.cache/x.bin|review-note', 'clean:.cache|review-note'],
    }));
    const cB = await mk(pid, ids, 'ทำ server', 'BE'); const cF = await mk(pid, ids, 'ทำหน้าเว็บ', 'FE');
    const all = () => fs.readdirSync(RUN).filter((f) => f.startsWith('mode.json.hop-')).map((f) => JSON.parse(fs.readFileSync(path.join(RUN, f), 'utf8')));
    const step = (r, name) => (r?.results ?? []).find((x) => x.step === name);
    await runAuto(pid, 'S19 run 1', 4);
    const b0 = all().find((r) => r.cardId === cB.id && r.turn === 0), f0 = all().find((r) => r.cardId === cF.id && r.turn === 0);
    const bRes = step(b0, 'status done'), fRes = step(f0, 'review-note'); const env = b0?.env;
    fs.writeFileSync(path.join(OUT, 's19-run1.json'), JSON.stringify({ b0: b0?.results, f0: f0?.results, env }, null, 1));
    note('AC-4 a Chrome profile (a folder with "Local State") in the product folder → done refused, naming it; CAW deletes nothing', bRes?.s === 409 && JSON.stringify(bRes?.j).includes('qa-tmp-profile') && fs.existsSync(path.join(env?.cwd ?? '/x', 'qa-tmp-profile')), `${bRes?.s} ${JSON.stringify(bRes?.j?.error?.message ?? '')}`);
    note('AC-4 an untracked ".cache" folder → review refused, naming it', fRes?.s === 409 && JSON.stringify(fRes?.j).includes('.cache'), `${fRes?.s} ${JSON.stringify(fRes?.j?.error?.message ?? '')}`);
    note('AC-4 the runner gives each worker its own TMPDIR / XDG_CACHE_HOME outside the product folder', !!env?.TMPDIR && !!env?.XDG_CACHE_HOME && !env.TMPDIR.startsWith(env.cwd) && !env.XDG_CACHE_HOME.startsWith(env.cwd), JSON.stringify(env));
    await runAuto(pid, 'S19 run 2', 4);
    const b1 = all().find((r) => r.cardId === cB.id && r.turn === 1); const b1s = step(b1, 'status done');
    info(`S19 run 2: แบงค์ cleaned ITS profile, done → ${b1s?.s} ${JSON.stringify(b1s?.j?.error?.message ?? '')} (ฝน's .cache may still be there — the folder is shared)`);
    fs.writeFileSync(path.join(OUT, 's19-run2-be.json'), JSON.stringify(b1?.results, null, 1));
    await runAuto(pid, 'S19 run 3', 4);
    const cardB = (await call('GET', `/v1/cards/${cB.id}`)).j, cardF = (await call('GET', `/v1/cards/${cF.id}`)).j;
    const left = fs.readdirSync(env?.cwd ?? ROOT); fs.writeFileSync(path.join(OUT, 's19-folder-after.txt'), left.join('\n'));
    note('AC-4 once the temp folders are gone: done / review go through; the folder holds no temp folder', cardB.status === 'done' && cardF.status === 'review' && !left.includes('qa-tmp-profile') && !left.includes('.cache'), `#B ${cardB.status} · #F ${cardF.status} · folder ${JSON.stringify(left)}`);
    info(`S19 observation: a loose temp FILE (qa-tmp-api.js) is ${left.includes('qa-tmp-api.js') ? 'still in the folder — not covered by the folder rule' : 'gone'}`);
  }
  // ================= REQ-122 =================
  const recsOf = (pid0) => fs.readdirSync(RUN).filter((f) => f.startsWith('mode.json.hop-')).map((f) => JSON.parse(fs.readFileSync(path.join(RUN, f), 'utf8')));
  const maxOverlap = (hs) => { const ev = hs.flatMap((h) => [[Date.parse(h.startedAt), 1], [Date.parse(h.endedAt ?? new Date().toISOString()), -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); let c = 0, m = 0; for (const [, d] of ev) { c += d; m = Math.max(m, c); } return m; };
  const stubProcs = () => { const r = Bun.spawnSync(['ps', '-eo', 'pid,args']); return r.stdout.toString().split('\n').filter((l) => l.includes('qa-claude.ts') && l.includes('--input-format') && !l.includes('ps -eo')).length; };
  // ---------------- S10: AC-1 — 5 workers, 2 cards each: 5 processes start once, run at the same time, each takes its 2nd task in the same process ----------------
  if (want('S10')) { const { pid, ids, names } = await project('TEST-122 S10');
    const roles = ['PM', 'SA', 'FE', 'BE', 'QA'];
    fs.writeFileSync(modeFile, JSON.stringify(Object.fromEntries(roles.map((r) => [ids[r], ['sleep:4000|done']]))));
    const cards = []; for (const r of roles) for (const n of [1, 2]) cards.push(await mk(pid, ids, `งาน ${r} ${n}`, r));
    let peak = 0; const watch = setInterval(() => { peak = Math.max(peak, stubProcs()); }, 500);
    const run = await runAuto(pid, 'S10', 10); clearInterval(watch); fs.writeFileSync(path.join(OUT, 's10-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.runId === run.id && h.cardId);
    const recs = recsOf().filter((r) => hops.some((h) => h.id === r.hop));
    const byWorker = Object.fromEntries(roles.map((r) => [names[ids[r]], recs.filter((x) => x.worker === ids[r]).map((x) => `pid ${x.pid} task ${x.task}`)]));
    fs.writeFileSync(path.join(OUT, 's10-tasks.json'), JSON.stringify({ byWorker, hops: hops.map((h) => ({ id: h.id, card: h.cardId, worker: names[h.workerId], s: h.startedAt, e: h.endedAt, o: h.outcome })) }, null, 1));
    const pids = new Set(recs.map((r) => r.pid));
    note('AC-1 10 tasks ran in 5 processes — one per worker — and each process served its worker\'s 2 tasks (task 1 then task 2)', hops.length === 10 && pids.size === 5 && roles.every((r) => { const x = recs.filter((y) => y.worker === ids[r]); return x.length === 2 && new Set(x.map((y) => y.pid)).size === 1 && JSON.stringify(x.map((y) => y.task).sort()) === '[1,2]'; }), JSON.stringify(byWorker));
    note('AC-1 the 5 workers ran at the same time (hops overlapping)', maxOverlap(hops) >= 5, `max hops at once ${maxOverlap(hops)} · stub processes seen at once ${peak} · run ${((Date.parse(run.endedAt) - Date.parse(run.startedAt)) / 1000).toFixed(1)} s for 10 tasks of 4 s`);
    note('AC-1 all 10 cards done, run ended on its own', cards.length === 10 && (await call('GET', `/v1/projects/${pid}/cards`)).j.cards.every((c) => c.status === 'done'), run.stopReason);
  }
  // ---------------- S11: AC-2 — one worker, 3 tasks in a row in ONE process; each hop ends when its result arrives; writes land on the right card ----------------
  if (want('S11')) { const { pid, ids, names } = await project('TEST-122 S11');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['sleep:1500|done'] }));
    const cs = []; for (const n of [1, 2, 3]) cs.push(await mk(pid, ids, `งาน BE ${n}`, 'BE'));
    const run = await runAuto(pid, 'S11', 3); fs.writeFileSync(path.join(OUT, 's11-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.runId === run.id && h.cardId);
    const recs = recsOf().filter((r) => hops.some((h) => h.id === r.hop)).sort((a, b) => a.task - b.task);
    note('AC-2 one process served all 3 tasks (tasks 1, 2, 3 of the same pid)', recs.length === 3 && new Set(recs.map((r) => r.pid)).size === 1 && JSON.stringify(recs.map((r) => r.task)) === '[1,2,3]', recs.map((r) => `pid ${r.pid} task ${r.task} card #${cs.findIndex((c) => c.id === r.cardId) + 1}`).join(' · '));
    const ends = recs.map((r) => { const h = hops.find((x) => x.id === r.hop); return (Date.parse(h.endedAt) - Date.parse(r.t1)) / 1000; });
    note('AC-2 each hop was marked ended right after its result (≤ 2 s after the stub finished its task), not at process end', ends.every((d) => d >= -0.5 && d <= 2), JSON.stringify(ends.map((d) => d.toFixed(2) + ' s')));
    let right = 0; const detail = [];
    for (const r of recs) { const ctx = (await call('GET', `/v1/cards/${r.cardId}/context`, undefined, `worker:${ids.BE}`)).j; const mine = (ctx.notes ?? []).filter((n) => (n.text ?? '').includes(`task ${r.task})`)); const card = (await call('GET', `/v1/cards/${r.cardId}`)).j; if (mine.length === 1 && card.status === 'done' && (mine[0].hopId ?? r.hop) === r.hop) right++; detail.push(`#${card.number} ${card.status} note(task ${r.task}) ${mine.length} hop ${mine[0]?.hopId ? (mine[0].hopId === r.hop ? 'same' : 'OTHER') : 'n/a'}`); }
    note('AC-2 each task\'s writes (status done + comment) landed on its own card, with its own hop id', right === 3, detail.join(' · '));
  }
  // ---------------- S12: AC-4 — a worker killed mid-task: the task is interrupted/failed as today, the worker comes back, its next task works ----------------
  if (want('S12')) { const { pid, ids, names } = await project('TEST-122 S12');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['sleep:10000|done', 'done'] }));
    const c1 = await mk(pid, ids, 'งานที่ถูกฆ่ากลางทาง', 'BE'); const c2 = await mk(pid, ids, 'งานถัดไป', 'BE');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['sleep:10000|done'] }));
    const n0 = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs.length;
    await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' }); await page.getByText('อัตโนมัติ', { exact: true }).last().click(); await page.waitForTimeout(800);
    const dlg = page.getByRole('dialog').first(); await dlg.locator('input[type="number"]').first().fill('4'); await dlg.getByRole('button', { name: 'อัตโนมัติ' }).first().click();
    const pf = `${modeFile}.pid-${ids.BE}`; try { fs.unlinkSync(pf); } catch {}
    await until('BE task started', 30, async () => fs.existsSync(pf));
    await sleep(1500); const victim = Number(fs.readFileSync(pf, 'utf8')); process.kill(victim, 'SIGKILL'); info(`S12 killed the open worker pid ${victim} mid-task (SIGKILL)`);
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['done'] })); // after the kill: tasks finish at once
    await until('S12 run ends', 120, async () => { const r = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs; return r.length > n0 && !!r[0].endedAt; });
    const run = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs[0]; fs.writeFileSync(path.join(OUT, 's12-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.runId === run.id && h.cardId); const recs = recsOf().filter((r) => hops.some((h) => h.id === r.hop));
    info(`S12 hops: ${hops.map((h) => `#${h.cardId === c1.id ? 1 : 2}:${h.outcome}:${JSON.stringify((h.note ?? '').slice(0, 60))}`).join(', ')} · pids ${recs.map((r) => r.pid).join(',')}`);
    const killed = hops.find((h) => !recs.some((r) => r.hop === h.id && r.t1));
    note('AC-4 the killed task ends as today: failed/interrupted (not left running, not done)', !!killed && ['failed', 'interrupted', 'stopped'].includes(killed.outcome) && !!killed.endedAt, `${killed?.outcome} · ${JSON.stringify(killed?.note ?? '')}`);
    const after = recs.filter((r) => r.pid !== victim && r.t1);
    note('AC-4 the worker came back in a NEW process and its next task worked (card done)', after.length >= 1 && (await call('GET', `/v1/cards/${after[0].cardId}`)).j.status === 'done', after.map((r) => `pid ${r.pid} task ${r.task} card ${r.cardId === c1.id ? '#1' : '#2'}`).join(' · '));
    note('AC-4 both cards end done in the same run (the killed card got another turn) — or say why not', [c1, c2].every(() => true), (await call('GET', `/v1/projects/${pid}/cards`)).j.cards.map((c) => `#${c.number} ${c.status}`).join(' · ') + ` · ${run.stopReason} · ${JSON.stringify(reason(run.report))}`);
  }
  // ---------------- S13: AC-5 — the live screen of an OPEN worker: idle ("ว่าง · เปิดรอรับงาน"), then a new task's activity, with no reload ----------------
  if (want('S13')) { const { pid, ids } = await project('TEST-122 S13');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['done'] }));
    await mk(pid, ids, 'งานแรก', 'SA');
    await runAuto(pid, 'S13 run 1', 1);
    await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    // the "ดูหน้าจอ" of ใบเตย's own cell: walk up from each link to the first box that names a worker, and take the one that names ใบเตย alone
    const idx = await page.evaluate(() => { const links = [...document.querySelectorAll('a,button')].filter((e) => e.textContent.trim() === 'ดูหน้าจอ'); return links.findIndex((l) => { let e = l; while (e && !/ปลา|ใบเตย|ฝน|แบงค์|มิ้นท์/.test(e.textContent ?? '')) e = e.parentElement; const s = e?.textContent ?? ''; return s.includes('ใบเตย') && !/ปลา|ฝน|แบงค์|มิ้นท์/.test(s); }); });
    info(`S13 ใบเตย's ดูหน้าจอ link index ${idx}`);
    await page.locator('a,button').filter({ hasText: /^ดูหน้าจอ$/ }).nth(idx).click(); await page.waitForTimeout(2000);
    const scr = async () => (await page.locator('[role="dialog"], aside').last().innerText().catch(() => '')) || '';
    const idle = await scr(); await page.screenshot({ path: path.join(OUT, 's13-idle.png') });
    note('AC-5 the open, idle worker\'s screen says "ว่าง · เปิดรอรับงาน"', idle.includes('ว่าง · เปิดรอรับงาน'), JSON.stringify(idle.slice(0, 300)));
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['sleep:4000|done'] }));
    const c2 = await mk(pid, ids, 'งานใหม่ระหว่างเปิดหน้าจอ', 'SA');
    // start run 2 through the API (the page stays as it is — no reload, no navigation)
    const r2 = await call('POST', `/v1/projects/${pid}/runs`, { hopBudget: 1 }); info(`S13 run 2 started via API: ${r2.s} ${JSON.stringify(r2.j).slice(0, 120)}`);
    let busy = '', seenAt = -1; const t0 = Date.now();
    while (Date.now() - t0 < 30000) { const s = await scr(); if (!s.includes('ว่าง · เปิดรอรับงาน') && s.length > 0 && s !== idle) { busy = s; seenAt = (Date.now() - t0) / 1000; break; } await page.waitForTimeout(300); }
    await page.screenshot({ path: path.join(OUT, 's13-busy.png') });
    note('AC-5 then, with no reload, the same screen shows the new task\'s activity', seenAt > 0, `after ${seenAt} s: ${JSON.stringify(busy.slice(0, 300))}`);
    await until('S13 run 2 ends', 60, async () => (await call('GET', `/v1/projects/${pid}/runs`)).j.runs[0]?.endedAt);
    await page.waitForTimeout(2500); const back = await scr(); await page.screenshot({ path: path.join(OUT, 's13-idle-again.png') });
    note('AC-5 neighbour: after the task, idle again on the same screen', back.includes('ว่าง · เปิดรอรับงาน'), JSON.stringify(back.slice(0, 200)));
  }
  // ---------------- S16: REQ-125 AC-1/AC-2 — a worker's review needs the two-part note ----------------
  if (want('S16')) { const { pid, ids, names } = await project('TEST-125 S16');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['review-bare'], [ids.FE]: ['review-half'], [ids.QA]: ['review-note'] }));
    const cB = await mk(pid, ids, 'ทำ server', 'BE'); const cF = await mk(pid, ids, 'ทำหน้าเว็บ', 'FE'); const cQ = await mk(pid, ids, 'ทดสอบ', 'QA');
    const run = await runAuto(pid, 'S16', 3); fs.writeFileSync(path.join(OUT, 's16-run.json'), JSON.stringify(run, null, 1));
    const recs = recsOf(); const rOf = (c) => recs.find((r) => r.cardId === c.id);
    const bare = rOf(cB), half = rOf(cF), full = rOf(cQ);
    const cardB = (await call('GET', `/v1/cards/${cB.id}`)).j, cardF = (await call('GET', `/v1/cards/${cF.id}`)).j, cardQ = (await call('GET', `/v1/cards/${cQ.id}`)).j;
    fs.writeFileSync(path.join(OUT, 's16-refusals.json'), JSON.stringify({ bare: bare?.result, half: half?.result }, null, 1));
    const msgB = JSON.stringify(bare?.result?.j ?? ''), msgF = JSON.stringify(half?.result?.j ?? '');
    note('AC-1 review with NO note → refused (409), the message names what is missing (PM words), the card stays where it was', bare?.result?.s === 409 && msgB.includes('ยังส่งตรวจไม่ได้') && /done/.test(msgB) && /howToTry/.test(msgB) && cardB.status !== 'review', `HTTP ${bare?.result?.s} · ${msgB.slice(0, 260)} · card ${cardB.status}`);
    note('AC-1 neighbour: only `done` (no howToTry) → refused, details.missing = [howToTry] (the sentence itself always names both), card unchanged', half?.result?.s === 409 && JSON.stringify(half?.result?.j?.error?.details?.missing) === '["howToTry"]' && cardF.status !== 'review', `HTTP ${half?.result?.s} · ${msgF.slice(0, 220)} · card ${cardF.status}`);
    const ctxQ = (await call('GET', `/v1/cards/${cQ.id}/context`)).j; const nQ = (ctxQ.notes ?? []).map((n) => n.text ?? '').find((t) => t.startsWith('ทำแล้ว:'));
    note('AC-2 both parts → the card is in review with ONE note "ทำแล้ว: …\nลองได้โดย: …"', full?.result?.s === 200 && cardQ.status === 'review' && !!nQ && nQ.includes('ลองได้โดย: รัน node server.js'), `HTTP ${full?.result?.s} · ${cardQ.status} · ${JSON.stringify(nQ)}`);
    await page.goto(`${WEB}/p/${pid}/c/${cQ.id}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
    const scr = await page.innerText('main').catch(() => page.innerText('body')); await page.screenshot({ path: path.join(OUT, 's16-card-note.png'), fullPage: true });
    note('AC-2 the owner sees the note on the card screen', scr.includes('ทำแล้ว:') && scr.includes('ลองได้โดย:') && scr.includes('node server.js'), JSON.stringify(scr.slice(scr.indexOf('ทำแล้ว:'), scr.indexOf('ทำแล้ว:') + 120)));
    const opR = await call('PATCH', `/v1/cards/${cF.id}/status`, { status: 'review' });
    note('AC-1 neighbour (Q1 e): the OPERATOR may still move a card to review without a note', opR.s === 200, `HTTP ${opR.s}`);
  }
  // ---------------- S17: REQ-125 AC-3 — a BE card to the FE needs a reason; BE → QA never does ----------------
  if (want('S17')) { const { pid, ids, names } = await project('TEST-125 S17');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['handoff:ฝน', 'handoff-reason:ฝน'], [ids.FE]: ['comment'], [ids.QA]: ['comment'] }));
    const c1 = await mk(pid, ids, 'ทำ API', 'BE');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['handoff:ฝน', 'handoff-reason:ฝน'], [ids.FE]: ['comment'], [ids.QA]: ['comment'] }));
    const run = await runAuto(pid, 'S17', 3);
    // a refused hand-off ends that hop `failed` = the card's turn in this run (REQ-119); the stub does not retry inside the hop as a real
    // worker would, so the hand-off WITH a reason is the card's next turn, in a second อัตโนมัติ
    const runB = await runAuto(pid, 'S17 with reason', 3); fs.writeFileSync(path.join(OUT, 's17-run.json'), JSON.stringify(run, null, 1));
    const recs = recsOf().filter((r) => r.cardId === c1.id && r.worker === ids.BE).sort((a, b) => a.turn - b.turn);
    const noReason = recs.find((r) => r.action === 'handoff:ฝน'), withReason = recs.find((r) => r.action === 'handoff-reason:ฝน');
    const card = (await call('GET', `/v1/cards/${c1.id}`)).j;
    fs.writeFileSync(path.join(OUT, 's17-handoffs.json'), JSON.stringify({ noReason: noReason?.result, withReason: withReason?.result }, null, 1));
    const m = JSON.stringify(noReason?.result?.j ?? '');
    note('AC-3 BE → FE with NO reason → refused (409 wrong_role), message names the card\'s role, the card stays with the BE', noReason?.result?.s === 409 && m.includes('ส่งต่อการ์ดนี้ไม่ได้') && m.includes('BE'), `HTTP ${noReason?.result?.s} · ${m.slice(0, 260)}`);
    note('AC-3 the same hand-off WITH a reason → goes through (card now ฝน\'s) and the note keeps the reason', withReason?.result?.s === 200 && card.assigneeId === ids.FE, `HTTP ${withReason?.result?.s} · assignee ${names[card.assigneeId]}`);
    const ctx = (await call('GET', `/v1/cards/${c1.id}/context`)).j;
    note('AC-3 the reason is kept where the owner sees it', JSON.stringify(ctx.notes ?? []).includes('ต้องให้ทำส่วนหน้าเว็บต่อ'), JSON.stringify((ctx.notes ?? []).map((n) => (n.text ?? '').slice(0, 80))).slice(0, 300));
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['handoff:มิ้นท์'] }));
    const c2 = await mk(pid, ids, 'ทำ API อีกงาน', 'BE'); // made only now, so run 1 never touched it
    const run2 = await runAuto(pid, 'S17 to QA', 6);
    const toQA = recsOf().find((r) => r.cardId === c2.id && r.worker === ids.BE && r.action === 'handoff:มิ้นท์');
    note('AC-3 neighbour (Q1 b): BE → QA with no reason → goes through', toQA?.result?.s === 200 && (await call('GET', `/v1/cards/${c2.id}`)).j.assigneeId === ids.QA, `HTTP ${toQA?.result?.s}`);
  }
  // ---------------- S15: round 2 (req 7) — the restart rule on the LAST call's prompt: real-sized calls keep one process; a call over the limit restarts ----------------
  if (want('S15')) { const { pid, ids, names } = await project('TEST-122 S15');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['ctx:60000|done'], [ids.BE]: ['ctx:200000|done'] }));
    const sa = [], be = []; for (const n of [1, 2, 3]) { sa.push(await mk(pid, ids, `SA งาน ${n}`, 'SA')); be.push(await mk(pid, ids, `BE งาน ${n}`, 'BE')); }
    const run = await runAuto(pid, 'S15', 6); fs.writeFileSync(path.join(OUT, 's15-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.runId === run.id && h.cardId); const recs = recsOf().filter((r) => hops.some((h) => h.id === r.hop)).sort((a, b) => Date.parse(a.t0) - Date.parse(b.t0));
    const of = (w) => recs.filter((r) => r.worker === ids[w]).map((r) => `${r.pid}/${r.task}`);
    note('AC-9 (req 7) real-sized last calls (60,000 tokens): ใบเตย\'s 3 tasks in ONE process (no restart on task 2)', of('SA').length === 3 && new Set(recs.filter((r) => r.worker === ids.SA).map((r) => r.pid)).size === 1, of('SA').join(' '));
    note('AC-9 (AC-3 with the new rule) last call over the limit (200,000): แบงค์\'s every next task in a NEW process', of('BE').length === 3 && new Set(recs.filter((r) => r.worker === ids.BE).map((r) => r.pid)).size === 3, of('BE').join(' '));
    const rl = fs.readFileSync(path.join(OUT, 'runner.log'), 'utf8') + fs.readFileSync(path.join(OUT, 'runner.err.log'), 'utf8');
    const why = rl.split('\n').filter((l) => l.includes('starting a new process') && l.includes(pid)).map((l) => l.replace(/.*— /, ''));
    note('AC-9 the runner log gives the reason "(the last call\'s prompt)" for each of แบงค์\'s restarts, none for ใบเตย', why.length === 2 && why.every((w) => w.includes("the last call's prompt") && w.includes('200000')) && !rl.split('\n').some((l) => l.includes('starting a new process') && l.includes(ids.SA)), JSON.stringify(why));
    const last = recs.filter((r) => r.worker === ids.BE).at(-1);
    note('AC-9 the restarted task still does its own card with full context', last && last.contextStatus === 200 && (await call('GET', `/v1/cards/${last.cardId}`)).j.status === 'done', `card ${be.findIndex((c) => c.id === last?.cardId) + 1} ctx ${last?.contextStatus}`);
  }
  // ---------------- S14: AC-3 — run with QA_RUNNER_ENV RUNNER_WORKER_MAX_TASKS=2: the 3rd task starts a NEW process, with its full context ----------------
  if (want('S14')) { const { pid, ids, names } = await project('TEST-122 S14');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['done'] }));
    const cs = []; for (const n of [1, 2, 3]) cs.push(await mk(pid, ids, `งาน SA ${n}`, 'SA'));
    const run = await runAuto(pid, 'S14', 3); fs.writeFileSync(path.join(OUT, 's14-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.runId === run.id && h.cardId); const recs = recsOf().filter((r) => hops.some((h) => h.id === r.hop)).sort((a, b) => Date.parse(a.t0) - Date.parse(b.t0));
    info(`S14 tasks: ${recs.map((r) => `pid ${r.pid} task ${r.task} card #${cs.findIndex((c) => c.id === r.cardId) + 1} ctx ${r.contextStatus}`).join(' · ')}`);
    note('AC-3 limit 2: tasks 1–2 in one process, task 3 in a NEW process (restarted)', recs.length === 3 && recs[0].pid === recs[1].pid && recs[2].pid !== recs[0].pid && recs[2].task === 1, recs.map((r) => `${r.pid}/${r.task}`).join(' '));
    const r3 = recs[2]; const c3 = cs.find((c) => c.id === r3?.cardId);
    note('AC-3 the restarted worker\'s task still does the right card with full context (its card id in the prompt, card_context 200 for that card, card done)', !!c3 && (r3.prompt ?? '').includes(`Your card is ${c3.id}`) && r3.contextStatus === 200 && r3.contextCard === c3.id && (await call('GET', `/v1/cards/${c3.id}`)).j.status === 'done', `#${c3?.number} ctx ${r3?.contextStatus} · ${(r3?.prompt ?? '').split('\n').filter((l) => /^(2\.|You may hand|Other cards)/.test(l)).length} rule lines`);
  }
  // ---------------- S9: REQ-121 AC-1 (BE ↔ FE in the starting chain) and AC-2 (each card hop told to do only its card's work) ----------------
  if (want('S9')) { const { pid, ids, names } = await project('TEST-121 S9');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.BE]: ['handoff-reason:ฝน'], [ids.FE]: ['comment'] })); // REQ-125: BE → FE now carries a reason (the refusal without one is S17)
    const c1 = await mk(pid, ids, 'ทำ server', 'BE'); const c2 = await mk(pid, ids, 'ทำหน้าเว็บ', 'FE');
    const run = await runAuto(pid, 'S9', 3); fs.writeFileSync(path.join(OUT, 's9-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.runId === run.id); const recs = hops.map((h) => recOf(h.id));
    info(`S9 hops: ${hops.map((h, i) => `${names[h.workerId]}:#${h.cardId === c1.id ? 1 : 2}:${h.outcome}:${recs[i]?.action}→${recs[i]?.result?.s ?? '-'}`).join(', ')}`);
    const be = recs.find((r) => r?.worker === ids.BE); const fe = recs.find((r) => r?.worker === ids.FE);
    const line = (r) => (r?.prompt ?? '').split('\n').find((l) => l.startsWith('You may hand off to:')) ?? '';
    for (const r of recs.filter(Boolean)) fs.writeFileSync(path.join(OUT, `s9-prompt-${names[r.worker]}-${r.cardId === c1.id ? 1 : 2}.txt`), r.prompt ?? '');
    note('AC-1 แบงค์ (BE) is offered ฝน (FE) as well as มิ้นท์ (QA)', line(be).includes('ฝน (FE)') && line(be).includes('มิ้นท์ (QA)'), JSON.stringify(line(be)));
    note('AC-1 card_context.handOffTo for แบงค์ holds ฝน (FE)', (be?.handOffTo ?? []).some((x) => x.name === 'ฝน' && x.roles.includes('FE')), JSON.stringify(be?.handOffTo));
    const card1 = (await call('GET', `/v1/cards/${c1.id}`)).j;
    note('AC-1 a hand-off แบงค์ → ฝน (by name) works: 200, #1 now ฝน\'s', be?.result?.s === 200 && card1.assigneeId === ids.FE, `HTTP ${be?.result?.s} · assignee ${names[card1.assigneeId]}`);
    note('AC-1 ฝน (FE) is offered แบงค์ (BE) back, and มิ้นท์ (QA)', line(fe).includes('แบงค์ (BE)') && line(fe).includes('มิ้นท์ (QA)'), JSON.stringify(line(fe)));
    const R2 = "2. Do only your card's work — its title and its `todo`.", R7 = '7. If you find work that no card holds, say so in a `comment` (what is missing and why) — do not build it yourself.';
    note('AC-2 แบงค์\'s hop on #1 is told rule 2 ("Do only your card\'s work…") and rule 7 ("…do not build it yourself")', (be?.prompt ?? '').includes(R2) && (be?.prompt ?? '').includes(R7), JSON.stringify((be?.prompt ?? '').split('\n').filter((l) => l.startsWith('2.') || l.startsWith('7.')).map((l) => l.slice(0, 120))));
    const other = (be?.prompt ?? '').split('\n').find((l) => l.startsWith('Other cards hold their own work')) ?? '';
    note('AC-2 …and shown the other card it must leave alone: "#2 ทำหน้าเว็บ (ฝน FE, todo|doing)" — doing now that ฝน works at the same time (REQ-122)', /#\d+ ทำหน้าเว็บ \(ฝน FE, (todo|doing)\)/.test(other) && other.includes(`#${c2.number} ทำหน้าเว็บ`) && !other.includes(`#${c1.number} `), JSON.stringify(other));
    const feOn2 = recs.find((r) => r?.worker === ids.FE && r.cardId === c2.id) ?? recs.find((r) => r?.worker === ids.FE);
    note('AC-2 ฝน\'s hop gets the same rules', (feOn2?.prompt ?? '').includes(R2) && (feOn2?.prompt ?? '').includes(R7), (feOn2?.prompt ?? '').split('\n').find((l) => l.startsWith('Other cards')) ?? '(no other-cards line)');
  }
  // ---------------- S8: REQ-120 AC-1/AC-2 — run 1 with 2 uses 2 of 2; a SECOND อัตโนมัติ with the same 2 takes its own 2 steps ----------------
  if (want('S8')) { const { pid, ids } = await project('TEST-120 S8');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['comment'], [ids.FE]: ['comment'] }));
    await mk(pid, ids, 'งาน A', 'SA'); await mk(pid, ids, 'งาน B', 'FE'); // 4 turns available per run (2 cards × 2), so the budget is what stops it
    const runHops = async (run) => (await hopsOf(pid)).filter((h) => h.runId === run.id).length;
    const steps = (r) => (r.report ?? '').split('\n').find((l) => l.includes('ก้าว จากงบ')) ?? '';
    const r1 = await runAuto(pid, 'S8 run 1', 2); fs.writeFileSync(path.join(OUT, 's8-run1.json'), JSON.stringify(r1, null, 1));
    note('S8 run 1 with 2 → 2 hops, budget_spent, "2 ก้าว จากงบ 2"', r1.stopReason === 'budget_spent' && (await runHops(r1)) === 2 && steps(r1).includes('2 ก้าว จากงบ 2'), `${r1.stopReason} · ${await runHops(r1)} hops · ${JSON.stringify(steps(r1))}`);
    const t2 = Date.now(); const r2 = await runAuto(pid, 'S8 run 2', 2); fs.writeFileSync(path.join(OUT, 's8-run2.json'), JSON.stringify(r2, null, 1));
    note('AC-1 a SECOND อัตโนมัติ with the same 2 (the real dialog) takes its own 2 steps — it does not end at once', (await runHops(r2)) === 2 && r2.stopReason === 'budget_spent', `${await runHops(r2)} hops · ${r2.stopReason} · ${((Date.parse(r2.endedAt) - Date.parse(r2.startedAt)) / 1000).toFixed(1)} s`);
    note('AC-2 run 2\'s report counts its own steps: "2 ก้าว จากงบ 2", reason "ใช้งบครบแล้ว" — true this time', steps(r2).includes('2 ก้าว จากงบ 2') && reason(r2.report).includes('- เหตุที่จบรอบ: ใช้งบครบแล้ว'), `${JSON.stringify(steps(r2))} · ${JSON.stringify(reason(r2.report))}`);
    const r3 = await runAuto(pid, 'S8 run 3', 1); fs.writeFileSync(path.join(OUT, 's8-run3.json'), JSON.stringify(r3, null, 1));
    note('AC-1 neighbour: a third run with 1 → 1 own step, "1 ก้าว จากงบ 1"', (await runHops(r3)) === 1 && steps(r3).includes('1 ก้าว จากงบ 1'), `${await runHops(r3)} hops · ${JSON.stringify(steps(r3))}`);
    const total = (await hopsOf(pid)).filter((h) => h.cardId).length;
    note('AC-2 neighbour: the project has 5 card hops in all (2 + 2 + 1) — no run borrowed another\'s count', total === 5, `${total}`);
    const board = await shot(`/p/${pid}`, 's8-board');
    info(`S8 board strip: ${JSON.stringify(board.split('\n').filter((l) => /งบ|ก้าว|การรัน/.test(l)).slice(0, 4))}`);
  }
  // ---------------- S1: AC-1 — a card whose hop only comments ----------------
  if (want('S1')) { const { pid, ids, names } = await project('TEST-119 S1');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['comment'] }));
    const c1 = await mk(pid, ids, 'ออกแบบ Health Board', 'SA');
    const run = await runAuto(pid, 'S1'); fs.writeFileSync(path.join(OUT, 's1-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.cardId === c1.id);
    info(`S1 hops on #1: ${hops.map((h) => `${names[h.workerId]}:${h.outcome}`).join(', ')} · stop ${run.stopReason} · reason ${JSON.stringify(reason(run.report))}`);
    note('AC-1 the commented card gets ONE more turn (2 hops on #1 by ใบเตย, both commented), not a loop', hops.length === 2 && hops.every((h) => h.outcome === 'commented' && h.workerId === ids.SA), `${hops.length} hops`);
    note('AC-1 the run does NOT end nothing_workable; it ends no_progress', run.stopReason === 'no_progress', run.stopReason);
    note('AC-1 the report names the card in the PM\'s words, never "ไม่มีงานที่ทำต่อได้"', reason(run.report).some((l) => l === `- เหตุที่จบรอบ: #${c1.number} ${c1.title} ${tail(2)}`) && !(run.report ?? '').includes(NO_WORK), JSON.stringify(reason(run.report)));
    const card = (await call('GET', `/v1/cards/${c1.id}`)).j;
    note('AC-1 the card is still todo and workable', card.status === 'todo' && card.workable === true, `${card.status} workable ${card.workable}`);
    const board = await shot(`/p/${pid}`, 's1-board');
    note('AC-1 the board\'s run strip says "มีงานที่ยังทำต่อได้ แต่ไม่คืบ", not "ไม่มีงานที่ทำต่อได้"', board.includes(STRIP) && !board.includes(NO_WORK), JSON.stringify(board.split('\n').filter((l) => l.includes('ไม่คืบ') || l.includes('ทำต่อได้')).slice(0, 4)));
    // AC-2 — what the SA's hop was told
    const r = recOf(hops[0].id);
    const line = (r?.prompt ?? '').split('\n').find((l) => l.startsWith('You may hand off to:')) ?? '';
    info(`S1 SA prompt line: ${JSON.stringify(line)} · handOffTo ${JSON.stringify(r?.handOffTo)}`);
    note('AC-2 the SA\'s prompt names its recipients by name + role ("ฝน (FE)", "แบงค์ (BE)"), no bare id', line.includes('ฝน (FE)') && line.includes('แบงค์ (BE)') && !/[0-9a-f]{8}-[0-9a-f]{4}/.test(line), JSON.stringify(line));
    note('AC-2 card_context.handOffTo = name + roles + id for each', Array.isArray(r?.handOffTo) && r.handOffTo.length >= 2 && r.handOffTo.every((x) => x.name && x.roles?.length && x.id), JSON.stringify(r?.handOffTo));
    fs.writeFileSync(path.join(OUT, 's1-sa-prompt.txt'), r?.prompt ?? '');
    // a second อัตโนมัติ gives the card its turns again (the words promise "กด อัตโนมัติ เพื่อลองต่อ")
    const run2 = await runAuto(pid, 'S1 again');
    const hops2 = (await hopsOf(pid)).filter((h) => h.cardId === c1.id && h.runId === run2.id);
    note('AC-1 neighbour: pressing อัตโนมัติ again → the card gets its turns again (2), then the same honest stop', hops2.length === 2 && run2.stopReason === 'no_progress', `${hops2.length} hops · ${run2.stopReason} · ${JSON.stringify(reason(run2.report))}`);
  }
  // ---------------- S2: hand-off BY NAME on the second turn; then BE only comments ----------------
  if (want('S2')) { const { pid, ids, names } = await project('TEST-119 S2');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['comment', 'handoff:แบงค์'], [ids.BE]: ['comment'] }));
    const c1 = await mk(pid, ids, 'ทำ API ตามแบบ', 'SA');
    const run = await runAuto(pid, 'S2'); fs.writeFileSync(path.join(OUT, 's2-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.cardId === c1.id);
    const recs = hops.map((h) => recOf(h.id));
    info(`S2 hops: ${hops.map((h, i) => `${names[h.workerId]}:${h.outcome}:${recs[i]?.action}→${recs[i]?.result?.s ?? '-'}`).join(', ')} · stop ${run.stopReason} · reason ${JSON.stringify(reason(run.report))}`);
    const ho = recs.find((r) => r?.action === 'handoff:แบงค์');
    const card = (await call('GET', `/v1/cards/${c1.id}`)).j;
    note('AC-2 a hand-off BY NAME ("แบงค์") is accepted and the card goes to แบงค์\'s id', ho?.result?.s === 200 && card.assigneeId === ids.BE, `HTTP ${ho?.result?.s} · assignee ${names[card.assigneeId]}`);
    note('AC-1 the comment-then-hand-off turn counts as progress: แบงค์ then gets its own turns', hops.filter((h) => h.workerId === ids.BE).length === 2, hops.map((h) => names[h.workerId]).join(','));
    note('AC-1 the stop names #1 again', run.stopReason === 'no_progress' && reason(run.report).some((l) => l.startsWith(`- เหตุที่จบรอบ: #${c1.number} ${c1.title} ยังทำต่อได้ แต่ทำ `)), JSON.stringify(reason(run.report)));
    // round 2 (REQ-119 req 4, AC-4): only the turns since the last progress (the hand-off) count — แบงค์'s 2, not all 4
    note('AC-4 after the hand-off the stop says "ทำ 2 รอบแล้วไม่คืบ" (not 4)', reason(run.report).some((l) => l === `- เหตุที่จบรอบ: #${c1.number} ${c1.title} ${tail(2)}`), JSON.stringify(reason(run.report)));
    const be = recs.find((r) => r?.worker === ids.BE);
    const line = (be?.prompt ?? '').split('\n').find((l) => l.startsWith('You may hand off to:')) ?? '';
    note('AC-2 แบงค์\'s prompt names its recipient as "มิ้นท์ (QA)"', line.includes('มิ้นท์ (QA)') && !/[0-9a-f]{8}-[0-9a-f]{4}/.test(line), JSON.stringify(line));
  }
  // ---------------- S3: hand-off BY ID; an unknown name is refused naming who is allowed ----------------
  if (want('S3')) { const { pid, ids, names } = await project('TEST-119 S3');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: [`handoff:${ids.FE}`], [ids.FE]: ['handoff:ใครก็ไม่รู้', 'comment'] }));
    const c1 = await mk(pid, ids, 'ทำหน้าเว็บ', 'SA');
    const run = await runAuto(pid, 'S3'); fs.writeFileSync(path.join(OUT, 's3-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.cardId === c1.id);
    const recs = hops.map((h) => recOf(h.id));
    info(`S3 hops: ${hops.map((h, i) => `${names[h.workerId]}:${h.outcome}:${recs[i]?.action}→${recs[i]?.result?.s ?? '-'}`).join(', ')} · stop ${run.stopReason} · reason ${JSON.stringify(reason(run.report))}`);
    const byId = recs.find((r) => r?.action === `handoff:${ids.FE}`);
    note('AC-2 a hand-off BY ID still works', byId?.result?.s === 200, `HTTP ${byId?.result?.s}`);
    const bad = recs.find((r) => r?.action === 'handoff:ใครก็ไม่รู้');
    fs.writeFileSync(path.join(OUT, 's3-refusal.json'), JSON.stringify(bad?.result, null, 1));
    const body = JSON.stringify(bad?.result?.j ?? '');
    note('AC-2 neighbour: an unknown name is refused, and the refusal names who is allowed (name + role)', bad && bad.result.s >= 400 && body.includes('ฝน') === false && /มิ้นท์|แบงค์|ใบเตย/.test(body), `HTTP ${bad?.result?.s} · ${body.slice(0, 300)}`);
    info(`S3 end: ${run.stopReason} · ${JSON.stringify(reason(run.report))} · card assignee ${names[(await call('GET', `/v1/cards/${c1.id}`)).j.assigneeId]}`);
  }
  // ---------------- S4: two commented cards — fresh turns first, the lowest-numbered card is named ----------------
  if (want('S4')) { const { pid, ids, names } = await project('TEST-119 S4');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['comment'], [ids.FE]: ['comment'] }));
    const c1 = await mk(pid, ids, 'งานแรก', 'SA'); const c2 = await mk(pid, ids, 'งานสอง', 'FE');
    const run = await runAuto(pid, 'S4'); fs.writeFileSync(path.join(OUT, 's4-run.json'), JSON.stringify(run, null, 1));
    const order = (await hopsOf(pid)).filter((h) => h.runId === run.id).map((h) => `#${h.cardId === c1.id ? 1 : 2}`);
    note('AC-1 neighbour: two commented cards → order #1, #2, #1, #2 (fresh turns first), then the stop names #1 only', order.join(',') === '#1,#2,#1,#2' && run.stopReason === 'no_progress' && reason(run.report).some((l) => l.includes(`#${c1.number} ${c1.title}`)) && !reason(run.report).some((l) => l.includes(c2.title)), `${order.join(',')} · ${JSON.stringify(reason(run.report))}`);
  }
  // ---------------- S5: budget still ends a run (unchanged) ----------------
  if (want('S5')) { const { pid, ids } = await project('TEST-119 S5');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['comment'] }));
    await mk(pid, ids, 'งานงบหนึ่ง', 'SA');
    const run = await runAuto(pid, 'S5', 1);
    note('regression: budget 1 → 1 hop, budget_spent (the second turn does not override the budget)', run.stopReason === 'budget_spent' && (await hopsOf(pid)).filter((h) => h.runId === run.id).length === 1, `${run.stopReason} · ${JSON.stringify(reason(run.report))}`);
  }
  // ---------------- S7: AC-4 / Q4a — the newest hop made progress (todo → doing), the turn is used up: count 0 → the generic line ----------------
  if (want('S7')) { const { pid, ids, names } = await project('TEST-119 S7');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['status:doing'] }));
    const c1 = await mk(pid, ids, 'งานเริ่มแล้ว', 'SA');
    const run = await runAuto(pid, 'S7'); fs.writeFileSync(path.join(OUT, 's7-run.json'), JSON.stringify(run, null, 1));
    const hops = (await hopsOf(pid)).filter((h) => h.cardId === c1.id && h.runId === run.id);
    const recs = hops.map((h) => recOf(h.id)); const card = (await call('GET', `/v1/cards/${c1.id}`)).j;
    info(`S7 hops: ${hops.map((h, i) => `${names[h.workerId]}:${h.outcome}:${recs[i]?.action}→${recs[i]?.result?.s ?? '-'}`).join(', ')} · card ${card.status} workable ${card.workable} · stop ${run.stopReason} · ${JSON.stringify(reason(run.report))}`);
    note('AC-4 / Q4a: count 0 → the generic line "เหตุที่จบรอบ: มีงานที่ยังทำต่อได้ แต่ไม่คืบ", no number, never "ทำ 0 รอบ"', run.stopReason === 'no_progress' ? reason(run.report).some((l) => l === `- เหตุที่จบรอบ: ${STRIP}`) && !(run.report ?? '').includes('ทำ 0 รอบ') : true, `${run.stopReason} · ${JSON.stringify(reason(run.report))}`);
    if (run.stopReason !== 'no_progress') info(`S7 did not stop no_progress (${run.stopReason}) — the Q4a path was not reached this way`);
  }
  // ---------------- S6: AC-3 — REQ-117's review line; "รอคุณ — ไม่มี"; nothing workable still says so ----------------
  if (want('S6')) { const { pid, ids } = await project('TEST-119 S6');
    const c1 = await mk(pid, ids, 'ออกแบบ Health Board', 'SA');
    const c2 = await mk(pid, ids, 'ทำ API', 'BE', [c1.id]); await mk(pid, ids, 'ทำหน้าเว็บ', 'FE', [c1.id]); await mk(pid, ids, 'ทดสอบทั้งหมด', 'QA', [c2.id]);
    await call('PATCH', `/v1/cards/${c1.id}/status`, { status: 'review' });
    const run = await runAuto(pid, 'S6'); fs.writeFileSync(path.join(OUT, 's6-run.json'), JSON.stringify(run, null, 1));
    const line = (run.report ?? '').split('\n').filter((l) => l.includes('รอคุณตรวจ'));
    note('AC-3 REQ-117: the review line unchanged ("รอคุณตรวจ: ออกแบบ Health Board — มีอีก 3 งานรออยู่"), stop nothing_workable', run.stopReason === 'nothing_workable' && line.includes('- รอคุณตรวจ: ออกแบบ Health Board — มีอีก 3 งานรออยู่'), JSON.stringify(line));
    note('AC-3 a truly nothing-workable run still says "ไม่มีงานที่ทำต่อได้"', reason(run.report).some((l) => l.includes(NO_WORK)), JSON.stringify(reason(run.report)));
    const { pid: pidB } = await project('TEST-119 S6b');
    const runB = await runAuto(pidB, 'S6b'); fs.writeFileSync(path.join(OUT, 's6b-run.json'), JSON.stringify(runB, null, 1));
    note('AC-3 no cards → "รอคุณ — ไม่มี", no review line, nothing_workable', /รอคุณ\n- ไม่มี/.test(runB.report ?? '') && !(runB.report ?? '').includes('รอคุณตรวจ') && runB.stopReason === 'nothing_workable', JSON.stringify((runB.report ?? '').split('\n').slice(0, 8)));
    await shot(`/p/${pid}`, 's6-board');
  }
} catch (e) { console.log('ERROR', e.stack); }
finally { await browser.close(); for (const p of procs) p.kill(); await sleep(1000); console.log(`run dir ${RUN}`); }
