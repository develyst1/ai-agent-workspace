// TEST-119 (REQ-119) — real caw-back API + runner + caw-front (TASK-147/148 trees) with QA's stub CLI (qa-claude.ts), from TEST-117's r117.mjs.
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
spawn([process.execPath, '--no-env-file', 'run', 'src/runner/main.ts'], path.join(X, 'caw-back'), { CAW_API_URL: API, CAW_WORKSPACE_ROOT: ROOT, RUNNER_POLL_MS: '300', RUNNER_HOP_MAX_MS: '60000', CLAUDE_BIN: stub }, 'runner');
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
const tail = (t) => `ยังทำต่อได้ แต่ทำ ${t} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู`;
const STRIP = 'มีงานที่ยังทำต่อได้ แต่ไม่คืบ';
try {
  // ---------------- S1: AC-1 — a card whose hop only comments ----------------
  { const { pid, ids, names } = await project('TEST-119 S1');
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
  { const { pid, ids, names } = await project('TEST-119 S2');
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
  { const { pid, ids, names } = await project('TEST-119 S3');
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
  { const { pid, ids, names } = await project('TEST-119 S4');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['comment'], [ids.FE]: ['comment'] }));
    const c1 = await mk(pid, ids, 'งานแรก', 'SA'); const c2 = await mk(pid, ids, 'งานสอง', 'FE');
    const run = await runAuto(pid, 'S4'); fs.writeFileSync(path.join(OUT, 's4-run.json'), JSON.stringify(run, null, 1));
    const order = (await hopsOf(pid)).filter((h) => h.runId === run.id).map((h) => `#${h.cardId === c1.id ? 1 : 2}`);
    note('AC-1 neighbour: two commented cards → order #1, #2, #1, #2 (fresh turns first), then the stop names #1 only', order.join(',') === '#1,#2,#1,#2' && run.stopReason === 'no_progress' && reason(run.report).some((l) => l.includes(`#${c1.number} ${c1.title}`)) && !reason(run.report).some((l) => l.includes(c2.title)), `${order.join(',')} · ${JSON.stringify(reason(run.report))}`);
  }
  // ---------------- S5: budget still ends a run (unchanged) ----------------
  { const { pid, ids } = await project('TEST-119 S5');
    fs.writeFileSync(modeFile, JSON.stringify({ [ids.SA]: ['comment'] }));
    await mk(pid, ids, 'งานงบหนึ่ง', 'SA');
    const run = await runAuto(pid, 'S5', 1);
    note('regression: budget 1 → 1 hop, budget_spent (the second turn does not override the budget)', run.stopReason === 'budget_spent' && (await hopsOf(pid)).filter((h) => h.runId === run.id).length === 1, `${run.stopReason} · ${JSON.stringify(reason(run.report))}`);
  }
  // ---------------- S7: AC-4 / Q4a — the newest hop made progress (todo → doing), the turn is used up: count 0 → the generic line ----------------
  { const { pid, ids, names } = await project('TEST-119 S7');
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
  { const { pid, ids } = await project('TEST-119 S6');
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
