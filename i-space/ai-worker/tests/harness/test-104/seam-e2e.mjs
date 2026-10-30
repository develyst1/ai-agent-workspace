// TEST-104 #18/#18b (AC-9) + #3b: the Blueprint ↔ CAW seam with REQ-103's build (labels, names, a requirement part),
// against CAW at today's HEAD (102a130 export). Ports: BP API 4221 · BP web 3121 · CAW API 4521 · CAW web 3521.
// usage: bun seam-e2e.mjs <blueprint-front dir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [bpFront] = process.argv.slice(2);
const BP_API = 'http://127.0.0.1:4221', CAW_API = 'http://127.0.0.1:4521', BP_WEB = 'http://127.0.0.1:3121', CAW_WEB = 'http://127.0.0.1:3521';
const { chromium } = createRequire(path.join(bpFront, 'package.json'))('@playwright/test');
const steps = [];
const note = (step, ok, detail) => { steps.push({ step, ok, detail }); console.log(`${ok ? 'OK ' : 'BAD'} ${step} — ${detail}`); };
const by = { 'X-Blueprint-By': encodeURIComponent('โด่ง') };
async function call(base, method, route, body, headers = {}) {
  const res = await fetch(base + route, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
}
const op = { 'X-CAW-Actor': 'operator' };
const origin = { stamp: 'operator', date: '2026-10-29' };

try {
  const { large } = await import(path.join(bpFront, 'tests/seed/large.ts'));
  const bp = (await call(BP_API, 'POST', '/v1/projects', { name: 'TEST-104 seam', theme: 'clean-blue' }, by)).json.id;
  const cs = await call(BP_API, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: [...large, { op: 'part.add', ref: '$req', kind: 'requirement', title: 'เช็คสถานะทุก 10 วินาที', body: { text: 'หน้าเว็บเช็คสถานะบริการใหม่เองทุก 10 วินาที' }, origin }] }, by);
  const reqKey = cs.json?.keys?.['$req'];
  const quiz = (await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes`, {}, by)).json;
  for (const q of ['มีกี่ขั้นตอน', 'ใครเริ่มงาน', 'ใครอนุมัติ', 'มีหน้าจอกี่หน้า', 'จบงานที่ไหน']) await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes/${quiz.id}/questions`, { question: q }, by);
  for (const it of (await call(BP_API, 'GET', `/v1/projects/${bp}/quizzes/latest`)).json.items) await call(BP_API, 'POST', `/v1/projects/${bp}/quizzes/${quiz.id}/items/${it.id}/mark`, { mark: 'right' }, by);
  const stuck = (await call(BP_API, 'GET', `/v1/projects/${bp}/stuck`)).json.items.length;
  note('S0 seed + requirement + quiz 5/5', cs.status === 201 && !!reqKey, `bp=${bp}; requirement ${reqKey}; stuck ${stuck}`);

  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: BP_WEB }]);
  const page = await ctx.newPage(); page.setDefaultTimeout(60000);
  await page.goto(`${BP_WEB}/p/${bp}/ready`, { waitUntil: 'networkidle' });
  const t = await page.textContent('body');
  note('#3b ready project: no warning', stuck === 0 && !t.includes('ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม'), `stuck ${stuck}; warning text present ${t.includes('ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม')}`);
  await page.getByPlaceholder('ตั้งชื่อป้าย เช่น v1 ทดลอง').fill('v1 พร้อม');
  await page.getByRole('button', { name: 'ใส่ป้าย version' }).click();
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(1200);
  const labels = (await call(BP_API, 'GET', `/v1/projects/${bp}/labels`)).json.labels;
  note('S0 label v1 through the ready screen', labels.length === 1 && labels[0].label === 'v1 พร้อม', JSON.stringify(labels));
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: 'S1-ready.png', fullPage: true });
  const build = page.getByRole('link', { name: 'ส่งไปสร้างที่ CAW' }).first();
  const href = await build.getAttribute('href');
  note('#18 S1 build href with the label\'s version', href === `${CAW_WEB}/start?project=${bp}&version=${labels[0].version}`, `href ${href}`);
  await build.click();
  await page.waitForURL(/\/p\/[0-9a-f-]+$/, { timeout: 60000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  const caw = page.url().match(/\/p\/([0-9a-f-]+)$/)?.[1];
  note('#18 S1 click lands on CAW board', !!caw && page.url().startsWith(CAW_WEB) && (await page.textContent('body')).includes('TEST-104 seam'), `url ${page.url()}`);
  await page.screenshot({ path: 'S1-caw-board.png', fullPage: true });
  await browser.close();

  const cp = await call(CAW_API, 'GET', `/v1/projects/${caw}`, null, op);
  note('#18 S2 getProject/getVersion via create', cp.status === 200 && JSON.stringify(cp.json).includes(bp), `status ${cp.status} version ${cp.json?.version}`);
  const step = (await call(BP_API, 'GET', `/v1/projects/${bp}/versions/${labels[0].version}`)).json.parts.find((x) => x.kind === 'step');
  const pc = await call(CAW_API, 'GET', `/v1/projects/${caw}/parts/${encodeURIComponent(step.key)}`, null, op);
  note('#18 S3 partContext pass-through (a step)', pc.status === 200 && JSON.stringify(pc.json).includes(step.title), `CAW ${pc.status}`);
  const pr = await call(CAW_API, 'GET', `/v1/projects/${caw}/parts/${encodeURIComponent(reqKey)}`, null, op);
  note('#18b requirement part through CAW', pr.status === 200 && pr.json?.part?.kind === 'requirement' && pr.json?.part?.body?.text?.includes('10 วินาที'), `CAW ${pr.status} kind ${pr.json?.part?.kind}`);
  const lo = await call(CAW_API, 'POST', `/v1/projects/${caw}/locate`, { request: 'เช็คสถานะทุก 10 วินาที' }, op);
  note('#18b locate finds the requirement', lo.status === 200 && (lo.json?.candidates ?? []).some((c) => c.key === reqKey), `status ${lo.status}; candidates ${JSON.stringify((lo.json?.candidates ?? []).slice(0, 4).map((c) => c.key))}`);
  const am = await call(CAW_API, 'POST', `/v1/projects/${caw}/amendments`, { request: 'TEST-104: ขอแก้', about: [step.key] }, op);
  const msgs = (await call(BP_API, 'GET', `/v1/projects/${bp}/messages?limit=50`)).json;
  note('#18 S5 amend 201 + lands in Blueprint chat', am.status === 201 && JSON.stringify(msgs).includes('TEST-104: ขอแก้'), `CAW ${am.status}`);
  // push: a second label → CAW sees it (latestSeenVersion)
  await call(BP_API, 'POST', `/v1/projects/${bp}/change-sets`, { cause: { kind: 'operator' }, changes: [{ op: 'part.update', key: step.key, title: `${step.title} (TEST-104)`, origin }] }, by);
  const v2 = (await call(BP_API, 'POST', `/v1/projects/${bp}/versions`, { label: 'v2' }, by)).json;
  await new Promise((r) => setTimeout(r, 3000));
  const cp2 = await call(CAW_API, 'GET', `/v1/projects/${caw}`, null, op);
  note('#18 S6 push + versionsAfter', cp2.json?.latestSeenVersion === v2.version, `BP label v${v2.version}; CAW latestSeenVersion ${cp2.json?.latestSeenVersion}`);
} catch (e) {
  note('ERROR', false, String(e?.stack ?? e).slice(0, 500));
} finally {
  fs.writeFileSync('seam.json', JSON.stringify(steps, null, 2));
}
