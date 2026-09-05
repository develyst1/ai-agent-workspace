/*
 * TEST-001 confirm-tick harness — REQ-001 §QA confirm tick (Tanya, 2026-09-02).
 * ONE case: every quote rendered on `/` compared to R5 AS IT NOW STANDS,
 * by exact string equality. Quote 2's Thai is the 42-char string the owner
 * ruled canonical on 2026-09-02 (Q4).
 *
 * Playwright is NOT a dependency of front/ (adding it there is an engineer's
 * change, not QA's). Run with playwright installed OUTSIDE the repo, via NODE_PATH,
 * against a locally running `npm run dev`:
 *
 *   NODE_PATH=<scratchpad>/pw/node_modules node confirm-tick-2026-09-02.cjs
 *
 * The script prints observations only. The verdict is written by hand in
 * tests/TEST-001-*.md from what was SEEN, never from a line printed here.
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SHOTS = 'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-req001-confirm-tick-2026-09-02';
const shot = (n) => path.join(SHOTS, n);

// R5 canonical strings, pasted from requirements/REQ-001-ui-visual-redesign.md §R5
// as it stands on 2026-09-02 (quote 2 Thai superseded by the owner, Q4).
const R5 = {
  th1: 'นักพนันที่เก่งมากๆ ไม่ได้เล่นแค่ตาที่ตัวเองไพ่ดี',
  th2: 'ผมไม่ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร',
  th3: 'จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลย นอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"',
  en1: "A truly great gambler doesn't only play the hands where his own cards are good.",
  en2: 'I don\'t work "for" anyone. I work "with" them.',
  en3: 'My weakness and my strength are the same thing: "I care about nothing but solving the most important problem of the organisation."',
  en4: "Don't say why me. Say try me.",
};

function firstDiff(a, b) {
  const A = [...a], B = [...b];
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    if (A[i] !== B[i]) return { index: i,
      rendered: A[i] === undefined ? '(end)' : A[i] + ' U+' + A[i].codePointAt(0).toString(16),
      canonical: B[i] === undefined ? '(end)' : B[i] + ' U+' + B[i].codePointAt(0).toString(16) };
  }
  return null;
}
const hideDevOverlay = (p) => p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
const out = (label, val) => console.log('\n### ' + label + '\n' + (typeof val === 'string' ? val : JSON.stringify(val, null, 1)));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  p.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  const resp = await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  out('HOME http status', resp.status());

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
  out('quote-bearing nodes on Home (raw textContent)', nodes);

  const matchTable = nodes.map((n) => {
    const hit = Object.entries(R5).find(([, v]) => v === n.textContent);
    if (hit) return { node: n.cls || n.tag, lang: n.lang, matches: hit[0], exact: true, len: n.len };
    let best = null, bestScore = -1;
    for (const [k, v] of Object.entries(R5)) {
      let i = 0; const A = [...n.textContent], B = [...v];
      while (i < A.length && i < B.length && A[i] === B[i]) i++;
      const score = i / Math.max(1, B.length);
      if (score > bestScore) { bestScore = score; best = k; }
    }
    return { node: n.cls || n.tag, lang: n.lang, matches: null, exact: false, nearest: best,
      prefixMatchRatio: Math.round(bestScore * 1000) / 1000,
      rendered: n.textContent, renderedLen: [...n.textContent].length,
      canonical: R5[best], canonicalLen: [...R5[best]].length,
      diff: firstDiff(n.textContent, R5[best]) };
  });
  out('EXACT EQUALITY vs R5 (as it stands 2026-09-02)', matchTable);

  out('canonical strings present anywhere in body text', await p.evaluate((r5) => {
    const t = document.body.textContent; const res = {};
    for (const [k, v] of Object.entries(r5)) res[k] = t.includes(v);
    return res;
  }, R5));

  out('quote count (a quote counts if either language form is present)', await p.evaluate((r5) => {
    const t = document.body.textContent;
    return { quote1: t.includes(r5.th1) || t.includes(r5.en1), quote2: t.includes(r5.th2) || t.includes(r5.en2),
      quote3: t.includes(r5.th3) || t.includes(r5.en3), quote4: t.includes(r5.en4) };
  }, R5));

  out('console on / at 1280x900', logs.length ? logs : '(none)');

  await hideDevOverlay(p);
  await p.screenshot({ path: shot('01-home-full-1280.png'), fullPage: true });
  for (const [file, sel] of [['02-hero-quote.png', '[class*="HomeHero"] blockquote, [class*="HomeHero"] [class*="uote"]'],
                             ['03-band-quote.png', '[class*="HomeStatement_band"]']]) {
    const el = await p.$(sel);
    if (el) await el.screenshot({ path: shot(file) });
    else console.log('\n(no element for ' + file + ')');
  }
  await ctx.close();
  await browser.close();
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
