/*
 * TEST-005 harness, round 4 (Tanya, 2026-09-05) — check 5 done honestly.
 * Round 1 reached the /services scroller at Tab 12, but the tab walk started
 * from a mid-document focus origin (I had called scrollIntoView first), so
 * "12 tabs" was not a clean-load number. Walk Tab from a clean load, no click,
 * no programmatic scroll, and record the whole trail; then arrow-key it.
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
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/services', { waitUntil: 'networkidle' });
  await p.bringToFront();
  await p.screenshot({ path: shot('_wake5.png') });   // wake only; no click, no scroll
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
  await p.waitForTimeout(900);

  const trail = [];
  let reached = false, n = 0;
  while (n < 40 && !reached) {
    await p.keyboard.press('Tab'); n++;
    const cur = await p.evaluate(() => {
      const a = document.activeElement;
      return { tag: a.tagName, text: (a.textContent || '').trim().slice(0, 28),
        cls: (a.className || '').toString().slice(0, 40),
        isScroller: /ServicesTable_scroller/.test((a.className || '').toString()) };
    });
    trail.push(n + ': <' + cur.tag + '> ' + (cur.text || '(no text)') + (cur.isScroller ? '  <== SCROLLER' : ''));
    reached = cur.isScroller;
  }
  const before = await p.evaluate((s) => document.querySelector(s).scrollLeft, SEL);
  for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250); }
  const afterRight = await p.evaluate((s) => Math.round(document.querySelector(s).scrollLeft), SEL);
  for (let i = 0; i < 8; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(160); }
  const afterMore = await p.evaluate((s) => {
    const sc = document.querySelector(s);
    return { scrollLeft: Math.round(sc.scrollLeft), max: sc.scrollWidth - sc.clientWidth,
      headsVisible: [...sc.querySelectorAll('thead th')].map((th) => {
        const b = th.getBoundingClientRect();
        return th.textContent.trim() + ' @' + Math.round(b.left) + '..' + Math.round(b.right);
      }) };
  }, SEL);
  for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(200); }
  const afterLeft = await p.evaluate((s) => Math.round(document.querySelector(s).scrollLeft), SEL);
  console.log('\n### clean-load Tab walk\n' + trail.join('\n'));
  console.log('\n### arrow keys\n' + JSON.stringify(
    { tabsToReach: reached ? n : 'NOT REACHED in 40', before, afterThreeRight: afterRight,
      afterElevenRight: afterMore, afterThreeLeft: afterLeft }, null, 1));
  await p.screenshot({ path: shot('d-scroller-keyboard-clean-360.png') });
  await p.close(); await ctx.close();
  await browser.close();
  console.log('\n=== ROUND 4 DONE ===');
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
