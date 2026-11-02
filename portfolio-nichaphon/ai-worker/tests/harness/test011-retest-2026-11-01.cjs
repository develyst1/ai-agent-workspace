/*
 * TEST-011 re-test after TASK-042 (Tanya, QA — 2026-11-01). ZERO real calls (back/ on the stub; Ask never pressed;
 * the admin's Save is never pressed).
 *   (1) S6 / DEF-1: clean load of each of the 6 routes at 1280x900 and 360x740, page kept open 2.5 s:
 *       failed requests (with errorText), `_rsc` requests, console errors, pageerrors, responses >= 400.
 *   (1b) observation: one header-link click from / → /about — every `_rsc` request, its status, and whether Chrome also fails it.
 *   (2) OBS-22: admin → Posts → New post → Author value; an existing sample post → Author value. Nothing saved.
 *   (3) light regression: full-page pictures of the 6 routes (same recipe as test011-aca) pixel-compared with TEST-011's
 *       own pictures of the switched site (REF_DIR = TEST-011 aca/, files new-<route>-<size>.png).
 * Usage: NODE_PATH=… BASE_URL=http://127.0.0.1:3072 ADMIN_URL=http://localhost:4015 REF_DIR=<TEST-011 aca dir> OUT=<dir> node test011-retest-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const ADMIN = process.env.ADMIN_URL || 'http://localhost:4015';
const REF = process.env.REF_DIR;
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROUTES = ['/', '/about', '/services', '/portfolio', '/blog', '/contact'];
const SIZES = [{ w: 1280, h: 900, n: 'desktop' }, { w: 360, h: 740, n: 'phone' }];
fs.mkdirSync(OUT, { recursive: true });
const log = (k, v) => console.log(`${k}: ${JSON.stringify(v)}`);

function watch(p) {
  const r = { failed: [], rsc: [], console: [], pageerror: [], s400: [] };
  p.on('requestfailed', (q) => r.failed.push(`${q.url().replace(BASE, '')} ${q.failure() && q.failure().errorText}`));
  p.on('request', (q) => { if (q.url().includes('_rsc=')) r.rsc.push(q.url().replace(BASE, '')); });
  p.on('response', (s) => { if (s.url().includes('_rsc=')) r.rsc.push(`  -> ${s.status()} ${s.url().replace(BASE, '')}`); if (s.status() >= 400) r.s400.push(`${s.status()} ${s.url()}`); });
  p.on('console', (m) => { if (m.type() === 'error') r.console.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => r.pageerror.push(String(e).slice(0, 120)));
  return r;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  // (1) S6 — clean loads
  for (const s of SIZES) {
    for (const route of ROUTES) {
      const p = await browser.newPage({ viewport: { width: s.w, height: s.h } });
      const r = watch(p);
      const res = await p.goto(BASE + route, { waitUntil: 'networkidle' });
      await p.waitForTimeout(2500);
      log(`S6 ${s.n} ${route}`, { status: res.status(), failed: r.failed.length, rsc: r.rsc.length, console: r.console.length, pageerror: r.pageerror.length, s400: r.s400.length, detail: r.failed.concat(r.rsc) });
      await p.close();
    }
  }

  // (1b) one click navigation — observation
  {
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    const r = watch(p);
    await p.click('header nav[aria-label="Main"] a[href="/about"]');
    await p.waitForURL('**/about');
    await p.waitForTimeout(2500);
    const h1 = await p.evaluate(() => (document.querySelector('h1') || {}).innerText);
    log('click / -> /about', { url: new URL(p.url()).pathname, h1, rsc: r.rsc, failed: r.failed, console: r.console });
    await p.close();
  }

  // (2) OBS-22 — Author default, nothing saved
  {
    const a = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const open = async () => {
      await a.goto(ADMIN + '/', { waitUntil: 'networkidle' });
      await a.waitForFunction(() => [...document.querySelectorAll('nav[aria-label="Content documents"] p')].some((x) => x.innerText === 'Blog'), null, { timeout: 30000 });
      await a.evaluate(() => {
        let el = [...document.querySelectorAll('nav[aria-label="Content documents"] p')].find((x) => x.innerText === 'Blog').nextElementSibling;
        while (el && el.tagName !== 'P') { const l = el.tagName === 'A' ? el : el.querySelector('a'); if (l && l.innerText.trim() === 'Posts') { l.click(); return; } el = el.nextElementSibling; }
      });
      await a.waitForTimeout(1200);
    };
    await open();
    await a.locator('main button', { hasText: /^New post$/ }).click();
    await a.waitForTimeout(900);
    const newAuthor = await a.getByRole('textbox', { name: 'Author', exact: true }).inputValue();
    await a.screenshot({ path: path.join(OUT, 'obs22-new-post-author.png') });
    await open();
    await a.locator('main button', { hasText: 'API Security: Protecting Your Backend Services' }).first().click();
    await a.waitForTimeout(900);
    const oldAuthor = await a.getByRole('textbox', { name: 'Author', exact: true }).inputValue();
    await a.screenshot({ path: path.join(OUT, 'obs22-existing-post-author.png') });
    const site = await (await a.request.get('http://localhost:4014/content')).json();
    log('OBS-22', { newPostAuthor: newAuthor, existingSamplePostAuthor: oldAuthor, storedSiteName: site.documents.site.name });
    await a.close();
  }

  // (3) light regression — pixel compare with TEST-011's own pictures
  for (const s of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    for (const route of ROUTES) {
      const slug = (route === '/' ? 'home' : route.slice(1)) + '-' + s.n;
      await p.goto(BASE + route, { waitUntil: 'networkidle' });
      await p.waitForTimeout(800);
      await p.evaluate(async () => {
        const step = Math.floor(window.innerHeight * 0.8);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120))); }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 600));
      });
      const file = path.join(OUT, `retest-${slug}.png`);
      await p.screenshot({ path: file, fullPage: true, animations: 'disabled' });
      const ref = path.join(REF, `new-${slug}.png`);
      const pix = await p.evaluate(async ([pa, pb]) => {
        const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
        const [ia, ib] = await Promise.all([load(pa), load(pb)]);
        if (ia.width !== ib.width || ia.height !== ib.height) return { sizeRef: [ia.width, ia.height], sizeNow: [ib.width, ib.height], diff: null };
        const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
        const x = c.getContext('2d');
        x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data;
        x.clearRect(0, 0, c.width, c.height); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 0; i < da.length; i += 4) if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) n++;
        return { sizeRef: [ia.width, ia.height], sizeNow: [ib.width, ib.height], diff: n };
      }, ['data:image/png;base64,' + fs.readFileSync(ref).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(file).toString('base64')]);
      log(`pixels ${slug} vs TEST-011`, pix);
    }
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
