/*
 * TEST-001 re-verify harness — REQ-001 §QA re-verify round (Tanya, 2026-09-02).
 * Four cases only: R5 strings, R5 count, item C fold (1280x600 + 360x740), R7 console.
 *
 * Playwright is NOT a dependency of front/ (adding it there is an engineer's
 * change, not QA's). Run with playwright installed OUTSIDE the repo, via NODE_PATH,
 * against a locally running `npm run dev`:
 *
 *   NODE_PATH=<scratchpad>/pw/node_modules node reverify-2026-09-02.cjs
 *
 * The script prints observations only. The verdict is written by hand in
 * tests/TEST-001-*.md from what was SEEN, never from a line printed here.
 */
const { chromium } = require('playwright');
const path = require('path');

// Port 3000 was already held by a process QA did not start, so `npm run dev`
// chose 3001. Override with BASE_URL when 3000 is free.
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SHOTS = 'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-req001-reverify-2026-09-02';
const shot = (n) => path.join(SHOTS, n);

// R5 canonical strings, pasted from requirements/REQ-001-ui-visual-redesign.md §R5.
const R5 = {
  th1: 'นักพนันที่เก่งมากๆ ไม่ได้เล่นแค่ตาที่ตัวเองไพ่ดี',
  th2: 'ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร',
  th3: 'จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลย นอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"',
  en1: "A truly great gambler doesn't only play the hands where his own cards are good.",
  en2: 'I don\'t work "for" anyone. I work "with" them.',
  en3: 'My weakness and my strength are the same thing: "I care about nothing but solving the most important problem of the organisation."',
  en4: "Don't say why me. Say try me.",
};

const cp = (s) => [...s].map((c) => c.codePointAt(0).toString(16)).join(' ');
function firstDiff(a, b) {
  const A = [...a], B = [...b];
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    if (A[i] !== B[i]) return { index: i, rendered: A[i] === undefined ? '(end)' : A[i] + ' U+' + A[i].codePointAt(0).toString(16),
      canonical: B[i] === undefined ? '(end)' : B[i] + ' U+' + B[i].codePointAt(0).toString(16),
      renderedContext: A.slice(Math.max(0, i - 12), i + 12).join(''), canonicalContext: B.slice(Math.max(0, i - 12), i + 12).join('') };
  }
  return null;
}

const hideDevOverlay = (p) => p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});

function hook(page, sink) {
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') sink.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => sink.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => sink.push(`[requestfailed] ${r.url()} ${r.failure() && r.failure().errorText}`));
}
const out = (label, val) => console.log('\n### ' + label + '\n' + (typeof val === 'string' ? val : JSON.stringify(val, null, 1)));

