/*
 * TEST-001 harness — REQ-001 Home QA round (Tanya, 2026-08-30).
 * Playwright is NOT a dependency of front/ (adding it there is an engineer's
 * change, not QA's). This script is run with playwright installed OUTSIDE the
 * repo, via NODE_PATH, against a locally running `npm run dev`.
 *
 *   NODE_PATH=<scratchpad>/pw/node_modules node home-sweep.cjs part1
 *
 * The script only prints observations. The verdict is written by hand in
 * tests/TEST-001-*.md from what was SEEN in the screenshots, never from a
 * "success" line printed here.
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:3000';
const SHOTS = 'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-req001-2026-08-30';
const shot = (n) => path.join(SHOTS, n);

// R5 canonical strings, pasted from requirements/REQ-001-ui-visual-redesign.md
const R5 = {
  th1: 'นักพนันที่เก่งมากๆ ไม่ได้เล่นแค่ตาที่ตัวเองไพ่ดี',
  th2: 'ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร',
  th3: 'จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลย นอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"',
  en1: "A truly great gambler doesn't only play the hands where his own cards are good.",
  en2: 'I don\'t work "for" anyone. I work "with" them.',
  en3: 'My weakness and my strength are the same thing: "I care about nothing but solving the most important problem of the organisation."',
  en4: "Don't say why me. Say try me.",
};
// Content belonging to the reference screenshot (R9) — must NOT appear.
const REF_CONTENT = ['FAEK', '150+', 'Win Awards', '12Years', '12 Years', 'Li Europan',
  'Get Started', 'CREATIVE', 'agency.'];

const ROUTES = ['/', '/about', '/services', '/portfolio', '/blog', '/contact'];

// The Next.js dev-tools badge is an overlay injected by `next dev`; it is not
// part of the product and it sits on top of the hero on small viewports.
// Hidden for evidence shots only — nothing in the app is changed.
const hideDevOverlay = (p) => p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});

function hook(page, sink) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') sink.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => sink.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => sink.push(`[requestfailed] ${r.url()} ${r.failure() && r.failure().errorText}`));
}

const out = (label, val) => console.log('\n### ' + label + '\n' + (typeof val === 'string' ? val : JSON.stringify(val, null, 1)));

async function part1(browser) {
  // ---- Home, desktop 1280x900 ----
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const logs = [];
  hook(p, logs);
  const resp = await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  out('HOME http status', resp.status());

  // dark-only + toggle absence
  out('colour scheme', await p.evaluate(() => ({
    htmlDataScheme: document.documentElement.getAttribute('data-mantine-color-scheme'),
    htmlClass: document.documentElement.className,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    colorSchemeMeta: (document.querySelector('meta[name="color-scheme"]') || {}).content || null,
  })));
  out('header controls (buttons in <header>)', await p.$$eval('header button', (bs) =>
    bs.map((b) => ({ aria: b.getAttribute('aria-label'), title: b.getAttribute('title'), text: b.innerText.trim(), cls: b.className.slice(0, 80) }))));
  out('any colour-scheme control anywhere?', await p.evaluate(() => {
    const hay = /color.?scheme|dark.?mode|light.?mode|theme.?toggle|toggle.?theme/i;
    return [...document.querySelectorAll('button,[role=switch],input[type=checkbox],a')]
      .filter((e) => hay.test(e.className + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || '') + ' ' + (e.id || '')))
      .map((e) => e.outerHTML.slice(0, 160));
  }));

  // quotes
  const quoteEls = await p.$$eval('blockquote, [class*="Quote"], [class*="quote"]', (es) =>
    es.map((e) => ({ tag: e.tagName, cls: e.className.slice(0, 60), text: e.innerText, lang: e.getAttribute('lang') })));
  out('quote elements on Home', quoteEls);
  const bodyText = await p.locator('body').innerText();
  out('R5 exact-string presence on Home', Object.fromEntries(
    Object.entries(R5).map(([k, v]) => [k, bodyText.includes(v)])));
  // codepoint-level check for the two rendered quotes
  out('codepoint check', await p.evaluate((r5) => {
    const res = {};
    for (const [k, v] of Object.entries(r5)) {
      const nodes = [...document.querySelectorAll('blockquote p, blockquote')];
      const hit = nodes.find((n) => n.textContent.trim() === v);
      if (hit) res[k] = { exactNodeMatch: true, raw: hit.textContent, len: hit.textContent.length };
    }
    return res;
  }, R5));

  // reference-screenshot content
  out('reference content found on Home (must be empty)',
    REF_CONTENT.filter((s) => bodyText.includes(s)));
  const html = await p.content();
  out('reference content found in Home HTML source (must be empty)',
    REF_CONTENT.filter((s) => html.includes(s)));

  // every visible text string, for the "no new copy" cross-check
  const texts = await p.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const s = new Set(); let n;
    while ((n = w.nextNode())) {
      const t = n.textContent.trim();
      if (!t) continue;
      const el = n.parentElement;
      if (!el || el.closest('nextjs-portal, script, style')) continue;
      s.add(t);
    }
    return [...s];
  });
  out('VISIBLE TEXT NODES (home)', texts);

  // component shapes (R1 observation, not a taste verdict)
  out('component geometry sample', await p.evaluate(() => {
    const g = (sel) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); const r = e.getBoundingClientRect();
      return { sel, radius: c.borderRadius, bg: c.backgroundColor, border: c.border, backdrop: c.backdropFilter, box: `${Math.round(r.width)}x${Math.round(r.height)}`, font: c.fontFamily.slice(0, 60), size: c.fontSize, weight: c.fontWeight, ls: c.letterSpacing }; };
    return [g('h1'), g('[class*="GlassPanel"]'), g('[class*="Button-root"]'), g('header'), g('[class*="SectionHeading_eyebrow"]'), g('blockquote')].filter(Boolean);
  }));
  out('fonts actually used', await p.evaluate(() => document.fonts ? [...document.fonts].map(f => `${f.family} ${f.weight} ${f.status}`) : 'no document.fonts'));

  await hideDevOverlay(p);
  await p.screenshot({ path: shot('01-home-desktop-1280-full.png'), fullPage: true });
  await p.screenshot({ path: shot('02-home-desktop-1280-fold.png') });
  out('console/network on Home desktop', logs.length ? logs : '(none)');
  await ctx.close();

  // ---- Home, mobile 360x740 ----
  const mctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  const mlogs = []; hook(mp, mlogs);
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
  await hideDevOverlay(mp);
  await mp.screenshot({ path: shot('03-home-mobile-360-full.png'), fullPage: true });
  await mp.screenshot({ path: shot('04-home-mobile-360-fold.png') });
  out('mobile horizontal overflow', await mp.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    overflowing: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 10).map(e => e.tagName + '.' + String(e.className).slice(0, 40)),
  })));
  out('console on Home mobile', mlogs.length ? mlogs : '(none)');
  await mctx.close();
}

// ---------------------------------------------------------------- part 2
// Items A / C / E — the three the team previously parked as "not runnable".
async function part2(browser) {
  // ---- A: reduced motion ----
  for (const mode of ['reduce', 'no-preference']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: mode });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'commit' });
    await p.waitForSelector('h1');
    const a = await p.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 900 } });
    await p.waitForTimeout(1800);
    const b = await p.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 900 } });
    out(`A reduced-motion=${mode}: media query as the page sees it`, await p.evaluate(() => ({
      reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
      noPref: matchMedia('(prefers-reduced-motion: no-preference)').matches,
    })));
    out(`A reduced-motion=${mode}: frame at first paint identical to frame at +1.8s?`,
      { identical: Buffer.compare(a, b) === 0, bytesFirst: a.length, bytesLater: b.length });
    out(`A reduced-motion=${mode}: computed motion on animated elements`, await p.evaluate(() => {
      const moving = [];
      for (const e of document.querySelectorAll('body *')) {
        const c = getComputedStyle(e);
        const dur = (s) => s.split(',').map((x) => parseFloat(x) || 0).reduce((m, x) => Math.max(m, x), 0);
        const an = dur(c.animationDuration), tr = dur(c.transitionDuration);
        if ((an > 0 && c.animationName !== 'none') || tr > 0) {
          moving.push({ el: e.tagName + '.' + String(e.className).slice(0, 40), animationName: c.animationName, animationDuration: c.animationDuration, transitionDuration: c.transitionDuration, opacity: c.opacity, transform: c.transform });
        }
      }
      return moving.slice(0, 25);
    }));
    await hideDevOverlay(p);
    await p.screenshot({ path: shot(mode === 'reduce' ? '05-home-reduced-motion-on-1280.png' : '06-home-reduced-motion-off-1280.png') });
    await ctx.close();
  }

  // ---- C: what falls below the fold ----
  const folds = [{ w: 1280, h: 600, name: '07-home-fold-1280x600.png' }, { w: 360, h: 740, name: '08-home-fold-360x740.png' }];
  for (const f of folds) {
    const ctx = await browser.newContext({ viewport: { width: f.w, height: f.h }, isMobile: f.w < 768, hasTouch: f.w < 768 });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    out(`C fold ${f.w}x${f.h}`, await p.evaluate((vh) => {
      const pick = { h1: 'h1', nickname: '[class*="HomeHero_nickname"]', lead: '[class*="HomeHero_lead"]', cta1: '[class*="Button-root"]', cta2: '[class*="HomeHero_textLink"]', heroQuote: '[class*="PullQuote_lead"]', firstStat: '[class*="HomeStats_card"]' };
      const r = {};
      for (const [k, sel] of Object.entries(pick)) {
        const e = document.querySelector(sel);
        if (!e) { r[k] = 'NOT FOUND'; continue; }
        const b = e.getBoundingClientRect();
        r[k] = { top: Math.round(b.top), bottom: Math.round(b.bottom), fullyAbove: b.bottom <= vh, startsBelow: b.top >= vh };
      }
      const lead = document.querySelector('[class*="HomeHero_lead"]');
      r.leadCutMidSentence = lead ? lead.getBoundingClientRect().top < vh && lead.getBoundingClientRect().bottom > vh : null;
      return r;
    }, f.h));
    await hideDevOverlay(p);
    await p.screenshot({ path: shot(f.name) });
    await ctx.close();
  }

  // ---- E: skip link by keyboard ----
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { document.body.focus(); if (document.activeElement) document.activeElement.blur(); });
  await p.keyboard.press('Tab');
  out('E after Tab #1', await p.evaluate(() => {
    const a = document.activeElement; const r = a.getBoundingClientRect();
    return { tag: a.tagName, text: a.innerText, href: a.getAttribute('href'), visibleBox: `${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.top)}`, outline: getComputedStyle(a).outline, boxShadow: getComputedStyle(a).boxShadow };
  }));
  await hideDevOverlay(p);
  await p.screenshot({ path: shot('09-home-skiplink-focused.png') });
  await p.keyboard.press('Enter');
  await p.waitForTimeout(600);
  out('E after Enter', await p.evaluate(() => {
    const a = document.activeElement;
    const main = document.querySelector('#main') || document.querySelector('main');
    return {
      hash: location.hash, scrollY: Math.round(scrollY),
      activeTag: a && a.tagName, activeId: a && a.id, activeText: a && a.innerText ? a.innerText.slice(0, 60) : '',
      activeIsMainOrInsideMain: !!(main && a && (a === main || main.contains(a))),
      mainExists: !!main, mainId: main && main.id, mainTabindex: main && main.getAttribute('tabindex'),
    };
  }));
  await p.screenshot({ path: shot('10-home-after-skiplink-enter.png') });
  await ctx.close();
}

// ---------------------------------------------------------------- part 3
// R8 regression: six routes, header + footer nav, mobile drawer.
async function part3(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const logs = []; hook(p, logs);
  const rows = [];
  let i = 11;
  for (const r of ROUTES) {
    logs.length = 0;
    const resp = await p.goto(BASE + r, { waitUntil: 'networkidle' });
    const info = await p.evaluate(() => ({
      h1: (document.querySelector('h1') || {}).innerText || null,
      title: document.title,
      is404: /404|This page could not be found/i.test(document.body.innerText),
      sections: document.querySelectorAll('main section, main > *').length,
      textLen: document.body.innerText.length,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      lowContrastText: (() => {
        const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.map(Number);
          const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const bgOf = (el) => { let e = el; while (e) { const b = getComputedStyle(e).backgroundColor;
          if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) return b; e = e.parentElement; } return 'rgb(255,255,255)'; };
        const bad = [];
        for (const e of document.querySelectorAll('main *, footer *, header *')) {
          if (!e.childNodes.length) continue;
          const own = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
          if (!own) continue;
          const cs = getComputedStyle(e);
          if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
          const l1 = lum(cs.color), l2 = lum(bgOf(e));
          if (l1 == null || l2 == null) continue;
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          if (ratio < 2.0) bad.push({ text: own.slice(0, 40), color: cs.color, bg: bgOf(e), ratio: Math.round(ratio * 100) / 100 });
        }
        return bad.slice(0, 8);
      })(),
    }));
    await hideDevOverlay(p);
    await p.screenshot({ path: shot(`${String(i++).padStart(2, '0')}-route${r.replace(/\//g, '-') || '-home'}-desktop.png`), fullPage: true });
    rows.push({ route: r, status: resp.status(), ...info, console: logs.slice() });
  }
  out('ROUTE SWEEP (desktop 1280)', rows);

  // header nav click-through
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  const navChecks = [];
  for (const r of ROUTES) {
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const link = p.locator(`header nav a[href="${r}"]`).first();
    const n = await link.count();
    if (!n) { navChecks.push({ route: r, headerLink: 'MISSING' }); continue; }
    await link.click();
    await p.waitForLoadState('networkidle');
    navChecks.push({ route: r, headerLink: 'clicked', landedOn: new URL(p.url()).pathname, ok: new URL(p.url()).pathname === r });
  }
  out('HEADER NAV click-through', navChecks);

  const footChecks = [];
  for (const r of ROUTES.filter((x) => x !== '/')) {
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const link = p.locator(`footer a[href="${r}"]`).first();
    if (!(await link.count())) { footChecks.push({ route: r, footerLink: 'MISSING' }); continue; }
    await link.click();
    await p.waitForLoadState('networkidle');
    footChecks.push({ route: r, landedOn: new URL(p.url()).pathname, ok: new URL(p.url()).pathname === r });
  }
  out('FOOTER NAV click-through', footChecks);
  await ctx.close();

  // mobile drawer
  const mctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mp = await mctx.newPage();
  const mlogs = []; hook(mp, mlogs);
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
  await mp.locator('header button[aria-label]').first().click();
  await mp.waitForTimeout(600);
  out('DRAWER open — links visible', await mp.evaluate(() => {
    const d = document.querySelector('.mantine-Drawer-content, [role="dialog"]');
    if (!d) return 'NO DRAWER ELEMENT';
    return { links: [...d.querySelectorAll('a')].map((a) => ({ t: a.innerText.trim(), h: a.getAttribute('href') })), visible: d.getBoundingClientRect().width > 0 };
  }));
  await hideDevOverlay(mp);
  await mp.screenshot({ path: shot('17-home-mobile-drawer-open.png') });
  const dlink = mp.locator('[role="dialog"] a[href="/about"], .mantine-Drawer-content a[href="/about"]').first();
  if (await dlink.count()) {
    await dlink.click();
    await mp.waitForLoadState('networkidle');
    await mp.waitForTimeout(500);
    out('DRAWER navigate to /about', await mp.evaluate(() => ({
      path: location.pathname,
      drawerStillOpen: !!document.querySelector('[role="dialog"]'),
      h1: (document.querySelector('h1') || {}).innerText,
    })));
    await hideDevOverlay(mp);
    await mp.screenshot({ path: shot('18-mobile-about-after-drawer-nav.png') });
  } else {
    out('DRAWER navigate', 'about link NOT FOUND in drawer');
  }
  out('console during mobile drawer run', mlogs.length ? mlogs : '(none)');
  await mctx.close();
}

// ---------------------------------------------------------------- part 4
// Follow-ups that the first pass of part2 could not settle:
//  A  — running animations read from document.getAnimations() (byte-compare of
//       frames is polluted by webfont swap, so it is not used as the evidence).
//  C  — the hero CTA button measured with a selector that resolves to the real
//       rendered <a>, not to a 0x0 Mantine root.
//  E  — the decisive check: where does the NEXT Tab go after the skip link is
//       activated? activeElement staying on <body> is normal for a fragment
//       target that is not focusable; what matters is the focus start point.
async function part4(browser) {
  for (const mode of ['reduce', 'no-preference']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: mode });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'commit' });
    await p.waitForSelector('[class*="HomeHero_content"]');
    out(`A(${mode}) document.getAnimations() at first paint`, await p.evaluate(() =>
      document.getAnimations().map((a) => ({
        name: a.animationName || (a.effect && a.effect.getKeyframes && 'keyframe-effect'),
        target: a.effect && a.effect.target ? a.effect.target.tagName + '.' + String(a.effect.target.className).slice(0, 45) : null,
        playState: a.playState, duration: a.effect && a.effect.getTiming().duration,
      }))));
    // settle fully, then prove nothing is still moving
    await p.evaluate(() => document.fonts.ready);
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(400);
    const a1 = await p.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 900 } });
    await p.waitForTimeout(1500);
    const a2 = await p.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 900 } });
    out(`A(${mode}) settled frames identical over 1.5s`, Buffer.compare(a1, a2) === 0);
    await ctx.close();
  }

  // C — real CTA geometry
  for (const f of [{ w: 1280, h: 600 }, { w: 360, h: 740 }]) {
    const ctx = await browser.newContext({ viewport: { width: f.w, height: f.h }, isMobile: f.w < 768, hasTouch: f.w < 768 });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    out(`C(${f.w}x${f.h}) hero action row, measured on the rendered anchors`, await p.evaluate((vh) => {
      const row = document.querySelector('[class*="HomeHero_actions"]');
      const els = row ? [...row.querySelectorAll('a')] : [];
      return {
        actionsRow: row ? (() => { const b = row.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), fullyAbove: b.bottom <= vh }; })() : 'NOT FOUND',
        anchors: els.map((e) => { const b = e.getBoundingClientRect(); return { text: e.innerText.trim(), href: e.getAttribute('href'), top: Math.round(b.top), bottom: Math.round(b.bottom), fullyAbove: b.bottom <= vh, startsBelow: b.top >= vh }; }),
        viewportHeight: vh, documentHeight: document.documentElement.scrollHeight,
      };
    }, f.h));
    await ctx.close();
  }

  // E — the next Tab after activating the skip link
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.keyboard.press('Tab');
  const first = await p.evaluate(() => ({ tag: document.activeElement.tagName, text: document.activeElement.innerText, href: document.activeElement.getAttribute('href') }));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(500);
  await p.keyboard.press('Tab');
  const afterEnterTab = await p.evaluate(() => {
    const a = document.activeElement; const main = document.getElementById('main');
    return { tag: a.tagName, text: (a.innerText || '').slice(0, 50), href: a.getAttribute && a.getAttribute('href'),
      insideMain: !!(main && main.contains(a)), inHeader: !!a.closest && !!a.closest('header'), hash: location.hash, scrollY: Math.round(scrollY) };
  });
  // control: with NO skip-link activation, where does the 2nd Tab go?
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.keyboard.press('Tab');
  await p.keyboard.press('Tab');
  const control = await p.evaluate(() => {
    const a = document.activeElement; const main = document.getElementById('main');
    return { tag: a.tagName, text: (a.innerText || '').slice(0, 50), href: a.getAttribute && a.getAttribute('href'),
      insideMain: !!(main && main.contains(a)), inHeader: !!(a.closest && a.closest('header')) };
  });
  out('E first Tab', first);
  out('E Tab AFTER activating skip link with Enter', afterEnterTab);
  out('E control — second Tab WITHOUT activating the skip link', control);
  await hideDevOverlay(p);
  await ctx.close();
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const which = process.argv[2] || 'part1';
  if (which === 'part1') await part1(browser);
  if (which === 'part2') await part2(browser);
  if (which === 'part3') await part3(browser);
  if (which === 'part4') await part4(browser);
  await browser.close();
}
main().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
