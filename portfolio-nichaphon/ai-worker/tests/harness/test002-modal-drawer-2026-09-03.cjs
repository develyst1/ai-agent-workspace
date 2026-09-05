/*
 * TEST-002 harness — SQ7 independent repro (Tanya, 2026-09-03).
 * Question under test: does a Mantine `Modal` or `Drawer` EVER open on the
 * locally served site? Three triggers:
 *   T1  /portfolio  -> "Project detail" button on a card  -> ProjectModal (Modal)
 *   T2  /about      -> ImageLightbox thumbnail button     -> Modal
 *   T3  /  @390px   -> header Burger                      -> Drawer
 *
 * Plus a HYDRATION CONTROL on every page: the header sets data-scrolled="true"
 * from a client useEffect + useState. If that flips, React hydrated and client
 * state works — so a dead Modal is NOT "the page never hydrated".
 *
 * Playwright is deliberately NOT a dependency of front/ (adding it there is an
 * engineer's change, not QA's). Run with playwright installed OUTSIDE the repo:
 *   NODE_PATH=<scratchpad>/pw/node_modules node test002-modal-drawer-2026-09-03.cjs
 *
 * The script prints observations only. The verdict is written by hand in
 * tests/TEST-002-*.md from what was SEEN in the screenshots, never from a line
 * printed here.
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test002-2026-09-03';
const shot = (n) => path.join(SHOTS, n);
const out = (label, val) =>
  console.log('\n### ' + label + '\n' + (typeof val === 'string' ? val : JSON.stringify(val, null, 1)));

const hideDevOverlay = (p) =>
  p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});

/* Everything a browser can tell us about "did an overlay mount". Read from the
   live DOM, not from React. */
const probe = () => ({
  roleDialog: document.querySelectorAll('[role="dialog"]').length,
  modalRoot: document.querySelectorAll('.mantine-Modal-root').length,
  modalContent: document.querySelectorAll('.mantine-Modal-content').length,
  drawerRoot: document.querySelectorAll('.mantine-Drawer-root').length,
  drawerContent: document.querySelectorAll('.mantine-Drawer-content').length,
  overlay: document.querySelectorAll('.mantine-Overlay-root, [class*="Overlay"]').length,
  portalDivs: document.querySelectorAll('body > div').length,
  scrollLocked: document.body.getAttribute('data-scroll-locked'),
  bodyOverflow: getComputedStyle(document.body).overflow,
  visibleDialogText: [...document.querySelectorAll('[role="dialog"]')]
    .map((d) => (d.textContent || '').trim().slice(0, 120)),
  headerScrolled: document.querySelector('header')?.getAttribute('data-scrolled') ?? '(no header)',
});

