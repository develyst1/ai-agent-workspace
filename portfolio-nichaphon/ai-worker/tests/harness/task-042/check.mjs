// TASK-042 evidence (Fern, 2026-11-01). Headless, ZERO real calls (back/'s gateway on a closed port; Ask is never pressed).
// PHASE=before → pictures of / and /blog from the build as it was (no edit yet).
// PHASE=after  → the same pictures + a pixel diff against before; for each of the 6 routes: load, wait 2.5 s, count failed and
//                `_rsc` requests; then click a header link and count the `_rsc` it makes.
// Usage: OUT=<dir> PHASE=before|after FRONT=http://127.0.0.1:3072 PW=<file URL of playwright-core index.mjs> node check.mjs
import { readFileSync } from 'node:fs';
const { chromium } = await import(process.env.PW ?? 'playwright-core');
const OUT = process.env.OUT;
const PHASE = process.env.PHASE;
const FRONT = process.env.FRONT ?? 'http://127.0.0.1:3072';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });

async function shoot(path, name) {
  const page = await context.newPage();
  await page.goto(FRONT + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}`, fullPage: true, animations: 'disabled' });
  await page.close();
}

/** Different pixels between two PNGs, counted in the browser on a canvas. */
async function diff(a, b) {
  const page = await context.newPage();
  const url = (f) => `data:image/png;base64,${readFileSync(f).toString('base64')}`;
  const n = await page.evaluate(async ([ua, ub]) => {
    const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });
    const [ia, ib] = await Promise.all([load(ua), load(ub)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return `size ${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`;
    const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const [da, db] = [px(ia), px(ib)];
    let d = 0;
    for (let i = 0; i < da.length; i += 4) if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2] || da[i + 3] !== db[i + 3]) d++;
    return `${d} differing pixels of ${ia.width}x${ia.height}`;
  }, [url(a), url(b)]);
  await page.close();
  return n;
}

await shoot('/', `${PHASE}-home.png`);
await shoot('/blog', `${PHASE}-blog.png`);

if (PHASE === 'after') {
  console.log(`/ vs before: ${await diff(`${OUT}/before-home.png`, `${OUT}/after-home.png`)}`);
  console.log(`/blog vs before: ${await diff(`${OUT}/before-blog.png`, `${OUT}/after-blog.png`)}`);

  for (const path of ['/', '/about', '/services', '/portfolio', '/blog', '/contact']) {
    const page = await context.newPage();
    let failed = 0;
    let rsc = 0;
    page.on('requestfailed', (r) => {
      failed++;
      console.log(`  failed: ${r.method()} ${r.url()} ${r.resourceType()} — ${r.failure()?.errorText}`);
    });
    page.on('request', (r) => { if (r.url().includes('_rsc=')) rsc++; });
    await page.goto(FRONT + path);
    await page.waitForTimeout(2500);
    console.log(`${path}: failed=${failed} _rsc=${rsc}`);
    if (path === '/') {
      const clicks = [];
      page.on('response', (r) => { if (r.url().includes('_rsc=')) clicks.push(`${r.status()} ${new URL(r.url()).pathname}`); });
      page.on('request', (r) => {
        if (!r.url().includes('_rsc=')) return;
        const h = r.headers();
        const keep = Object.keys(h).filter((k) => k.startsWith('next-') || k === 'rsc').map((k) => `${k}=${h[k].slice(0, 40)}`);
        console.log(`  _rsc request on click: ${new URL(r.url()).pathname}${new URL(r.url()).search} ${keep.join(' ')}`);
      });
      await page.locator('header').getByRole('link', { name: 'About' }).first().click();
      await page.waitForURL('**/about');
      await page.waitForTimeout(1000);
      console.log(`click header About → url=${new URL(page.url()).pathname} _rsc on click: ${clicks.join(', ') || 'none'} (failed so far=${failed})`);
    }
    await page.close();
  }
}
await browser.close();
