/*
 * TEST-005 harness (Tanya, QA — 2026-09-05).
 * The closing round on REQ-002: the five checks Porter asked for, plus a small
 * trust set on the two routes the fixes touched.
 *
 *  A1  REGRESSION H8 — Home hero at 360x740: name, nickname/role, lead, BOTH
 *      CTAs and the hero quote above the fold. Ticks AC3 if it passes.
 *  A2  REGRESSION S14 — /services at 360: is the visitor TOLD the table scrolls?
 *  A3  AC7 — no colour-scheme control on the five non-Home routes, desktop +
 *      mobile + inside the open mobile drawer.
 *  A4  /services at 1280 — the desktop eye Sober measured but never saw.
 *  A5  Arrow-key scrolling of the /services scroller, reached by REAL Tab
 *      presses (Sober's carry (b); the engineer's harness sent no key events).
 *  A6  Trust set on / and /services only: console errors, no page overflow at
 *      360, dark scheme. The three edits were CSS/deletion, so this is not the
 *      full sweep — see the TEST file.
 *
 * Run rules obeyed (REGRESSION §How to run it): headed Chrome, the tab is
 * fronted and one screenshot taken before anything is measured (so
 * document.hidden goes false and scrolling/transitions actually run), the whole
 * document is scrolled with a requestAnimationFrame per step before measuring,
 * and focus is reached with real Tab presses, never el.focus().
 *
 * Prints observations only. The verdict comes from the screenshots.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3021';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test005-2026-09-05';
fs.mkdirSync(SHOTS, { recursive: true });
const shot = (n) => path.join(SHOTS, n);
const R = {};
const out = (l, v) => { R[l] = v; console.log('\n### ' + l + '\n' + JSON.stringify(v, null, 1)); };
const hideDevOverlay = (p) =>
  p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});

/* Front the tab and take one throwaway shot: this is what makes document.hidden
   false in headed Chrome, and without it scrolling and transitions never run. */
async function wake(p) {
  await p.bringToFront();
  await p.screenshot({ path: shot('_wake.png') });
  await hideDevOverlay(p);
  await p.waitForTimeout(500);
}

const scrollAll = (p) => p.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.6);
  for (let y = 0; y < document.body.scrollHeight + step; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 130)));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 300)));
});

/* The colour-scheme probe, identical in shape to the H1 probe TEST-004 ran on
   Home — same word list, same node sweep. */
