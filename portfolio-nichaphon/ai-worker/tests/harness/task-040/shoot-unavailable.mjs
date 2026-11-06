// TASK-040 DoD 3 (Fern, 2026-11-01): with back/ stopped, ONE load of /about → the unavailable state. Headless.
// Usage: OUT=<dir> FRONT=http://127.0.0.1:3072 PW=<file URL of playwright-core index.mjs> node shoot-unavailable.mjs
const { chromium } = await import(process.env.PW ?? 'playwright-core');
const FRONT = process.env.FRONT ?? 'http://127.0.0.1:3072';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const res = await page.goto(`${FRONT}/about`);
console.log(`${new Date().toISOString().slice(11, 23)} GET /about → HTTP ${res?.status()}`);
console.log(`body text: ${JSON.stringify((await page.locator('main').innerText()).slice(0, 200))}`);
await page.screenshot({ path: `${process.env.OUT}/about-back-stopped-1280.png` });
await browser.close();
