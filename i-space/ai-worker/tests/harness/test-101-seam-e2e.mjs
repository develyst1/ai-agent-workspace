// TEST-101 #14 + S-cases — the Blueprint ↔ CAW seam, run end to end on this machine only.
// Expects (started by QA beforehand, all on 127.0.0.1, all in-memory):
//   blueprint-back BP_API (GATEWAY_URL = the local fake stub; CAW_NOTIFY_URL = CAW_API/v1/notify)
//   caw-back CAW_API (BLUEPRINT_URL = BP_API; no runner)  ·  blueprint-front BP_WEB  ·  caw-front CAW_WEB (CAW_API=http)
// usage: bun tests/harness/test-101-seam-e2e.mjs <blueprint-front dir> <out dir>
// Writes only into the in-memory back ends it seeds, plus screenshots + seam.json into <out dir>.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [bpFront, out] = process.argv.slice(2);
const BP_API = 'http://127.0.0.1:4210', CAW_API = 'http://127.0.0.1:4510', BP_WEB = 'http://127.0.0.1:3110', CAW_WEB = 'http://127.0.0.1:3520';
for (const u of [BP_API, CAW_API, BP_WEB, CAW_WEB]) if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(u)) throw new Error(`refused ${u}`);
const { chromium } = createRequire(path.join(bpFront, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const steps = [];
const note = (step, ok, detail) => { steps.push({ step, ok, detail }); console.log(`${ok ? 'OK ' : 'BAD'} ${step} — ${detail}`); };
async function call(base, method, route, body, headers = {}) {
  const res = await fetch(base + route, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
}
const op = { 'X-CAW-Actor': 'operator' };

try {
  // Seed Blueprint the way blueprint-front's own tests do: the "large" seed (nothing stuck), a 5-question quiz on the fake gateway, all marked right, confirm.
  const { large } = await import(path.join(bpFront, 'tests/seed/large.ts'));
  const p = await call(BP_API, 'POST', '/v1/projects', { name: 'TEST-101 seam', theme: 'clean-blue' });
  const bp = p.json.id;
  const cs = await call(BP_API, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: large });
  note('S0 seed project', p.status === 201 && cs.status < 300, `bp=${bp} project ${p.status}, change-set ${cs.status}`);
  const quiz = (await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes`, {})).json;
  for (const q of ['มีกี่ขั้นตอน', 'ใครเริ่มงาน', 'ใครอนุมัติ', 'มีหน้าจอกี่หน้า', 'จบงานที่ไหน']) await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes/${quiz.id}/questions`, { question: q });
  for (const it of (await call(BP_API, 'GET', `/v1/projects/${bp}/quizzes/latest`)).json.items) await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes/${quiz.id}/items/${it.id}/mark`, { mark: 'right' });
  const v = await call(BP_API, 'POST', `/v1/projects/${bp}/versions`, { confirmedBy: 'operator' });
  note('S0 confirm v1', v.status === 201 || v.status === 200, `status ${v.status} version ${v.json?.version}`);

  // Front link: blueprint-front ready screen → click "ส่งไปสร้างที่ CAW" → caw-front /start → board
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BP_WEB}/p/${bp}/ready`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.screenshot({ path: path.join(out, 'S1-ready.png'), fullPage: true });
  const build = page.locator('a[data-build]');
  const href = await build.getAttribute('href');
  note('S1 build href', href === `${CAW_WEB}/start?project=${bp}&version=${v.json.version}`, `href ${href}`);
  await build.click();
  await page.waitForURL(/\/p\/[0-9a-f-]+$/, { timeout: 60000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  const cawProject = page.url().match(/\/p\/([0-9a-f-]+)$/)?.[1];
  const body = await page.textContent('body');
  note('S1 click lands on CAW board', !!cawProject && page.url().startsWith(CAW_WEB) && body.includes('TEST-101 seam'), `url ${page.url()}; name shown ${body.includes('TEST-101 seam')}`);
  await page.screenshot({ path: path.join(out, 'S1-caw-board.png'), fullPage: true });
  // same link again → CAW already has it → same board (409 already_exists followed)
  await page.goto(href, { waitUntil: 'networkidle' });
  note('S1b second click → same project', page.url().endsWith(`/p/${cawProject}`), `url ${page.url()}`);
  await browser.close();

  // getProject + getVersion are behind the create above; read what CAW stored
  const cp = await call(CAW_API, 'GET', `/v1/projects/${cawProject}`, null, op);
  note('S2 getProject/getVersion via create', cp.status === 200 && JSON.stringify(cp.json).includes(bp), `status ${cp.status} ${JSON.stringify(cp.json).slice(0, 300)}`);

  // partContext through CAW's own route
  const key = (await call(BP_API, 'GET', `/v1/projects/${bp}/versions/1`)).json.parts[0].key;
  const pc = await call(CAW_API, 'GET', `/v1/projects/${cawProject}/parts/${encodeURIComponent(key)}`, null, op);
  const bpc = await call(BP_API, 'GET', `/v1/projects/${bp}/versions/1/parts/${encodeURIComponent(key)}/context`);
  note('S3 partContext pass-through', pc.status === 200 && JSON.stringify(pc.json).includes(JSON.stringify(bpc.json.part.title)), `CAW ${pc.status}, BP ${bpc.status}, key ${key}`);
  const pcMissing = await call(CAW_API, 'GET', `/v1/projects/${cawProject}/parts/NOPE-999`, null, op);
  note('S3b partContext unknown key', pcMissing.status === 404, `CAW ${pcMissing.status} ${JSON.stringify(pcMissing.json)}`);

  // locate
  const title = bpc.json.part.title;
  const lo = await call(CAW_API, 'POST', `/v1/projects/${cawProject}/locate`, { request: title }, op);
  note('S4 locate', lo.status === 200 && Array.isArray(lo.json?.candidates), `status ${lo.status} candidates ${lo.json?.candidates?.length} notInSpec ${lo.json?.notInSpec}`);

  // amend: ok, and Blueprint's own 400 (unknown about key) → CAW 400 amendment_refused
  const am = await call(CAW_API, 'POST', `/v1/projects/${cawProject}/amendments`, { request: 'TEST-101: please add a note', about: [key] }, op);
  const msgs = await call(BP_API, 'GET', `/v1/projects/${bp}/messages?limit=50`);
  const landed = JSON.stringify(msgs.json).includes('TEST-101: please add a note');
  note('S5 amend 201 + message in Blueprint chat', am.status === 201 && landed, `CAW ${am.status}; BP messages ${msgs.status}, landed ${landed}`);
  const am2 = await call(CAW_API, 'POST', `/v1/projects/${cawProject}/amendments`, { request: 'x', about: ['NOPE-999'] }, op);
  note('S5b amend unknown about → refusal', am2.status === 400, `CAW ${am2.status} ${JSON.stringify(am2.json)}`);

  // versionsAfter: confirm v2 on Blueprint (push goes to CAW /v1/notify), then CAW's project should see version 2
  const step = (await call(BP_API, 'GET', `/v1/projects/${bp}`)).json.parts.find((x) => x.kind === 'step') ?? (await call(BP_API, 'GET', `/v1/projects/${bp}`)).json.parts[0];
  await call(BP_API, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.update', key: step.key, title: `${step.title} (TEST-101)`, origin: { stamp: 'operator', date: '2026-10-29' } }] });
  const quiz2 = (await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes`, {})).json;
  for (const q of ['มีกี่ขั้นตอน', 'ใครเริ่มงาน', 'ใครอนุมัติ', 'มีหน้าจอกี่หน้า', 'จบงานที่ไหน']) await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes/${quiz2.id}/questions`, { question: q });
  for (const it of (await call(BP_API, 'GET', `/v1/projects/${bp}/quizzes/latest`)).json.items) await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes/${quiz2.id}/items/${it.id}/mark`, { mark: 'right' });
  const v2 = await call(BP_API, 'POST', `/v1/projects/${bp}/versions`, { confirmedBy: 'operator' });
  await new Promise((r) => setTimeout(r, 3000));
  const cp2 = await call(CAW_API, 'GET', `/v1/projects/${cawProject}`, null, op);
  note('S6 push + versionsAfter', v2.json?.version === 2 && JSON.stringify(cp2.json).includes('"latestSeenVersion":2'), `BP v${v2.json?.version}; CAW project after push: ${JSON.stringify(cp2.json).match(/"latestSeenVersion":\d+/)?.[0] ?? 'no latestSeenVersion field'}`);
  fs.writeFileSync(path.join(out, 'caw-project-after-v2.json'), JSON.stringify(cp2.json, null, 2));
} catch (e) {
  note('ERROR', false, String(e?.stack ?? e));
} finally {
  fs.writeFileSync(path.join(out, 'seam.json'), JSON.stringify(steps, null, 2));
}
