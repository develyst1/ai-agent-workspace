// TEST-117 (REQ-117) — real caw-back API + runner + caw-front (TASK-143/144 trees) with QA's stub CLI, Blueprint = the real blueprint-back
// export (not under test; it only gives CAW a project). A FRESH CAW_WORKSPACE_ROOT: guard hooks linked (the runner needs them), NO .claude/skills.
// usage (from this folder): bun r117.mjs <export root> <guard-hooks workspace> <refusing gateway url>
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

const RUN = fs.mkdtempSync(path.join(os.tmpdir(), 'qa117-'));
const ROOT = path.join(RUN, 'root'); fs.mkdirSync(ROOT); fs.symlinkSync(path.join(HOOKS_WS, 'scripts'), path.join(ROOT, 'scripts'));
note('setup: the fresh root has no .claude/skills', !fs.existsSync(path.join(ROOT, '.claude')), ROOT);
const modeFile = path.join(RUN, 'mode.txt'); fs.writeFileSync(modeFile, 'x');
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
const project = async (name) => { const p = await bp('POST', '/v1/projects', { name, theme: 'clean-blue' }); await bp('POST', `/v1/projects/${p.id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.add', ref: '$w', kind: 'work', title: 'งานทดสอบ', body: { goal: 'TEST-117' }, origin: { stamp: 'operator', date: '2026-10-30', note: 'TEST-117 seed' } }] }); return (await call('POST', '/v1/projects', { blueprintProjectId: p.id })).j.id; };
const runAuto = async (pid, label) => {
  const n0 = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs.length;
  await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' });
  await page.getByText('อัตโนมัติ', { exact: true }).last().click(); await page.waitForTimeout(800);
  const dlg = page.getByRole('dialog').first(); await dlg.getByRole('button', { name: 'อัตโนมัติ' }).first().click();
  await until(`${label} run ends`, 60, async () => { const r = (await call('GET', `/v1/projects/${pid}/runs`)).j.runs; return r.length > n0 && !!r[0].endedAt; });
  return (await call('GET', `/v1/projects/${pid}/runs`)).j.runs[0];
};
try {
  // ---------------- AC-1 ----------------
  const pid = await project('TEST-117 A'); fs.writeFileSync(path.join(OUT, 'project-a.txt'), pid);
  await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' });
  await page.getByText('ใช้ทีมเริ่มต้น').first().click(); await page.waitForTimeout(2500);
  const chain = (await call('GET', `/v1/projects/${pid}/chain`)).j;
  info(`team: ${chain.members.map((m) => `${m.name}(${m.skills.join(',')})`).join(' · ')}`);
  fs.mkdirSync(path.join(ROOT, 'hb')); await page.reload({ waitUntil: 'networkidle' });
  await page.locator('input[placeholder*="path"]').first().fill(path.join(ROOT, 'hb')); await page.getByText('เพิ่มโฟลเดอร์').first().click(); await page.waitForTimeout(1500);
  await page.goto(`${WEB}/p/${pid}/chat`, { waitUntil: 'networkidle' });
  const box = page.locator('textarea').first(); await box.fill('สวัสดีครับ ช่วยดูงานนี้หน่อย'); await box.press('Enter');
  await until('chat hop ends', 60, async () => (await call('GET', `/v1/projects/${pid}/hops`)).j.hops.some((h) => h.endedAt));
  const hop = (await call('GET', `/v1/projects/${pid}/hops`)).j.hops[0];
  const runnerLog = fs.readFileSync(path.join(OUT, 'runner.err.log'), 'utf8') + fs.readFileSync(path.join(OUT, 'runner.log'), 'utf8');
  note('AC-1 the first chat hop of the starting team STARTS on a fresh root (no "skill … not found")', hop.outcome !== 'stopped' && !/not found/.test(runnerLog), `hop ${hop.id.slice(0, 13)} outcome ${hop.outcome} · note ${JSON.stringify(hop.note ?? '').slice(0, 80)} · runner "not found" ${/not found/.test(runnerLog)}`);
  const rec = JSON.parse(fs.readFileSync(`${modeFile}.hop-${hop.id}.json`, 'utf8'));
  note('AC-1 the CLI was handed the PM role skill text', /role-pm|Project Manager|PM/.test(rec.skills ?? '') && (rec.skills ?? '').length > 200, `${(rec.skills ?? '').length} chars from ${rec.skillsFile}`);
  note('AC-1 (Q1) the skill carries the PM\'s sentence', (rec.skills ?? '').includes("Before you ask the operator anything, read the card's `spec.decisions` and `spec.relatedDecisions`; ask only what they do not answer."), '');
  note('AC-1 nothing was written into the fresh root\'s .claude by the runner', !fs.existsSync(path.join(ROOT, '.claude')), `exists ${fs.existsSync(path.join(ROOT, '.claude'))}`);
  fs.writeFileSync(path.join(OUT, 'ac1-skills.txt'), rec.skills ?? '');
  const chatText = await shot(`/p/${pid}/chat`, 'ac1-chat');
  note('AC-1 the reply shows in the chat', chatText.includes('รับทราบครับ (TEST-117 stub)'), '');

  // ---------------- AC-2 ----------------
  const ids = Object.fromEntries(chain.members.map((m) => [m.roles?.[0] ?? m.role, m.id]));
  const mk = async (title, who, dependsOn = []) => (await call('POST', `/v1/projects/${pid}/cards`, { title, todo: 'TEST-117', anchor: { key: 'WRK-001' }, assigneeId: ids[who], dependsOn })).j;
  const c1 = await mk('ออกแบบ Health Board', 'SA');
  const c2 = await mk('ทำ API', 'BE', [c1.id]);
  const c3 = await mk('ทำหน้าเว็บ', 'FE', [c1.id]);
  const c4 = await mk('ทดสอบทั้งหมด', 'QA', [c2.id]); // transitive: waits on #1 through #2
  const c5 = await mk('เอกสารประกอบ', 'PM'); // a review card that holds nothing up (Q2)
  for (const c of [c1, c5]) { const r = await call('PATCH', `/v1/cards/${c.id}/status`, { status: 'review' }); info(`card #${c.number} → review: ${r.s} ${r.j.status ?? JSON.stringify(r.j).slice(0, 100)}`); }
  info(`cards: ${(await call('GET', `/v1/projects/${pid}/cards`)).j.cards.map((c) => `#${c.number}:${c.status}:w=${c.workable}`).join(' ')}`);
  const run = await runAuto(pid, 'AC-2');
  fs.writeFileSync(path.join(OUT, 'ac2-run.json'), JSON.stringify(run, null, 1));
  const line = (run.report ?? '').split('\n').filter((l) => l.includes('รอคุณตรวจ'));
  info(`report: ${JSON.stringify(run.report)}`);
  note('AC-2 the run ends nothing_workable and the report names #1 with the PM\'s words', run.stopReason === 'nothing_workable' && line.some((l) => l.includes(`รอคุณตรวจ: ${c1.title}`) && /มีอีก \d+ งานรออยู่/.test(l)), JSON.stringify(line));
  note('AC-2 never "รอคุณ — ไม่มี" when a review holds work up', !/รอคุณ\n- ไม่มี/.test(run.report ?? ''), '');
  const n = Number((line.find((l) => l.includes(c1.title)) ?? '').match(/มีอีก (\d+) งาน/)?.[1]);
  note('AC-2 "2 waiting cards" — the count for #1', n === 2, `count ${n} (direct #2, #3; #4 waits through #2) → see Q`);
  note('Q2 a review card that holds nothing up (#5) is not listed', !line.some((l) => l.includes(c5.title)), '');
  const board = await shot(`/p/${pid}`, 'ac2-board');
  const bl = board.split('\n').filter((l) => l.includes('รอคุณตรวจ'));
  note('AC-2 the board shows the same line', bl.some((l) => l.includes(`รอคุณตรวจ: ${c1.title}`) && /มีอีก \d+ งานรออยู่/.test(l)), JSON.stringify(bl));

  // ---------------- AC-3 ----------------
  const pidB = await project('TEST-117 B');
  await page.goto(`${WEB}/p/${pidB}`, { waitUntil: 'networkidle' }); await page.getByText('ใช้ทีมเริ่มต้น').first().click(); await page.waitForTimeout(2500);
  const runB = await runAuto(pidB, 'AC-3');
  fs.writeFileSync(path.join(OUT, 'ac3-run.json'), JSON.stringify(runB, null, 1));
  note('AC-3 a run with nothing waiting on the operator still says "รอคุณ — ไม่มี"', /รอคุณ\n- ไม่มี/.test(runB.report ?? '') && !(runB.report ?? '').includes('รอคุณตรวจ'), JSON.stringify((runB.report ?? '').split('\n').slice(0, 7)));
  const boardB = await shot(`/p/${pidB}`, 'ac3-board');
  note('AC-3 its board shows no review line', !boardB.includes('รอคุณตรวจ'), '');
} catch (e) { console.log('ERROR', e.stack); }
finally { await browser.close(); for (const p of procs) p.kill(); await sleep(1000); console.log(`run dir ${RUN}`); }
