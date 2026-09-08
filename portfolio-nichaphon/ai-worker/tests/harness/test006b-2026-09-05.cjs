/*
 * TEST-006b (Tanya, QA — 2026-09-05) — the mobile follow-up.
 * At 360x740 the modal body scrolls and the "Open live project" button starts
 * below the modal's own fold. test006 measured that but its programmatic
 * scrollTop did not move the container, so this probe scrolls the modal the way
 * a visitor does — mouse wheel over it — and captures the footer as a picture.
 * The anchor is READ, never clicked.
 */
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3061';
const SHOTS =
  'H:/ai-agent-workplace/ai-agent-workspace/portfolio-nichaphon/project-docs/qa-test006-2026-09-05';
const shot = (n) => path.join(SHOTS, n);
const out = (l, v) => console.log('\n### ' + l + '\n' + JSON.stringify(v, null, 1));

const linkProbe = () => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return '(no dialog)';
  const a = d.querySelector('a[href]');
  if (!a) return '(no anchor)';
  const r = a.getBoundingClientRect();
  const cs = getComputedStyle(a);
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return {
    href: a.getAttribute('href'),
    text: a.textContent.trim(),
    box: `${Math.round(r.width)}x${Math.round(r.height)} at (${Math.round(r.x)},${Math.round(r.y)})`,
    inViewport: r.top >= 0 && r.bottom <= window.innerHeight,
    bg: cs.backgroundColor,
    color: cs.color,
    topElementAtItsCentre: hit ? hit.tagName + '.' + (hit.className || '').toString().slice(0, 40) : null,
    hitIsTheLinkOrInsideIt: !!(hit && (hit === a || a.contains(hit))),
  };
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
  await p.bringToFront();
  await p.screenshot({ path: shot('_wake-mobile-360b.png') });

  for (const name of ['Learning Curve', 'Ong Match']) {
    const key = name.toLowerCase().replace(/\s+/g, '-');
    await p.getByRole('button', { name: `Open project detail for ${name}` }).first().click();
    await p.waitForTimeout(1400);
    out(`${name} @360 link BEFORE any scroll`, await p.evaluate(linkProbe));
    /* wheel over the middle of the modal, the way a visitor scrolls it */
    await p.mouse.move(180, 400);
    for (let i = 0; i < 14; i++) {
      await p.mouse.wheel(0, 300);
      await p.waitForTimeout(120);
    }
    await p.waitForTimeout(600);
    out(`${name} @360 link AFTER wheel-scrolling the modal`, await p.evaluate(linkProbe));
    await p.screenshot({ path: shot(`m-${key}-modal-foot-wheel-mobile-360.png`), fullPage: false });
    await p.keyboard.press('Escape');
    await p.waitForTimeout(800);
  }
  await browser.close();
})();
