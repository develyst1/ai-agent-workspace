// Counts .draft-badge elements over every screen listed on the index. usage: node badges.mjs <chrome-path>
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: process.argv[2], args: ['--no-sandbox'] })
const page = await (await browser.newContext({ viewport: { width: 375, height: 667 } })).newPage()
const base = 'http://localhost:5173/'
await page.goto(base)
await page.waitForSelector('.index a')
const hrefs = await page.$$eval('.index a', (as) => as.map((a) => a.getAttribute('href')))
let total = await page.locator('.draft-badge').count()
console.log(`index: ${total} badges`)
for (const h of hrefs) {
  await page.goto(base + h)
  await page.reload()
  await page.waitForSelector('.tv, .phone')
  const n = await page.locator('.draft-badge').count()
  total += n
  if (n) console.log(h, n)
}
console.log(`screens: ${hrefs.length}; total .draft-badge over index + all screens: ${total}`)
await browser.close()
