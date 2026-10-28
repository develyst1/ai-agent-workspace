// TASK-006: TASK-005 click paths still work + .draft-badge count over index, all screens and both clicked states.
// usage: node task006.mjs <chrome-path>
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: process.argv[2], args: ['--no-sandbox'] })
const page = await (await browser.newContext({ viewport: { width: 375, height: 667 } })).newPage()
const base = 'http://localhost:5173/'
const open = async (hash) => { await page.goto(base + hash); await page.reload() }
const badges = () => page.locator('.draft-badge').count()
let total = 0

await page.goto(base)
await page.waitForSelector('.index a')
total += await badges()
console.log('index badges:', total)
const hrefs = await page.$$eval('.index a', (as) => as.map((a) => a.getAttribute('href')))
for (const h of hrefs) {
  await open(h); await page.waitForSelector('.tv, .phone')
  const n = await badges(); total += n
  if (n) console.log(h, 'badges:', n)
}
console.log(`${hrefs.length} screens loaded; badges so far: ${total}`)

await open('#/parent/line-overtime-request')
await page.getByRole('button', { name: 'ไม่อนุมัติ' }).click()
total += await badges()
await page.getByRole('link', { name: /ดูหน้าจอทีวี/ }).click()
await page.waitForSelector('.tv')
console.log('decline -> TV text:', await page.textContent('.tv .big'))

await open('#/parent/line-borrowed')
await page.getByRole('link', { name: /ไปที่เมนูโควต้า/ }).click()
await page.waitForSelector('[data-testid=buyback-amount]')
console.log('buy-back info:', await page.textContent('.phone-body .muted'))
console.log('buy-back amount:', await page.textContent('[data-testid=buyback-amount]'))
await page.getByRole('button', { name: /ซื้อคืน/ }).click()
console.log('buy-back after press:', await page.textContent('[data-testid=buyback-done]'))
total += await badges()
console.log('TOTAL .draft-badge (index + all screens + both clicked states):', total)
await browser.close()
