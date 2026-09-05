/*
 * TEST-004 harness — REQ-002 site-wide acceptance round (Tanya, 2026-09-05).
 *
 * Three outcomes Porter asked for, in one pass:
 *   (i)   full REGRESSION re-run: S1-S13 + H1-H8
 *   (ii)  R9 forbidden-string sweep across ALL SIX rendered routes
 *   (iii) the 7 SQ8 eye checks, captured as screenshots for a human eye
 *
 * Playwright is deliberately NOT a dependency of front/. Run it from outside:
 *   NODE_PATH=<scratchpad>/pw/node_modules \
 *   BASE_URL=http://localhost:3021 node test004-2026-09-05.cjs
 *
 * Port 3021 (not 3000): 3000 was already held by an orphan `next` server for
 * this same repo that this session did not start and does not own.
 *
 * The script prints observations ONLY. Every verdict in tests/TEST-004-*.md is
 * written by hand from the screenshots that were opened and read.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3021';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test004-2026-09-05';
fs.mkdirSync(SHOTS, { recursive: true });
const shot = (n) => path.join(SHOTS, n);

const RESULTS = {};
const out = (label, val) => {
  RESULTS[label] = val;
  console.log('\n### ' + label + '\n' + (typeof val === 'string' ? val : JSON.stringify(val, null, 1)));
};

const ROUTES = ['/', '/about', '/services', '/portfolio', '/blog', '/contact'];
const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 360, height: 740 };

/* R9 — the reference screenshot's own content. None of it may appear. */
const R9 = ['FAEK', '150+', 'Win Awards', '12Years', 'Li Europan', 'Get Started', 'CREATIVE', 'agency.'];

/* R5 as it stands in REQ-001 today (quote 2 Thai = the owner-ruled 42-char form). */
const R5 = [
  'นักพนันที่เก่งมากๆ ไม่ได้เล่นแค่ตาที่ตัวเองไพ่ดี',
  'ผมไม่ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร',
  'จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลย นอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"',
  "Don't say why me. Say try me.",
  "A truly great gambler doesn't only play the hands where his own cards are good.",
  'I don\'t work "for" anyone. I work "with" them.',
  'My weakness and my strength are the same thing: "I care about nothing but solving the most important problem of the organisation."',
];

const hideDevOverlay = (p) =>
  p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});

/* Scroll the whole document so lazy content intersects, then come back.
   The engineer's harness never did this, which is why paint stayed unverified. */
async function fullScroll(p) {
  await p.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
  });
  await p.waitForTimeout(400);
}

/* Did the client bundle actually come alive? header[data-scrolled] false->true. */
async function hydrationControl(p) {
  const before = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(350);
  const after = await p.evaluate(() => document.querySelector('header')?.getAttribute('data-scrolled'));
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  return { before, after, hydrated: before === 'false' && after === 'true' };
}