async function hydrationControl(p, label) {
  const before = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  out(`HYDRATION CONTROL ${label} (header data-scrolled before/after scroll)`, { before, after });
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const logs = [];
  const wire = (p) => {
    p.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`);
    });
    p.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  };

  /* ---------- T1  /portfolio  ProjectModal ---------- */
  const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  let p = await ctxD.newPage();
  wire(p);
  let r = await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
  await hideDevOverlay(p);
  out('T1 /portfolio http status', r.status());
  await hydrationControl(p, 'T1 /portfolio');
  out('T1 BEFORE click', await p.evaluate(probe));
  await p.screenshot({ path: shot('t1-portfolio-before.png'), fullPage: false });

  const t1btn = p.getByRole('button', { name: /Open project detail for/i }).first();
  const t1count = await p.getByRole('button', { name: /Open project detail for/i }).count();
  out('T1 trigger buttons found', t1count);
  await t1btn.click();
  await p.waitForTimeout(1200);
  out('T1 AFTER click', await p.evaluate(probe));
  await p.screenshot({ path: shot('t1-portfolio-after-click.png'), fullPage: false });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(900);
  out('T1 AFTER Escape (does it close?)', await p.evaluate(probe));
  await p.screenshot({ path: shot('t1-portfolio-after-escape.png'), fullPage: false });

  /* ---------- T2  /about  ImageLightbox ---------- */
  const p2 = await ctxD.newPage();
  wire(p2);
  r = await p2.goto(BASE + '/about', { waitUntil: 'networkidle' });
  await hideDevOverlay(p2);
  out('T2 /about http status', r.status());
  await hydrationControl(p2, 'T2 /about');
  /* Two kinds of lightbox live on /about and their hint text differs:
     certificates say "View certificate", testimonials say "Read full
     conversation". Both are the same ImageLightbox -> Modal. Test BOTH. */
  const t2kinds = [
    { key: 'cert', label: 'certificate lightbox', sel: 'button:has-text("View certificate")' },
    { key: 'testi', label: 'testimonial lightbox', sel: 'button:has-text("Read full conversation")' },
  ];
  for (const k of t2kinds) {
    const loc = p2.locator(k.sel);
    const n = await loc.count();
    out(`T2 ${k.label} triggers found`, n);
    if (n === 0) {
      await p2.screenshot({ path: shot(`t2-${k.key}-no-trigger.png`), fullPage: true });
      continue;
    }
    await loc.first().scrollIntoViewIfNeeded();
    await p2.waitForTimeout(400);
    out(`T2 ${k.label} BEFORE click`, await p2.evaluate(probe));
    await p2.screenshot({ path: shot(`t2-${k.key}-before.png`), fullPage: false });
    await loc.first().click();
    await p2.waitForTimeout(1500);
    out(`T2 ${k.label} AFTER click`, await p2.evaluate(probe));
    await p2.screenshot({ path: shot(`t2-${k.key}-after-click.png`), fullPage: false });
    /* close it again so the next kind starts from a clean page state */
    await p2.keyboard.press('Escape');
    await p2.waitForTimeout(800);
    out(`T2 ${k.label} AFTER Escape (does it close?)`, await p2.evaluate(probe));
  }

  /* Incidental evidence, NOT part of SQ7: the lightbox THUMBNAILS on /about.
     Measure the rendered box of each trigger frame and keep a full-page shot. */
  out(
    'OBS /about lightbox thumbnail frame boxes (w x h, px)',
    await p2.evaluate(() =>
      [...document.querySelectorAll('[class*="ImageLightbox_frame"]')].map((f) => {
        const r = f.getBoundingClientRect();
        const img = f.querySelector('img');
        return {
          frame: `${Math.round(r.width)}x${Math.round(r.height)}`,
          img: img ? `${img.naturalWidth}x${img.naturalHeight} natural` : '(no img)',
          imgBox: img
            ? `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}`
            : '-',
        };
      })
    )
  );
  await p2.evaluate(() => window.scrollTo(0, 0));
  await p2.waitForTimeout(400);
  await p2.screenshot({ path: shot('obs-about-fullpage.png'), fullPage: true });

  /* ---------- T3  /  @390px  Burger -> Drawer ---------- */
  const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p3 = await ctxM.newPage();
  wire(p3);
  r = await p3.goto(BASE + '/', { waitUntil: 'networkidle' });
  await hideDevOverlay(p3);
  out('T3 / (390px) http status', r.status());
  await hydrationControl(p3, 'T3 / mobile');
  const burger = p3.locator('button.mantine-Burger-root, button[aria-label="Open navigation"]').first();
  out('T3 burger visible', await burger.isVisible().catch(() => 'not found'));
  out('T3 BEFORE click', await p3.evaluate(probe));
  out('T3 burger aria-expanded BEFORE', await burger.getAttribute('aria-expanded').catch(() => null));
  await p3.screenshot({ path: shot('t3-mobile-before.png'), fullPage: false });
  await burger.click();
  await p3.waitForTimeout(1200);
  out('T3 AFTER click', await p3.evaluate(probe));
  out('T3 burger aria-expanded AFTER', await burger.getAttribute('aria-expanded').catch(() => null));
  await p3.screenshot({ path: shot('t3-mobile-after-click.png'), fullPage: false });

  /* body innerHTML tail after the drawer click — shows whether a portal node
     exists at all, empty or not. */
  out(
    'T3 body > div class list AFTER',
    await p3.evaluate(() => [...document.querySelectorAll('body > div')].map((d) => d.className || '(no class)'))
  );
  /* the drawer's own close button — a drawer that opens but traps the user is
     still a defect, so close it the way a visitor would. */
  await p3.locator('[role="dialog"] button').first().click().catch(() => {});
  await p3.waitForTimeout(900);
  out('T3 AFTER close-button click (does it close?)', await p3.evaluate(probe));
  await p3.screenshot({ path: shot('t3-mobile-after-close.png'), fullPage: false });

  out('CONSOLE errors + warnings (all pages)', logs.length ? logs : '(none)');
  await browser.close();
})();
