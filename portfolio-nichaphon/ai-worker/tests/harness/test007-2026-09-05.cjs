/*
 * TEST-007 harness (Tanya, QA — 2026-09-05).
 * REQ-004 AC-a / AC-b / AC-c / AC-d / AC-g + the owner's SQ19 "is the pinned
 * bar intrusive?" pictures. TASK-018 pinned ProjectModal's .footer.
 *
 *   A  360x740 — all 11 /portfolio modals, opened FRESH (page reloaded between
 *      each), scrollTop asserted 0, viewport picture + the footer element's box
 *   B  1280x900 — the two new modals as pictures + button box (AC-d)
 *   C  360x740 — SQ19: one modal mid-scroll (bar over content) and at full
 *      scroll (bar un-pinned), bar height measured, elementFromPoint probes
 *
 * The live-project anchor is READ off the DOM, NEVER clicked — those URLs are
 * the owner's own live products (REQ-004 Constraint 4).
 *
 * Run rules (REGRESSION §How to run it): headed Chrome, tab fronted and one
 * throwaway screenshot taken BEFORE anything is measured so document.hidden
 * goes false, one rAF per scroll step, no el.focus() anywhere.
 *
 * Usage (playwright lives OUTSIDE the repo; front/package.json untouched):
 *   NODE_PATH=<scratchpad>/pw/node_modules \
 *   BASE_URL=http://127.0.0.1:3071 OUT=<dir> node test007-2026-09-05.cjs
 *
 * Prints observations only. The verdict comes from the screenshots.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3071';
const OUT = process.env.OUT || '.';
fs.mkdirSync(OUT, { recursive: true });

const TRIGGER = 'button[aria-label^="Open project detail for"]';
const SCROLLPORT = '.mantine-Modal-content';

const ORDER = [
  ['learning-curve', 'Learning Curve', true],
  ['ong-match', 'Ong Match', true],
  ['dte-platform', 'DTE Platform', true],
  ['develyst-web', 'Develyst Company Website', true],
  ['laichill', 'Laichill', true],
  ['crm-rag-chatbot', 'RAG Chatbot for CRM Sales', false],
  ['backend-optimisation', 'Enterprise Backend Optimisation', false],
  ['yodbarber', 'YodBarber Queue Booking', true],
  ['ai-voice-avatar', 'AI Voice Avatar', true],
  ['develyst-ai', 'Develyst AI Gateway', false],
  ['r1-bev', 'R1-BEV Voice Command Robot', false],
];

const counts = { consoleErrors: [], pageErrors: [], failedRequests: [], nonLocalRequests: [] };
const log = [];
function say(s) { console.log(s); log.push(s); }

function wire(page) {
  page.on('console', (m) => { if (m.type() === 'error') counts.consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => counts.pageErrors.push(String(e).slice(0, 200)));
  page.on('requestfailed', (r) => counts.failedRequests.push(`${r.url().slice(0, 120)} ${r.failure() && r.failure().errorText}`));
  page.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:') && !r.url().startsWith('about:')) counts.nonLocalRequests.push(r.url().slice(0, 160)); });
}

// Everything measured inside the page in one pass, so nothing is inferred.
async function probeOpenModal(page) {
  return page.evaluate((sel) => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return { ok: false, why: 'no dialog' };
    const sp = document.querySelector(sel);
    const footer = dlg.querySelector('div[class*="footer"]');
    const anchor = footer && footer.querySelector('a');
    const note = footer && footer.querySelector('p');
    const target = anchor || note;
    const r = target ? target.getBoundingClientRect() : null;
    const fr = footer ? footer.getBoundingClientRect() : null;
    const spr = sp ? sp.getBoundingClientRect() : null;
    const cs = footer ? getComputedStyle(footer) : null;
    return {
      ok: true,
      title: (dlg.querySelector('.mantine-Modal-title') || {}).textContent || null,
      windowScrollY: window.scrollY,
      scrollportScrollTop: sp ? sp.scrollTop : null,
      scrollportScrollHeight: sp ? sp.scrollHeight : null,
      scrollportClientHeight: sp ? sp.clientHeight : null,
      overflows: sp ? sp.scrollHeight > sp.clientHeight : null,
      scrollportBox: spr ? { x: Math.round(spr.x), y: Math.round(spr.y), w: Math.round(spr.width), h: Math.round(spr.height) } : null,
      footerBox: fr ? { top: +fr.top.toFixed(2), bottom: +fr.bottom.toFixed(2), h: +fr.height.toFixed(2) } : null,
      footerPosition: cs ? cs.position : null,
      footerBg: cs ? cs.backgroundColor : null,
      kind: anchor ? 'button' : (note ? 'note' : 'none'),
      text: target ? target.textContent.trim() : null,
      box: r ? { top: +r.top.toFixed(2), bottom: +r.bottom.toFixed(2), left: +r.left.toFixed(2), right: +r.right.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) } : null,
      href: anchor ? anchor.getAttribute('href') : null,
      hrefIDL: anchor ? anchor.href : null,
      targetAttr: anchor ? anchor.getAttribute('target') : null,
      rel: anchor ? anchor.getAttribute('rel') : null,
      viewportH: window.innerHeight,
      viewportW: window.innerWidth,
      // what the browser says is on top at the visual centre of the target
      hitTop: r ? (() => { const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e ? e.tagName + '.' + (e.className || '').toString().slice(0, 40) : null; })() : null,
      scrollLocked: document.documentElement.hasAttribute('data-scroll-locked') || document.body.style.overflow === 'hidden',
    };
  }, SCROLLPORT);
}

async function openFresh(page, idx) {
  await page.goto(`${BASE}/portfolio`, { waitUntil: 'networkidle' });
  await page.waitForSelector(TRIGGER);
  const triggers = await page.$$(TRIGGER);
  await triggers[idx].click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForTimeout(600); // let the transition settle and paint
}

async function closeAndVerify(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  return page.evaluate(() => ({
    dialogGone: document.querySelector('[role="dialog"]') === null,
    scrollLocked: document.documentElement.hasAttribute('data-scroll-locked') || document.body.style.overflow === 'hidden',
  }));
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });

  // ---------- A: mobile 360x740, all eleven ----------
  let ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  let page = await ctx.newPage();
  wire(page);
  await page.goto(`${BASE}/portfolio`, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.screenshot({ path: path.join(OUT, '00-wake-360.png') }); // wake step
  say(`[wake] document.hidden = ${await page.evaluate(() => document.hidden)}`);
  const triggerCount = await page.evaluate((s) => document.querySelectorAll(s).length, TRIGGER);
  say(`[A] /portfolio at 360x740 — ${triggerCount} card triggers`);

  const rowsA = [];
  for (let i = 0; i < ORDER.length; i++) {
    const [id, title, linked] = ORDER[i];
    await openFresh(page, i);
    const p = await probeOpenModal(page);
    const shot = `${linked ? 'a' : 'b'}${String(i + 1).padStart(2, '0')}-${id}-360.png`;
    await page.screenshot({ path: path.join(OUT, shot) });
    const close = await closeAndVerify(page);
    const inView = p.box ? (p.box.top >= 0 && p.box.bottom <= p.viewportH) : null;
    rowsA.push({ id, title, linked, shot, p, close, inView });
    say(`[A${i + 1}] ${title} | title="${p.title}" | ${p.kind} "${p.text}" | box top ${p.box && p.box.top} bottom ${p.box && p.box.bottom} (viewport ${p.viewportH}) | inViewport=${inView} | scrollTop=${p.scrollportScrollTop} windowScrollY=${p.windowScrollY} | sH/cH ${p.scrollportScrollHeight}/${p.scrollportClientHeight} overflows=${p.overflows} | footer position=${p.footerPosition} bg=${p.footerBg} | hitTop=${p.hitTop} | href=${p.href} idl=${p.hrefIDL} target=${p.targetAttr} rel=${p.rel} | escClosed=${close.dialogGone} lockReleased=${!close.scrollLocked} | shot=${shot}`);
  }
  await page.close(); await ctx.close();

  // ---------- B: desktop 1280x900, the two new modals ----------
  ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  page = await ctx.newPage();
  wire(page);
  await page.goto(`${BASE}/portfolio`, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.screenshot({ path: path.join(OUT, '00-wake-1280.png') });
  say(`[wake] 1280 document.hidden = ${await page.evaluate(() => document.hidden)}`);
  const rowsB = [];
  for (const i of [0, 1]) {
    const [id, title] = ORDER[i];
    await openFresh(page, i);
    const p = await probeOpenModal(page);
    const shot = `c${String(i + 1).padStart(2, '0')}-${id}-1280.png`;
    await page.screenshot({ path: path.join(OUT, shot) });
    const close = await closeAndVerify(page);
    const inView = p.box ? (p.box.top >= 0 && p.box.bottom <= p.viewportH) : null;
    rowsB.push({ id, title, shot, p, close, inView });
    say(`[B] ${title} @1280x900 | ${p.kind} box top ${p.box && p.box.top} bottom ${p.box && p.box.bottom} | inViewport=${inView} | sH/cH ${p.scrollportScrollHeight}/${p.scrollportClientHeight} overflows=${p.overflows} | href=${p.href} | escClosed=${close.dialogGone} lockReleased=${!close.scrollLocked} | shot=${shot}`);
  }
  await page.close(); await ctx.close();

  // ---------- C: SQ19 — is the pinned bar intrusive? ----------
  ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  page = await ctx.newPage();
  wire(page);
  await page.goto(`${BASE}/portfolio`, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.screenshot({ path: path.join(OUT, '00-wake-sq19.png') });
  await openFresh(page, 0); // Learning Curve — it overflows at 360
  const atOpen = await probeOpenModal(page);
  say(`[C0] Learning Curve at open — sH/cH ${atOpen.scrollportScrollHeight}/${atOpen.scrollportClientHeight}, footer h=${atOpen.footerBox.h} top=${atOpen.footerBox.top} bottom=${atOpen.footerBox.bottom}`);

  // mid scroll: half way down the scrollport
  const mid = await page.evaluate((sel) => new Promise((res) => {
    const sp = document.querySelector(sel);
    sp.scrollTop = Math.round((sp.scrollHeight - sp.clientHeight) / 2);
    requestAnimationFrame(() => requestAnimationFrame(() => res(sp.scrollTop)));
  }), SCROLLPORT);
  await page.waitForTimeout(400);
  const midProbe = await page.evaluate((sel) => {
    const sp = document.querySelector(sel);
    const dlg = document.querySelector('[role="dialog"]');
    const footer = dlg.querySelector('div[class*="footer"]');
    const fr = footer.getBoundingClientRect();
    // what the pinned bar sits ON TOP of: probe just inside the bar's own area
    const under = document.elementsFromPoint(fr.left + fr.width / 2, fr.top + 4).map((e) => e.tagName + '.' + (e.className || '').toString().slice(0, 30));
    // the bar's own height and the fraction of the scrollport it eats
    return {
      scrollTop: sp.scrollTop,
      barTop: +fr.top.toFixed(2), barBottom: +fr.bottom.toFixed(2), barH: +fr.height.toFixed(2),
      scrollportH: sp.clientHeight,
      pctOfScrollport: +((fr.height / sp.clientHeight) * 100).toFixed(1),
      stackAtBarTopEdge: under.slice(0, 4),
      position: getComputedStyle(footer).position,
      bg: getComputedStyle(footer).backgroundColor,
    };
  }, SCROLLPORT);
  await page.screenshot({ path: path.join(OUT, 'd1-sq19-midscroll-360.png') });
  say(`[C1] mid-scroll scrollTop=${midProbe.scrollTop} | bar ${midProbe.barTop} -> ${midProbe.barBottom} = ${midProbe.barH}px = ${midProbe.pctOfScrollport}% of the ${midProbe.scrollportH}px scrollport | position=${midProbe.position} bg=${midProbe.bg} | stack under bar top edge: ${JSON.stringify(midProbe.stackAtBarTopEdge)} | shot=d1-sq19-midscroll-360.png`);

  // full scroll: the bar un-pins and sits at the natural end
  const full = await page.evaluate((sel) => new Promise((res) => {
    const sp = document.querySelector(sel);
    sp.scrollTop = sp.scrollHeight;
    requestAnimationFrame(() => requestAnimationFrame(() => res(sp.scrollTop)));
  }), SCROLLPORT);
  await page.waitForTimeout(400);
  const fullProbe = await page.evaluate((sel) => {
    const sp = document.querySelector(sel);
    const dlg = document.querySelector('[role="dialog"]');
    const footer = dlg.querySelector('div[class*="footer"]');
    const fr = footer.getBoundingClientRect();
    const chips = dlg.querySelectorAll('[class*="chip"], .mantine-Badge-root, .mantine-Chip-root');
    const lastChip = chips.length ? chips[chips.length - 1] : null;
    const bullets = dlg.querySelectorAll('li');
    const lastBullet = bullets.length ? bullets[bullets.length - 1] : null;
    const probe = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { text: el.textContent.trim().slice(0, 40), top: +r.top.toFixed(2), bottom: +r.bottom.toFixed(2), hitIsSelfOrChild: !!(hit && (hit === el || el.contains(hit) || hit.contains(el))), hit: hit ? hit.tagName + '.' + (hit.className || '').toString().slice(0, 30) : null };
    };
    return {
      scrollTop: sp.scrollTop, maxScroll: sp.scrollHeight - sp.clientHeight,
      barTop: +fr.top.toFixed(2), barBottom: +fr.bottom.toFixed(2), barH: +fr.height.toFixed(2),
      scrollportBottom: +sp.getBoundingClientRect().bottom.toFixed(2),
      chipCount: chips.length, lastChip: probe(lastChip), lastBullet: probe(lastBullet),
    };
  }, SCROLLPORT);
  await page.screenshot({ path: path.join(OUT, 'd2-sq19-fullscroll-360.png') });
  say(`[C2] full scroll scrollTop=${fullProbe.scrollTop}/${fullProbe.maxScroll} | bar ${fullProbe.barTop} -> ${fullProbe.barBottom} (scrollport bottom ${fullProbe.scrollportBottom}) | chips=${fullProbe.chipCount} lastChip=${JSON.stringify(fullProbe.lastChip)} lastBullet=${JSON.stringify(fullProbe.lastBullet)} | shot=d2-sq19-fullscroll-360.png`);

  const closeC = await closeAndVerify(page);
  say(`[C3] Escape closed=${closeC.dialogGone} lockReleased=${!closeC.scrollLocked}`);
  await page.close(); await ctx.close();
  await browser.close();

  say('--- COUNTS over the whole run ---');
  say(`console errors: ${counts.consoleErrors.length} ${JSON.stringify(counts.consoleErrors.slice(0, 5))}`);
  say(`pageerrors:     ${counts.pageErrors.length} ${JSON.stringify(counts.pageErrors.slice(0, 5))}`);
  say(`failed reqs:    ${counts.failedRequests.length} ${JSON.stringify(counts.failedRequests.slice(0, 5))}`);
  say(`non-local reqs: ${counts.nonLocalRequests.length} ${JSON.stringify(counts.nonLocalRequests.slice(0, 5))}`);

  fs.writeFileSync(path.join(OUT, 'test007-run.txt'), log.join('\n'), 'utf8');
  fs.writeFileSync(path.join(OUT, 'test007-data.json'), JSON.stringify({ rowsA, rowsB, atOpen, midProbe, fullProbe, counts }, null, 2), 'utf8');
})();
