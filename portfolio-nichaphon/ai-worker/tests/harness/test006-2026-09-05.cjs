/*
 * TEST-006 harness (Tanya, QA — 2026-09-05).
 * REQ-003 AC-d — SEE it: /portfolio as a picture (intro line + 11 cards), and
 * the two NEW cards' modals opened and captured as pictures, with each modal's
 * "Open live project" href read off the live DOM in the same round.
 *
 *   P1  /portfolio full page  -> intro line text + the 11 card titles in order
 *   M1  card "Learning Curve" -> ProjectModal -> picture + href
 *   M2  card "Ong Match"      -> ProjectModal -> picture + href
 *   (both at desktop 1280x900 and again at mobile 360x740)
 *   CON console errors / pageerrors / failed requests across the whole run
 *
 * The live-project anchor is READ, never clicked: the two URLs inside it are the
 * owner's own products and this round only has to report the href.
 *
 * Run rules obeyed (REGRESSION §How to run it):
 *   - headed Chrome (`channel: 'chrome'`, headless: false)
 *   - the tab is fronted and one throwaway screenshot taken BEFORE anything is
 *     measured, so document.hidden goes false and scrolling actually runs
 *   - the whole document is scrolled, one requestAnimationFrame per step
 *   - no el.focus() anywhere
 *
 * Usage (playwright lives OUTSIDE the repo; front/package.json is untouched):
 *   NODE_PATH=<scratchpad>/pw/node_modules \
 *   BASE_URL=http://127.0.0.1:3061 node test006-2026-09-05.cjs
 *
 * Prints observations only. The verdict comes from the screenshots.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3061';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test006-2026-09-05';
fs.mkdirSync(SHOTS, { recursive: true });
const shot = (n) => path.join(SHOTS, n);
const out = (l, v) => console.log('\n### ' + l + '\n' + JSON.stringify(v, null, 1));

async function wake(p, tag) {
  await p.bringToFront();
  await p.screenshot({ path: shot(`_wake-${tag}.png`) });
}

async function scrollAll(p) {
  await p.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => r()));
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 250));
  });
}

const probe = () => ({
  dialogs: document.querySelectorAll('[role="dialog"]').length,
  modalContent: document.querySelectorAll('.mantine-Modal-content').length,
  overlays: document.querySelectorAll('.mantine-Modal-overlay').length,
  scrollLocked: document.body.getAttribute('data-scroll-locked'),
  bodyOverflow: getComputedStyle(document.body).overflow,
});

/* Everything the open modal actually shows, measured — plus the anchor's href,
   read from the DOM. The anchor is never clicked. */
const modalProbe = () => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return '(no dialog)';
  const r = d.getBoundingClientRect();
  const a = d.querySelector('a[href]');
  const ar = a ? a.getBoundingClientRect() : null;
  const cs = getComputedStyle(d);
  return {
    dialogBox: `${Math.round(r.width)}x${Math.round(r.height)} at (${Math.round(r.x)},${Math.round(r.y)})`,
    dialogBg: cs.backgroundColor,
    dialogOpacity: cs.opacity,
    dialogVisibility: cs.visibility,
    title: (d.querySelector('.mantine-Modal-title')?.textContent || '').trim(),
    summaryFirst80: (d.querySelector('[class*="summary"]')?.textContent || '').trim().slice(0, 80),
    labels: [...d.querySelectorAll('[class*="label"]')].map((e) => e.textContent.trim()),
    highlightCount: d.querySelectorAll('[class*="highlight"]').length,
    chipCount: d.querySelectorAll('[class*="Chip"], [class*="chip"]').length,
    linkText: a ? a.textContent.trim() : '(no anchor)',
    linkHref: a ? a.getAttribute('href') : '(no anchor)',
    linkTarget: a ? a.getAttribute('target') : null,
    linkRel: a ? a.getAttribute('rel') : null,
    linkBox: ar ? `${Math.round(ar.width)}x${Math.round(ar.height)} at (${Math.round(ar.x)},${Math.round(ar.y)})` : null,
    linkInViewport: ar ? ar.top >= 0 && ar.bottom <= window.innerHeight : null,
  };
};

const gridProbe = () => {
  const intro = document.querySelector('h1, h2');
  const cards = [...document.querySelectorAll('button[aria-label^="Open project detail for"]')];
  return {
    introHeadingText: intro ? intro.textContent.trim() : '(none)',
    cardTriggerCount: cards.length,
    cardTitlesInOrder: cards.map((b) => b.getAttribute('aria-label').replace('Open project detail for ', '')),
  };
};

async function runViewport(browser, label, width, height, logs) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${label}][${m.type()}] ${m.text()}`);
  });
  p.on('pageerror', (e) => logs.push(`[${label}][pageerror] ${e.message}`));
  p.on('requestfailed', (r) => logs.push(`[${label}][requestfailed] ${r.url()} — ${r.failure()?.errorText}`));
  p.on('response', (r) => { if (r.status() >= 400) logs.push(`[${label}][http ${r.status()}] ${r.url()}`); });

  const res = await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
  await wake(p, label);
  out(`P1 ${label} /portfolio http status`, res.status());
  await scrollAll(p);
  await p.waitForTimeout(600);

  out(`P1 ${label} intro line + card titles`, await p.evaluate(gridProbe));
  await p.screenshot({ path: shot(`p1-portfolio-fullpage-${label}.png`), fullPage: true });
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);
  await p.screenshot({ path: shot(`p1-portfolio-top-${label}.png`), fullPage: false });

  for (const name of ['Learning Curve', 'Ong Match']) {
    const key = name.toLowerCase().replace(/\s+/g, '-');
    const trig = p.getByRole('button', { name: `Open project detail for ${name}` });
    out(`M ${label} ${name} trigger count`, await trig.count());
    await trig.first().scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    out(`M ${label} ${name} BEFORE click`, await p.evaluate(probe));
    await trig.first().click();
    await p.waitForTimeout(1600);
    out(`M ${label} ${name} AFTER click`, await p.evaluate(probe));
    out(`M ${label} ${name} MODAL CONTENT + live-URL href`, await p.evaluate(modalProbe));
    await p.screenshot({ path: shot(`m-${key}-modal-${label}.png`), fullPage: false });
    /* scroll inside the modal body so the footer link is captured too */
    await p.evaluate(() => {
      const body = document.querySelector('.mantine-Modal-body') || document.querySelector('[role="dialog"]');
      if (body) body.scrollTop = body.scrollHeight;
      const d = document.querySelector('.mantine-Modal-inner');
      if (d) d.scrollTop = d.scrollHeight;
    });
    await p.waitForTimeout(700);
    out(`M ${label} ${name} after scrolling modal to its foot`, await p.evaluate(modalProbe));
    await p.screenshot({ path: shot(`m-${key}-modal-foot-${label}.png`), fullPage: false });
    await p.keyboard.press('Escape');
    await p.waitForTimeout(900);
    out(`M ${label} ${name} AFTER Escape`, await p.evaluate(probe));
  }
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const logs = [];
  console.log(`\n===== TEST-006 AC-d picture round — BASE=${BASE} =====`);
  await runViewport(browser, 'desktop-1280', 1280, 900, logs);
  await runViewport(browser, 'mobile-360', 360, 740, logs);
  out('CON console errors + warnings + failed requests (whole run)', logs.length ? logs : '(none)');
  await browser.close();
})();
