/*
 * TEST-008 harness (Tanya, QA — 2026-09-13). ZERO COST — nothing here may reach
 * https://ai.develyst.online; `back/`, when it runs, is pinned to the local stub.
 *
 *   strings   REQ-005 AC-d — `/` + `/about` at 1280x900 and 360x740: every corrected
 *             string located in the DOM, scrolled into view and photographed; the
 *             absence list checked against the whole rendered text.
 *   f1        REQ-007 AC-e (1) — `back/` NOT running → the section's honest failure.
 *   happy     stub happy path (`stub:slow`) — mid-chain + final pictures, citations read.
 *   none      `stub:none` — the not-covered hint.
 *   fold      REQ-007 AC-h — hero fold at scrollTop 0, section top, scrollWidth (idle).
 *   f2        AC-e (2) — `back/` up, stub dead → honest failure at step 1.
 *   f3        AC-e (3) — `stub:slow`, `back/` killed mid-chain (KILL_BACK_CMD) → dropped.
 *
 * Run rules (REGRESSION §How to run it): headed Chrome, tab fronted and one
 * throwaway screenshot taken BEFORE anything is measured so document.hidden goes
 * false, one rAF per scroll step over the whole document, no el.focus() anywhere.
 *
 * Usage (playwright-core lives OUTSIDE the repo; front/package.json untouched):
 *   NODE_PATH=<some repo>/node_modules BASE_URL=http://127.0.0.1:3072 OUT=<dir> \
 *   SIZES=desktop,phone node test008-2026-09-13.cjs <mode>
 *
 * Prints observations only. The verdict comes from the pictures.
 */
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mode = process.argv[2];
const SIZES = { desktop: { width: 1280, height: 900 }, phone: { width: 360, height: 740 } };
fs.mkdirSync(OUT, { recursive: true });

const counts = { consoleErrors: [], pageErrors: [], failedRequests: [], nonLocalRequests: [], wsUrls: [] };
const log = (...a) => console.log(...a);

function wire(page) {
  page.on('console', (m) => { if (m.type() === 'error') counts.consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => counts.pageErrors.push(String(e).slice(0, 200)));
  page.on('requestfailed', (r) => counts.failedRequests.push(`${r.url().slice(0, 120)} ${r.failure() && r.failure().errorText}`));
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('about:') && !u.startsWith('blob:')) counts.nonLocalRequests.push(u.slice(0, 160));
  });
  page.on('websocket', (ws) => counts.wsUrls.push(ws.url()));
}

async function wake(page) {
  await page.bringToFront();
  await page.screenshot({ path: path.join(OUT, '_throwaway.png') });
  const hidden = await page.evaluate(() => document.hidden);
  log(`[wake] document.hidden=${hidden}`);
}

async function scrollWhole(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight / 2));
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(r));
  });
  await page.waitForTimeout(400);
}

async function withPage(size, route, fn) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: false });
  const page = await browser.newPage({ viewport: SIZES[size] });
  wire(page);
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await wake(page);
  await page.waitForTimeout(1500); // hero entrance animation
  try {
    await fn(page, size);
  } finally {
    await browser.close();
  }
}

const shoot = (page, name) => page.screenshot({ path: path.join(OUT, name), fullPage: false });

// ---------- strings (REQ-005 AC-d) ----------
const HOME_STRINGS = [
  ['role', 'AI Engineer / Senior Software Engineer'],
  ['year', '© 2026'],
  ['lead', 'in about three weeks'],
  ['stat-label', 'Years experience'], // CAREER_STATS renders on Home (HomeStats.tsx), not on /about
];
const ABOUT_STRINGS = [
  ['role', 'AI Engineer / Senior Software Engineer'],
  ['year', '© 2026'],
  ['h1', 'Four years of shipping the thing nobody there had shipped before'],
  ['stat-value', '4'],
  ['stat-label', 'Years experience'],
  ['gfai-role', 'AI & Robotics Developer'],
  ['gfai-para', 'In about three weeks I delivered'],
  ['icm-role', 'Senior / Staff Software Engineer'],
  ['icm-org', 'ICM Smart Solution Co., Ltd.'],
  ['cert-issuer', 'ICM Smart Solution'],
  ['values', 'a robotic kiosk prototype in about three weeks'],
  ['chip', 'DeepSeek'],
  ['chip', 'Kimi'],
  ['chip', 'xAI'],
  ['chip', 'Text-to-SQL / schema grounding'],
  ['chip', 'MQTT'],
  ['chip', 'Go Gin'],
  ['chip', 'SQLite'],
  ['chip', 'nginx'],
  ['chip', 'pm2'],
  ['chip', 'Generative AI (Gemini, OpenAI)'],
];
const ABSENT = ['two weeks', 'Three years', 'Solutions', '2025', 'Chatuchak'];

