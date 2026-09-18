#!/usr/bin/env node
// measure-about.mjs — TASK-023 measuring instrument (DoD 6, 7, 8).
//
// Usage:
//   PW=<abs path to a dir with node_modules/playwright-core> \
//   node measure-about.mjs <base-url> <label: BEFORE|AFTER>
//
// Drives the REAL Chrome on this machine (playwright-core + executablePath).
// For each theme (light/dark, via localStorage dte-theme), same viewport:
//   - GET /about status
//   - body.innerText contains the SPEC-008 #4 sentence / ตัวเลขที่น่าสนใจ
//   - /\p{Extended_Pictographic}/u.test(body.innerText)
//   - document.querySelectorAll('svg.lucide').length
//   - getBoundingClientRect().height of the two h4 (Vision/Mission cards) and
//     of the first Vision bullet p
//   - AFTER only: a screenshot `about-after-<theme>.png` next to this script
//     (BEFORE writes `about-before-<theme>.png` for comparison)
//
// Throwaway verification script. Lives in the coordination repo, not in front/.

import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(
  pathToFileURL(`${process.env.PW}/node_modules/playwright-core/index.mjs`).href
);

const BASE = process.argv[2];
const LABEL = process.argv[3];
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HERE = dirname(fileURLToPath(import.meta.url));
if (!BASE || !LABEL) { console.error('usage: node measure-about.mjs <base-url> <BEFORE|AFTER>'); process.exit(1); }

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1050 } });
  await ctx.addInitScript((t) => localStorage.setItem('dte-theme', t), theme);
  const page = await ctx.newPage();
  const resp = await page.goto(`${BASE}/about`, { waitUntil: 'load' });
  await page.waitForFunction(() => /\b(light|dark)\b/.test(document.documentElement.className));
  await page.waitForTimeout(1200);
  const g = await page.evaluate(() => {
    const h4s = [...document.querySelectorAll('h4')];
    const bullet = h4s[0] && h4s[0].parentElement.querySelector('div.space-y-3 > p');
    const text = document.body.innerText;
    return {
      htmlClass: document.documentElement.className,
      hasSentence: text.includes('DTE — Develyst The Education คือแพลตฟอร์มเรียนออนไลน์'),
      hasNumbers: text.includes('ตัวเลขที่น่าสนใจ'),
      pictographic: /\p{Extended_Pictographic}/u.test(text),
      lucide: document.querySelectorAll('svg.lucide').length,
      h4: h4s.map((h) => ({ text: h.innerText.replace(/\s+/g, ' ').trim(), h: h.getBoundingClientRect().height })),
      bullet: bullet && { text: bullet.innerText.replace(/\s+/g, ' ').trim(), h: bullet.getBoundingClientRect().height },
    };
  });
  console.log(`=== ${LABEL} / ${theme} (html="${g.htmlClass}") GET /about -> ${resp.status()} ===`);
  console.log(`innerText includes SPEC-008 #4 sentence = ${g.hasSentence}`);
  console.log(`innerText includes 'ตัวเลขที่น่าสนใจ'      = ${g.hasNumbers}`);
  console.log(`/\\p{Extended_Pictographic}/u.test(innerText) = ${g.pictographic}`);
  console.log(`svg.lucide count = ${g.lucide}`);
  for (const h of g.h4) console.log(`h4 "${h.text}"  height=${h.h}`);
  console.log(`vision bullet p "${g.bullet && g.bullet.text}"  height=${g.bullet && g.bullet.h}`);
  const file = join(HERE, `about-${LABEL.toLowerCase()}-${theme}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`screenshot: ${file}`);
  await ctx.close();
}

await browser.close();