async function run(browser) {
  // ---------- case 1 + 2 + 4(desktop): Home at 1280x900 ----------
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const logs = [];
  hook(p, logs);
  const resp = await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  out('HOME http status', resp.status());

  // every candidate quote-bearing node, raw textContent (not innerText)
  const nodes = await p.evaluate(() => {
    const sel = 'blockquote, [class*="Quote"], [class*="quote"], [class*="Statement"], [class*="statement"], [lang="th"], [lang="en"], q, cite';
    const seen = new Set();
    return [...document.querySelectorAll(sel)].filter((e) => !['HTML', 'BODY', 'HEAD', 'SCRIPT', 'STYLE'].includes(e.tagName)
      && !e.querySelector('header, footer, main') && [...e.textContent].length < 400).map((e) => {
      const key = e.tagName + '|' + e.className + '|' + e.textContent;
      if (seen.has(key)) return null; seen.add(key);
      return { tag: e.tagName, cls: String(e.className).slice(0, 70), lang: e.getAttribute('lang'),
        textContent: e.textContent, len: [...e.textContent].length };
    }).filter(Boolean);
  });
  out('CASE 1 — quote-bearing nodes on Home (raw textContent)', nodes);

  // exact-equality check of every rendered candidate against every R5 string
  const matchTable = nodes.map((n) => {
    const hit = Object.entries(R5).find(([, v]) => v === n.textContent);
    if (hit) return { node: n.cls || n.tag, matches: hit[0], exact: true };
    // nearest canonical string by shared prefix, so a diff can be reported
    let best = null, bestScore = -1;
    for (const [k, v] of Object.entries(R5)) {
      let i = 0; const A = [...n.textContent], B = [...v];
      while (i < A.length && i < B.length && A[i] === B[i]) i++;
      const score = i / Math.max(1, B.length);
      if (score > bestScore) { bestScore = score; best = k; }
    }
    return { node: n.cls || n.tag, matches: null, exact: false, nearest: best,
      prefixMatchRatio: Math.round(bestScore * 1000) / 1000,
      rendered: n.textContent, renderedLen: [...n.textContent].length,
      canonical: R5[best], canonicalLen: [...R5[best]].length,
      diff: firstDiff(n.textContent, R5[best]) };
  });
  out('CASE 1 — exact equality vs R5 canonical', matchTable);

  // whole-page search: which of the 7 canonical strings appear anywhere in the DOM text
  out('CASE 2 — canonical strings present anywhere in body text', await p.evaluate((r5) => {
    const t = document.body.textContent;
    const res = {};
    for (const [k, v] of Object.entries(r5)) res[k] = t.includes(v);
    return res;
  }, R5));

  // which of the FOUR quotes (either language) are on the page
  out('CASE 2 — quote count (a quote counts if either its Thai or its English form is present)',
    await p.evaluate((r5) => {
      const t = document.body.textContent;
      return {
        quote1: t.includes(r5.th1) || t.includes(r5.en1),
        quote2: t.includes(r5.th2) || t.includes(r5.en2),
        quote3: t.includes(r5.th3) || t.includes(r5.en3),
        quote4: t.includes(r5.en4),
      };
    }, R5));

  out('CASE 4 — console on / at 1280x900', logs.length ? logs : '(none)');
  await hideDevOverlay(p);
  await p.screenshot({ path: shot('01-home-full-1280.png'), fullPage: true });
  await ctx.close();

  // ---------- case 4 (mobile console) ----------
  const mctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mp = await mctx.newPage();
  const mlogs = []; hook(mp, mlogs);
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
  out('CASE 4 — console on / at 360x740', mlogs.length ? mlogs : '(none)');
  await hideDevOverlay(mp);
  await mp.screenshot({ path: shot('02-home-full-360.png'), fullPage: true });
  await mctx.close();

  // ---------- case 3: item C, the hero fold ----------
  for (const f of [{ w: 1280, h: 600 }, { w: 360, h: 740 }]) {
    const c = await browser.newContext({ viewport: { width: f.w, height: f.h }, isMobile: f.w < 768, hasTouch: f.w < 768 });
    const pg = await c.newPage();
    await pg.goto(BASE + '/', { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    out(`CASE 3 — fold at ${f.w}x${f.h}`, await pg.evaluate((vh) => {
      const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect();
        return { top: Math.round(b.top), bottom: Math.round(b.bottom), fullyAbove: b.bottom <= vh, startsBelow: b.top >= vh }; };
      const hero = document.querySelector('[class*="HomeHero"]');
      const lead = hero && [...hero.querySelectorAll('p')].sort((a, b) => b.textContent.length - a.textContent.length)[0];
      const actions = document.querySelector('[class*="HomeHero_actions"]');
      const anchors = actions ? [...actions.querySelectorAll('a')] : [];
      const quote = document.querySelector('[class*="HomeHero"] blockquote, [class*="HomeHero"] [class*="uote"]');
      // where exactly the lead text is cut: last full line above the fold
      let cutAt = null;
      if (lead) {
        const r = document.createRange(); const tn = [...lead.childNodes].find((n) => n.nodeType === 3) || lead.firstChild;
        if (tn && tn.nodeType === 3) {
          const s = tn.textContent; let last = 0;
          for (let i = 1; i <= s.length; i++) { r.setStart(tn, 0); r.setEnd(tn, i);
            const rects = r.getClientRects(); const bb = rects[rects.length - 1];
            if (bb && bb.bottom <= vh) last = i; }
          cutAt = { visiblePrefixEndsWith: s.slice(Math.max(0, last - 30), last), cutMidSentence: last < s.length, charsVisible: last, charsTotal: s.length };
        }
      }
      return { viewportHeight: vh, documentHeight: document.documentElement.scrollHeight,
        leadParagraph: lead ? { ...box(lead), text: lead.textContent.slice(0, 90) + '…' } : 'NOT FOUND',
        leadCut: cutAt,
        actionsRow: box(actions),
        ctas: anchors.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'), ...box(a) })),
        heroQuote: quote ? { ...box(quote), text: quote.textContent.slice(0, 60) } : 'NOT FOUND' };
    }, f.h));
    await hideDevOverlay(pg);
    await pg.screenshot({ path: shot(`0${f.w === 1280 ? '3' : '4'}-home-fold-${f.w}x${f.h}.png`) });
    await c.close();
  }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  await run(browser);
  await browser.close();
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
