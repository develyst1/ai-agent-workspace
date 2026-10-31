// TEST-101 #15 re-run of the nav part: start at overview each time; open the "เบื้องหลังเทคนิค" tab when the page sits under it.
import { createRequire } from 'node:module';
import path from 'node:path';
const [front, base, bp, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(front, 'package.json'))('@playwright/test');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + '/', { waitUntil: 'networkidle' });
console.log(`home shows "TEST-101 dialog": ${(await page.textContent('body')).includes('TEST-101 dialog')}`);
for (const pg of ['sequence', 'screens', 'api', 'web', 'history', 'ready']) {
  await page.goto(`${base}/p/${bp}/overview`, { waitUntil: 'networkidle' });
  let via = 'overview';
  if (!(await page.locator(`a[href="/p/${bp}/${pg}"]`).count())) {
    await page.locator(`a[href="/p/${bp}/work-order"]`).first().click(); await page.waitForLoadState('networkidle'); via = 'เบื้องหลังเทคนิค';
  }
  const link = page.locator(`a[href="/p/${bp}/${pg}"]`).first();
  if (!(await link.count())) { console.log(`BAD ${pg}: no link from overview or work-order`); continue; }
  await link.click(); await page.waitForLoadState('networkidle');
  console.log(`${page.url().endsWith(`/${pg}`) ? 'OK ' : 'BAD'} ${pg} via ${via} → ${page.url()}`);
  await page.screenshot({ path: path.join(out, `nav2-${pg}.png`) });
}
await browser.close();
