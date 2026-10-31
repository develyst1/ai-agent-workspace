// TEST-101 #17/#18 — walk caw-front's main flow on the mock, by clicks, against maps/caw.md § Main flow.
// usage: bun tests/harness/test-101-caw-walk.mjs <caw-front dir> <base url> <out dir>
// Read-only against a mock server QA started; writes only screenshots + a JSON result into <out dir>.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [front, base, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
fs.mkdirSync(out, { recursive: true });

const BP = '11111111-2222-4333-8444-555555555555';
const steps = [];
const note = (step, ok, detail) => { steps.push({ step, ok, detail }); console.log(`${ok ? 'OK ' : 'BAD'} ${step} — ${detail}`); };

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const shot = (n) => page.screenshot({ path: path.join(out, `${n}.png`), fullPage: true });
const startLinks = () => page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')).filter((h) => h.includes('/start')));
// click the visible link whose name starts with this text (a tab may carry a count badge, e.g. "แชต 1"),
// the way a user would (hit-test via Playwright click)
const clickText = async (text) => { await page.getByRole('link', { name: new RegExp(`^\\s*${text}`) }).first().click(); await page.waitForLoadState('networkidle'); };

try {
  // 1. /start with a confirmed version → redirect to the board (map row 1)
  const r = await page.goto(`${base}/start?project=${BP}&version=3`, { waitUntil: 'networkidle', timeout: 180000 });
  note('1 /start known v3', /\/p\/10000000-0000-4000-8000-000000000001$/.test(page.url()), `landed ${page.url()} (status ${r?.status()})`);
  await shot('1-board');
  const board = await page.textContent('body');
  note('2 board words', ['บอร์ด', 'ทีม', 'การรัน', 'แชต', 'จองห้องประชุม'].every((w) => board.includes(w)), 'tabs + project name present');
  note('2 board no /start link', (await startLinks()).length === 0, JSON.stringify(await startLinks()));

  // 3. a card, reached by clicking it on the board
  const cardHref = await page.$eval('a[href*="/c/"]', (a) => a.getAttribute('href'));
  await page.click(`a[href="${cardHref}"]`); await page.waitForLoadState('networkidle');
  const spec = await page.$$eval('a[href]', (as) => as.map((a) => a.href).filter((h) => h.includes('/web?part=')));
  note('3 card', page.url().includes('/c/'), `url ${page.url()}; ดู spec hrefs ${JSON.stringify(spec)}`);
  await shot('3-card');

  // 4–6. tabs by click
  for (const [n, tab, url] of [['4-team', 'ทีม', '/team'], ['5-runs', 'การรัน', '/runs'], ['6-chat', 'แชต', '/chat']]) {
    await clickText(tab);
    note(`${n} tab click`, page.url().endsWith(url), `url ${page.url()}`);
    note(`${n} no /start link`, (await startLinks()).length === 0, JSON.stringify(await startLinks()));
    await shot(n);
  }

  // 7. home via the header
  await clickText('โปรเจกต์');
  note('7 home by header', new URL(page.url()).pathname === '/', `url ${page.url()}`);
  note('7 home no /start link', (await startLinks()).length === 0, JSON.stringify(await startLinks()));
  await shot('7-home');

  // negative /start cases (map § Front links, CAW side)
  for (const [n, q, expectText] of [
    ['N1 no query', '', 'ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน'],
    ['N2 bad version', `?project=${BP}&version=abc`, 'ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน'],
    ['N3 v99', `?project=${BP}&version=99`, 'เวอร์ชันนี้ยังไม่ได้ยืนยันใน Blueprint'],
  ]) {
    await page.goto(`${base}/start${q}`, { waitUntil: 'networkidle' });
    const body = await page.textContent('body');
    note(n, new URL(page.url()).pathname === '/start' && body.includes(expectText), `stays ${page.url()}; text present: ${body.includes(expectText)}`);
    await shot(n.split(' ')[0]);
  }
  // test-reset must be 404 when CAW_TEST_RESET is not set (dev:mock does not set it)
  const tr = await page.request.post(`${base}/test-reset`);
  note('N4 /test-reset without CAW_TEST_RESET', tr.status() === 404, `status ${tr.status()}`);
} catch (e) {
  note('ERROR', false, String(e?.message ?? e));
} finally {
  fs.writeFileSync(path.join(out, 'walk.json'), JSON.stringify(steps, null, 2));
  await browser.close();
}
