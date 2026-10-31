// AC-8 by hand: decline -> ended; Sunday used up -> only paid extension; TV QuotaZero loads. usage: node ac8.mjs <chrome-path>
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: process.argv[2], args: ['--no-sandbox'] })
const page = await (await browser.newContext({ viewport: { width: 375, height: 667 } })).newPage()
const base = 'http://localhost:5173/'
const open = async (hash) => { await page.goto(base + hash); await page.reload() } // hash-only goto keeps component state

await open('#/parent/line-overtime-request')
await page.getByRole('button', { name: 'ไม่อนุมัติ' }).click()
console.log('decline ->', await page.textContent('[data-testid=result]'))
await open('#/parent/line-overtime-request')
await page.getByRole('button', { name: 'อนุมัติ', exact: true }).click()
console.log('approve ->', await page.textContent('[data-testid=result]'))

await open('#/parent/liff-quota-settings')
console.log('quota line ->', await page.textContent('.phone-body > p'))
await page.getByRole('button', { name: /ดูกรณีวันอาทิตย์ใช้หมด/ }).click()
console.log('sunday used up ->', await page.textContent('[data-testid=sunday-used-up]'))
console.log('buttons now:', await page.$$eval('.phone-body button', (bs) => bs.map((b) => b.textContent)))

await open('#/tv/quota-zero')
console.log('TV quota zero ->', await page.textContent('.tv .big'))
await browser.close()
