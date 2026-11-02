/*
 * TEST-011 AC-b harness (Tanya, QA — 2026-11-01). ZERO real calls (no Draft button is pressed).
 * Through the REAL admin UI (ADMIN_URL), against a COPY of the seeded store: change (1) a headline — About page title,
 * (2) a project — Learning Curve's summary, (3) a certificate — the first certificate's title; press Save once each;
 * then fetch the public page (BASE_URL) once a second until the marker appears, and report seconds from the Save click.
 * Also reports the public page's text diff before/after (only the marker may change) and takes the pictures.
 * Usage: NODE_PATH=<dir>/node_modules ADMIN_URL=http://localhost:4015 BASE_URL=http://127.0.0.1:3072 OUT=<dir> node test011-acb-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ADMIN = process.env.ADMIN_URL || 'http://localhost:4015';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });

async function openEditor(a, section, name) {
  await a.goto(ADMIN + '/', { waitUntil: 'networkidle' });
  await a.evaluate(([sec, nm]) => {
    const ps = [...document.querySelectorAll('nav[aria-label="Content documents"] p')];
    let el = ps.find((x) => x.innerText === sec).nextElementSibling;
    while (el && el.tagName !== 'P') {
      const link = el.tagName === 'A' ? el : el.querySelector('a');
      if (link && link.innerText.trim() === nm) { link.click(); return; }
      el = el.nextElementSibling;
    }
    throw new Error('no editor ' + sec + ' / ' + nm);
  }, [section, name]);
  await a.waitForTimeout(1200);
}
async function pageText(p, route) {
  await p.goto(BASE + route, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  return p.evaluate(() => document.body.innerText);
}
async function saveAndTime(a, pub, route, marker, tag) {
  const save = a.locator('main button', { hasText: /^Save$/ }).first();
  const t0 = Date.now();
  await save.click();
  await a.waitForFunction(() => /Saved/.test(document.querySelector('main').innerText), null, { timeout: 15000 }).catch(() => {});
  const savedMsg = await a.evaluate(() => (document.querySelector('main').innerText.match(/Saved[^\n]*/) || [''])[0]);
  await a.screenshot({ path: path.join(OUT, `${tag}-admin-saved.png`) });
  let seenAt = null;
  for (let i = 0; i < 90; i++) {
    const res = await pub.request.get(BASE + route, { headers: { 'cache-control': 'no-cache' } });
    if ((await res.text()).includes(marker)) { seenAt = (Date.now() - t0) / 1000; break; }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { savedMsg, seenAfterSeconds: seenAt };
}
function diffLines(a, b) {
  const al = a.split('\n'); const bl = b.split('\n');
  const out = [];
  for (let i = 0; i < Math.max(al.length, bl.length); i++) if (al[i] !== bl[i]) out.push({ i, old: al[i], new: bl[i] });
  return out;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const a = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const pub = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  a.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));

  // (1) headline — About page title
  const before1 = await pageText(pub, '/about');
  await openEditor(a, 'About', 'Page text');
  const t1 = a.getByLabel('Title', { exact: true }).first();
  const old1 = await t1.inputValue();
  await t1.fill(old1 + ' QA-T011-H');
  const r1 = await saveAndTime(a, pub, '/about', 'QA-T011-H', 'b1-headline');
  const after1 = await pageText(pub, '/about');
  await pub.screenshot({ path: path.join(OUT, 'b1-headline-public-about.png') });
  console.log('AC-b (1) headline', JSON.stringify({ old: old1, ...r1, diff: diffLines(before1, after1) }));

  // (2) project — Learning Curve summary (shown on the card and in the modal)
  const before2 = await pageText(pub, '/portfolio');
  await openEditor(a, 'Portfolio', 'Projects');
  await a.locator('main button', { hasText: 'Learning Curve' }).first().click();
  await a.waitForTimeout(700);
  const s2 = a.getByLabel('Summary', { exact: true }).first();
  const old2 = await s2.inputValue();
  await s2.fill(old2 + ' QA-T011-P');
  const r2 = await saveAndTime(a, pub, '/portfolio', 'QA-T011-P', 'b2-project');
  const after2 = await pageText(pub, '/portfolio');
  await pub.locator('text=QA-T011-P').first().scrollIntoViewIfNeeded().catch(() => {});
  await pub.screenshot({ path: path.join(OUT, 'b2-project-public-portfolio.png') });
  await pub.locator('button[aria-label="Open project detail for Learning Curve"]').click();
  await pub.waitForSelector('[role="dialog"]', { state: 'visible' });
  await pub.waitForTimeout(600);
  const modalHas = await pub.evaluate(() => document.querySelector('[role="dialog"]').innerText.includes('QA-T011-P'));
  await pub.screenshot({ path: path.join(OUT, 'b2-project-public-modal.png') });
  console.log('AC-b (2) project', JSON.stringify({ old: old2, ...r2, modalHas, diff: diffLines(before2, after2) }));

  // (3) certificate — the first certificate's title
  const before3 = await pageText(pub, '/about');
  await openEditor(a, 'About', 'Certificates');
  await a.locator('main button', { hasText: 'Prompt Engineering with GitHub Copilot' }).first().click();
  await a.waitForTimeout(700);
  const labels3 = await a.evaluate(() => [...document.querySelectorAll('main label')].map((l) => l.innerText));
  const c3 = a.getByLabel('Title', { exact: true }).first();
  const old3 = await c3.inputValue();
  await c3.fill(old3 + ' QA-T011-C');
  const r3 = await saveAndTime(a, pub, '/about', 'QA-T011-C', 'b3-certificate');
  const after3 = await pageText(pub, '/about');
  await pub.locator('text=QA-T011-C').first().scrollIntoViewIfNeeded().catch(() => {});
  await pub.screenshot({ path: path.join(OUT, 'b3-certificate-public-about.png') });
  console.log('AC-b (3) certificate', JSON.stringify({ labels: labels3, old: old3, ...r3, diff: diffLines(before3, after3) }));
  console.log('admin pageerrors', JSON.stringify(errs));
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
