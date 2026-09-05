/*
 * TEST-003 harness (Tanya, QA — 2026-09-05).
 * The BUILD round: the same three SQ7 triggers TEST-002 ran on `next dev`, now
 * on a PRODUCTION build (`npm run build`), plus REGRESSION S13's thumbnails.
 *
 *  T1  /portfolio -> a card's "Project detail" button -> Mantine Modal
 *  T2a /about     -> "View certificate"        -> ImageLightbox Modal
 *  T2b /about     -> "Read full conversation"  -> ImageLightbox Modal
 *  T3  / @390px   -> header burger             -> Mantine Drawer
 *  HC  hydration control on every page (header[data-scrolled] false -> true)
 *  S13 all 9 /about ImageLightbox thumbnails: non-zero box AND painted
 *      (complete === true, naturalWidth > 0), at 1280 and at 360
 *  CON console errors / pageerrors / failed requests across the whole run
 *
 * Run rules obeyed (REGRESSION §How to run it):
 *   - headed Chrome (`channel: 'chrome'`, headless: false)
 *   - the tab is fronted and one throwaway screenshot taken BEFORE anything is
 *     measured, so document.hidden goes false and scrolling actually runs
 *   - the whole document is scrolled, one requestAnimationFrame per step,
 *     before any measurement (S13's images are lazy)
 *   - no el.focus() anywhere
 *
 * Usage (playwright lives OUTSIDE the repo; front/package.json is untouched):
 *   NODE_PATH=<scratchpad>/pw/node_modules \
 *   BASE_URL=http://localhost:3041 LABEL=standalone \
 *   node test003-2026-09-05.cjs
 *
 * Prints observations only. The verdict comes from the screenshots.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3041';
const LABEL = process.env.LABEL || 'standalone';
const SHOTS = path.join(
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test003-2026-09-05',
  LABEL
);
fs.mkdirSync(SHOTS, { recursive: true });
const shot = (n) => path.join(SHOTS, n);
const out = (l, v) => console.log('\n### ' + l + '\n' + JSON.stringify(v, null, 1));

/* Front the tab and take one throwaway shot: this is what makes document.hidden
   false in headed Chrome. Without it a headed background tab will not scroll. */
async function wake(p, tag) {
  await p.bringToFront();
  await p.screenshot({ path: shot(`_wake-${tag}.png`) });
}

/* Scroll the whole document, one rAF per step, then return to the top. Lazy
   images (S13) never load until they intersect. */
async function scrollAll(p) {
  await p.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => r()));
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

const probe = () => ({
  dialogs: document.querySelectorAll('[role="dialog"]').length,
  modalContent: document.querySelectorAll('.mantine-Modal-content').length,
  drawerContent: document.querySelectorAll('.mantine-Drawer-content').length,
  overlays: document.querySelectorAll('.mantine-Modal-overlay, .mantine-Drawer-overlay').length,
  scrollLocked: document.body.getAttribute('data-scroll-locked'),
  bodyOverflow: getComputedStyle(document.body).overflow,
  visibleDialogText: [...document.querySelectorAll('[role="dialog"]')]
    .map((d) => (d.textContent || '').trim().slice(0, 120)),
});

async function hydrationControl(p, label) {
  /* settle back at the top first — scrollAll() ran before this and the header
     needs a moment to flip back, otherwise "before" reads true and the control
     proves less than it could. */
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(700);
  const before = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  out(`HC hydration control — ${label} (header data-scrolled before/after 400px scroll)`, { before, after });
}

/* S13: a loaded image is not a rendered image, and a sized box is not a painted
   one. Report BOTH the frame box and the img's complete/naturalWidth. */
