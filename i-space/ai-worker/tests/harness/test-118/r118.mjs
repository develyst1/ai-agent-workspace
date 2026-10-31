// TEST-118 (REQ-118) — the JOINT path: the real blueprint-back + blueprint-front (TASK-145/146) and the real caw-back API + runner + caw-front
// (TASK-149/150), QA's stub CLI (qa-claude.ts). The spec = TEST-106 phase 2's 8 requirements, typed BY HAND on Blueprint's requirements page.
// usage (from this folder): bun r118.mjs <export root> <guard-hooks workspace> <refusing gateway url>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const [X, HOOKS_WS, REFUSE] = process.argv.slice(2);
const OUT = path.resolve('out'); fs.mkdirSync(OUT, { recursive: true });
const BPP = 4292, BPW = 3192, CAWP = 4541, WEBP = 3541;
const BP = `http://127.0.0.1:${BPP}`, BPWEB = `http://127.0.0.1:${BPW}`, API = `http://127.0.0.1:${CAWP}`, WEB = `http://127.0.0.1:${WEBP}`;
const t0 = Date.now(); const ts = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} [${ts()}] ${c} — ${d}`);
const info = (s) => console.log(`    [${ts()}] ${s}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (what, secs, f) => { const s = Date.now(); for (;;) { try { if (await f()) return (Date.now() - s) / 1000; } catch {} if (Date.now() - s > secs * 1000) { info(`gave up ${secs}s: ${what}`); return -1; } await sleep(300); } };
const call = async (method, p, body, actor = 'operator') => { const r = await fetch(API + p, { method, headers: { 'x-caw-actor': actor, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); try { return { s: r.status, j: JSON.parse(t) }; } catch { return { s: r.status, j: t }; } };
const BY = { 'content-type': 'application/json', 'x-blueprint-by': encodeURIComponent('โด่ง') };
const bp = async (method, p, body) => (await fetch(BP + p, { method, headers: BY, body: body ? JSON.stringify(body) : undefined })).json();
const save = (name, v) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(v, null, 1));

// the 8 requirements of TEST-106 phase 2, exactly as hand.mjs typed them (title + the spec line, verbatim)
const lines = fs.readFileSync('../test-106/spec.txt', 'utf8').trim().split('\n');
const EIGHT = [
  ['สิ่งที่สร้าง: I-Space Health Board', lines[0]],
  ['1. บริการ 4 ตัวที่แสดง', lines[1]], ['2. สิ่งที่แสดงต่อบริการ', lines[2]], ['3. เช็คใหม่ทุก 10 วินาที + ปุ่มเช็คตอนนี้', lines[3]],
  ['4. ไม่ตอบใน 3 วินาที = ไม่ตอบ', lines[4]], ['5. รันที่ :3900 ไม่ต้อง login ไม่มีฐานข้อมูล', lines[5]], ['6. ข้อความภาษาไทย', lines[6]],
  ['ไม่ทำ', lines[7]],
];
const TEXTS = EIGHT.map(([, t]) => t);

const RUN = fs.mkdtempSync(path.join(os.tmpdir(), 'qa118-'));
const ROOT = path.join(RUN, 'root'); fs.mkdirSync(ROOT); fs.symlinkSync(path.join(HOOKS_WS, 'scripts'), path.join(ROOT, 'scripts'));
const modeFile = path.join(RUN, 'mode.txt'); fs.writeFileSync(modeFile, 'x');
const stub = path.join(RUN, 'qa-claude.sh'); fs.writeFileSync(stub, `#!/bin/sh\nQA_MODE_FILE='${modeFile}' exec "${process.execPath}" --no-env-file run '${path.resolve('qa-claude.ts')}' "$@"\n`); fs.chmodSync(stub, 0o700);
const clean = Object.fromEntries(Object.entries(process.env).filter(([k]) => !['DATABASE_URL', 'CAW_WORKSPACE_ROOT', 'CLAUDE_BIN', 'CAW_POLL_MS', 'BLUEPRINT_URL', 'BLUEPRINT_API_URL', 'CAW_URL', 'CAW_API_URL', 'GATEWAY_URL', 'CAW_NOTIFY_URL', 'GATEWAY_LIGHT_MODEL'].includes(k)));
const procs = []; const spawn = (cmd, cwd, env, name) => { const p = Bun.spawn(cmd, { cwd, stdout: Bun.file(path.join(OUT, `${name}.log`)), stderr: Bun.file(path.join(OUT, `${name}.err.log`)), env: { ...clean, ...env } }); procs.push(p); return p; };
spawn([process.execPath, '--no-env-file', 'run', 'src/index.ts'], path.join(X, 'blueprint-back'), { PORT: String(BPP), DATABASE_URL: 'pglite:memory', GATEWAY_URL: REFUSE, CAW_NOTIFY_URL: `${API}/v1/notify` }, 'bp');
await until('bp', 30, async () => (await fetch(`${BP}/v1/projects`)).ok);
spawn([path.join(X, 'blueprint-front/node_modules/.bin/next'), 'start', '-p', String(BPW), '-H', '127.0.0.1'], path.join(X, 'blueprint-front'), { BLUEPRINT_API_URL: BP, CAW_URL: WEB }, 'bp-web');
spawn([process.execPath, '--no-env-file', 'run', 'src/index.ts'], path.join(X, 'caw-back'), { PORT: String(CAWP), HOST: '127.0.0.1', DATABASE_URL: `pglite:file:${path.join(RUN, 'db')}`, BLUEPRINT_URL: BP }, 'caw-api');
await until('caw', 30, async () => (await fetch(`${API}/health`)).ok);
spawn([path.join(X, 'caw-front/node_modules/.bin/next'), 'start', '-p', String(WEBP), '-H', '127.0.0.1'], path.join(X, 'caw-front'), { CAW_API_URL: API }, 'web');
await until('bp-web', 60, async () => (await fetch(BPWEB)).status < 500);
await until('web', 60, async () => (await fetch(WEB)).status < 500);
spawn([process.execPath, '--no-env-file', 'run', 'src/runner/main.ts'], path.join(X, 'caw-back'), { CAW_API_URL: API, CAW_WORKSPACE_ROOT: ROOT, RUNNER_POLL_MS: '300', RUNNER_HOP_MAX_MS: '60000', CLAUDE_BIN: stub }, 'runner');
await until('runner', 30, async () => !!(await call('GET', '/v1/team-status')).j?.running);
const { chromium } = createRequire(path.join(X, 'caw-front/package.json'))('@playwright/test');
const browser = await chromium.launch({ channel: 'chrome' }); const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: BPWEB }]);
const page = await ctx.newPage(); page.setDefaultTimeout(30000);
const shot = async (url, name) => { await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(800); await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true }); return page.innerText('body'); };
// a string (the system prompt) holds each text; an array of texts (a context's requirements) holds each one exactly — never JSON.stringify:
// it escapes the quotes three of the texts contain
const has8 = (text) => TEXTS.map((t) => (text ?? '').includes(t));
const has8arr = (arr) => TEXTS.map((t) => (arr ?? []).includes(t));
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
const recs = (kind) => fs.readdirSync(RUN).filter((f) => f.startsWith(`mode.txt.${kind}-`)).map((f) => ({ f, ...JSON.parse(fs.readFileSync(path.join(RUN, f), 'utf8')) }));
try {
  // ---------- the spec, BY HAND on Blueprint's requirements page (as TEST-106 phase 2 AC-1) ----------
  const bpp = await bp('POST', '/v1/projects', { name: 'TEST-118 Health Board (by hand)', theme: 'clean-blue' });
  fs.writeFileSync(path.join(OUT, 'bp-project-id.txt'), bpp.id);
  for (const [title, text] of EIGHT) {
    await page.goto(`${BPWEB}/p/${bpp.id}/requirements`, { waitUntil: 'networkidle' });
    await page.getByText('เพิ่ม requirement').first().click(); await page.waitForTimeout(400);
    await page.locator('input').first().fill(title); await page.locator('textarea').first().fill(text);
    await page.getByRole('button', { name: 'เพิ่ม', exact: true }).click(); await page.waitForTimeout(1200);
  }
  const spec = await bp('GET', `/v1/projects/${bpp.id}`); save('bp-spec.json', spec);
  const reqs = spec.parts.filter((p) => p.kind === 'requirement').sort((a, b) => a.key.localeCompare(b.key, 'en', { numeric: true }));
  note('setup: 8 requirements typed on the page, nothing else in the spec', reqs.length === 8 && spec.parts.length === 8 && reqs.every((r, i) => r.body?.text === TEXTS[i]), reqs.map((r) => `${r.key} ${r.title}`).join(' · '));
  await shot(`${BPWEB}/p/${bpp.id}/requirements`, 'bp-requirements');
  // the seam itself, as CAW reads it: two part contexts with different anchors
  for (const key of ['REQ-001', 'REQ-005']) {
    const c = await bp('GET', `/v1/projects/${bpp.id}/spec/parts/${key}/context`); save(`seam-context-${key}.json`, c);
    const got = (c?.requirements ?? []).map((r) => r.body?.text);
    note(`seam: Blueprint's ${key} context carries all 8 requirements verbatim`, has8arr(got).every(Boolean) && got.length === 8, `requirements ${got.length} · ${JSON.stringify(has8arr(got))}`);
  }
  // ---------- CAW project from the Blueprint project; the starting team; a folder ----------
  const pid = (await call('POST', '/v1/projects', { blueprintProjectId: bpp.id })).j.id; fs.writeFileSync(path.join(OUT, 'caw-project-id.txt'), pid);
  await page.goto(`${WEB}/p/${pid}`, { waitUntil: 'networkidle' });
  await page.getByText('ใช้ทีมเริ่มต้น').first().click(); await page.waitForTimeout(2500);
  const dir = path.join(ROOT, 'hb118'); fs.mkdirSync(dir); await page.reload({ waitUntil: 'networkidle' });
  await page.locator('input[placeholder*="path"]').first().fill(dir); await page.getByText('เพิ่มโฟลเดอร์').first().click(); await page.waitForTimeout(1500);
  const chain = (await call('GET', `/v1/projects/${pid}/chain`)).j; const ids = Object.fromEntries(chain.members.map((m) => [m.roles?.[0] ?? m.role, m.id]));
  const reqRoute = await call('GET', `/v1/projects/${pid}/requirements`); save('caw-requirements.json', reqRoute.j);
  note('CAW reads the 8 from Blueprint (GET /requirements)', reqRoute.s === 200 && reqRoute.j.requirements.length === 8 && reqRoute.j.requirements.every((r, i) => r.text === TEXTS[i]), `${reqRoute.s} · ${reqRoute.j.requirements?.map((r) => r.key).join(',')}`);

  // ---------- AC-2: the entry chat's prompt holds all 8 ----------
  fs.writeFileSync(`${modeFile}.items.json`, JSON.stringify([
    { title: 'ออกแบบ Health Board', todo: 'TEST-118: a card on the title line, as in TEST-106 phase 2', anchor: { key: 'REQ-001' }, workerId: ids.SA, dependsOn: [], hops: 2 },
    { title: 'ตัดสินสถานะไม่ตอบใน 3 วินาที', todo: 'TEST-118: a card on point 4', anchor: { key: 'REQ-005' }, workerId: ids.BE, dependsOn: [], hops: 2 },
  ]));
  await page.goto(`${WEB}/p/${pid}/chat`, { waitUntil: 'networkidle' });
  const box = page.locator('textarea').first(); await box.fill('ช่วยแบ่งงานตาม spec นี้ให้หน่อยครับ'); await box.press('Enter');
  await until('chat record', 90, async () => recs('chat').length > 0 && !!recs('chat')[0].reply);
  const chatRec = recs('chat')[0]; save('ac2-chat-record.json', chatRec);
  fs.writeFileSync(path.join(OUT, 'ac2-system-prompt.txt'), chatRec.system ?? '');
  const inSys = has8(chatRec.system); const inPrompt = has8(chatRec.prompt);
  note('AC-2 the entry chat hop was given all 8 requirements verbatim (system-prompt file)', inSys.every(Boolean), `system ${JSON.stringify(inSys)} · prompt ${JSON.stringify(inPrompt)} · ${(chatRec.system ?? '').split('\n').find((l) => l.startsWith("# The spec's requirements")) ?? 'no block heading'}`);
  note('AC-2 the chat prompt tells it to anchor cards on requirement keys', /requirement/i.test(chatRec.prompt ?? '') && /2b\./.test(chatRec.prompt ?? ''), JSON.stringify((chatRec.prompt ?? '').split('\n').filter((l) => /requirement/i.test(l)).map((l) => l.slice(0, 160))));
  info(`locate: ${chatRec.locate.map((l) => l.s).join(',')} · proposal ${chatRec.proposal.s} ${JSON.stringify(chatRec.proposal.j?.items?.map((i) => i.anchor?.key) ?? chatRec.proposal.j).slice(0, 200)}`);

  // ---------- AC-3: coverage for that proposal, then on the board ----------
  const prop = chatRec.proposal.j;
  const covP = await call('GET', `/v1/projects/${pid}/coverage?proposalId=${prop.id}`); save('ac3-coverage-proposal.json', covP.j);
  const unc = (j) => (j?.uncovered ?? []).map((u) => u.key).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const WANT = ['REQ-002', 'REQ-003', 'REQ-004', 'REQ-006', 'REQ-007', 'REQ-008'];
  note('AC-3 coverage of the proposal (cards on REQ-001, REQ-005): the other 6 requirements uncovered', covP.s === 200 && JSON.stringify(unc(covP.j)) === JSON.stringify(WANT), `${covP.s} · ${unc(covP.j).join(',')}`);
  const chatPage = await shot(`${WEB}/p/${pid}/chat`, 'ac3-chat');
  const chatUnc = chatPage.split('\n').filter((l) => l.includes('ยังไม่มีงานไหนรับไป'));
  info(`chat page uncovered lines: ${JSON.stringify(chatUnc).slice(0, 400)}`);
  const acc = await call('POST', `/v1/proposals/${prop.id}/accept`);
  const cards = (await call('GET', `/v1/projects/${pid}/cards`)).j.cards; save('cards.json', cards);
  note('setup: accept → 2 cards anchored REQ-001 and REQ-005', acc.s === 200 && cards.length === 2 && JSON.stringify(cards.map((c) => c.anchor?.key).sort()) === '["REQ-001","REQ-005"]', `${acc.s} · ${cards.map((c) => `#${c.number} ${c.anchor?.key}`).join(', ')}`);
  const covB = await call('GET', `/v1/projects/${pid}/coverage`); save('ac3-coverage-board.json', covB.j);
  note('AC-3 the board\'s coverage after accept: the same 6 uncovered', JSON.stringify(unc(covB.j)) === JSON.stringify(WANT), unc(covB.j).join(','));
  const board = await shot(`${WEB}/p/${pid}`, 'ac3-board');
  const lines = board.split('\n').filter((l) => l.includes('ยังไม่มีงานไหนรับไป') || /REQ-00\d/.test(l));
  note('AC-3 the board shows the uncovered line for each of the 6 (the REQ-112 words)', board.includes('ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป') && WANT.every((k) => board.includes(k)) && !board.includes('REQ-001 ') , JSON.stringify(lines).slice(0, 600));

  // ---------- AC-1: every card's context holds all 8 (worker's read), and the hop is told to follow them ----------
  for (const c of cards) {
    const r = await call('GET', `/v1/cards/${c.id}/context`, undefined, `worker:${c.assigneeId}`); save(`ac1-context-${c.anchor.key}.json`, r.j);
    const got = (r.j?.spec?.requirements ?? []).map((x) => x.body?.text ?? x.text);
    note(`AC-1 card #${c.number} (anchored ${c.anchor.key}) — context holds all 8 requirement texts verbatim`, r.s === 200 && has8arr(got).every(Boolean) && got.length === 8, `${r.s} · ${got.length} · ${JSON.stringify(has8arr(got))}`);
  }
  const run1 = await runAuto(pid, 'AC-1 hops', 2); save('ac1-run.json', run1);
  const cardRecs = recs('card'); for (const r of cardRecs) save(`ac1-hop-${r.f}`, r);
  for (const r of cardRecs) {
    const got = (r.context?.spec?.requirements ?? []).map((x) => x.body?.text ?? x.text);
    const card = cards.find((c) => c.id === r.cardId);
    note(`AC-1 the hop on #${card?.number} (${card?.anchor?.key}) read all 8 through card_context`, has8arr(got).every(Boolean) && got.length === 8, `${got.length}`);
    note(`AC-1 the hop on #${card?.number} is told to follow spec.requirements`, (r.prompt ?? '').includes('Follow every requirement in `spec.requirements`'), JSON.stringify((r.prompt ?? '').split('\n').find((l) => l.includes('spec.requirements'))?.slice(0, 200)));
  }
  info(`run 1: ${cardRecs.length} card hops · ${run1.stopReason}`);

  // ---------- AC-4: a requirement edited in Blueprint after the run started → the next hop sees it ----------
  const NEW = 'เช็คใหม่ทุก 5 วินาที และมีปุ่ม "เช็คตอนนี้" (QA แก้ใน TEST-118)';
  const r3 = reqs.find((r) => r.title.startsWith('3.'));
  const cs = await bp('POST', `/v1/projects/${bpp.id}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.update', key: r3.key, body: { text: NEW } }] });
  info(`edit ${r3.key} in Blueprint: ${JSON.stringify(cs).slice(0, 160)}`);
  await sleep(1500);
  const after = (await call('GET', `/v1/projects/${pid}/cards`)).j.cards; save('ac4-cards-after-edit.json', after);
  info(`cards after the edit: ${after.map((c) => `#${c.number} ${c.status} pull=${JSON.stringify(c.pull ?? c.specChanged ?? c.stale ?? null)}`).join(' · ')}`);
  const before = recs('card').length;
  // the dialog's number is the PROJECT's hop budget (hopsUsed counts every run): run 1 used 2, so give room for 2 more
  const run2 = await runAuto(pid, 'AC-4 hops', 4); save('ac4-run.json', run2);
  const newRecs = recs('card').slice(before);
  const latest = fs.readdirSync(RUN).filter((f) => f.startsWith('mode.txt.card-')).map((f) => ({ f, m: fs.statSync(path.join(RUN, f)).mtimeMs, ...JSON.parse(fs.readFileSync(path.join(RUN, f), 'utf8')) })).sort((a, b) => b.m - a.m);
  const nextHop = latest[0]; save('ac4-next-hop.json', nextHop);
  const t3 = (nextHop?.context?.spec?.requirements ?? []).find((x) => x.key === r3.key);
  note(`AC-4 the next hop sees ${r3.key}'s edited text (and the other 7 unchanged)`, newRecs.length > 0 && (t3?.body?.text ?? t3?.text) === NEW && has8arr((nextHop?.context?.spec?.requirements ?? []).map((x) => x.body?.text ?? x.text)).filter(Boolean).length === 7, `${JSON.stringify(t3?.body?.text ?? t3?.text)} · hops this run ${newRecs.length} · ${run2.stopReason}`);
  note('AC-4 CAW flagged both cards when the requirement changed (specChangedVersion set)', after.every((c) => c.specChangedVersion !== null), after.map((c) => `#${c.number} ${c.specChangedVersion}`).join(', '));
  const reqAfter = await call('GET', `/v1/projects/${pid}/requirements`);
  note('AC-4 CAW\'s requirements route shows the edit, revision up', reqAfter.j.requirements.find((r) => r.key === r3.key)?.text === NEW && reqAfter.j.revision > reqRoute.j.revision, `revision ${reqRoute.j.revision} → ${reqAfter.j.revision}`);
} catch (e) { console.log('ERROR', e.stack); }
finally { await browser.close(); for (const p of procs) p.kill(); await sleep(1000); console.log(`run dir ${RUN}`); }
