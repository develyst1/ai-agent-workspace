// TASK-005 click-throughs + draft-badge count. usage: node task005.mjs <chrome-path>
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: process.argv[2], args: ['--no-sandbox'] })
const page = await (await browser.newContext({ viewport: { width: 375, height: 667 } })).newPage()
const base = 'http://localhost:5173/'
const open = async (hash) => { await page.goto(base + hash); await page.reload() }

await open('#/parent/line-overtime-request')
await page.getByRole('button', { name: 'ไม่อนุมัติ' }).click()
const link = page.getByRole('link', { name: /ดูหน้าจอทีวี/ })
console.log('decline link height px:', (await link.boundingBox()).height)
await link.click()
await page.waitForSelector('.tv')
console.log('TV text after decline link ->', await page.textContent('.tv .big'), '| url', page.url())

await open('#/parent/line-borrowed')
console.log('borrowed bubble ->', await page.textContent('.bubble'))
await page.getByRole('link', { name: /ไปที่เมนูโควต้า/ }).click()
await page.waitForSelector('[data-testid=buyback-amount]')
console.log('buy-back amount ->', await page.textContent('[data-testid=buyback-amount]'))
await page.getByRole('button', { name: /ซื้อคืน/ }).click()
console.log('buy-back status ->', await page.textContent('[data-testid=buyback-done]'))

await page.goto(base)
await page.waitForSelector('.index a')
const hrefs = await page.$$eval('.index a', (as) => as.map((a) => a.getAttribute('href')))
let total = 0
for (const h of hrefs) {
  await page.goto(base + h); await page.reload(); await page.waitForSelector('.tv, .phone')
  const n = await page.locator('.draft-badge').count()
  if (n) console.log(h, 'badges:', n)
  total += n
}
console.log(`screens: ${hrefs.length}; total .draft-badge: ${total}`)
await browser.close()