const thumbProbe = () =>
  [...document.querySelectorAll('[class*="ImageLightbox_frame"]')].map((f, i) => {
    const fr = f.getBoundingClientRect();
    const img = f.querySelector('img');
    const ir = img ? img.getBoundingClientRect() : null;
    return {
      n: i + 1,
      frame: `${Math.round(fr.width)}x${Math.round(fr.height)}`,
      imgBox: ir ? `${Math.round(ir.width)}x${Math.round(ir.height)}` : '(no img)',
      natural: img ? `${img.naturalWidth}x${img.naturalHeight}` : '-',
      complete: img ? img.complete : '-',
      painted: !!(img && img.complete && img.naturalWidth > 0 && ir.width > 0 && ir.height > 0),
    };
  });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const logs = [];
  const wire = (p, where) => {
    p.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${where}][${m.type()}] ${m.text()}`);
    });
    p.on('pageerror', (e) => logs.push(`[${where}][pageerror] ${e.message}`));
    p.on('requestfailed', (r) => logs.push(`[${where}][requestfailed] ${r.url()} — ${r.failure()?.errorText}`));
    p.on('response', (r) => { if (r.status() >= 400) logs.push(`[${where}][http ${r.status()}] ${r.url()}`); });
  };

  console.log(`\n===== TEST-003 build round — BASE=${BASE} LABEL=${LABEL} =====`);

  /* ---------- T1  /portfolio  ProjectModal (desktop 1280x900) ---------- */
  const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctxD.newPage();
  wire(p, '/portfolio');
  let r = await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
  await wake(p, 't1');
  out('T1 /portfolio http status', r.status());
  await scrollAll(p);
  await hydrationControl(p, 'T1 /portfolio');
  out('T1 BEFORE click', await p.evaluate(probe));
  await p.screenshot({ path: shot('t1-portfolio-before.png'), fullPage: false });

  const t1loc = p.getByRole('button', { name: /Open project detail for/i });
  out('T1 trigger buttons found', await t1loc.count());
  await t1loc.first().scrollIntoViewIfNeeded();
  await t1loc.first().click();
  await p.waitForTimeout(1400);
  out('T1 AFTER click', await p.evaluate(probe));
  await p.screenshot({ path: shot('t1-portfolio-after-click.png'), fullPage: false });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);
  out('T1 AFTER Escape (does it close?)', await p.evaluate(probe));
  await p.screenshot({ path: shot('t1-portfolio-after-escape.png'), fullPage: false });

  /* ---------- T2  /about  ImageLightbox (desktop) + S13 ---------- */
  const p2 = await ctxD.newPage();
  wire(p2, '/about');
  r = await p2.goto(BASE + '/about', { waitUntil: 'networkidle' });
  await wake(p2, 't2');
  out('T2 /about http status', r.status());
  await scrollAll(p2);
  await p2.waitForTimeout(1500); /* the nine images are lazy; give them room */
  await hydrationControl(p2, 'T2 /about');

  out('S13 /about thumbnails @1280 (frame box + painted)', await p2.evaluate(thumbProbe));
  await p2.evaluate(() => window.scrollTo(0, 0));
  await p2.waitForTimeout(400);
  await p2.screenshot({ path: shot('s13-about-fullpage-1280.png'), fullPage: true });

  const kinds = [
    { key: 'cert', label: 'certificate lightbox', sel: 'button:has-text("View certificate")' },
    { key: 'testi', label: 'testimonial lightbox', sel: 'button:has-text("Read full conversation")' },
  ];
  for (const k of kinds) {
    const loc = p2.locator(k.sel);
    const n = await loc.count();
    out(`T2 ${k.label} triggers found`, n);
    if (n === 0) { await p2.screenshot({ path: shot(`t2-${k.key}-no-trigger.png`), fullPage: true }); continue; }
    await loc.first().scrollIntoViewIfNeeded();
    await p2.waitForTimeout(500);
    await p2.screenshot({ path: shot(`t2-${k.key}-before.png`), fullPage: false });
    out(`T2 ${k.label} BEFORE click`, await p2.evaluate(probe));
    await loc.first().click();
    await p2.waitForTimeout(1600);
    out(`T2 ${k.label} AFTER click`, await p2.evaluate(probe));
    /* is the image inside the modal actually painted, or is it an empty box? */
    out(
      `T2 ${k.label} image INSIDE the modal`,
      await p2.evaluate(() => {
        const img = document.querySelector('[role="dialog"] img');
        if (!img) return '(no img in dialog)';
        const b = img.getBoundingClientRect();
        return {
          box: `${Math.round(b.width)}x${Math.round(b.height)}`,
          natural: `${img.naturalWidth}x${img.naturalHeight}`,
          complete: img.complete,
        };
      })
    );
    await p2.screenshot({ path: shot(`t2-${k.key}-after-click.png`), fullPage: false });
    await p2.keyboard.press('Escape');
    await p2.waitForTimeout(900);
    out(`T2 ${k.label} AFTER Escape (does it close?)`, await p2.evaluate(probe));
    await p2.screenshot({ path: shot(`t2-${k.key}-after-escape.png`), fullPage: false });
  }

  /* ---------- S13 again at 360 (mobile) ---------- */
  const ctxM = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1 });
  const pm = await ctxM.newPage();
  wire(pm, '/about@360');
  r = await pm.goto(BASE + '/about', { waitUntil: 'networkidle' });
  await wake(pm, 's13m');
  out('S13 /about @360 http status', r.status());
  await scrollAll(pm);
  await pm.waitForTimeout(1500);
  out('S13 /about thumbnails @360 (frame box + painted)', await pm.evaluate(thumbProbe));
  await pm.evaluate(() => window.scrollTo(0, 0));
  await pm.waitForTimeout(400);
  await pm.screenshot({ path: shot('s13-about-fullpage-360.png'), fullPage: true });

  /* ---------- T3  / @390px  Burger -> Drawer ---------- */
  const ctxM390 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p3 = await ctxM390.newPage();
  wire(p3, '/@390');
  r = await p3.goto(BASE + '/', { waitUntil: 'networkidle' });
  await wake(p3, 't3');
  out('T3 / (390px) http status', r.status());
  await scrollAll(p3);
  await hydrationControl(p3, 'T3 / mobile');
  const burger = p3.locator('button.mantine-Burger-root, button[aria-label="Open navigation"]').first();
  out('T3 burger visible', await burger.isVisible().catch(() => 'not found'));
  out('T3 burger aria-expanded BEFORE', await burger.getAttribute('aria-expanded').catch(() => null));
  out('T3 BEFORE click', await p3.evaluate(probe));
  await p3.screenshot({ path: shot('t3-mobile-before.png'), fullPage: false });
  await burger.click();
  await p3.waitForTimeout(1300);
  out('T3 AFTER click', await p3.evaluate(probe));
  out('T3 burger aria-expanded AFTER', await burger.getAttribute('aria-expanded').catch(() => null));
  await p3.screenshot({ path: shot('t3-mobile-after-click.png'), fullPage: false });
  await p3.locator('[role="dialog"] button').first().click().catch(() => {});
  await p3.waitForTimeout(1000);
  out('T3 AFTER close-button click (does it close?)', await p3.evaluate(probe));
  await p3.screenshot({ path: shot('t3-mobile-after-close.png'), fullPage: false });

  out('CON console errors + warnings + failed requests (whole run)', logs.length ? logs : '(none)');
  await browser.close();
})();