async function strings(page, size, route) {
  const tag = route === '/' ? 'home' : 'about';
  await scrollWhole(page);
  // 1. the whole rendered text, once
  const bodyText = await page.evaluate(() => document.body.innerText);
  const list = route === '/' ? HOME_STRINGS : ABOUT_STRINGS;
  for (const [key, s] of list) {
    const n = bodyText.split(s).length - 1;
    log(`[${tag}/${size}] present "${s}" -> ${n} occurrence(s) in body.innerText`);
  }
  for (const s of ABSENT) {
    const re = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const hits = (bodyText.match(re) || []).length;
    const srcHits = (await page.content()).split(s).length - 1;
    log(`[${tag}/${size}] absent  "${s}" -> text ${hits}, source ${srcHits}`);
  }
  // footer check on the visible year: "© 2026" as one string in the footer's innerText
  const footer = await page.evaluate(() => { const f = document.querySelector('footer'); return f ? f.innerText.replace(/\s+/g, ' ') : null; });
  log(`[${tag}/${size}] footer text = ${JSON.stringify(footer)}`);
  const header = await page.evaluate(() => { const h = document.querySelector('header'); return h ? h.innerText.replace(/\s+/g, ' ') : null; });
  log(`[${tag}/${size}] header text = ${JSON.stringify(header)}`);
  // 2. pictures: top of page (header), then every string scrolled into view, then footer
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shoot(page, `${tag}-${size}-01-top.png`);
  let i = 2;
  const seen = new Set();
  for (const [key, s] of list) {
    if (key === 'role' || key === 'year') continue; // header/footer pictures cover these
    const loc = page.getByText(s, { exact: key !== 'gfai-para' && key !== 'lead' && key !== 'values' }).first();
    const cnt = await page.getByText(s, { exact: key !== 'gfai-para' && key !== 'lead' && key !== 'values' }).count();
    if (!cnt) { log(`[${tag}/${size}] NOT FOUND as element: "${s}"`); continue; }
    await loc.scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    await page.waitForTimeout(500);
    const box = await loc.boundingBox();
    const txt = (await loc.innerText()).replace(/\s+/g, ' ');
    const name = `${tag}-${size}-${String(i).padStart(2, '0')}-${key}.png`;
    if (key === 'chip') {
      // one picture of the chip group is enough — shoot once per group, log each chip's box
      log(`[${tag}/${size}] chip "${s}" box=${JSON.stringify(box)} text=${JSON.stringify(txt)}`);
      if (!seen.has('chips')) { seen.add('chips'); await shoot(page, `${tag}-${size}-${String(i).padStart(2, '0')}-chips.png`); i++; }
      continue;
    }
    if (key === 'stat-label') {
      const card = await loc.evaluate((el) => (el.parentElement ? el.parentElement.innerText.replace(/\s+/g, ' ') : null));
      log(`[${tag}/${size}] stat card innerText=${JSON.stringify(card)} (label textContent=${JSON.stringify(await loc.evaluate((el) => el.textContent))})`);
    }
    log(`[${tag}/${size}] ${key} box=${JSON.stringify(box)} text=${JSON.stringify(txt)} -> ${name}`);
    await shoot(page, name);
    i++;
  }
  // AI chips group: a second, separately scrolled picture of the "Tools and DevOps" / "Databases" rows
  if (route === '/about') {
    for (const label of ['Databases', 'Tools and DevOps']) {
      const loc = page.getByText(label, { exact: true }).first();
      if (await loc.count()) {
        await loc.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await shoot(page, `${tag}-${size}-${String(i).padStart(2, '0')}-chips-${label.replace(/\W+/g, '-').toLowerCase()}.png`);
        i++;
      }
    }
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  await page.waitForTimeout(500);
  await shoot(page, `${tag}-${size}-${String(i).padStart(2, '0')}-footer.png`);
  await page.screenshot({ path: path.join(OUT, `${tag}-${size}-full.png`), fullPage: true });
}

// ---------- Ask section (REQ-007) ----------
async function section(page) {
  const h = page.locator('#ask-heading');
  await h.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  await page.waitForTimeout(300);
  return h;
}
const stepStatuses = (page) =>
  page.$$eval('section:has(#ask-heading) ol li', (lis) => lis.map((li) => li.innerText.replace(/\n/g, ' | ')));
async function askViaChip(page, index) {
  await page.locator('section:has(#ask-heading) form button[type="button"]').nth(index).click();
}
async function askTyped(page, text) {
  await page.locator('input[name="question"]').fill(text);
  await page.locator('section:has(#ask-heading) form button[type="submit"]').click();
}
async function dump(page, tag) {
  const steps = await stepStatuses(page);
  const liveText = await page.locator('section:has(#ask-heading) [aria-live]').innerText();
  log(`[${tag}] steps=${JSON.stringify(steps)}`);
  log(`[${tag}] live=${JSON.stringify(liveText)}`);
  const sw = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  log(`[${tag}] scrollWidth=${sw.scrollWidth} innerWidth=${sw.innerWidth}`);
  const btn = await page.$eval('section:has(#ask-heading) form button[type="submit"]', (b) => ({ loading: b.getAttribute('data-loading'), disabled: b.disabled, text: b.innerText }));
  log(`[${tag}] submit=${JSON.stringify(btn)}`);
  const retry = await page.$$eval('section:has(#ask-heading) button', (bs) => bs.filter((b) => /Try again/.test(b.innerText)).length);
  log(`[${tag}] "Try again" buttons=${retry}`);
  const links = await page.$$eval('section:has(#ask-heading) [aria-live] a', (as) => as.map((a) => a.getAttribute('href') + ' | ' + a.innerText.replace(/\s+/g, ' ')));
  log(`[${tag}] links in live region=${JSON.stringify(links)}`);
  const restOfHome = await page.evaluate(() => ({
    hero: !!document.querySelector('main > div'),
    h2s: [...document.querySelectorAll('main h2')].map((h) => h.innerText.replace(/\s+/g, ' ')),
    footer: !!document.querySelector('footer'),
  }));
  log(`[${tag}] rest of Home=${JSON.stringify(restOfHome)}`);
  const live = page.locator('section:has(#ask-heading) [aria-live]');
  if (await live.count()) await live.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(200);
}
async function waitStatus(page, timeout) {
  await page.waitForSelector('section:has(#ask-heading) [role="status"]', { timeout });
  await page.waitForTimeout(400);
}

const scenarios = {
  async f1(page, size) {
    await section(page);
    await shoot(page, `f1-idle-${size}.png`);
    const t0 = Date.now();
    await askViaChip(page, 0);
    await page.waitForTimeout(600);
    await shoot(page, `f1-connecting-${size}.png`);
    await dump(page, `f1/${size}/connecting`);
    await waitStatus(page, 12000);
    log(`[f1/${size}] failure shown after ${Date.now() - t0} ms`);
    await dump(page, `f1/${size}`);
    await shoot(page, `f1-never-opened-${size}.png`);
  },
  async happy(page, size) {
    await section(page);
    await askTyped(page, 'stub:slow Can you build a realtime site with WebSocket?');
    await page.waitForTimeout(3200);
    await dump(page, `happy/${size}/mid`);
    await shoot(page, `happy-mid-${size}.png`);
    await page.waitForFunction(() => document.querySelectorAll('section:has(#ask-heading) [aria-live] a').length > 0, null, { timeout: 20000 });
    await page.waitForTimeout(500);
    await dump(page, `happy/${size}/final`);
    await shoot(page, `happy-final-${size}.png`);
  },
  async none(page, size) {
    await section(page);
    await askTyped(page, 'stub:none Do you fly helicopters?');
    await page.waitForFunction(() => !!document.querySelector('section:has(#ask-heading) [aria-live] a[href="/contact"]'), null, { timeout: 20000 });
    await page.waitForTimeout(500);
    await dump(page, `none/${size}`);
    await shoot(page, `none-${size}.png`);
  },
  async fold(page, size) {
    const m = await page.evaluate(() => {
      const hero = document.querySelector('main > div');
      const ask = document.querySelector('#ask-heading').closest('section');
      const r = (el) => el.getBoundingClientRect();
      const q = (sel) => { const e = document.querySelector(sel); return e ? Math.round(r(e).bottom) : null; };
      return {
        scrollY: window.scrollY, innerHeight: window.innerHeight, innerWidth: window.innerWidth,
        heroBottom: r(hero).bottom, askTop: r(ask).top, scrollWidth: document.documentElement.scrollWidth,
        h1Bottom: q('main h1'),
        orderAfterHero: [...document.querySelectorAll('main > *')].slice(0, 4).map((e) => (e.querySelector('h1,h2') || e).innerText.split('\n')[0].slice(0, 60)),
      };
    });
    log(`[fold/${size}] ${JSON.stringify(m)}`);
    await shoot(page, `fold-${size}.png`);
    await section(page);
    await shoot(page, `section-idle-${size}.png`);
    await dump(page, `fold/${size}/idle`);
  },
  async h8(page, size) {
    // REGRESSION H8 — the six hero parts at scrollTop 0, boxes read off the DOM (same method as TEST-005 case 1)
    const m = await page.evaluate(() => {
      const hero = document.querySelector('main > div');
      const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.top * 100) / 100, Math.round(b.bottom * 100) / 100]; };
      const byText = (t) => [...hero.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === t) || [...hero.querySelectorAll('*')].find((e) => e.textContent.trim().startsWith(t) && e.querySelectorAll('*').length < 4);
      const h1 = hero.querySelector('h1');
      const lead = [...hero.querySelectorAll('p')].find((p) => /Generative AI and RAG/.test(p.textContent));
      const ctas = [...hero.querySelectorAll('a')].filter((a) => /View my work|Get in touch/.test(a.innerText));
      const quote = [...hero.querySelectorAll('*')].reverse().find((e) => /Say try me/.test(e.textContent) && e.children.length <= 2);
      const role = [...hero.querySelectorAll('*')].find((e) => e.children.length === 0 && /Senior Software Engineer/.test(e.textContent));
      return {
        innerHeight: window.innerHeight, scrollY: window.scrollY, heroBottom: Math.round(hero.getBoundingClientRect().bottom),
        name: h1 && r(h1), nameText: h1 && h1.innerText.replace(/\n/g, ' '),
        role: role && r(role), roleText: role && role.textContent,
        lead: lead && r(lead), leadLines: lead && Math.round(lead.getBoundingClientRect().height / parseFloat(getComputedStyle(lead).lineHeight)),
        cta1: ctas[0] && r(ctas[0]), cta1Text: ctas[0] && ctas[0].innerText,
        cta2: ctas[1] && r(ctas[1]), cta2Text: ctas[1] && ctas[1].innerText,
        quote: quote && r(quote), quoteText: quote && quote.textContent.trim(),
      };
    });
    log(`[h8/${size}] ${JSON.stringify(m)}`);
    await shoot(page, `h8-fold-${size}.png`);
  },
  async f2(page, size) {
    await section(page);
    await askViaChip(page, 0);
    await waitStatus(page, 20000);
    await dump(page, `f2/${size}`);
    await shoot(page, `f2-unreachable-step1-${size}.png`);
  },
  async f3(page, size) {
    await section(page);
    await askTyped(page, 'stub:slow Which databases have you worked with?');
    await page.waitForTimeout(2600);
    await dump(page, `f3/${size}/before-kill`);
    await shoot(page, `f3-before-kill-${size}.png`);
    log(`[f3/${size}] killing back/: ${process.env.KILL_BACK_CMD}`);
    execSync(process.env.KILL_BACK_CMD, { stdio: 'inherit' });
    await waitStatus(page, 15000);
    await dump(page, `f3/${size}`);
    const n = await page.$$eval('section:has(#ask-heading) [aria-live] > div:not([role="status"])', (d) => d.length);
    const answerP = await page.$$eval('section:has(#ask-heading) [aria-live] p', (ps) => ps.map((p) => p.innerText.slice(0, 80)));
    log(`[f3/${size}] answer blocks on screen=${n} paragraphs=${JSON.stringify(answerP)}`);
    await shoot(page, `f3-dropped-${size}.png`);
  },
};

(async () => {
  const sizes = (process.env.SIZES || 'desktop,phone').split(',');
  if (mode === 'strings') {
    for (const route of ['/', '/about']) for (const size of sizes) {
      log(`=== strings ${route} @ ${size}`);
      await withPage(size, route, (p, s) => strings(p, s, route));
    }
  } else {
    const fn = scenarios[mode];
    if (!fn) throw new Error('unknown mode ' + mode);
    for (const size of sizes) {
      log(`=== ${mode} @ ${size}`);
      await withPage(size, '/', fn);
    }
  }
  log('=== counts ' + JSON.stringify(counts, null, 0));
})().catch((e) => { console.error(e); process.exit(1); });
