/*
 * TEST-005 harness, round 2 (Tanya, 2026-09-05) — S14 needs a closer look.
 * Round 1 measured a real 8px scrollbar and six background gradients on the
 * /services scroller, but the scroller is 1156px tall inside a 740px viewport,
 * so I cannot tell from a stitched element shot WHAT A VISITOR ACTUALLY SEES.
 * This round captures, at deviceScaleFactor 3 so faint pixels survive:
 *   B1  the top of the table as it first arrives on screen (right edge)
 *   B2  the bottom of the scroller, where the scrollbar would be
 *   B3  the same box after scrolling the table sideways (left shadow should
 *       appear, right shadow should go as content runs out)
 *   B4  the desktop (1280) right edge, where both covers should hide everything
 */
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE_URL || 'http://localhost:3021';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test005-2026-09-05';
const shot = (n) => path.join(SHOTS, n);
const SEL = '[class*="ServicesTable_scroller"]';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });

  /* ---------- mobile 360 ---------- */
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  await p.goto(BASE + '/services', { waitUntil: 'networkidle' });
  await p.bringToFront();
  await p.screenshot({ path: shot('_wake2.png') });
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
  await p.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
    }
  });

  /* B1 — top of the scroller in view */
  const geo = await p.evaluate((s) => {
    const sc = document.querySelector(s);
    const b = sc.getBoundingClientRect();
    return { pageTop: Math.round(b.top + window.scrollY), height: Math.round(b.height) };
  }, SEL);
  await p.evaluate((y) => window.scrollTo(0, y), geo.pageTop - 60);
  await p.waitForTimeout(600);
  await p.screenshot({ path: shot('b1-scroller-top-360-x3.png') });

  /* B2 — bottom of the scroller: is a scrollbar drawn there? */
  await p.evaluate((y) => window.scrollTo(0, y), geo.pageTop + geo.height - 640);
  await p.waitForTimeout(600);
  await p.screenshot({ path: shot('b2-scroller-bottom-360-x3.png') });
  const bar = await p.evaluate((s) => {
    const sc = document.querySelector(s);
    const b = sc.getBoundingClientRect();
    return { boxBottomInViewport: Math.round(b.bottom),
      gutterPx: sc.offsetHeight - sc.clientHeight,
      scrollLeft: sc.scrollLeft, max: sc.scrollWidth - sc.clientWidth };
  }, SEL);
  console.log('\n### B2 bottom gutter\n' + JSON.stringify(bar, null, 1));

  /* B3 — scrolled sideways: left shadow in, right shadow out */
  await p.evaluate((s) => { document.querySelector(s).scrollLeft = 584; }, SEL);
  await p.evaluate((y) => window.scrollTo(0, y), geo.pageTop - 60);
  await p.waitForTimeout(700);
  await p.screenshot({ path: shot('b3-scroller-scrolled-right-360-x3.png') });
  const end = await p.evaluate((s) => {
    const sc = document.querySelector(s);
    const cells = [...sc.querySelectorAll('thead th')].map((th) => {
      const b = th.getBoundingClientRect();
      return th.textContent.trim() + ' @' + Math.round(b.left) + '..' + Math.round(b.right);
    });
    return { scrollLeft: Math.round(sc.scrollLeft), cells };
  }, SEL);
  console.log('\n### B3 after scrolling to the far right\n' + JSON.stringify(end, null, 1));
  await p.close(); await ctx.close();

  /* ---------- B4 desktop 1280 right edge ---------- */
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + '/services', { waitUntil: 'networkidle' });
  await p2.bringToFront();
  await p2.screenshot({ path: shot('_wake3.png') });
  await p2.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
  await p2.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
    }
  });
  await p2.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), SEL);
  await p2.waitForTimeout(700);
  const el = await p2.$(SEL);
  await el.screenshot({ path: shot('b4-scroller-element-1280-x2.png') });
  await p2.close(); await ctx2.close();

  await browser.close();
  console.log('\n=== ROUND 2 DONE ===');
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
