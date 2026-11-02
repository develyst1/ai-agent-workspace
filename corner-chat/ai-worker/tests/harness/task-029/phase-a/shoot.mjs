// Throwaway (TASK-029 phase A): walk the two new screens on their fakes at 360 x 800, assert, save screenshots next to this file.
// Needs the harness page on :5199 (see vite.config.mjs). usage: node shoot.mjs <playwright-core/index.mjs>
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const { chromium } = await import(pathToFileURL(process.argv[2]).href)
const here = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:5199/'
const ok = []
const check = (name, pass, detail = '') => { ok.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} ${detail}`) }

const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 })).newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
const notFound = []
page.on('response', (r) => { if (r.status() === 404) notFound.push(new URL(r.url()).pathname) })
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()) })
const shot = (f, full = true) => page.screenshot({ path: join(here, f), fullPage: full })
const id = (x) => page.getByTestId(x)
const open = async (screen, ready) => { await page.goto(`${BASE}?screen=${screen}`); await id(ready).waitFor() }

async function metrics(label) {
  const m = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button, input, select, textarea, a')].filter((e) => {
      const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0
    })
    return {
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      small: els.map((e) => ({ t: e.tagName + (e.dataset.testid ? `[${e.dataset.testid}]` : ''), h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 44),
    }
  })
  check(`${label}: no horizontal scroll at 360 px, every control ≥ 44 px`, m.sw <= m.cw && m.small.length === 0, JSON.stringify({ sw: m.sw, cw: m.cw, small: m.small }))
}

// --- /conditions
await open('conditions', 'conditions-screen')
await page.waitForTimeout(400)
await metrics('conditions')
await shot('a-01-conditions.png')

await id('conditions-add-value').fill('ใบแจ้งหนี้')
await id('conditions-add-action-never').click()
await id('conditions-add-submit').click()
await page.getByText('ใบแจ้งหนี้').first().waitFor()
check('add a keyword rule → listed', (await page.getByText('ใบแจ้งหนี้').count()) > 0)
await id('conditions-add-value').fill('ใบแจ้งหนี้')
await id('conditions-add-submit').click()
await id('conditions-add-error').waitFor()
check('same rule again → the generic error', (await id('conditions-add-error').innerText()) === 'เกิดข้อผิดพลาด ลองอีกครั้ง')
await shot('a-02-conditions-rule-exists.png')

await id('conditions-add-kind-group').click()
await id('conditions-add-group').waitFor()
await shot('a-03-conditions-group-picker.png')
await id('conditions-add-submit').click()
await page.waitForTimeout(300)
check('group rule listed with the group NAME', (await id('conditions-rules').innerText()).includes('ทีมทดสอบ'))

await id('conditions-bar').fill('80')
check('bar label follows the slider (80)', (await id('conditions-bar-label').innerText()) === 'แจ้งเมื่อตรงเงื่อนไขตั้งแต่ 80%')
await id('conditions-save').click()
await id('conditions-saved').waitFor()
await shot('a-04-conditions-saved.png')
await page.reload()
await id('conditions-screen').waitFor()
check('a fresh load of the same fake keeps nothing (in-memory) — bar is back to 70', (await id('conditions-bar-label').innerText()).includes('70'))

await open('conditions-prefill', 'conditions-screen')
check('prefilled sender rule: kind sender + the sender key', (await id('conditions-add-kind-sender').getAttribute('aria-checked')) === 'true' && (await id('conditions-add-value').inputValue()) === 'boss@example.test')
await shot('a-05-conditions-prefill.png')
await open('conditions-empty', 'conditions-rules-empty')
await shot('a-06-conditions-no-rules.png')

// --- /channels/zimbra
await open('zimbra', 'zimbra-screen')
await metrics('zimbra form')
await shot('a-07-zimbra-form.png')
await id('zimbra-email-input').fill('me@example.test')
await id('zimbra-password-input').fill('wrong-password')
await id('zimbra-connect').click()
await id('zimbra-error').waitFor()
check('wrong login → the REQ-002 text, password emptied', (await id('zimbra-error').innerText()) === 'เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง' && (await id('zimbra-password-input').inputValue()) === '')
await shot('a-08-zimbra-login-failed.png')
await id('zimbra-password-input').fill('fake-ok-password')
await id('zimbra-connect').click()
await id('zimbra-connected').waitFor()
check('good login → connected + email, no password on the page', (await id('zimbra-email').innerText()) === 'me@example.test' && !(await page.content()).includes('fake-ok-password'))
await metrics('zimbra connected')
await shot('a-09-zimbra-connected.png')
await id('zimbra-disconnect').click()
await id('zimbra-email-input').waitFor()
check('disconnect → the empty form again', (await id('zimbra-email-input').inputValue()) === '' && (await id('zimbra-password-input').inputValue()) === '')

const realNotFound = [...new Set(notFound)].filter((p) => p !== '/favicon.ico') // the harness page has no favicon
check('no console / page errors, no 404 except the harness page favicon', errors.length === 0 && realNotFound.length === 0, JSON.stringify({ errors: errors.slice(0, 3), notFound: [...new Set(notFound)] }))
await browser.close()
console.log(ok.every(Boolean) ? 'ALL PASS' : 'SOME FAILED')
process.exit(ok.every(Boolean) ? 0 : 1)