const overlayProbe = () => ({
  roleDialog: document.querySelectorAll('[role="dialog"]').length,
  modalContent: document.querySelectorAll('.mantine-Modal-content').length,
  drawerContent: document.querySelectorAll('.mantine-Drawer-content').length,
  scrollLocked: document.body.getAttribute('data-scroll-locked'),
  dialogText: [...document.querySelectorAll('[role="dialog"]')].map((d) =>
    (d.textContent || '').trim().slice(0, 90)),
  dialogBox: [...document.querySelectorAll('[role="dialog"]')].map((d) => {
    const r = d.getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height);
  }),
});

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });

  /* =================================================================
     PART 1 — per-route sweep at both viewports.
     S1 S2 S6 S7 S8 S9 S10 S13 + R9 + full-page shots for the owner.
     ================================================================= */
  for (const vp of [{ name: 'desktop', ...DESKTOP }, { name: 'mobile', ...MOBILE }]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    for (const route of ROUTES) {
      const slug = route === '/' ? 'home' : route.slice(1);
      const p = await ctx.newPage();
      const logs = [];
      const failed = [];
      p.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`);
      });
      p.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
      p.on('requestfailed', (r) => failed.push(`${r.url()} :: ${r.failure()?.errorText}`));

      const res = await p.goto(BASE + route, { waitUntil: 'networkidle' });
      await hideDevOverlay(p);
      await fullScroll(p);
      /* give every in-viewport image a chance to decode */
      await p.waitForTimeout(600);

      const data = await p.evaluate((r9) => {
        const bodyText = document.body.innerText;
        const html = document.documentElement.outerHTML;
        const de = document.documentElement;
        const imgs = [...document.querySelectorAll('img')].map((i) => {
          const b = i.getBoundingClientRect();
          return {
            src: (i.currentSrc || i.src || '').slice(-70),
            box: Math.round(b.width) + 'x' + Math.round(b.height),
            zero: b.width === 0 || b.height === 0,
            natural: i.naturalWidth + 'x' + i.naturalHeight,
            painted: i.naturalWidth > 0 && b.width > 0 && b.height > 0,
          };
        });
        const overflow = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const b = el.getBoundingClientRect();
            return b.width > 0 && b.right > de.clientWidth + 1;
          })
          .slice(0, 6)
          .map((el) => el.tagName + '.' + (el.className || '').toString().slice(0, 40)
            + ' right=' + Math.round(el.getBoundingClientRect().right));
        return {
          title: document.title,
          h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 80)),
          is404: /This page could not be found/i.test(bodyText),
          colorScheme: de.getAttribute('data-mantine-color-scheme'),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          scrollWidth: de.scrollWidth,
          clientWidth: de.clientWidth,
          overflowSuspects: overflow,
          r9TextHits: r9.filter((s) => bodyText.includes(s)),
          r9SourceHits: r9.filter((s) => html.includes(s)),
          fonts: {
            spaceGrotesk: document.fonts.check('16px "Space Grotesk"'),
            plexThai: document.fonts.check('16px "IBM Plex Sans Thai"'),
            jetbrains: document.fonts.check('16px "JetBrains Mono"'),
            loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
          },
          imgCount: imgs.length,
          imgZero: imgs.filter((i) => i.zero),
          imgUnpainted: imgs.filter((i) => !i.painted),
          openingBlockHeight: (() => {
            const el = document.querySelector('main > *');
            return el ? Math.round(el.getBoundingClientRect().height * 100) / 100 : null;
          })(),
        };
      }, R9);

      await p.screenshot({ path: shot(`${vp.name}-${slug}-full.png`), fullPage: true });
      await p.screenshot({ path: shot(`${vp.name}-${slug}-fold.png`), fullPage: false });

      out(`ROUTE ${vp.name} ${route}`, {
        status: res.status(),
        ...data,
        consoleErrors: logs.filter((l) => l.startsWith('[error]') || l.startsWith('[pageerror]')),
        consoleWarnings: logs.filter((l) => l.startsWith('[warning]')),
        requestFailed: failed,
      });
      await p.close();
    }
    await ctx.close();
  }

  /* =================================================================
     PART 2 — S3 / S4 nav click-through at desktop
     ================================================================= */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);

    const headerLinks = await p.$$eval('header nav[aria-label="Main"] a',
      (as) => as.map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') })));
    const footerLinks = await p.$$eval('footer a[href^="/"]',
      (as) => as.map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') })));
    out('S3 header links found', headerLinks);
    out('S4 footer links found', footerLinks);

    const clickThrough = async (sel, links, label) => {
      const rows = [];
      for (const l of links) {
        await p.goto(BASE + '/', { waitUntil: 'networkidle' });
        await hideDevOverlay(p);
        await p.click(`${sel} a[href="${l.href}"]`);
        await p.waitForTimeout(700);
        rows.push({ label: l.label, href: l.href, landed: new URL(p.url()).pathname,
          ok: new URL(p.url()).pathname === l.href });
      }
      out(label, rows);
    };
    await clickThrough('header nav[aria-label="Main"]', headerLinks, 'S3 header click-through');
    await clickThrough('footer', footerLinks, 'S4 footer click-through');
    await ctx.close();
  }

  /* =================================================================
     PART 3 — S5 + SQ8 eye 7: mobile nav at 360, for real
     ================================================================= */
  {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    const hyd = await hydrationControl(p);
    out('S5 hydration control (mobile /)', hyd);

    await p.screenshot({ path: shot('s5-01-before-burger.png') });
    await p.click('header button.mantine-Burger-root, header .mantine-Burger-root');
    await p.waitForTimeout(900);
    const openState = await p.evaluate(overlayProbe);
    const drawerLinks = await p.$$eval('[role="dialog"] nav[aria-label="Mobile"] a',
      (as) => as.map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') })));
    await p.screenshot({ path: shot('s5-02-drawer-open.png') });
    out('S5 drawer opened', { openState, drawerLinkCount: drawerLinks.length, drawerLinks });

    /* navigate from inside the drawer */
    let navigated = null;
    if (drawerLinks.length) {
      await p.click('[role="dialog"] nav[aria-label="Mobile"] a[href="/services"]');
      await p.waitForTimeout(1200);
      navigated = {
        pathname: new URL(p.url()).pathname,
        afterClose: await p.evaluate(overlayProbe),
      };
      await p.screenshot({ path: shot('s5-03-after-navigate.png') });
    }
    out('S5 drawer navigate + close', navigated);
    await ctx.close();
  }

  /* =================================================================
     PART 4 — S12 overlays: T1 /portfolio Modal, T2 /about lightbox
     ================================================================= */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });

    /* T1 */
    let p = await ctx.newPage();
    await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    out('S12 T1 hydration', await hydrationControl(p));
    await fullScroll(p);
    const t1btn = await p.$$('button:has-text("Project detail")');
    out('S12 T1 trigger count', t1btn.length);
    if (t1btn.length) {
      await t1btn[0].scrollIntoViewIfNeeded();
      await t1btn[0].click();
      await p.waitForTimeout(1000);
      out('S12 T1 AFTER open', await p.evaluate(overlayProbe));
      await p.screenshot({ path: shot('s12-t1-portfolio-modal-open.png') });
      await p.keyboard.press('Escape');
      await p.waitForTimeout(900);
      out('S12 T1 AFTER escape', await p.evaluate(overlayProbe));
      await p.screenshot({ path: shot('s12-t1-portfolio-modal-closed.png') });
    }
    await p.close();

    /* T2 + S13 + SQ8 eye 5 — /about lightbox thumbnails */
    p = await ctx.newPage();
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    out('S12 T2 hydration', await hydrationControl(p));
    await fullScroll(p);
    await p.waitForTimeout(900);

    const thumbs = await p.evaluate(() => {
      const frames = [...document.querySelectorAll('button')]
        .filter((b) => b.querySelector('img'))
        .map((b) => {
          const img = b.querySelector('img');
          const fb = img.parentElement.getBoundingClientRect();
          const ib = img.getBoundingClientRect();
          return {
            alt: img.alt.slice(0, 50),
            frameBox: Math.round(fb.width) + 'x' + Math.round(fb.height),
            imgBox: Math.round(ib.width) + 'x' + Math.round(ib.height),
            natural: img.naturalWidth + 'x' + img.naturalHeight,
            complete: img.complete,
            display: getComputedStyle(img.parentElement).display,
            painted: img.naturalWidth > 0 && ib.width > 0 && ib.height > 0,
          };
        });
      return { count: frames.length, frames };
    });
    out('S13 / SQ8-eye5 /about lightbox thumbnails (desktop, after scroll)', thumbs);
    await p.screenshot({ path: shot('s13-about-thumbnails-fullpage.png'), fullPage: true });

    const t2 = await p.$$('button:has(img)');
    if (t2.length) {
      await t2[0].scrollIntoViewIfNeeded();
      await t2[0].click();
      await p.waitForTimeout(1200);
      out('S12 T2 AFTER open', await p.evaluate(overlayProbe));
      out('S12 T2 modal image', await p.evaluate(() => {
        const i = document.querySelector('[role="dialog"] img');
        if (!i) return '(no img in dialog)';
        const b = i.getBoundingClientRect();
        return { box: Math.round(b.width) + 'x' + Math.round(b.height),
          natural: i.naturalWidth + 'x' + i.naturalHeight };
      }));
      await p.screenshot({ path: shot('s12-t2-about-lightbox-open.png') });
      await p.keyboard.press('Escape');
      await p.waitForTimeout(900);
      out('S12 T2 AFTER escape', await p.evaluate(overlayProbe));
    }
    await p.close();
    await ctx.close();
  }

  /* =================================================================
     PART 5 — SQ8 eye 4 + 6: /contact accordion, focus rings, fields
     ================================================================= */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const p = await ctx.newPage();
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    out('SQ8 /contact hydration', await hydrationControl(p));
    await fullScroll(p);

    /* eye 4 — accordion open / close, mouse */
    const ctrl = await p.$$('.mantine-Accordion-control');
    out('SQ8-eye4 accordion control count', ctrl.length);
    if (ctrl.length) {
      await ctrl[0].scrollIntoViewIfNeeded();
      const restGround = await p.evaluate((i) =>
        getComputedStyle(document.querySelectorAll('.mantine-Accordion-control')[i]).backgroundColor, 0);
      await ctrl[0].hover();
      await p.waitForTimeout(500);
      const hoverGround = await p.evaluate((i) =>
        getComputedStyle(document.querySelectorAll('.mantine-Accordion-control')[i]).backgroundColor, 0);
      await p.screenshot({ path: shot('sq8-eye4-accordion-hover.png') });
      await ctrl[0].click();
      await p.waitForTimeout(900);
      const opened = await p.evaluate(() => {
        const c = document.querySelector('.mantine-Accordion-control');
        const panel = document.querySelector('.mantine-Accordion-panel');
        return {
          ariaExpanded: c?.getAttribute('aria-expanded'),
          panelHeight: panel ? Math.round(panel.getBoundingClientRect().height) : null,
          panelText: (panel?.textContent || '').trim().slice(0, 80),
        };
      });
      await p.screenshot({ path: shot('sq8-eye4-accordion-open.png') });
      await ctrl[0].click();
      await p.waitForTimeout(900);
      const closed = await p.evaluate(() => {
        const c = document.querySelector('.mantine-Accordion-control');
        const panel = document.querySelector('.mantine-Accordion-panel');
        return {
          ariaExpanded: c?.getAttribute('aria-expanded'),
          panelHeight: panel ? Math.round(panel.getBoundingClientRect().height) : null,
        };
      });
      await p.screenshot({ path: shot('sq8-eye4-accordion-closed.png') });
      out('SQ8-eye4 accordion mouse', { restGround, hoverGround, opened, closed });

      /* keyboard: focus the control and press Enter */
      await p.evaluate(() => document.querySelector('.mantine-Accordion-control').focus());
      await p.waitForTimeout(300);
      const ring = await p.evaluate(() => {
        const c = document.activeElement;
        const s = getComputedStyle(c);
        return { tag: c.tagName, cls: (c.className || '').toString().slice(0, 60),
          outline: s.outline, outlineColor: s.outlineColor, outlineWidth: s.outlineWidth,
          boxShadow: s.boxShadow, borderColor: s.borderColor };
      });
      await p.screenshot({ path: shot('sq8-eye4-accordion-focus-ring.png') });
      await p.keyboard.press('Enter');
      await p.waitForTimeout(800);
      const kbOpen = await p.evaluate(() =>
        document.querySelector('.mantine-Accordion-control')?.getAttribute('aria-expanded'));
      await p.screenshot({ path: shot('sq8-eye4-accordion-keyboard-open.png') });
      await p.keyboard.press('Enter');
      await p.waitForTimeout(800);
      const kbClose = await p.evaluate(() =>
        document.querySelector('.mantine-Accordion-control')?.getAttribute('aria-expanded'));
      out('SQ8-eye4 accordion keyboard', { focusRing: ring, kbOpen, kbClose });
    }

    /* eye 6 — the three form fields: real focus, rest vs focused style */
    const fieldStyle = () => {
      const read = (el) => {
        if (!el) return null;
        const s = getComputedStyle(el);
        return {
          outline: s.outline, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor,
          borderTopColor: s.borderTopColor, borderBottomColor: s.borderBottomColor,
          boxShadow: s.boxShadow, backgroundColor: s.backgroundColor,
        };
      };
      return {
        name: read(document.querySelector('input[name="name"]')),
        email: read(document.querySelector('input[name="email"]')),
        message: read(document.querySelector('textarea[name="message"]')),
        active: document.activeElement?.getAttribute?.('name') || document.activeElement?.tagName,
      };
    };
    const rest = await p.evaluate(fieldStyle);
    const focusedEach = {};
    for (const sel of ['input[name="name"]', 'input[name="email"]', 'textarea[name="message"]']) {
      const h = await p.$(sel);
      await h.scrollIntoViewIfNeeded();
      await h.click();          /* real focus, not .focus() */
      await p.waitForTimeout(450);
      focusedEach[sel] = await p.evaluate((s) => {
        const el = document.querySelector(s);
        const cs = getComputedStyle(el);
        return {
          isActive: document.activeElement === el,
          outline: cs.outline, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor,
          borderTopColor: cs.borderTopColor, boxShadow: cs.boxShadow,
        };
      }, sel);
      await p.screenshot({ path: shot('sq8-eye6-focus-' + sel.replace(/\W+/g, '-') + '.png') });
    }
    out('SQ8-eye6 form fields rest', rest);
    out('SQ8-eye6 form fields focused (real click)', focusedEach);

    /* fields accept input (typed, never submitted — a submit fires mailto:) */
    await p.fill('input[name="name"]', 'QA Tanya');
    await p.fill('input[name="email"]', 'qa@example.invalid');
    await p.fill('textarea[name="message"]', 'TEST-004 typing check. This form is never submitted by QA.');
    await p.waitForTimeout(400);
    out('SQ8-eye4 fields accept input', await p.evaluate(() => ({
      name: document.querySelector('input[name="name"]').value,
      email: document.querySelector('input[name="email"]').value,
      message: document.querySelector('textarea[name="message"]').value.slice(0, 40),
      submitLabel: [...document.querySelectorAll('button[type="submit"]')].map((b) => b.textContent.trim()),
    })));
    await p.screenshot({ path: shot('sq8-eye4-form-filled.png') });
    await p.close();
    await ctx.close();
  }

  /* =================================================================
     PART 6 — H1..H8 on Home
     ================================================================= */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await fullScroll(p);

    out('H1 colour-scheme control sweep', await p.evaluate(() => {
      const suspects = [...document.querySelectorAll('button,[role=switch],[role=button],input')]
        .filter((el) => {
          const t = ((el.getAttribute('aria-label') || '') + ' ' + (el.className || '').toString()
            + ' ' + (el.textContent || '')).toLowerCase();
          return /theme|scheme|dark|light|mode|toggle/.test(t);
        })
        .map((el) => el.tagName + ' :: ' + (el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30)));
      return {
        suspects,
        mantineToggleClass: document.querySelectorAll('[class*="ColorScheme"], [class*="colorScheme"]').length,
        htmlAttr: document.documentElement.getAttribute('data-mantine-color-scheme'),
      };
    }));

    const quotes = await p.evaluate(() => {
      const nodes = [...document.querySelectorAll('blockquote, [class*="PullQuote"], [class*="pullQuote"], [class*="quote"]')];
      return nodes.map((n) => ({
        cls: (n.className || '').toString().slice(0, 60),
        lang: n.getAttribute('lang'),
        text: n.textContent,
        len: n.textContent.length,
      }));
    });
    out('H2/H3 quote-bearing nodes on /', quotes);
    out('H2/H3 exact-match against R5', quotes.map((q) => ({
      len: q.len, lang: q.lang, exact: R5.includes(q.text),
      text: q.text.slice(0, 60),
    })));

    /* H7 — skip link by keyboard */
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.click('body', { position: { x: 5, y: 5 } });
    await p.evaluate(() => document.body.focus());
    await p.keyboard.press('Tab');
    await p.waitForTimeout(400);
    const skip = await p.evaluate(() => {
      const a = document.activeElement;
      const s = getComputedStyle(a);
      const b = a.getBoundingClientRect();
      return { text: (a.textContent || '').trim().slice(0, 40), tag: a.tagName,
        href: a.getAttribute?.('href'), outline: s.outline, boxShadow: s.boxShadow,
        box: Math.round(b.width) + 'x' + Math.round(b.height), top: Math.round(b.top) };
    });
    await p.screenshot({ path: shot('h7-skip-link-focused.png') });
    await p.keyboard.press('Enter');
    await p.waitForTimeout(600);
    await p.keyboard.press('Tab');
    await p.waitForTimeout(400);
    const afterEnter = await p.evaluate(() => {
      const a = document.activeElement;
      return { hash: location.hash, tag: a.tagName,
        text: (a.textContent || '').trim().slice(0, 40),
        insideMain: !!document.querySelector('main')?.contains(a) };
    });
    out('H7 skip link', { firstTab: skip, afterEnterThenTab: afterEnter });
    await p.close();
    await ctx.close();
  }

  /* H6 — reduced motion, with the no-preference control */
  for (const rm of ['reduce', 'no-preference']) {
    const ctx = await browser.newContext({ viewport: DESKTOP, reducedMotion: rm });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await hideDevOverlay(p);
    const first = await p.evaluate(() => ({
      animations: document.getAnimations().length,
      names: document.getAnimations().map((a) => a.animationName || a.constructor.name).slice(0, 8),
    }));
    await p.waitForTimeout(1400);
    const a = await p.screenshot({ path: shot(`h6-${rm}-frame-a.png`) });
    await p.waitForTimeout(500);
    const b = await p.screenshot({ path: shot(`h6-${rm}-frame-b.png`) });
    const heroVisible = await p.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      const s = getComputedStyle(h1);
      const r = h1.getBoundingClientRect();
      return { opacity: s.opacity, transform: s.transform,
        box: Math.round(r.width) + 'x' + Math.round(r.height), top: Math.round(r.top) };
    });
    out(`H6 reduced-motion=${rm}`, {
      animationsAtFirstPaint: first,
      framesIdentical: Buffer.compare(a, b) === 0,
      hero: heroVisible,
    });
    await p.close();
    await ctx.close();
  }

  /* H8 — hero full set at 360x740 above the fold */
  {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.waitForTimeout(1200);
    out('H8 hero above the fold at 360x740', await p.evaluate(() => {
      const inFold = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { text: (el.textContent || '').trim().slice(0, 44),
          top: Math.round(r.top), bottom: Math.round(r.bottom),
          fullyAbove: r.bottom <= window.innerHeight };
      };
      const hero = document.querySelector('main');
      const els = [...hero.querySelectorAll('h1, p, a, blockquote, [class*="quote"]')].slice(0, 12);
      return { viewportH: window.innerHeight, items: els.map(inFold) };
    }));
    await p.screenshot({ path: shot('h8-home-mobile-fold.png') });
    await p.close();
    await ctx.close();
  }

  /* =================================================================
     PART 7 — SQ8 eye (a): is the D1 lattice perceptible below the fold?
     ================================================================= */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const p = await ctx.newPage();
    await p.goto(BASE + '/services', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.evaluate(() => window.scrollTo(0, 1400));
    await p.waitForTimeout(900);
    await p.screenshot({ path: shot('sq8-eyeA-lattice-below-fold-services.png') });
    await p.screenshot({ path: shot('sq8-eyeA-lattice-crop.png'),
      clip: { x: 40, y: 120, width: 420, height: 300 } });
    out('SQ8-eyeA lattice tokens', await p.evaluate(() => {
      const g = document.querySelector('[aria-hidden="true"][class*="ground"]');
      const cs = g ? getComputedStyle(g) : null;
      const root = getComputedStyle(document.documentElement);
      return {
        mounted: !!g,
        zIndex: cs?.zIndex, position: cs?.position,
        gridLine: root.getPropertyValue('--site-grid-line').trim(),
        gridSize: root.getPropertyValue('--site-grid-size').trim(),
        gridFine: root.getPropertyValue('--site-grid-size-fine').trim(),
      };
    }));
    await p.close();
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(shot('_raw-results.json'), JSON.stringify(RESULTS, null, 1));
  console.log('\n\n=== DONE — screenshots + _raw-results.json in ' + SHOTS + ' ===');
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
