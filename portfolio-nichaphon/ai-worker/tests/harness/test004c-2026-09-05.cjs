/*
 * TEST-004 harness, round 3 (Tanya, 2026-09-05).
 * Round 1's /about shots were taken while the dev image optimiser was still
 * working, so they show empty frames and are NOT evidence of the paint.
 * Re-capture /about at both viewports only after all nine images report
 * complete + naturalWidth > 0 (SQ8 eye 5 / REGRESSION S13).
 */
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE_URL || 'http://localhost:3021';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test004-2026-09-05';
const shot = (n) => path.join(SHOTS, n);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  for (const vp of [{ n: 'desktop', w: 1280, h: 900 }, { n: 'mobile', w: 360, h: 740 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
    await p.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.body.scrollHeight + step; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 140)));
      }
    });
    let ok = true;
    try {
      await p.waitForFunction(
        () => [...document.querySelectorAll('button img')].every((i) => i.complete && i.naturalWidth > 0),
        null, { timeout: 60000 });
    } catch { ok = false; }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(1200);
    const state = await p.evaluate(() => [...document.querySelectorAll('button img')].map((i) => {
      const b = i.getBoundingClientRect();
      return i.alt.slice(0, 28) + ' | box ' + Math.round(b.width) + 'x' + Math.round(b.height)
        + ' | natural ' + i.naturalWidth + 'x' + i.naturalHeight;
    }));
    console.log('\n### ' + vp.n + ' /about all nine painted: ' + ok + '\n' + state.join('\n'));
    await p.screenshot({ path: shot(vp.n + '-about-full.png'), fullPage: true });
    await p.close(); await ctx.close();
  }
  await browser.close();
  console.log('\n=== ROUND 3 DONE ===');
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