const schemeProbe = () => {
  const WORDS = ['theme', 'scheme', 'dark', 'light', 'mode', 'toggle'];
  const suspects = [];
  document.querySelectorAll('button,[role=switch],[role=radio],input,select,a').forEach((el) => {
    const hay = [
      el.textContent || '', el.getAttribute('aria-label') || '', el.getAttribute('title') || '',
      el.getAttribute('name') || '', el.getAttribute('id') || '',
      (el.className || '').toString(), el.getAttribute('data-testid') || '',
    ].join(' ').toLowerCase();
    if (WORDS.some((w) => hay.includes(w))) {
      suspects.push({ tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40),
        aria: el.getAttribute('aria-label'), cls: (el.className || '').toString().slice(0, 60) });
    }
  });
  const csNodes = [...document.querySelectorAll('*')]
    .filter((el) => /colorscheme/i.test((el.className || '').toString()))
    .map((el) => (el.className || '').toString().slice(0, 60));
  return {
    suspects, suspectCount: suspects.length,
    colorSchemeNodes: csNodes, colorSchemeNodeCount: csNodes.length,
    htmlScheme: document.documentElement.getAttribute('data-mantine-color-scheme'),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    srcHits: ['ColorSchemeToggle', 'useMantineColorScheme', 'toggleColorScheme']
      .filter((s) => document.documentElement.outerHTML.includes(s)),
  };
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const errors = [];

  /* ================= A1 — H8, Home hero at 360x740 ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    p.on('console', (m) => m.type() === 'error' && errors.push('A1 console: ' + m.text().slice(0, 160)));
    p.on('pageerror', (e) => errors.push('A1 pageerror: ' + String(e).slice(0, 160)));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await wake(p);
    await p.waitForTimeout(1500);            // let the entrance animation settle
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);

    const h8 = await p.evaluate(() => {
      const box = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { top: Math.round(b.top), bottom: Math.round(b.bottom),
          w: Math.round(b.width), h: Math.round(b.height),
          text: (el.textContent || '').trim().slice(0, 46) };
      };
      const q = (s) => document.querySelector(s);
      const fold = window.innerHeight;
      const parts = {
        name: box(q('h1')),
        supporting: box(q('[class*="HomeHero_supporting"]')),
        lead: box(q('[class*="HomeHero_lead"]')),
        cta1: box(q('main a[href="/portfolio"]')),
        cta2: box(q('main a[href="/contact"]')),
        quote: box(q('main blockquote') || q('[class*="PullQuote"]')),
      };
      const verdict = {};
      Object.entries(parts).forEach(([k, v]) => {
        verdict[k] = v ? (v.bottom <= fold ? 'ABOVE FOLD' : (v.top < fold ? 'CUT BY FOLD' : 'BELOW FOLD')) : 'NOT FOUND';
      });
      return { fold, innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        docHidden: document.hidden, parts, verdict };
    });
    out('A1 H8 hero at 360x740', h8);
    await p.screenshot({ path: shot('a1-h8-fold-360x740.png') });          // viewport = the fold
    await p.screenshot({ path: shot('a1-home-full-360.png'), fullPage: true });
    await p.close(); await ctx.close();
  }

  /* ================= A2 — S14, /services at 360 ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    p.on('console', (m) => m.type() === 'error' && errors.push('A2 console: ' + m.text().slice(0, 160)));
    p.on('pageerror', (e) => errors.push('A2 pageerror: ' + String(e).slice(0, 160)));
    await p.goto(BASE + '/services', { waitUntil: 'networkidle' });
    await wake(p);
    await scrollAll(p);

    const s14 = await p.evaluate(() => {
      const sc = document.querySelector('[class*="ServicesTable_scroller"]');
      if (!sc) return { found: false };
      const t = sc.querySelector('table');
      const cs = getComputedStyle(sc);
      return {
        found: true,
        scrollerClient: sc.clientWidth, scrollerScroll: sc.scrollWidth,
        tableWidth: Math.round(t.getBoundingClientRect().width),
        /* a classic (non-overlay) horizontal scrollbar takes layout height */
        scrollbarHeightPx: sc.offsetHeight - sc.clientHeight - 2 /* 1px border each side */,
        offsetHeight: sc.offsetHeight, clientHeight: sc.clientHeight,
        tabIndex: sc.tabIndex, role: sc.getAttribute('role'),
        ariaLabel: sc.getAttribute('aria-label'),
        backgroundImage: cs.backgroundImage.slice(0, 400),
        backgroundAttachment: cs.backgroundAttachment,
        backgroundSize: cs.backgroundSize,
        scrollbarWidthProp: cs.scrollbarWidth, scrollbarColorProp: cs.scrollbarColor,
        /* any hint text near the table? */
        hintText: [...sc.parentElement.querySelectorAll('*')]
          .map((e) => (e.childElementCount === 0 ? (e.textContent || '').trim() : ''))
          .filter((t) => /swipe|scroll|เลื่อน|drag|→/i.test(t)),
        scrollLeftAtRest: sc.scrollLeft,
      };
    });
    out('A2 S14 /services scroller at 360', s14);

    await p.evaluate(() => document.querySelector('[class*="ServicesTable_scroller"]')
      .scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(600);
    await p.screenshot({ path: shot('a2-s14-services-table-360.png') });
    const el = await p.$('[class*="ServicesTable_scroller"]');
    await el.screenshot({ path: shot('a2-s14-scroller-element-360.png') });
    await p.screenshot({ path: shot('a2-services-full-360.png'), fullPage: true });

    /* ---- A5, same page/viewport: real Tab presses, then arrow keys ---- */
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(300);
    let tabs = 0, reached = false, trail = [];
    for (; tabs < 40 && !reached; ) {
      await p.keyboard.press('Tab'); tabs++;
      const cur = await p.evaluate(() => {
        const a = document.activeElement;
        return { tag: a.tagName, role: a.getAttribute('role'),
          cls: (a.className || '').toString().slice(0, 50),
          text: (a.textContent || '').trim().slice(0, 24),
          isScroller: /ServicesTable_scroller/.test((a.className || '').toString()) };
      });
      trail.push(tabs + ':' + (cur.text || cur.tag) + (cur.isScroller ? ' <== SCROLLER' : ''));
      reached = cur.isScroller;
    }
    const before = await p.evaluate(() =>
      document.querySelector('[class*="ServicesTable_scroller"]').scrollLeft);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120);
    const afterArrows = await p.evaluate(() =>
      document.querySelector('[class*="ServicesTable_scroller"]').scrollLeft);
    await p.keyboard.press('End'); await p.waitForTimeout(400);
    const afterEnd = await p.evaluate(() => {
      const sc = document.querySelector('[class*="ServicesTable_scroller"]');
      return { scrollLeft: Math.round(sc.scrollLeft), max: sc.scrollWidth - sc.clientWidth };
    });
    const focusRing = await p.evaluate(() => {
      const sc = document.querySelector('[class*="ServicesTable_scroller"]');
      const s = getComputedStyle(sc);
      return { outline: s.outline, outlineOffset: s.outlineOffset, boxShadow: s.boxShadow,
        isActive: document.activeElement === sc };
    });
    out('A5 arrow-key scroll of the /services scroller', {
      tabsToReach: reached ? tabs : 'NOT REACHED in 40 tabs',
      trail, scrollLeftBefore: before, afterThreeArrowRight: Math.round(afterArrows),
      afterEnd, focusRing,
    });
    await p.evaluate(() => document.querySelector('[class*="ServicesTable_scroller"]')
      .scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(400);
    await p.screenshot({ path: shot('a5-scroller-after-keyboard-360.png') });

    /* trust set on this route */
    out('A6 /services 360 trust', await p.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      htmlScheme: document.documentElement.getAttribute('data-mantine-color-scheme'),
      bodyBg: getComputedStyle(document.body).backgroundColor,
    })));
    await p.close(); await ctx.close();
  }

  /* ================= A4 — /services at 1280, the desktop eye ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    p.on('console', (m) => m.type() === 'error' && errors.push('A4 console: ' + m.text().slice(0, 160)));
    p.on('pageerror', (e) => errors.push('A4 pageerror: ' + String(e).slice(0, 160)));
    await p.goto(BASE + '/services', { waitUntil: 'networkidle' });
    await wake(p);
    await scrollAll(p);
    const d = await p.evaluate(() => {
      const sc = document.querySelector('[class*="ServicesTable_scroller"]');
      const t = sc.querySelector('table');
      const cs = getComputedStyle(sc);
      const heads = [...t.querySelectorAll('thead th')].map((th) => {
        const b = th.getBoundingClientRect();
        return th.textContent.trim() + ' @' + Math.round(b.left) + '..' + Math.round(b.right);
      });
      return {
        viewport: window.innerWidth + 'x' + window.innerHeight,
        scrollerClient: sc.clientWidth, scrollerScroll: sc.scrollWidth,
        overflows: sc.scrollWidth > sc.clientWidth,
        scrollbarHeightPx: sc.offsetHeight - sc.clientHeight - 2,
        tableWidth: Math.round(t.getBoundingClientRect().width),
        rows: t.querySelectorAll('tbody tr').length,
        columnHeads: heads,
        backgroundAttachment: cs.backgroundAttachment,
        pageScrollWidth: document.documentElement.scrollWidth,
        pageClientWidth: document.documentElement.clientWidth,
      };
    });
    out('A4 /services at 1280', d);
    await p.evaluate(() => document.querySelector('[class*="ServicesTable_scroller"]')
      .scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(600);
    await p.screenshot({ path: shot('a4-services-table-1280.png') });
    await p.screenshot({ path: shot('a4-services-full-1280.png'), fullPage: true });
    await p.close(); await ctx.close();
  }

  /* ================= A3 — AC7 on the five non-Home routes ================= */
  const ROUTES = ['/about', '/services', '/portfolio', '/blog', '/contact'];
  const ac7 = { desktop: {}, mobile: {}, mobileDrawer: {} };
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    p.on('console', (m) => m.type() === 'error' && errors.push('A3d console: ' + m.text().slice(0, 160)));
    p.on('pageerror', (e) => errors.push('A3d pageerror: ' + String(e).slice(0, 160)));
    for (const r of ROUTES) {
      await p.goto(BASE + r, { waitUntil: 'networkidle' });
      await wake(p);
      await scrollAll(p);
      ac7.desktop[r] = await p.evaluate(schemeProbe);
      await p.screenshot({ path: shot('a3-header-desktop-' + r.slice(1) + '.png'),
        clip: { x: 0, y: 0, width: 1280, height: 140 } });
    }
    await p.close(); await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    p.on('console', (m) => m.type() === 'error' && errors.push('A3m console: ' + m.text().slice(0, 160)));
    p.on('pageerror', (e) => errors.push('A3m pageerror: ' + String(e).slice(0, 160)));
    for (const r of ROUTES) {
      await p.goto(BASE + r, { waitUntil: 'networkidle' });
      await wake(p);
      await scrollAll(p);
      ac7.mobile[r] = await p.evaluate(schemeProbe);
      /* the toggle could live inside the burger drawer — open it and look */
      const burger = await p.$('header button');
      if (burger) {
        await burger.click();
        await p.waitForTimeout(700);
        ac7.mobileDrawer[r] = await p.evaluate(() => {
          const dlg = document.querySelector('[role=dialog]');
          const probe = (root) => {
            const WORDS = ['theme', 'scheme', 'dark', 'light', 'mode', 'toggle'];
            const s = [];
            root.querySelectorAll('button,[role=switch],input,a').forEach((el) => {
              const hay = [el.textContent || '', el.getAttribute('aria-label') || '',
                (el.className || '').toString()].join(' ').toLowerCase();
              if (WORDS.some((w) => hay.includes(w))) s.push((el.textContent || '').trim().slice(0, 30) || el.tagName);
            });
            return s;
          };
          return { dialogCount: document.querySelectorAll('[role=dialog]').length,
            links: dlg ? [...dlg.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [],
            suspects: dlg ? probe(dlg) : ['NO DIALOG'] };
        });
        if (r === '/about') await p.screenshot({ path: shot('a3-drawer-open-about-360.png') });
        await p.keyboard.press('Escape');
        await p.waitForTimeout(400);
      } else {
        ac7.mobileDrawer[r] = { error: 'no header button found' };
      }
    }
    await p.close(); await ctx.close();
  }
  out('A3 AC7 colour-scheme probe, five non-Home routes', ac7);

  /* ================= A6 — Home 360 trust ================= */
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    p.on('console', (m) => m.type() === 'error' && errors.push('A6 console: ' + m.text().slice(0, 160)));
    p.on('pageerror', (e) => errors.push('A6 pageerror: ' + String(e).slice(0, 160)));
    const failed = [];
    p.on('requestfailed', (rq) => failed.push(rq.url().slice(0, 120)));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await wake(p);
    await scrollAll(p);
    out('A6 / 360 trust', await p.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      htmlScheme: document.documentElement.getAttribute('data-mantine-color-scheme'),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      quotes: [...document.querySelectorAll('blockquote')].map((b) => (b.textContent || '').trim().slice(0, 60)),
    })));
    R.failedRequestsHome360 = failed;
    await p.close(); await ctx.close();
  }

  out('CONSOLE ERRORS / PAGEERRORS across the whole run', errors);
  fs.writeFileSync(shot('_raw-results.json'), JSON.stringify(R, null, 2));
  await browser.close();
  console.log('\n=== TEST-005 HARNESS DONE — shots in ' + SHOTS + ' ===');
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
