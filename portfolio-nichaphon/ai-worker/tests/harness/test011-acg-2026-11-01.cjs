/*
 * TEST-011 AC-g harness (Tanya, QA — 2026-11-01). ZERO real calls: back/ is pinned to the STUB gateway.
 * The REGRESSION lines about BEHAVIOUR, on the switched site (front reading the store copy):
 *   S1/S6 every route 200, not 404, 0 console errors / pageerrors / failed requests / responses >= 400 (both sizes)
 *   S3/S4 header + footer links land on their own path · S5 drawer at 360 · S12/S13 portfolio modal + /about lightbox
 *   H10 Ask under the hero, two chips · H12 stub happy + stub:none · H13 (1) plain sources, (2) stub:malformed@2
 * Usage: NODE_PATH=<dir>/node_modules BASE_URL=http://127.0.0.1:3072 OUT=<dir> node test011-acg-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROUTES = ['/', '/about', '/services', '/portfolio', '/blog', '/contact'];
fs.mkdirSync(OUT, { recursive: true });
const out = (k, v) => console.log(`${k}: ${JSON.stringify(v)}`);
const shot = (p, n) => p.screenshot({ path: path.join(OUT, n) });
const dialogs = () => ({ dialogs: document.querySelectorAll('[role="dialog"]').length, locked: document.documentElement.hasAttribute('data-scroll-locked') || document.body.style.overflow === 'hidden' });
async function fullScroll(p) {
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 100))); }
  });
}
async function ask(p, q) {
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('#ask-heading').scrollIntoViewIfNeeded();
  await p.locator('input[name="question"]').click();
  await p.keyboard.type(q, { delay: 5 });
  await p.locator('section:has(#ask-heading) form button[type="submit"]').click();
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const done = await p.evaluate(() => {
      const live = document.querySelector('section:has(#ask-heading) [aria-live]');
      const btn = document.querySelector('section:has(#ask-heading) form button[type="submit"]');
      return !!live && (!!live.querySelector('[role="status"]') || (btn && btn.getAttribute('data-loading') !== 'true' && live.innerText.length > 0));
    });
    if (done) break;
    await p.waitForTimeout(300);
  }
  await p.waitForTimeout(500);
  const live = p.locator('section:has(#ask-heading) [aria-live]');
  await live.scrollIntoViewIfNeeded().catch(() => {});
  return {
    text: await live.innerText(),
    links: await p.$$eval('section:has(#ask-heading) [aria-live] a', (as) => as.map((a) => a.getAttribute('href') + ' ' + a.innerText.replace(/\s+/g, ' '))),
    failurePanel: !!(await p.$('section:has(#ask-heading) [role="status"]')),
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  // S1 + S6 — every route, both sizes, clean loads
  for (const vp of [{ width: 1280, height: 900 }, { width: 360, height: 740 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    for (const r of ROUTES) {
      const p = await ctx.newPage();
      const bad = { console: [], pageerror: [], failed: [], status400: [] };
      p.on('console', (m) => { if (m.type() === 'error') bad.console.push(m.text().slice(0, 120)); });
      p.on('pageerror', (e) => bad.pageerror.push(String(e).slice(0, 120)));
      p.on('requestfailed', (q) => bad.failed.push(q.url().slice(0, 100)));
      p.on('response', (s) => { if (s.status() >= 400) bad.status400.push(s.status() + ' ' + s.url().slice(0, 100)); });
      const res = await p.goto(BASE + r, { waitUntil: 'networkidle' });
      await fullScroll(p);
      await p.waitForTimeout(1500);
      const is404 = await p.evaluate(() => /404|could not be found/i.test(document.title + ' ' + (document.querySelector('h1') || {}).innerText));
      const h1 = await p.evaluate(() => document.querySelectorAll('h1').length);
      out(`S1/S6 ${vp.width} ${r}`, { status: res.status(), is404, h1, title: await p.title(), ...bad });
      await p.close();
    }
    await ctx.close();
  }

  // S3 / S4 — header and footer links land on their own path (desktop)
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const head = await p.$$eval('header nav[aria-label="Main"] a', (as) => as.map((a) => a.getAttribute('href')));
    const foot = await p.$$eval('footer a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
    const land = [];
    for (const [where, list] of [['header nav[aria-label="Main"]', head], ['footer', foot]]) {
      for (const h of list) {
        await p.goto(BASE + '/', { waitUntil: 'networkidle' });
        await p.click(`${where} a[href="${h}"]`);
        await p.waitForTimeout(900);
        land.push(`${where.split(' ')[0]} ${h} -> ${new URL(p.url()).pathname}`);
      }
    }
    out('S3/S4 links', { head, foot, land, allLand: land.every((l) => { const [, h, , got] = l.split(' '); return h === got; }) });
    await ctx.close();
  }

  // S5 — drawer at 360
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.click('header .mantine-Burger-root');
    await p.waitForTimeout(900);
    const open = await p.evaluate(dialogs);
    const links = await p.$$eval('[role="dialog"] nav[aria-label="Mobile"] a', (as) => as.map((a) => a.getAttribute('href')));
    await shot(p, 's5-drawer-open.png');
    await p.click('[role="dialog"] nav[aria-label="Mobile"] a[href="/services"]');
    await p.waitForTimeout(1200);
    out('S5 drawer', { open, links, after: new URL(p.url()).pathname, closed: await p.evaluate(dialogs) });
    await ctx.close();
  }

  // S12 / S13 — /portfolio modal + /about lightbox (desktop)
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    let p = await ctx.newPage();
    await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
    const before = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
    await fullScroll(p);
    const after = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
    const t = await p.$$('button[aria-label^="Open project detail for"]');
    await t[0].scrollIntoViewIfNeeded(); await t[0].click(); await p.waitForTimeout(900);
    const o = await p.evaluate(dialogs); await shot(p, 's12-portfolio-modal-open.png');
    await p.keyboard.press('Escape'); await p.waitForTimeout(700);
    out('S12 portfolio modal', { hydration: `${before}->${after}`, open: o, afterEscape: await p.evaluate(dialogs), triggers: t.length });

    p = await ctx.newPage();
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' });
    await fullScroll(p); await p.waitForTimeout(2500);
    const thumbs = await p.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.querySelector('img')).map((b) => { const i = b.querySelector('img'); const r = i.getBoundingClientRect(); return i.naturalWidth > 0 && r.width > 0 && r.height > 0 && i.complete; }));
    const t2 = await p.$$('button:has(img)');
    await t2[0].scrollIntoViewIfNeeded(); await t2[0].click(); await p.waitForTimeout(1200);
    const o2 = await p.evaluate(dialogs);
    const img = await p.evaluate(() => { const i = document.querySelector('[role="dialog"] img'); return i ? `${i.naturalWidth}x${i.naturalHeight} ${i.getAttribute('src')}` : null; });
    await shot(p, 's12-about-lightbox-open.png');
    await p.keyboard.press('Escape'); await p.waitForTimeout(900);
    out('S12/S13 about lightbox', { thumbs: thumbs.length, painted: thumbs.filter(Boolean).length, open: o2, img, afterEscape: await p.evaluate(dialogs) });
    await ctx.close();
  }

  // H10 / H12 / H13 — Ask on the stub
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const h10 = await p.evaluate(() => {
      const hero = document.querySelector('main section');
      const ask = document.querySelector('section:has(#ask-heading)');
      const chips = [...ask.querySelectorAll('button')].filter((b) => b.closest('form') === null).map((b) => b.innerText);
      return { heroBottom: hero.getBoundingClientRect().bottom, askTop: ask.getBoundingClientRect().top, chips };
    });
    out('H10', h10);
    const happy = await ask(p, 'stub:slow What can you build?');
    await shot(p, 'h12-stub-happy.png');
    const marks = ['**', '__', '`', ']('].map((m) => `${m}:${happy.text.split(m).length - 1}`).concat([`listLine:${/\n(- |\* |#)/.test(happy.text)}`]);
    out('H12/H13(1) stub happy', { ...happy, marks });
    const none = await ask(p, 'stub:none Do you fly helicopters?');
    await shot(p, 'h12-stub-none.png');
    out('H12 stub:none', none);
    const mal = await ask(p, 'stub:malformed@2 Which databases?');
    await shot(p, 'h13-stub-malformed-at-2.png');
    out('H13(2) stub:malformed@2', mal);
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
