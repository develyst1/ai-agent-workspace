/*
 * TEST-005 harness, round 3 (Tanya, 2026-09-05).
 * Round 1's AC7 header clips were taken after the document had been scrolled,
 * so they framed the wrong strip and are NOT evidence of what the header holds.
 * Re-capture the header of each non-Home route from a clean load, at scroll 0,
 * from the <header> element itself — desktop and mobile.
 */
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE_URL || 'http://localhost:3021';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test005-2026-09-05';
const shot = (n) => path.join(SHOTS, n);
const ROUTES = ['/about', '/services', '/portfolio', '/blog', '/contact'];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  for (const vp of [{ n: 'desktop', w: 1280, h: 900 }, { n: 'mobile', w: 360, h: 740 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    for (const r of ROUTES) {
      await p.goto(BASE + r, { waitUntil: 'networkidle' });
      await p.bringToFront();
      await p.screenshot({ path: shot('_wake4.png') });
      await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(700);
      const hdr = await p.$('header');
      await hdr.screenshot({ path: shot('c-header-' + vp.n + '-' + r.slice(1) + '.png') });
      const inv = await p.evaluate(() => {
        const h = document.querySelector('header');
        return {
          controls: [...h.querySelectorAll('button,[role=switch],input,select')]
            .map((el) => ({ tag: el.tagName,
              text: (el.textContent || '').trim().slice(0, 30) || null,
              aria: el.getAttribute('aria-label'),
              cls: (el.className || '').toString().slice(0, 50) })),
          links: [...h.querySelectorAll('a')].map((a) => a.getAttribute('href')),
        };
      });
      console.log('\n### ' + vp.n + ' ' + r + ' header inventory\n' + JSON.stringify(inv, null, 1));
    }
    await p.close(); await ctx.close();
  }
  await browser.close();
  console.log('\n=== ROUND 3 DONE ===');
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
