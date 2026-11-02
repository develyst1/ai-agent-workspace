// TASK-037 evidence pictures (Fern, 2026-11-01). Headless; ZERO real calls — back/ must point at the stub
// (PHASE=stub) or at a closed port (PHASE=error). The loading picture holds the request 4 s in the browser
// (page.route → continue); nothing is faked: every response is back/'s own.
// Usage: OUT=<dir> PHASE=stub|error PW=<file URL of playwright-core's index.mjs> node shoot.mjs
// (node, not bun: under bun on Windows the launch over --remote-debugging-pipe never completes.)
const { chromium } = await import(process.env.PW ?? 'playwright-core');

const OUT = process.env.OUT;
const PHASE = process.env.PHASE ?? 'stub';
const NOTE = 'เพิ่มว่าระบบนี้รองรับผู้ใช้หลายภาษา';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const api = (path) => fetch(`http://localhost:4014${path}`).then((r) => r.text());
const hash = async (s) => Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))).toString('hex');

await page.goto('http://localhost:4015/');
await page.getByText('Projects', { exact: true }).click();
await page.getByText('Learning Curve', { exact: true }).click();
const summary = page.locator('[data-path="projects[0].summary"]');
const block = summary.locator('xpath=ancestor::div[contains(@class,"mantine-Stack-root")][1]');
await block.getByRole('button', { name: 'Draft with AI' }).click();
const panel = block.locator('.mantine-Paper-root');
await panel.scrollIntoViewIfNeeded();

const shot = (name, target = panel) =>
  target.screenshot({ path: `${OUT}/${name}.png` }).then(() => console.log(`shot ${name}`));

if (PHASE === 'stub') {
  await shot('01-panel-empty', block);
  await panel.getByLabel('Note').fill(NOTE);
  await page.route('**/admin/api/draft', async (route) => {
    await new Promise((r) => setTimeout(r, 4000));
    await route.continue();
  });
  await panel.getByRole('button', { name: 'Draft', exact: true }).click();
  await page.waitForTimeout(500);
  await shot('02-panel-loading', block);
  await panel.getByLabel('Draft', { exact: true }).waitFor();
  await shot('03-panel-result', block);

  const before = await api('/admin/api/documents/projects');
  await panel.getByRole('button', { name: 'Use this' }).click();
  console.log(`field after Use this: ${JSON.stringify(await summary.inputValue())}`);
  const after = await api('/admin/api/documents/projects');
  console.log(`GET projects before Use this sha256=${await hash(before)}`);
  console.log(`GET projects after  Use this sha256=${await hash(after)}`);
  await page.screenshot({ path: `${OUT}/04-after-use-this-unsaved.png` });

  // 768 wide — the narrowest the admin supports (TASK-035 note 7: no phone layout, loopback-only).
  await page.setViewportSize({ width: 768, height: 1024 });
  await block.getByRole('button', { name: 'Draft with AI' }).click();
  await panel.scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`768 horizontal overflow px=${overflow}`);
  await shot('06-panel-768', block);
} else if (PHASE === 'real') {
  // TASK-037 step 5 — SPENDS ONE REAL CALL (SPEC-010 §Call ledger row 1). One press, never a retry,
  // never "Use this". The current summary goes along as `current` (the panel sends the field's text).
  console.log(`current summary sent: ${JSON.stringify(await summary.inputValue())}`);
  await panel.getByLabel('Note').fill(NOTE);
  await panel.getByRole('button', { name: 'Draft', exact: true }).click();
  const done = await Promise.race([
    panel.getByLabel('Draft', { exact: true }).waitFor({ timeout: 120000 }).then(() => 'result'),
    panel.getByRole('alert').waitFor({ timeout: 120000 }).then(() => 'error'),
  ]);
  if (done === 'result') {
    console.log(`draft: ${JSON.stringify(await panel.getByLabel('Draft', { exact: true }).inputValue())}`);
    console.log(`provider/model line: ${await panel.locator('.mantine-InputWrapper-description').textContent()}`);
    await shot('07-real-draft-result', block);
  } else {
    console.log(`error: ${await panel.getByRole('alert').textContent()}`);
    await shot('07-real-draft-error', block);
  }
} else if (PHASE === 'probe') {
  // Audit numbers: contrast of every text in the panel against the panel background, and button boxes.
  await panel.getByLabel('Note').fill(NOTE);
  await panel.getByRole('button', { name: 'Draft', exact: true }).click();
  await panel.getByLabel('Draft', { exact: true }).waitFor();
  await panel.getByLabel('Note').fill('');
  const report = await block.evaluate((root) => {
    const rgb = (s) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]) => {
      const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const bgOf = (el) => {
      for (let e = el; e; e = e.parentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor);
        if (c.length >= 3 && (c.length < 4 || c[3] > 0.5)) return c;
      }
      return [0, 0, 0];
    };
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
    };
    const out = [];
    for (const el of root.querySelectorAll('label, button, p, .mantine-InputWrapper-description, .mantine-Text-root, textarea')) {
      const cs = getComputedStyle(el);
      const name = (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40);
      const r = el.getBoundingClientRect();
      out.push(`${el.tagName} "${name}" fg/bg=${ratio(rgb(cs.color), bgOf(el))} box=${Math.round(r.width)}x${Math.round(r.height)}`);
      if (el.tagName === 'TEXTAREA') {
        const ph = getComputedStyle(el, '::placeholder');
        out.push(`  placeholder fg/bg=${ratio(rgb(ph.color), bgOf(el))}`);
      }
    }
    return out;
  });
  console.log(report.join('\n'));
  // Keyboard: Tab from the toggle reaches note → Draft (disabled skipped) → draft box → Use this → Discard.
  await block.getByRole('button', { name: 'Draft with AI' }).focus();
  const order = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || document.activeElement?.tagName || '').trim().slice(0, 30)));
  }
  console.log(`tab order: ${order.join(' → ')}`);
  // The enabled filled buttons: Draft (mine) next to the editor's own Save (TASK-035), same theme variant.
  await panel.getByLabel('Note').fill(NOTE);
  await page.mouse.move(0, 0);
  const filled = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((b) => ['Draft', 'Save'].includes(b.textContent.trim()))
      .map((b) => {
        const cs = getComputedStyle(b);
        return `${b.textContent.trim()} disabled=${b.disabled} color=${cs.color} bg=${cs.backgroundColor}`;
      }),
  );
  console.log(filled.join('\n'));
} else {
  await panel.getByLabel('Note').fill(NOTE);
  await panel.getByRole('button', { name: 'Draft', exact: true }).click();
  const alert = panel.getByRole('alert');
  await alert.waitFor();
  console.log(`error text: ${await alert.textContent()}`);
  await shot('05-panel-error', block);
}
await browser.close();
