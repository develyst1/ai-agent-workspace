// TASK-042 DoD 4 (Fern, 2026-11-01): New post → Author = the stored site.name; an existing sample post keeps its author.
// Headless, zero real calls, nothing saved. Usage: OUT=<dir> PW=<file URL of playwright-core index.mjs> node admin-author.mjs
const { chromium } = await import(process.env.PW ?? 'playwright-core');
const OUT = process.env.OUT;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:4015/');
await page.locator('[data-path]').first().waitFor();
const site = await (await fetch('http://localhost:4014/admin/api/documents/site')).json();
console.log(`stored site.name: ${JSON.stringify(site.value.name)}`);

const nav = page.locator('.mantine-NavLink-root');
await nav.filter({ hasText: /^Posts$/ }).first().click();
await page.getByRole('button', { name: 'New post' }).click();
console.log(`New post → Author: ${JSON.stringify(await page.getByLabel('Author').inputValue())}`);
await page.screenshot({ path: `${OUT}/admin-new-post-author.png` });

await page.getByText('All posts').first().click();
await page.locator('table tbody tr').first().locator('a, button').first().click();
console.log(`existing post "${await page.getByLabel('Title').inputValue()}" → Author: ${JSON.stringify(await page.getByLabel('Author').inputValue())}`);
await page.screenshot({ path: `${OUT}/admin-existing-post-author.png` });
await browser.close();
