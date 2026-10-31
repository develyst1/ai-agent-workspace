// FE verification walk (TASK-002/003): every screen from the index, console errors, request origins, 375x667 overflow.
// usage: node walk.mjs <chrome-path> [tv|parent|all]
import { chromium } from 'playwright-core'

const chrome = process.argv[2]
const which = process.argv[3] ?? 'all'
const base = 'http://localhost:5173/'
const browser = await chromium.launch({ executablePath: chrome, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
const page = await ctx.newPage()
const errors = []
const origins = new Set()
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))
page.on('request', (r) => origins.add(new URL(r.url()).origin))

await page.goto(base)
await page.waitForSelector('.index a')
const links = await page.$$eval('.index a', (as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent })))
console.log(`index lists ${links.length} screens`)
for (const l of links) {
  if (which !== 'all' && !l.href.startsWith(`#/${which}/`)) continue
  await page.goto(base + l.href)
  await page.waitForSelector('.tv, .phone', { timeout: 3000 }).catch(() => {})
  const loaded = (await page.$('.tv, .phone')) !== null
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  const small = await page.$$eval('button, a, input', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 && e.tagName !== 'INPUT') }).map((e) => e.textContent?.trim().slice(0, 20)))
  console.log(`${l.href}\tloaded=${loaded ? 'yes' : 'NO'}\thorizontalOverflowPx=${over}\tbuttonsUnder44px=${JSON.stringify(small)}`)
}
console.log('console errors:', errors.length, errors)
console.log('request origins:', [...origins])
await browser.close()
