/*
 * TEST-011 AC-a harness (Tanya, QA — 2026-11-01). ZERO real calls — pages only, the Ask section is never pressed.
 * Compares the pre-switch site (BASE_OLD: HEAD b068fba front, built from `git archive`) with the switched site
 * (BASE_NEW: working-tree front reading a seeded COPY of the store) on the six routes, at 1280x900 and 360x740:
 *   - body.innerText after a full scroll (one rAF per step), exact string compare + first differing line;
 *   - every <img> currentSrc (and CSS background-image urls) — the "picture" half of AC-a;
 *   - a full-page screenshot of each, then a pixel compare done in the browser (canvas) — count of differing pixels.
 * Usage: NODE_PATH=<dir>/node_modules BASE_OLD=http://127.0.0.1:3073 BASE_NEW=http://127.0.0.1:3072 OUT=<dir> node test011-aca-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OLD = process.env.BASE_OLD || 'http://127.0.0.1:3073';
const NEW = process.env.BASE_NEW || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROUTES = ['/', '/about', '/services', '/portfolio', '/blog', '/contact'];
const SIZES = [{ w: 1280, h: 900, n: 'desktop' }, { w: 360, h: 740, n: 'phone' }];
fs.mkdirSync(OUT, { recursive: true });

async function capture(page, base, route, tag) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // scroll the whole document one frame per step so every reveal-on-scroll section mounts
  await page.evaluate(async () => {
    const step = Math.floor(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  const text = await page.evaluate(() => document.body.innerText);
  const imgs = await page.evaluate(() => {
    const out = [...document.images].map((i) => i.currentSrc.replace(location.origin, '') + (i.complete && i.naturalWidth > 0 ? '' : ' [NOT LOADED]'));
    for (const el of document.querySelectorAll('*')) {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('url(')) out.push('bg:' + bg.replace(location.origin, ''));
    }
    return out;
  });
  const file = path.join(OUT, `${tag}.png`);
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  return { text, imgs, file };
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const report = [];
  for (const s of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    for (const r of ROUTES) {
      const slug = (r === '/' ? 'home' : r.slice(1)) + '-' + s.n;
      errors.length = 0;
      const a = await capture(page, OLD, r, `old-${slug}`);
      const oldErr = errors.splice(0);
      const b = await capture(page, NEW, r, `new-${slug}`);
      const newErr = errors.splice(0);
      const al = a.text.split('\n');
      const bl = b.text.split('\n');
      let firstDiff = -1;
      for (let i = 0; i < Math.max(al.length, bl.length); i++) if (al[i] !== bl[i]) { firstDiff = i; break; }
      const pix = await page.evaluate(async ([pa, pb]) => {
        const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
        const [ia, ib] = await Promise.all([load(pa), load(pb)]);
        if (ia.width !== ib.width || ia.height !== ib.height) return { sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height], diff: null };
        const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
        const x = c.getContext('2d');
        x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data;
        x.clearRect(0, 0, c.width, c.height); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
        let n = 0; let minY = -1; let maxY = -1;
        for (let i = 0; i < da.length; i += 4) {
          if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { n++; const y = Math.floor(i / 4 / c.width); if (minY < 0) minY = y; maxY = y; }
        }
        return { sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height], diff: n, rows: [minY, maxY] };
      }, ['data:image/png;base64,' + fs.readFileSync(a.file).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(b.file).toString('base64')]);
      const row = {
        route: r, size: s.n,
        textEqual: a.text === b.text, textLines: [al.length, bl.length],
        firstDiff: firstDiff < 0 ? null : { line: firstDiff, old: al[firstDiff], new: bl[firstDiff] },
        imgsEqual: JSON.stringify(a.imgs) === JSON.stringify(b.imgs), imgs: [a.imgs.length, b.imgs.length],
        imgsOnlyOld: a.imgs.filter((x) => !b.imgs.includes(x)), imgsOnlyNew: b.imgs.filter((x) => !a.imgs.includes(x)),
        notLoadedNew: b.imgs.filter((x) => x.includes('NOT LOADED')),
        pixels: pix, errorsOld: oldErr, errorsNew: newErr,
      };
      report.push(row);
      fs.writeFileSync(path.join(OUT, `text-old-${slug}.txt`), a.text);
      fs.writeFileSync(path.join(OUT, `text-new-${slug}.txt`), b.text);
      console.log(JSON.stringify(row));
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'aca-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
