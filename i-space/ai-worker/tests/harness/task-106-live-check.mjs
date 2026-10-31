// TASK-106 DoD 6, the live check: open a project on caw-front (http mode, against TASK-105's stub dev script), press ดูหน้าจอ on a worker, and log when each
// new line appears in the sheet WITHOUT a reload. Compares each line with the time the runner stored it (GET /v1/hops/{id}/output `at`).
// usage: bun tests/harness/task-106-live-check.mjs <caw-front dir> <front url> <api url> <project id> <worker name> <seconds> <out dir>
// Read-only: it clicks ดูหน้าจอ only, and GETs the API.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [front, base, api, project, worker, secs, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let navigations = 0;
page.on('framenavigated', (f) => { if (f === page.mainFrame()) navigations++; });
await page.goto(`${base}/p/${project}`, { waitUntil: 'networkidle' });
navigations = 0; // count only what happens after the first load

await page.exposeFunction('__seen', (n, t) => console.log(`${new Date(t).toISOString()}  lines in sheet: ${n}`));
await page.locator(`[data-watch="${worker}"]`).click();
await page.locator('[data-screen]').waitFor();
await page.evaluate(() => {
  const el = document.querySelector('[data-screen-lines]');
  let last = -1;
  const read = () => { const n = el.querySelectorAll('[data-kind]').length; if (n !== last) { last = n; window.__seen(n, Date.now()); } };
  new MutationObserver(read).observe(el, { childList: true, subtree: true });
  read();
});
const opened = new Date().toISOString();
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(out, 'live-1280-a.png') });
await page.waitForTimeout(Number(secs) * 1000);
await page.screenshot({ path: path.join(out, 'live-1280-b.png') });

const head = await page.locator('[data-screen]').locator('[data-live], [data-ended], [data-started]').allInnerTexts();
const kinds = await page.locator('[data-screen] [data-kind]').evaluateAll((els) => els.map((e) => e.dataset.kind));
const atBottom = await page.locator('[data-screen-lines]').evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight < 24);
const inputs = await page.locator('[data-screen] input, [data-screen] textarea, [data-screen] [contenteditable]').count();
console.log(JSON.stringify({ opened, navigationsAfterLoad: navigations, header: head, lines: kinds.length, byKind: kinds.reduce((a, k) => ({ ...a, [k]: (a[k] ?? 0) + 1 }), {}), atBottom, inputsInSheet: inputs }));
await browser.close();

// what the runner stored: hop id from the API, then its output with `at`
const hops = (await (await fetch(`${api}/v1/projects/${project}/hops`)).json()).hops;
const hop = hops[0];
const o = await (await fetch(`${api}/v1/hops/${hop.id}/output?after=-1&limit=1000`)).json();
console.log(`API: hop ${hop.id.slice(0, 8)} startedAt ${hop.startedAt} endedAt ${hop.endedAt} · ${o.entries.length} entries, more=${o.more}`);
for (const e of o.entries.slice(-6)) console.log(`  seq ${e.seq}  at ${e.at}  ${e.kind}  ${JSON.stringify(e.text).slice(0, 70)}`);
