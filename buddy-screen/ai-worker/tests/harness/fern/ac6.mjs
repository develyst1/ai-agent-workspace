// AC-6 by hand with real timing on ActivityInProgress. usage: node ac6.mjs <chrome-path>
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: process.argv[2], args: ['--no-sandbox'] })
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
const read = async () => ({ state: await page.getAttribute('[data-testid=state]', 'data-state'), counter: await page.textContent('[data-testid=counter]') })
const t0 = () => Date.now()

console.log('--- run 1: turn off "responding"')
await page.goto('http://localhost:5173/#/tv/activity-in-progress')
await page.waitForSelector('[data-testid=state]')
let start = t0()
await page.getByLabel(/น้องกำลังตอบสนอง/).uncheck()
for (const target of [5, 9, 11, 20, 29, 31, 36]) {
  await page.waitForTimeout(Math.max(0, start + target * 1000 - t0()))
  console.log(`t~${target}s`, JSON.stringify(await read()))
}

console.log('--- run 2: restart, turn off "in frame"')
await page.getByRole('button', { name: /เริ่มใหม่/ }).click()
await page.waitForTimeout(3200)
console.log('before leaving', JSON.stringify(await read()))
await page.getByLabel(/น้องอยู่หน้ากล้อง/).uncheck()
start = t0()
for (const target of [1, 3, 8, 19, 22]) {
  await page.waitForTimeout(Math.max(0, start + target * 1000 - t0()))
  console.log(`t~${target}s after leaving`, JSON.stringify(await read()))
}
await browser.close()
