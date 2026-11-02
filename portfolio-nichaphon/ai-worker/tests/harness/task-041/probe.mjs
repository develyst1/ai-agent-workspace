// TASK-041 evidence (Fern, 2026-11-01). Headless; ZERO real calls (no Draft is pressed; back/'s gateway is a closed port).
// For every document in the admin's nav: open it, open the first list item, list which fields carry "Draft with AI".
// Measures both Save buttons enabled (one keystroke makes the editor dirty; nothing is saved). Pictures: site + one project.
// Usage: OUT=<dir> PW=<file URL of playwright-core index.mjs> node probe.mjs
const { chromium } = await import(process.env.PW ?? 'playwright-core');
const OUT = process.env.OUT;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:4015/');
await page.locator('[data-path]').first().waitFor();

const contrast = () =>
  page.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]) => {
      const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    // Composite every translucent background up the tree onto the first opaque one.
    const bgOf = (el) => {
      const layers = [];
      for (let e = el; e; e = e.parentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor);
        if (c.length < 3) continue;
        const a = c.length === 4 ? c[3] : 1;
        if (a > 0) layers.push([c[0], c[1], c[2], a]);
        if (a >= 1) break;
      }
      let out = [0, 0, 0];
      for (const [r, g, b, a] of layers.reverse()) out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a)];
      return out;
    };
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Save');
    const cs = getComputedStyle(b);
    const [x, y] = [lum(rgb(cs.color)), lum(bgOf(b))].sort((p, q) => q - p);
    return `disabled=${b.disabled} color=${cs.color} bg=${cs.backgroundColor} ratio=${(Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100).toFixed(2)}`;
  });

const listDraft = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-path]')].map((el) => {
      // withDraft = <Stack>{input wrapper}{DraftAssist}</Stack>: the field's own wrapper must be followed by the Draft toggle.
      const wrapper = el.closest('.mantine-InputWrapper-root') ?? el;
      const next = wrapper.nextElementSibling;
      // Direct children only: a later field's own Draft stack must not count for this one.
      const has = !!next && next.querySelector(':scope > .mantine-Group-root > button[aria-expanded]')?.textContent === 'Draft with AI';
      return `${el.getAttribute('data-path')}${has ? ' ✓' : ''}`;
    }),
  );

// Click nav entries by index: four of them are called "Page text", so text alone cannot address them.
const nav = page.locator('.mantine-NavLink-root');
const count = await nav.count();
for (let i = 0; i < count; i++) {
  const name = (await nav.nth(i).innerText()).trim();
  if (/^(Posts|Pictures)/.test(name)) continue; // own screens, not field-map documents
  await nav.nth(i).click();
  await page.waitForTimeout(300);
  const firstItem = page.locator('.mantine-Accordion-control').first();
  if (await firstItem.count()) await firstItem.click();
  await page.waitForTimeout(200);
  const fields = await listDraft();
  console.log(`${name}: ${fields.join(' · ')}`);
  if (name === 'Name, contact and availability') await page.screenshot({ path: `${OUT}/01-site-editor.png`, fullPage: true });
  if (name === 'Projects') await page.screenshot({ path: `${OUT}/02-projects-item.png`, fullPage: true });
}

// Save contrast, enabled: one keystroke in the site editor (never saved).
await page.getByText('Name, contact and availability', { exact: true }).first().click();
await page.locator('[data-path="site.availability"]').press('End');
await page.locator('[data-path="site.availability"]').type('x');
await page.mouse.move(0, 0);
console.log(`document Save: ${await contrast()}`);

// Posts editor Save, enabled: open the first post, one keystroke in its title.
await nav.filter({ hasText: /^Posts$/ }).first().click();
await page.locator('table tbody tr').first().locator('a, button').first().click();
await page.getByLabel('Title').press('End');
await page.getByLabel('Title').type('x');
await page.mouse.move(0, 0);
console.log(`post Save: ${await contrast()}`);
await page.screenshot({ path: `${OUT}/03-post-editor-save.png` });
await browser.close();
