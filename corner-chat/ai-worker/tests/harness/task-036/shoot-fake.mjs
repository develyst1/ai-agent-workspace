// Throwaway (TASK-036): the DEF-1 path through the app's own navigation at 360 x 800, on the app's FAKE repos (no server, no database):
//   reply (a body containing FAIL fails once) → the reply screen shows ส่งไม่สำเร็จ → LEAVE it → the detail → the retry button → tap → กำลังส่ง → ส่งแล้ว.
// This is NOT the TEST-002 row-18 live run (that needs QA's back end + stand-in SMTP on the owner's server): see TASK-036 Notes.
// Needs `npx vite --port 5180` running in corner-chat-app (default VITE_FAKE=true). usage: node shoot-fake.mjs <playwright-core/index.mjs>
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const { chromium } = await import(pathToFileURL(process.argv[2]).href)
const here = dirname(fileURLToPath(import.meta.url))
const APP = 'http://localhost:5180'
const ok = []
const check = (name, pass, detail = '') => { ok.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`) }

const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 })).newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
const id = (x) => page.getByTestId(x)
const shot = (f) => page.screenshot({ path: join(here, f), fullPage: true })

await page.goto(`${APP}/messages`)
await id('row-m02').waitFor() // a mail message
await id('row-m02').click()
await id('detail-open-reply').click()
await id('reply-body').fill('FAIL ลองส่งครั้งแรก')
await id('reply-send').click()
await page.getByText('ส่งไม่สำเร็จ ลองอีกครั้ง').first().waitFor({ timeout: 30000 }) // the reply screen polls every 3 s
check('the reply screen shows ส่งไม่สำเร็จ ลองอีกครั้ง (the fake failed it once)', true)

await id('nav-back').click() // LEAVE the reply screen
await id('detail-replies').waitFor()
const retry = page.locator('[data-testid^="detail-reply-retry-"]')
await retry.first().waitFor()
const h = await retry.first().evaluate((e) => Math.round(e.getBoundingClientRect().height))
check('on the detail, the failed reply has a retry button with the approved text ลองอีกครั้ง', (await retry.count()) === 1 && (await retry.first().innerText()).trim() === 'ลองอีกครั้ง')
check('the retry button is at least 44 px high', h >= 44, `${h}px`)
const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
check('no horizontal scroll at 360 px', m.sw <= m.cw, JSON.stringify(m))
await shot('fake-01-detail-failed-with-retry.png')

const replyLi = page.locator('[data-testid^="reply-rp"]').first()
await retry.first().click()
await page.waitForFunction(() => /กำลังส่ง/.test(document.querySelector('[data-testid^="reply-rp"]')?.textContent ?? ''), null, { timeout: 15000 })
check('after the tap the row reads กำลังส่ง', true)
await page.waitForFunction(() => /ส่งแล้ว/.test(document.querySelector('[data-testid^="reply-rp"]')?.textContent ?? ''), null, { timeout: 30000 })
await page.waitForTimeout(300)
check('then ส่งแล้ว (the detail is re-read every 3 s until sent) and the button is gone', (await retry.count()) === 0 && /ส่งแล้ว/.test(await replyLi.innerText()))
await shot('fake-02-detail-sent-after-retry.png')

check('no uncaught page errors', errors.length === 0, errors.slice(0, 2).join(' | '))
await browser.close()
console.log(ok.every(Boolean) ? 'ALL PASS' : 'SOME FAILED')
process.exit(ok.every(Boolean) ? 0 : 1)
