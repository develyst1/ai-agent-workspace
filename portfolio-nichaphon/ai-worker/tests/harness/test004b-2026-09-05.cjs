/*
 * TEST-004 harness, round 2 (Tanya, 2026-09-05) — settle six things round 1
 * could not settle cleanly. Each block exists because round 1's method was
 * arguably the reason for the reading, not the product.
 *
 *  B1  H7 skip link — round 1 clicked the page first, which moved the
 *      sequential-focus start point. Re-run with a fresh load and Tab only.
 *  B2  H8 hero at 360x740 — round 1 says the 2nd CTA and the hero quote fall
 *      below the fold. Re-measure and capture the fold shot.
 *  B3  S13 /about thumbnails — round 1 saw non-zero boxes but naturalWidth 0
 *      and complete:false. Wait up to 45s and watch the /_next/image responses:
 *      "slow dev optimiser" and "never paints" look identical at 1.5s.
 *  B4  SQ8 eye 6 + eye 4 focus ring — reach the control with a REAL Tab so
 *      :focus-visible can apply; .focus() does not set it.
 *  B5  S10 on /contact — JetBrains Mono did not load there. Is any element on
 *      the page actually asking for it?
 *  B6  S8 /services at 360 — the table is 908px wide inside a 345px viewport.
 *      Does an ancestor scroll it, or does the page overflow?
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3021';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test004-2026-09-05';
fs.mkdirSync(SHOTS, { recursive: true });
const shot = (n) => path.join(SHOTS, n);
const R = {};
const out = (l, v) => { R[l] = v; console.log('\n### ' + l + '\n' + JSON.stringify(v, null, 1)); };
const hideDevOverlay = (p) =>
  p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });

  /* ---------- B1  H7 skip link, no click first ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.waitForTimeout(800);
    await p.keyboard.press('Tab');
    await p.waitForTimeout(400);
    const t1 = await p.evaluate(() => {
      const a = document.activeElement, s = getComputedStyle(a), b = a.getBoundingClientRect();
      return { text: (a.textContent || '').trim().slice(0, 40), tag: a.tagName,
        href: a.getAttribute?.('href'), cls: (a.className || '').toString().slice(0, 40),
        outline: s.outline, boxShadow: s.boxShadow,
        box: Math.round(b.width) + 'x' + Math.round(b.height),
        top: Math.round(b.top), left: Math.round(b.left),
        visible: b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < window.innerHeight };
    });
    await p.screenshot({ path: shot('b1-h7-first-tab.png') });
    await p.keyboard.press('Enter');
    await p.waitForTimeout(700);
    await p.keyboard.press('Tab');
    await p.waitForTimeout(400);
    const t2 = await p.evaluate(() => {
      const a = document.activeElement;
      return { hash: location.hash, tag: a.tagName,
        text: (a.textContent || '').trim().slice(0, 40),
        insideMain: !!document.querySelector('main')?.contains(a) };
    });
    await p.screenshot({ path: shot('b1-h7-after-enter-tab.png') });
    out('B1 H7 skip link (fresh load, Tab only)', { firstTab: t1, afterEnterThenTab: t2 });
    await p.close(); await ctx.close();
  }

  /* ---------- B2  H8 hero at 360x740 ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.waitForTimeout(1500);
    out('B2 H8 hero items at 360x740', await p.evaluate(() => {
      const pick = (sel) => [...document.querySelectorAll(sel)].map((el) => {
        const r = el.getBoundingClientRect();
        return { text: (el.textContent || '').trim().slice(0, 40),
          top: Math.round(r.top), bottom: Math.round(r.bottom),
          fullyAbove: r.bottom <= window.innerHeight };
      });
      return {
        viewportH: window.innerHeight,
        h1: pick('main h1'),
        ctas: pick('main a[class*="cta"], main a[class*="Cta"], main a[class*="button"], main a[class*="Button"]'),
        quote: pick('main [class*="PullQuote"]'),
      };
    }));
    await p.screenshot({ path: shot('b2-h8-fold-360x740.png'), fullPage: false });
    await p.close(); await ctx.close();
  }

  /* ---------- B3  S13 /about thumbnails, patiently ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    const imgResponses = [];
    p.on('response', (res) => {
      if (res.url().includes('/_next/image')) {
        imgResponses.push({ status: res.status(), url: res.url().slice(-70) });
      }
    });
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.7);
      for (let y = 0; y < document.body.scrollHeight + step; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
      }
    });
    let settled = false;
    try {
      await p.waitForFunction(
        () => [...document.querySelectorAll('button img')].every((i) => i.complete && i.naturalWidth > 0),
        null, { timeout: 45000 });
      settled = true;
    } catch { settled = false; }
    const state = await p.evaluate(() => [...document.querySelectorAll('button img')].map((i) => {
      const b = i.getBoundingClientRect();
      return { alt: i.alt.slice(0, 40), complete: i.complete,
        natural: i.naturalWidth + 'x' + i.naturalHeight,
        box: Math.round(b.width) + 'x' + Math.round(b.height),
        loading: i.getAttribute('loading'), decoding: i.getAttribute('decoding'),
        painted: i.complete && i.naturalWidth > 0 && b.width > 0 && b.height > 0 };
    }));
    out('B3 S13 /about thumbnails after up to 45s', {
      allPaintedWithin45s: settled,
      nextImageResponses: imgResponses.length,
      nextImageStatuses: [...new Set(imgResponses.map((r) => r.status))],
      failedOrMissing: imgResponses.filter((r) => r.status >= 400),
      images: state,
    });
    /* park the viewport on the certificate row and shoot what a visitor sees */
    await p.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.querySelector('img'));
      b?.scrollIntoView({ block: 'center' });
    });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: shot('b3-s13-certificates-row.png') });
    await p.evaluate(() => {
      const bs = [...document.querySelectorAll('button')].filter((x) => x.querySelector('img'));
      bs[bs.length - 1]?.scrollIntoView({ block: 'center' });
    });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: shot('b3-s13-testimonials-row.png') });
    await p.close(); await ctx.close();
  }

  /* ---------- B4  focus ring via a real Tab ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.waitForTimeout(800);
    const readActive = () => {
      const a = document.activeElement, s = getComputedStyle(a);
      return { tag: a.tagName, name: a.getAttribute('name'),
        cls: (a.className || '').toString().slice(0, 55),
        matchesFocusVisible: a.matches(':focus-visible'),
        outline: s.outline, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth,
        outlineColor: s.outlineColor, outlineOffset: s.outlineOffset,
        borderTopColor: s.borderTopColor, boxShadow: s.boxShadow };
    };
    /* Tab until we hit the Name field, recording what each stop looks like */
    const stops = [];
    for (let i = 0; i < 30; i++) {
      await p.keyboard.press('Tab');
      await p.waitForTimeout(150);
      const a = await p.evaluate(readActive);
      stops.push(a);
      if (a.name === 'name') break;
    }
    await p.screenshot({ path: shot('b4-focus-name-field-real-tab.png') });
    const nameStop = stops[stops.length - 1];
    await p.keyboard.press('Tab'); await p.waitForTimeout(250);
    const emailStop = await p.evaluate(readActive);
    await p.screenshot({ path: shot('b4-focus-email-field-real-tab.png') });
    await p.keyboard.press('Tab'); await p.waitForTimeout(250);
    const msgStop = await p.evaluate(readActive);
    await p.screenshot({ path: shot('b4-focus-message-field-real-tab.png') });
    out('B4 SQ8-eye6 three fields, reached by real Tab',
      { name: nameStop, email: emailStop, message: msgStop });

    /* the accordion control, reached by real Tab */
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.evaluate(() => document.querySelector('.mantine-Accordion-control')
      ?.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(600);
    const accStops = [];
    for (let i = 0; i < 40; i++) {
      await p.keyboard.press('Tab');
      await p.waitForTimeout(120);
      const a = await p.evaluate(() => {
        const el = document.activeElement;
        return { isAccordion: el.classList.contains('mantine-Accordion-control'),
          tag: el.tagName, txt: (el.textContent || '').trim().slice(0, 30) };
      });
      if (a.isAccordion) {
        await p.evaluate(() => document.activeElement.scrollIntoView({ block: 'center' }));
        await p.waitForTimeout(300);
        accStops.push(await p.evaluate(readActive));
        await p.screenshot({ path: shot('b4-focus-accordion-real-tab.png') });
        break;
      }
    }
    out('B4 SQ8-eye4 accordion control, reached by real Tab', accStops);
    await p.close(); await ctx.close();
  }

  /* ---------- B5  /contact and JetBrains Mono ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight + step; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 80)));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1200);
    out('B5 S10 /contact mono usage', await p.evaluate(() => {
      const asks = [...document.querySelectorAll('body *')]
        .filter((el) => /JetBrains Mono/i.test(getComputedStyle(el).fontFamily)
          && (el.textContent || '').trim().length
          && el.children.length === 0)
        .slice(0, 10)
        .map((el) => el.tagName + ' "' + el.textContent.trim().slice(0, 30) + '"');
      return {
        elementsAskingForMono: asks.length, sample: asks,
        checkAfterScroll: document.fonts.check('16px "JetBrains Mono"'),
        loadedFamilies: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
      };
    }));
    /* control: a route where it did load */
    await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
    await p.waitForTimeout(900);
    out('B5 control /portfolio mono', await p.evaluate(() => ({
      check: document.fonts.check('16px "JetBrains Mono"'),
      asks: [...document.querySelectorAll('body *')]
        .filter((el) => /JetBrains Mono/i.test(getComputedStyle(el).fontFamily)
          && (el.textContent || '').trim().length && el.children.length === 0).length,
    })));
    await p.close(); await ctx.close();
  }

  /* ---------- B6  /services table at 360 ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/services', { waitUntil: 'networkidle' });
    await hideDevOverlay(p);
    await p.waitForTimeout(900);
    out('B6 S8 /services table at 360', await p.evaluate(() => {
      const t = document.querySelector('table');
      if (!t) return '(no table)';
      const chain = [];
      let el = t.parentElement;
      while (el && el !== document.body) {
        const s = getComputedStyle(el);
        chain.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40),
          overflowX: s.overflowX, clientW: el.clientWidth, scrollW: el.scrollWidth });
        el = el.parentElement;
      }
      const de = document.documentElement;
      return {
        tableWidth: Math.round(t.getBoundingClientRect().width),
        docScrollW: de.scrollWidth, docClientW: de.clientWidth,
        bodyScrollW: document.body.scrollWidth,
        pageOverflows: de.scrollWidth > de.clientWidth,
        ancestors: chain.slice(0, 5),
      };
    }));
    await p.evaluate(() => document.querySelector('table')?.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(600);
    await p.screenshot({ path: shot('b6-services-table-360.png') });
    await p.close(); await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(shot('_raw-results-round2.json'), JSON.stringify(R, null, 1));
  console.log('\n=== ROUND 2 DONE ===');
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
