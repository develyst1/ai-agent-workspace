// REQ-108 PHASE 3 (TEST-106) — phase 2's driver, folder health-board-108p3. Copied from TEST-112's live driver.
// TEST-112 joint + AC-3 LIVE (REQ-112, REQ-108 phase 2 shape) — through the real screens, the way the owner works: Blueprint's
// "ส่งไปสร้างที่ CAW" → CAW board → "ใช้ทีมเริ่มต้น" → folder → chat → proposal → "ตกลง เริ่มงาน" → อัตโนมัติ. Real Claude CLI hops
// (owner 2026-10-29 13:01), every hop on the ledger. usage (from this folder): bun live.mjs <caw-front dir> <phase: setup|chat|accept|auto|status>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front, phase] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const BPW = 'http://127.0.0.1:3100', CAWW = 'http://127.0.0.1:3500', API = 'http://127.0.0.1:4500';
const FOLDER = '/workspace/caw-workspaces/books-124r2'; // TEST-122 round 2 (REQ-124): another new product's folder
const BP = fs.readFileSync('out/bp-project-id.txt', 'utf8').trim();
const pidFile = 'out/caw-project-id.txt';
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const call = async (method, path, body) => { const r = await fetch(API + path, { method, headers: { 'x-caw-actor': 'operator', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); try { return { s: r.status, j: JSON.parse(t) }; } catch { return { s: r.status, j: t }; } };
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: BPW }]);
const p = await ctx.newPage(); p.setDefaultTimeout(30000);
const shot = async (n) => p.screenshot({ path: `out/${n}.png`, fullPage: true });
try {
  if (phase === 'setup') {
    await p.goto(`${BPW}/p/${BP}/ready`, { waitUntil: 'networkidle' });
    await Promise.all([p.waitForURL(/3500\/p\//, { timeout: 30000 }), p.getByText('ส่งไปสร้างที่ CAW').first().click()]);
    await p.waitForLoadState('networkidle');
    const pid = /\/p\/([0-9a-f-]{36})/.exec(p.url())[1]; fs.writeFileSync(pidFile, pid); log(`CAW project ${pid} (from Blueprint's button)`);
    await p.getByText('ใช้ทีมเริ่มต้น').first().click(); await p.waitForTimeout(2500); await p.reload({ waitUntil: 'networkidle' });
    const chain = (await call('GET', `/v1/projects/${pid}/chain`)).j;
    log(`team: ${chain.members?.map((m) => `${m.name}(${m.roles?.join('/')},${m.model}/${m.effort})`).join(' · ')} · entry ${chain.members?.find((m) => m.id === chain.entryWorkerId)?.name}`);
    fs.mkdirSync(FOLDER, { recursive: true });
    const input = p.locator('input[placeholder*="path"]').first(); await input.fill(FOLDER); await p.getByText('เพิ่มโฟลเดอร์').first().click(); await p.waitForTimeout(1500);
    log(`workspace: ${JSON.stringify((await call('GET', `/v1/projects/${pid}`)).j.workspace)}`);
    await shot('setup-board');
  }
  const pid = fs.readFileSync(pidFile, 'utf8').trim();
  if (phase === 'chat') {
    await p.goto(`${CAWW}/p/${pid}/chat`, { waitUntil: 'networkidle' });
    if (process.env.RETRY) { await p.getByRole('button', { name: /ลองอีกครั้ง/ }).first().click(); log('chat: "ลองอีกครั้ง" pressed; waiting for the entry worker'); }
    else { const box = p.locator('textarea').first(); await box.fill('ช่วยสร้างสมุดยืม-คืนหนังสือในออฟฟิศตาม spec ทั้งหมดให้หน่อย'); await box.press('Enter'); log('chat sent; waiting for the entry worker'); }
    let prop = null;
    for (let i = 0; i < 180 && !prop; i++) { prop = (await call('GET', `/v1/projects/${pid}/proposals`)).j.proposals?.find((x) => x.status === 'open'); if (!prop) await p.waitForTimeout(2000); }
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
    log(`proposal: ${JSON.stringify(prop?.items?.map((i) => `${i.title} @${i.anchor.key} → ${i.workerId.slice(0, 8)}`))}`);
    const cov = await call('GET', `/v1/projects/${pid}/coverage?proposalId=${prop?.id}`); log(`coverage (proposal, real relatedDecisions): ${JSON.stringify(cov.j)}`);
    fs.writeFileSync('out/proposal.json', JSON.stringify({ prop, cov: cov.j }, null, 1));
    await shot('chat-proposal');
  }
  if (phase === 'accept') {
    await p.goto(`${CAWW}/p/${pid}/chat`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /ตกลง เริ่มงาน/ }).first().click(); await p.waitForTimeout(2500);
    const cards = (await call('GET', `/v1/projects/${pid}/cards`)).j.cards;
    log(`cards: ${JSON.stringify(cards.map((c) => `#${c.number} ${c.title} @${c.anchor.key} ${c.status}`))}`);
    const cov = await call('GET', `/v1/projects/${pid}/coverage`); log(`coverage (board): ${JSON.stringify(cov.j)}`);
    for (const c of cards) { const ctxj = (await call('GET', `/v1/cards/${c.id}/context`)).j; fs.writeFileSync(`out/card-${c.number}-context.json`, JSON.stringify(ctxj, null, 1)); log(`card #${c.number} @${c.anchor.key}: decisions ${JSON.stringify(ctxj.spec?.decisions?.map((d) => d.key))} related ${JSON.stringify(ctxj.spec?.relatedDecisions?.map((r) => r.decision.key))}`); }
    await p.goto(`${CAWW}/p/${pid}`, { waitUntil: 'networkidle' }); await shot('board-accepted');
  }
  if (phase === 'auto') {
    await p.goto(`${CAWW}/p/${pid}`, { waitUntil: 'networkidle' });
    // first run: the mode toggle; after a run ended, the board's own restart button (the last "อัตโนมัติ") opens the dialog
    await p.getByText('อัตโนมัติ', { exact: true }).last().click(); await p.waitForTimeout(1500); await shot('auto-dialog');
    const dlg = p.getByRole('dialog').first();
    const budget = dlg.locator('input[type="number"]').first(); if (await budget.count()) await budget.fill(process.env.BUDGET ?? '12');
    await dlg.getByRole('button', { name: 'อัตโนมัติ' }).first().click(); log(`auto: budget ${process.env.BUDGET ?? '12'} confirmed in the dialog`);
    await p.waitForTimeout(2000); log(`mode: ${JSON.stringify((await call('GET', `/v1/projects/${pid}`)).j.mode)}`); await shot('auto-started');
  }
  if (phase === 'status') {
    const cards = (await call('GET', `/v1/projects/${pid}/cards`)).j.cards; const hops = (await call('GET', `/v1/projects/${pid}/hops`)).j.hops;
    log(`cards: ${cards.map((c) => `#${c.number}:${c.status}${c.stoppedMidway ? '(stoppedMidway)' : ''}`).join(' ')} · hops ${hops.length}: ${hops.map((h) => `${h.id.slice(0, 13)} ${h.workerId.slice(0, 6)} ${h.startedAt?.slice(11, 19)}–${h.endedAt?.slice(11, 19) ?? '…'} ${h.outcome ?? ''} ${(h.note ?? '').slice(0, 60)}`).join(' | ')}`);
    fs.writeFileSync('out/hops.json', JSON.stringify(hops, null, 1));
    await p.goto(`${CAWW}/p/${pid}`, { waitUntil: 'networkidle' }); await shot(`board-${Date.now()}`);
  }
} catch (e) { log(`ERROR ${e.message}`); await shot('error'); }
finally { await b.close(); }
