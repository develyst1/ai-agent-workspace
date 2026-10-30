// TEST-101 #15/#16 — walk blueprint-front's main flow by clicks, against maps/blueprint.md §3.
// usage: bun tests/harness/test-101-bp-walk.mjs <blueprint-front dir> <base url> <seeded project id> <out dir>
// Back end = QA's in-memory blueprint-back on the local fake gateway. Writes: one project created through the dialog, screenshots, walk.json.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [front, base, bp, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const steps = [];
const note = (step, ok, detail) => { steps.push({ step, ok, detail }); console.log(`${ok ? 'OK ' : 'BAD'} ${step} — ${detail}`); };
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const shot = (n) => page.screenshot({ path: path.join(out, `${n}.png`), fullPage: true });
const settle = () => page.waitForLoadState('networkidle');
const clickHref = async (href) => { await page.locator(`a[href="${href}"]`).first().click(); await settle(); };

try {
  // 1 Home
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 180000 });
  await shot('1-home');
  const homeLinks = await page.$$eval('a[href^="/p/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  note('1 home lists the seeded project', homeLinks.some((h) => h.includes(bp)), `${homeLinks.length} /p/ links; seeded present ${homeLinks.some((h) => h.includes(bp))}`);
  const sample = homeLinks.find((h) => !h.includes(bp));
  if (sample) {
    const r = await page.request.get(base + sample);
    note('1b home sample link target', true, `sample link ${sample} → HTTP ${r.status()} (visible: ${await page.locator(`a[href="${sample}"]`).first().isVisible()})`);
  }

  // 2 Create project through the dialog (local in-memory write)
  const before = homeLinks.length;
  const opener = page.getByRole('button', { name: /โปรเจกต์ใหม่|สร้างโปรเจกต์|เริ่มโปรเจกต์/ }).first();
  if (await opener.count()) {
    await opener.click();
    await page.getByRole('dialog').getByRole('textbox').first().fill('TEST-101 dialog');
    await shot('2-dialog');
    await page.getByRole('dialog').getByRole('button', { name: /สร้าง|เริ่ม|ตกลง/ }).last().click();
    await settle();
    note('2 create project by dialog', page.url().includes('/p/') || (await page.textContent('body')).includes('TEST-101 dialog'), `after submit url ${page.url()}`);
    await shot('2-after-create');
  } else {
    note('2 create project by dialog', false, 'no new-project button found by name — see 1-home.png');
  }

  // 3 Open the seeded card → /p/<id> redirects to overview
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.locator(`a[href^="/p/${bp}"]`).first().click(); await settle();
  note('3 open card → overview', page.url().includes(`/p/${bp}/`), `url ${page.url()}`);
  await shot('3-overview');

  // 4 chat, 5 spec pages, 6 ready — reached by clicking the nav
  for (const pg of ['chat', 'flowchart', 'sequence', 'screens', 'api', 'web', 'stuck', 'work-order', 'ready']) {
    const href = `/p/${bp}/${pg}`;
    const n = await page.locator(`a[href="${href}"]`).count();
    if (!n) { note(`nav ${pg}`, false, `no link ${href} on ${page.url()}`); continue; }
    await clickHref(href);
    note(`nav ${pg}`, page.url().endsWith(href), `url ${page.url()}`);
    await shot(`nav-${pg}`);
  }
  // history page: map says it exists; is it linked?
  const hist = await page.locator(`a[href="/p/${bp}/history"], a[href^="/p/${bp}/history"]`).count();
  note('nav history link present', true, `history links on ready page: ${hist}`);

  // 4 chat: the composer is there (sending needs a model → NOT_TESTED)
  await page.goto(`${base}/p/${bp}/chat`, { waitUntil: 'networkidle' });
  note('4 chat composer present', (await page.locator('textarea').count()) > 0, `textareas ${await page.locator('textarea').count()}`);

  // 6/7/8 ready: v2 confirmed, so the build link is on
  await page.goto(`${base}/p/${bp}/ready`, { waitUntil: 'networkidle' });
  const build = await page.locator('a[data-build]').getAttribute('href').catch(() => null);
  note('8 ready build link', !!build && build.includes(`project=${bp}`), `href ${build}`);
  const pdf = await page.locator('[href*="export/pdf"], button:has-text("PDF")').count();
  note('9 PDF export control present', pdf > 0, `controls ${pdf} (export itself not run: it launches local Chrome to print — NOT_TESTED)`);

  // not reachable from the UI
  const dev = await page.request.get(`${base}/dev/isolation`);
  note('U1 /dev/isolation without BLUEPRINT_DEV_PAGES', dev.status() === 404, `HTTP ${dev.status()}`);
  for (const pg of ['overview', 'ready', 'chat']) {
    await page.goto(`${base}/p/${bp}/${pg}`, { waitUntil: 'networkidle' });
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')).filter((h) => h.includes('/export/print') || h.startsWith('/dev')));
    note(`U2 no print/dev link on ${pg}`, links.length === 0, JSON.stringify(links));
  }
} catch (e) {
  note('ERROR', false, String(e?.stack ?? e).slice(0, 600));
} finally {
  fs.writeFileSync(path.join(out, 'walk.json'), JSON.stringify(steps, null, 2));
  await browser.close();
}
