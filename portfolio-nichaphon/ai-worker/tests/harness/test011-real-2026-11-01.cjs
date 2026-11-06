/*
 * TEST-011 real-call leg (Tanya, QA — 2026-11-01). WITH back/ ON THE REAL GATEWAY THIS SPENDS THE OWNER'S CALLS.
 * SPEC-010 §Call ledger rows 2–14 (planned ≤ 11, cap 13). One press each, never a retry. Dry-run it on the stub first.
 * STEP=R1|R2|R3|R4|R5 runs ONE step, so the operator of the harness can read the log's count between presses.
 *   R1 AC-d Draft on projects[].summary (Develyst AI Gateway), Thai note → read draft → Discard → public /portfolio unchanged
 *   R2 AC-d Draft on the QA post's body, Thai note → Use this → public unchanged before Save → Save → public shows it
 *   R3 AC-e add project "Zephyrine Ledger" + Save → /portfolio shows it → Home AI in English
 *   R4 AC-e Home AI in Thai
 *   R5 AC-g Home AI chip "Which databases have you worked with?"
 * Usage: NODE_PATH=… ADMIN_URL=http://localhost:4015 BASE_URL=http://127.0.0.1:3072 OUT=<dir> STEP=R1 node test011-real-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ADMIN = process.env.ADMIN_URL || 'http://localhost:4015';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const STEP = process.env.STEP;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });
const log = (k, v) => console.log(`${k}: ${JSON.stringify(v)}`);

const NOTE_R1 = 'เขียนสรุปใหม่ให้อ่านง่ายขึ้น สั้นลง ใช้แค่ข้อมูลที่มีอยู่แล้ว ห้ามเพิ่มอะไรใหม่';
const NOTE_R2 = 'เขียนย่อหน้าสั้นๆ ว่าทำไมผมเก็บเนื้อหาเว็บไว้ใน SQLite เพราะไม่ต้องรันเซิร์ฟเวอร์ฐานข้อมูลแยก';
const ZEP = { id: 'zephyrine-ledger', title: 'Zephyrine Ledger', summary: 'A bookkeeping web app for a small pottery studio that logs every kiln firing and tracks glaze stock.' };
const Q_EN = 'Have you built anything for a pottery studio?';
const Q_TH = 'เคยทำระบบให้สตูดิโอเครื่องปั้นดินเผาไหมครับ';
const CHIP = 'Which databases have you worked with?';

async function openEditor(a, section, name) {
  await a.goto(ADMIN + '/', { waitUntil: 'networkidle' });
  await a.waitForFunction((s) => [...document.querySelectorAll('nav[aria-label="Content documents"] p')].some((x) => x.innerText === s), section, { timeout: 30000 });
  await a.evaluate(([sec, nm]) => {
    let el = [...document.querySelectorAll('nav[aria-label="Content documents"] p')].find((x) => x.innerText === sec).nextElementSibling;
    while (el && el.tagName !== 'P') { const l = el.tagName === 'A' ? el : el.querySelector('a'); if (l && l.innerText.trim() === nm) { l.click(); return; } el = el.nextElementSibling; }
    throw new Error('no editor ' + sec + '/' + nm);
  }, [section, name]);
  await a.waitForTimeout(1200);
}
async function publicText(p, route) {
  const r = await p.request.get(BASE + route);
  return (await r.text()).replace(/<[^>]+>/g, ' ');
}
/** Opens the Draft panel that belongs to `field`, types the note, presses Draft ONCE, returns the result. */
async function draftOnce(a, field, note, tag) {
  const btn = field.locator('xpath=following::button[normalize-space()="Draft with AI"][1]');
  await btn.click();
  const noteBox = a.getByRole('textbox', { name: 'Note', exact: true });
  await noteBox.fill(note);
  await a.screenshot({ path: path.join(OUT, `${tag}-1-note.png`), fullPage: true });
  const t0 = Date.now();
  log(`[press] ${tag} Draft pressed ONCE at ${new Date(t0).toISOString()}`, note);
  await a.locator('button', { hasText: /^Draft$/ }).click();
  await a.waitForFunction(() => !!document.querySelector('[role="alert"]') || [...document.querySelectorAll('label')].some((l) => l.innerText === 'Draft'), null, { timeout: 120000 }).catch(() => {});
  const alert = await a.evaluate(() => (document.querySelector('[role="alert"]') || {}).innerText || null);
  let draft = null; let meta = null;
  if (!alert) {
    const d = a.getByRole('textbox', { name: 'Draft', exact: true });
    draft = await d.inputValue();
    meta = await a.evaluate(() => { const l = [...document.querySelectorAll('label')].find((x) => x.innerText === 'Draft'); const w = l && l.closest('.mantine-InputWrapper-root'); return w ? w.innerText.replace(/\n/g, ' | ') : null; });
  }
  await a.screenshot({ path: path.join(OUT, `${tag}-2-draft.png`), fullPage: true });
  return { ms: Date.now() - t0, alert, draft, meta };
}
async function askHome(p, how, q, tag) {
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('#ask-heading').scrollIntoViewIfNeeded();
  const t0 = Date.now();
  if (how === 'chip') {
    log(`[press] ${tag} chip clicked ONCE at ${new Date(t0).toISOString()}`, q);
    await p.locator('section:has(#ask-heading) button', { hasText: q }).first().click();
  } else {
    await p.locator('input[name="question"]').click();
    await p.keyboard.type(q, { delay: 15 });
    log(`[press] ${tag} Ask pressed ONCE at ${new Date().toISOString()}`, q);
    await p.locator('section:has(#ask-heading) form button[type="submit"]').click();
  }
  while (Date.now() - t0 < 120000) {
    const done = await p.evaluate(() => {
      const live = document.querySelector('section:has(#ask-heading) [aria-live]');
      const btn = document.querySelector('section:has(#ask-heading) form button[type="submit"]');
      return !!live && (!!live.querySelector('[role="status"]') || (btn && btn.getAttribute('data-loading') !== 'true' && live.querySelectorAll('p').length > 0));
    });
    if (done) break;
    await p.waitForTimeout(500);
  }
  await p.waitForTimeout(700);
  const live = p.locator('section:has(#ask-heading) [aria-live]');
  await live.scrollIntoViewIfNeeded().catch(() => {});
  const r = {
    ms: Date.now() - t0,
    text: await live.innerText(),
    paragraphs: await p.$$eval('section:has(#ask-heading) [aria-live] p', (ps) => ps.map((x) => x.innerText)),
    links: await p.$$eval('section:has(#ask-heading) [aria-live] a', (as) => as.map((x) => x.getAttribute('href') + ' ' + x.innerText.replace(/\s+/g, ' '))),
    failurePanel: !!(await p.$('section:has(#ask-heading) [role="status"]')),
  };
  await p.screenshot({ path: path.join(OUT, `${tag}-answered-desktop.png`) });
  return r;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const a = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  a.on('pageerror', (e) => errs.push('admin ' + String(e).slice(0, 150)));
  p.on('pageerror', (e) => errs.push('public ' + String(e).slice(0, 150)));

  if (STEP === 'R1') {
    const before = await publicText(p, '/portfolio');
    await openEditor(a, 'Portfolio', 'Projects');
    await a.locator('main button', { hasText: 'Develyst AI Gateway' }).first().click();
    await a.waitForTimeout(700);
    const field = a.getByRole('textbox', { name: 'Summary', exact: true });
    const current = await field.inputValue();
    const r = await draftOnce(a, field, NOTE_R1, 'R1');
    log('R1 current', current);
    log('R1 result', r);
    if (!r.alert) await a.locator('button', { hasText: /^Discard$/ }).click();
    await a.waitForTimeout(500);
    const fieldAfter = await field.inputValue();
    const after = await publicText(p, '/portfolio');
    log('R1 after Discard', { fieldUnchanged: fieldAfter === current, publicPortfolioUnchanged: before === after, draftOnPublic: r.draft ? after.includes(r.draft.slice(0, 40)) : null });
  }

  if (STEP === 'R2') {
    const before = await publicText(p, '/blog/qa-t011-published-post');
    await openEditor(a, 'Blog', 'Posts');
    await a.locator('main button', { hasText: 'QA-T011 published post' }).first().click();
    await a.waitForTimeout(1000);
    const excerptId = await a.getByRole('textbox', { name: 'Excerpt', exact: true }).getAttribute('id');
    const body = a.locator(`main textarea:not([id="${excerptId}"])`).last();
    const r = await draftOnce(a, body, NOTE_R2, 'R2');
    log('R2 result', r);
    if (r.alert) { log('R2 stop', 'technical failure — recorded, no re-press'); }
    else {
      await a.locator('button', { hasText: /^Use this$/ }).click();
      await a.waitForTimeout(500);
      const inField = await body.inputValue();
      const midPublic = await publicText(p, '/blog/qa-t011-published-post');
      log('R2 after Use this, BEFORE Save', { fieldIsDraft: inField === r.draft, publicUnchanged: midPublic === before, draftOnPublic: midPublic.includes(r.draft.slice(0, 40)) });
      await a.locator('main button', { hasText: /^Save$/ }).first().click();
      await a.waitForTimeout(1500);
      const msg = await a.evaluate(() => document.querySelector('main').innerText.split('\n').filter((l) => /Saved|error/i.test(l)).slice(0, 2));
      await p.goto(BASE + '/blog/qa-t011-published-post', { waitUntil: 'networkidle' });
      const postText = await p.evaluate(() => document.querySelector('main').innerText);
      await p.screenshot({ path: path.join(OUT, 'R2-public-post-after-save.png'), fullPage: true });
      log('R2 after Save', { msg, draftOnPublic: postText.includes(r.draft.split('\n')[0].slice(0, 40)) });
    }
  }

  if (STEP === 'R3') {
    await openEditor(a, 'Portfolio', 'Projects');
    const titlesBefore = await a.evaluate(() => [...document.querySelectorAll('main button')].map((b) => b.innerText).filter((t) => /^\d\d\n/.test(t)).length);
    await a.locator('main button', { hasText: /^Add item$/ }).click();
    await a.waitForTimeout(900);
    const box = (n) => a.getByRole('textbox', { name: n, exact: true }).last();
    await box('ID').fill(ZEP.id);
    await box('Title').fill(ZEP.title);
    await box('Summary').fill(ZEP.summary);
    await a.screenshot({ path: path.join(OUT, 'R3-admin-new-project.png'), fullPage: true });
    await a.locator('main button', { hasText: /^Save$/ }).first().click();
    await a.waitForTimeout(1500);
    const msg = await a.evaluate(() => document.querySelector('main').innerText.split('\n').filter((l) => /Saved|error|invalid|required/i.test(l)).slice(0, 3));
    await a.screenshot({ path: path.join(OUT, 'R3-admin-after-save.png'), fullPage: true });
    await p.goto(BASE + '/portfolio', { waitUntil: 'networkidle' });
    const onPortfolio = await p.evaluate((t) => document.body.innerText.includes(t), ZEP.title);
    await p.locator(`text=${ZEP.title}`).first().scrollIntoViewIfNeeded().catch(() => {});
    await p.screenshot({ path: path.join(OUT, 'R3-public-portfolio.png') });
    log('R3 project saved', { titlesBefore, msg, onPortfolio });
    if (!onPortfolio) { log('R3 stop', 'the project is not on the public site — no Home AI question fired'); }
    else log('R3 Home AI (EN)', await askHome(p, 'type', Q_EN, 'R3'));
  }

  if (STEP === 'R4') log('R4 Home AI (TH)', await askHome(p, 'type', Q_TH, 'R4'));
  if (STEP === 'R5') log('R5 Home AI chip', await askHome(p, 'chip', CHIP, 'R5'));

  log('pageerrors', errs);
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
