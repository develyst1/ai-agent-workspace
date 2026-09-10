#!/usr/bin/env node
// measure-btn-primary.mjs — TASK-021 measuring instrument.
//
// Usage:
//   PW=<abs path to a playwright-core install> \
//   node measure-btn-primary.mjs <base-url>
//
// Drives the REAL Chrome installed on this machine (playwright-core +
// executablePath, no bundled browser download) and, for the `.btn-primary`
// button, reads getComputedStyle(el).backgroundColor and .color OFF THE ACTUAL
// ELEMENT, then computes the WCAG 2.x relative-luminance contrast ratio from
// those two values.
//
// The hover states are REAL hovers: page.hover() moves the actual mouse over
// the element, so :hover matches in the engine. Nothing here is read off a CSS
// rule or off a token value.
//
// Limits, stated on purpose (same as TASK-005/006/020):
//  - It is a ratio between the element's OWN background-color and its OWN
//    color. It does not account for an ancestor showing through a translucent
//    background, for a background-image/gradient, or for text drawn over
//    anything but its own box.
//  - `npm run start` is not the live site; it is this machine's build.
//  - An automated Chrome is not the owner's eyes.
//
// Throwaway verification script. Lives in the coordination repo, not in front/.

import { pathToFileURL } from 'node:url';
const { chromium } = await import(
  pathToFileURL(`${process.env.PW}/node_modules/playwright-core/index.mjs`).href
);

const BASE = process.argv[2];
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!BASE) { console.error('usage: node measure-btn-primary.mjs <base-url>'); process.exit(1); }

const lum = (c) => {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const parse = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
const ratio = (bg, fg) => {
  const a = lum(parse(bg)), b = lum(parse(fg));
  return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
};

const read = (page, sel, nth) => page.evaluate(([s, n]) => {
  const el = document.querySelectorAll(s)[n];
  const cs = getComputedStyle(el);
  return {
    htmlClass: document.documentElement.className,
    text: el.textContent.trim(),
    backgroundColor: cs.backgroundColor,
    color: cs.color,
    borderColor: cs.borderTopColor,
  };
}, [sel, nth]);

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

const open = async (theme, path, width = 1440, height = 900) => {
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.addInitScript((t) => localStorage.setItem('dte-theme', t), theme);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForFunction(() => /\b(light|dark)\b/.test(document.documentElement.className));
  // `.btn-primary` has `transition: all 0.2s ease`, and applying the theme class
  // in ThemeContext's effect STARTS that transition. Reading immediately gives an
  // in-flight colour, not the resting one — the first run of this script did
  // exactly that (light resting read rgb(72,72,72) on its way from black to
  // white). Let it land before any measurement.
  await page.waitForTimeout(1200);
  return { ctx, page };
};

const rows = [];
const shot = async (label, theme, path, sel, nth) => {
  const { ctx, page } = await open(theme, path);
  const el = page.locator(sel).nth(nth);
  await el.scrollIntoViewIfNeeded();
  const rest = await read(page, sel, nth);
  rows.push({ case: `${label} / resting`, ...rest, ratio: ratio(rest.backgroundColor, rest.color) });
  await el.hover();
  await page.waitForTimeout(400); // the .btn-primary transition is 0.2s
  const hov = await read(page, sel, nth);
  rows.push({ case: `${label} / HOVER (real pointer)`, ...hov, ratio: ratio(hov.backgroundColor, hov.color) });
  await ctx.close();
};

// DoD 5 — the Navbar button (root layout) on `/`, both themes, resting + hover
await shot('/ navbar  light', 'light', '/', '.btn-primary', 0);
await shot('/ navbar  dark ', 'dark', '/', '.btn-primary', 0);
// DoD 6 — the /courses page CTA, light only, resting + hover
await shot('/courses CTA light', 'light', '/courses', '.btn-primary', 0);

console.log('=== DoD 5 + 6 — measured on the real element, hover is a real pointer ===');
for (const r of rows) {
  console.log(
    `${r.case.padEnd(30)} html=${r.htmlClass.padEnd(5)} bg=${r.backgroundColor.padEnd(20)} color=${r.color.padEnd(20)} ratio=${r.ratio}  ${r.ratio >= 4.5 ? 'PASS' : 'FAIL'}   [${r.text}]`
  );
}

// DoD 7 — the no-theme-class window on `/`
{
  const { ctx, page } = await open('light', '/');
  await page.evaluate(() => document.documentElement.classList.remove('light', 'dark'));
  const bare = await read(page, '.btn-primary', 0);
  console.log('\n=== DoD 7 — no theme class on <html> ===');
  console.log(`html="${bare.htmlClass}"  background-color=${bare.backgroundColor}  color=${bare.color}`);
  await page.reload({ waitUntil: 'load' });
  const back = await read(page, '.btn-primary', 0);
  console.log(`after reload: html="${back.htmlClass}"  background-color=${back.backgroundColor}`);
  await ctx.close();
}

// DoD 8 — geometry at 375 and 1440, both themes
console.log('\n=== DoD 8 — no horizontal scroll, geometry unchanged ===');
for (const theme of ['light', 'dark']) {
  for (const w of [375, 1440]) {
    const { ctx, page } = await open(theme, '/', w, 900);
    const g = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      btn: JSON.stringify(document.querySelectorAll('.btn-primary')[0].getBoundingClientRect()),
    }));
    console.log(`${theme.padEnd(5)} ${String(w).padStart(4)}px  scrollWidth=${g.scrollWidth} clientWidth=${g.clientWidth}  ${g.scrollWidth <= g.clientWidth ? 'no h-scroll' : 'H-SCROLL'}  navbar btn rect=${g.btn}`);
    await ctx.close();
  }
}

await browser.close();
