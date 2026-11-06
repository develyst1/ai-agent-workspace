// Throwaway (TASK-029 phase B): the live Definition of Done, in a browser at 360 x 800, against the REAL back end.
//   back end: bun src/index.ts on :8094, its own throwaway database corner_chat_app_a (:5433), seeded by seed.sql;
//   app:      `VITE_FAKE=false VITE_PROXY_TARGET=http://127.0.0.1:8094 vite --port 5180` (the app's browser run mode).
// The owner's login is read from the back end's own .env at run time (never printed); U1 / U2 are made up and their passwords
// are generated here. The database URL comes in as env LIVE_URL (for the seed and the `corrections` row).
// usage: node shoot-live.mjs <playwright-core/index.mjs> <corner-chat-back/.env>
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const { chromium } = await import(pathToFileURL(process.argv[2]).href)
const env = Object.fromEntries(
  readFileSync(process.argv[3], 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)
const LIVE_URL = process.env.LIVE_URL
if (!env.OWNER_EMAIL || !env.OWNER_PASSWORD || !LIVE_URL) throw new Error("need the back end's .env owner login and env LIVE_URL")

const here = dirname(fileURLToPath(import.meta.url))
const API = 'http://127.0.0.1:8094/api/v1'
const APP = 'http://localhost:5180'
const ok = []
const check = (name, pass, detail = '') => { ok.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`) }
// psql gets the database URL as an argument, and Node puts the whole command line in a failed call's message: never let that out.
function psql(args) {
  try {
    return execFileSync('psql', [LIVE_URL, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (e) {
    const why = String(e.stderr ?? '').split(/\r?\n/).find((l) => l.trim()) ?? 'unknown error'
    throw new Error(`psql failed: ${why.replace(LIVE_URL, '[db url]')}`)
  }
}
const sql = (q) => psql(['-At', '-v', 'ON_ERROR_STOP=1', '-c', q])

const call = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(`${API}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

// ---- users + seed ----
const stamp = Date.now().toString(36)
const U1 = { name: 'ผู้ใช้หนึ่ง (ทดสอบ)', email: 'u1-t29@corner.test', password: `u1-${stamp}-long-pw` }
const U2 = { name: 'ผู้ใช้สอง (ทดสอบ)', email: 'u2-t29@corner.test', password: `u2-${stamp}-long-pw` }
// repeatable: start from no U1 / U2 (their messages, rules, links and sessions go with them: ON DELETE CASCADE) and none of their groups
sql(`delete from users where email in ('${U1.email}', '${U2.email}')`)
sql(`delete from line_groups where group_id like 'G-T29-%'`)
const owner = (await call('/auth/login', { method: 'POST', body: { email: env.OWNER_EMAIL, password: env.OWNER_PASSWORD } })).body.token
if (!owner) throw new Error('owner login against the real back end failed')
for (const u of [U1, U2]) {
  const r = await call('/admin/users', { token: owner, method: 'POST', body: u })
  if (r.status !== 201) throw new Error(`creating ${u.email} failed: ${r.status} ${JSON.stringify(r.body.error)}`)
}
psql(['-q', '-v', 'ON_ERROR_STOP=1', '-f', join(here, 'seed.sql')])
const loginApi = async (u) => (await call('/auth/login', { method: 'POST', body: { email: u.email, password: u.password } })).body.token
let t1 = await loginApi(U1)
const t2 = await loginApi(U2)

const M = (n, who = 'b') => `${who.repeat(8)}-0000-4000-8000-00000000000${n}` // seeded message ids
const row = (id) => `row-${id}`

// ---- the browser ----
const browser = await chromium.launch({ channel: 'chrome' })
const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
const shot = (f) => page.screenshot({ path: join(here, f) })
const id = (x) => page.getByTestId(x)
const text = async (x) => (await id(x).innerText()).trim()
const tokenInApp = () => page.evaluate(() => localStorage.getItem('CapacitorStorage.cc.token'))
const cachedKeys = () => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('CapacitorStorage.cc.cache.')))
const rowsShown = () => page.locator('[data-testid^="row-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid').slice(4)))

async function metrics(label) {
  const m = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button, input, select, textarea, a, [role="tab"]')].filter((e) => {
      const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'
    })
    return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      small: els.map((e) => ({ t: e.tagName + (e.dataset.testid ? `[${e.dataset.testid}]` : '') + (e.className && typeof e.className === 'string' ? `.${e.className.split(' ')[0]}` : ''), h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 44) }
  })
  check(`${label}: no horizontal scroll at 360 px`, m.sw <= m.cw, `sw=${m.sw} cw=${m.cw}`)
  return m.small
}

async function signIn(u) {
  await page.goto(`${APP}/signin`)
  await id('signin-email').fill(u.email)
  await id('signin-password').fill(u.password)
  await id('signin-submit').click()
  await id('tab-messages').waitFor()
}
async function openTab(name) {
  await id(`tab-${name}`).click()
  await id(`screen-${name}`).waitFor()
  await page.waitForTimeout(500)
}
async function signOutUi() {
  await id('menu-open').click()
  await id('menu-signout').click()
  await id('signout-confirm').click()
  await id('screen-signin').waitFor()
}

const walk = [] // route -> how reached -> screenshot (AC-4)
const small = []
const step = async (route, how, file) => {
  await page.waitForTimeout(450)
  small.push(...(await metrics(route)).map((s) => ({ route, ...s })))
  await shot(file)
  walk.push({ route, how, file })
}

// ============ U1: the AC-4 walk, reached only through the app's own navigation ============
await page.goto(APP)
await id('screen-signin').waitFor()
await step('/signin', 'open the app signed out (the guard redirects `/`)', 'walk-01-signin.png')
await id('signin-email').fill(U1.email)
await id('signin-password').fill('wrong-password-1')
await id('signin-submit').click()
await id('signin-error').waitFor()
await id('signin-password').fill(U1.password)
await id('signin-submit').click()
await id('screen-messages').waitFor()
check('U1 signs in; the token is kept (Capacitor Preferences → localStorage in a browser)', (await tokenInApp()) !== null)
await page.waitForFunction(() => document.querySelectorAll('[data-testid^="row-"]').length > 0)
await step('/messages (แจ้งแล้ว)', 'sign in → the first tab', 'walk-02-messages-notified.png')
check('U1 sees exactly its 3 notified messages', JSON.stringify((await rowsShown()).sort()) === JSON.stringify([M(1), M(2), M(3)].sort()), JSON.stringify(await rowsShown()))

await id('list-tab-held').click()
await page.waitForFunction((x) => document.querySelector(`[data-testid="row-${x}"]`), M(4))
await page.waitForTimeout(400)
await shot('walk-03-messages-held.png')
check('U1 sees exactly its 3 held messages', JSON.stringify((await rowsShown()).sort()) === JSON.stringify([M(4), M(5), M(6)].sort()), JSON.stringify(await rowsShown()))

// AC-3: a held message with its reason; correct it to แจ้ง
await id(row(M(4))).click()
await id('detail-why').waitFor()
await step('/messages/:id', 'tap a row in the list', 'walk-04-detail-held.png')
const why = await text('detail-why')
check('AC-3: the held message shows ทำไมไม่แจ้ง and its reason', why.includes('ทำไมไม่แจ้ง') && why.includes('เป็นการพูดคุยทั่วไปในกลุ่ม ไม่ได้ถึงตัวคุณ'), JSON.stringify(why))
check('D40: an uncorrected message does not say คุณย้ายข้อความนี้มาเอง', (await id('detail-moved-by-you').count()) === 0)
await id('detail-correct').click()
await id('detail-moved-by-you').waitFor()
check('D40: after correcting, the line คุณย้ายข้อความนี้มาเอง is under the why card', (await text('detail-moved-by-you')) === 'คุณย้ายข้อความนี้มาเอง')
await page.waitForTimeout(300)
await shot('live-ac3-detail-corrected.png')
const corr = sql(`select outcome from corrections where message_id = '${M(4)}'`)
check('AC-3: the `corrections` row says notified', corr === 'notified', `corrections.outcome=${corr}`)
const a3 = (await call(`/messages/${M(4)}`, { token: t1 })).body.message
check('AC-3: GET /messages/:id returns outcome notified, decidedBy user and the correction', a3.outcome === 'notified' && a3.decidedBy === 'user' && a3.correction?.outcome === 'notified', JSON.stringify({ outcome: a3.outcome, decidedBy: a3.decidedBy, correction: a3.correction }))
await id('nav-back').click()
await id('screen-messages').waitFor()
await page.waitForFunction(() => document.querySelectorAll('[data-testid^="row-"]').length > 0)
check('AC-3: the message left ไม่ได้แจ้ง', !(await rowsShown()).includes(M(4)))
await id('list-tab-notified').click()
await page.waitForFunction((x) => document.querySelector(`[data-testid="row-${x}"]`), M(4))
check('AC-3: and is now in แจ้งแล้ว', (await rowsShown()).includes(M(4)))
await shot('live-ac3-notified-after.png')

// reply screen (mail message), real server: the mailbox is not connected, so the real answer is 409 MAIL_NOT_CONNECTED
await id(row(M(1))).click()
await id('detail-open-reply').waitFor()
await id('detail-open-reply').click()
await id('screen-reply').waitFor()
await step('/messages/:id/reply', 'detail → ตอบกลับ (mail messages only)', 'walk-05-reply.png')
await id('reply-body').fill('รับทราบครับ (ข้อความทดสอบ)')
await id('reply-send').click()
await id('reply-error').waitFor()
check('reply: a mailbox that is not connected → the generic error (real 409 MAIL_NOT_CONNECTED), nothing queued', (await text('reply-error')) === 'เกิดข้อผิดพลาด ลองอีกครั้ง' && sql(`select count(*) from mail_outbox`) === '0')
await shot('live-reply-not-connected.png')
await id('nav-back').click()
await id('detail-add-rule').waitFor()

// the detail menu → add-rule on /conditions, prefilled; here a mail sender
await id('detail-add-rule').click()
await id('conditions-screen').waitFor()
await step('/conditions', 'detail → เพิ่มกฎจากผู้ส่งนี้ (prefilled sender rule)', 'walk-06-conditions-prefilled.png')
check('the prefilled rule is a sender rule with the sender key', (await id('conditions-add-kind-sender').getAttribute('aria-checked')) === 'true' && (await id('conditions-add-value').inputValue()) === 'sales@vendor.test')
await id('conditions-add-submit').click()
await page.getByText('sales@vendor.test').first().waitFor()

// conditions: bar → 80, sentences, rules, the delete confirm
await id('conditions-bar').fill('80')
await id('conditions-sentences').fill('แจ้งเฉพาะเรื่องงานที่ต้องตอบ (ทดสอบ)')
await id('conditions-save').click()
await id('conditions-saved').waitFor()
const cond = (await call('/conditions', { token: t1 })).body
check('conditions: bar → 80 → GET /conditions shows 80', cond.bar === 80 && cond.sentences === 'แจ้งเฉพาะเรื่องงานที่ต้องตอบ (ทดสอบ)', JSON.stringify({ bar: cond.bar, sentences: cond.sentences }))
console.log('GET /conditions →', JSON.stringify({ bar: cond.bar, sentences: cond.sentences, rules: cond.rules.map((r) => ({ kind: r.kind, value: r.value, action: r.action })) }))
await id('conditions-add-kind-keyword').click()
await id('conditions-add-value').fill('โปรโมชั่น')
await id('conditions-add-action-never').click()
await id('conditions-add-submit').click()
await page.getByText('โปรโมชั่น').first().waitFor()
await id('conditions-add-value').fill('โปรโมชั่น')
await id('conditions-add-submit').click()
await id('conditions-add-error').waitFor()
check('conditions: the same rule again → the generic error (real 409 RULE_EXISTS)', (await text('conditions-add-error')) === 'เกิดข้อผิดพลาด ลองอีกครั้ง')
const ruleCountBefore = (await call('/conditions', { token: t1 })).body.rules.length
const kw = (await call('/conditions', { token: t1 })).body.rules.find((r) => r.value === 'โปรโมชั่น')
await id(`conditions-rule-delete-${kw.id}`).click()
await id('conditions-delete-dialog').waitFor()
await shot('live-delete-confirm.png')
check('D39: the dialog asks ลบกฎนี้ใช่ไหม and nothing is deleted yet', (await page.getByText('ลบกฎนี้ใช่ไหม').count()) > 0 && (await call('/conditions', { token: t1 })).body.rules.length === ruleCountBefore)
await id('conditions-delete-cancel').click()
await page.waitForTimeout(600)
check('D39: ยกเลิก keeps the rule', (await call('/conditions', { token: t1 })).body.rules.length === ruleCountBefore)
await id(`conditions-rule-delete-${kw.id}`).click()
await id('conditions-delete-confirm').click()
await page.waitForFunction((x) => !document.querySelector(`[data-testid="conditions-rule-${x}"]`), kw.id)
check('D39: ลบ deletes it (real DELETE → 204)', (await call('/conditions', { token: t1 })).body.rules.length === ruleCountBefore - 1)
await page.reload()
await id('conditions-screen').waitFor()
await page.waitForTimeout(400)
await shot('live-u1-tab-conditions.png')

// the LINE message's sender key is a mixed-case userId: the rule keeps it exactly
await openTab('messages')
await page.waitForFunction(() => document.querySelectorAll('[data-testid^="row-"]').length > 0)
await id(row(M(2))).click()
await id('detail-add-rule').click()
await id('conditions-screen').waitFor()
check('a LINE sender key (mixed-case userId) is carried as it is', (await id('conditions-add-value').inputValue()) === 'U0001abCDef')
await id('conditions-add-submit').click()
await page.getByText('U0001abCDef').first().waitFor()
const lineRule = (await call('/conditions', { token: t1 })).body.rules.find((r) => r.kind === 'sender' && r.value.startsWith('U0001'))
check('and the server stored it exactly (not lower-cased)', lineRule?.value === 'U0001abCDef', lineRule?.value)

// channels
await openTab('channels')
await id('channels-state-line').waitFor()
await step('/channels', 'the third tab', 'walk-07-channels.png')
check('U1 channels: LINE shows เชื่อมแล้ว, Zimbra shows no state', (await id('channels-state-line').count()) === 1 && (await id('channels-state-zimbra').count()) === 0)
await id('channels-open-zimbra').click()
await id('zimbra-screen').waitFor()
await step('/channels/zimbra', 'channels → อีเมล Zimbra', 'walk-08-zimbra.png')
check('zimbra: an empty form, password field is type=password and not pre-filled', (await id('zimbra-password-input').getAttribute('type')) === 'password' && (await id('zimbra-password-input').inputValue()) === '' && (await id('zimbra-email-input').inputValue()) === '')
await id('nav-back').click()
await id('screen-channels').waitFor()
await id('channels-open-line').click()
await id('screen-line').waitFor()
await step('/channels/line', 'channels → LINE', 'walk-09-line.png')
await id('line-open-names').click()
await id('screen-line-names').waitFor()
await step('/channels/line/names', 'LINE → names', 'walk-10-line-names.png')
await id('nav-back').click()
await id('line-open-groups').click()
await id('screen-line-groups').waitFor()
await step('/channels/line/groups', 'LINE → groups', 'walk-11-line-groups.png')
check('U1 sees its own LINE group on the groups screen', (await page.getByText('ทีมทดสอบ A').count()) > 0 && (await page.getByText('กลุ่มของผู้ใช้สอง').count()) === 0)
// two controls are in code this TASK must not edit (sign-in: Fanta's TASK-027 · LINE: Team B): they are reported, not fixed
const notMine = (s) => /signin-submit|line-unlink/.test(s.t)
check('AC-4: every control of every route in my files is ≥ 44 px tall', small.filter((s) => !notMine(s)).length === 0, JSON.stringify(small.filter((s) => !notMine(s)).slice(0, 6)))
console.log('NOTE  to report (not my files, 40 px < 44 px):', JSON.stringify(small.filter(notMine).map((s) => `${s.route} ${s.t} ${s.h}px`)))

// AC-6 screenshots, U1: the three tabs
await page.goto(`${APP}/messages`)
await page.waitForFunction(() => document.querySelectorAll('[data-testid^="row-"]').length > 0)
await page.waitForTimeout(400)
await shot('live-u1-tab-messages.png')
await openTab('channels')
await id('channels-state-line').waitFor()
await shot('live-u1-tab-channels.png')

// ============ offline (AC-5), browser equivalent: the network is cut, then restored ============
await openTab('messages')
await page.waitForFunction(() => document.querySelectorAll('[data-testid^="row-"]').length > 0)
await id('list-tab-held').click()
await page.waitForFunction((x) => document.querySelector(`[data-testid="row-${x}"]`), M(5))
await id('list-tab-notified').click()
await page.waitForFunction((x) => document.querySelector(`[data-testid="row-${x}"]`), M(1))
check('both tabs were loaded online, so their first pages are saved', (await cachedKeys()).length >= 2, JSON.stringify(await cachedKeys()))
await ctx.setOffline(true)
await id('list-tab-held').click()
await id('offline-banner').waitFor()
await page.waitForFunction((x) => document.querySelector(`[data-testid="row-${x}"]`), M(5))
check('offline: the banner ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด and the last held list', (await text('offline-banner')) === 'ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด' && (await rowsShown()).includes(M(5)))
await page.waitForTimeout(300)
await shot('live-ac5-offline-list.png')
await ctx.setOffline(false)
await page.waitForFunction(() => !document.querySelector('[data-testid="offline-banner"]'))
await page.waitForTimeout(500)
check('back online: the banner goes and the list reloads', (await id('offline-banner').count()) === 0 && (await rowsShown()).includes(M(5)))
await shot('live-ac5-back-online.png')

// ============ sign-out ============
const oldToken = await tokenInApp() // the BROWSER's session (not the API login above): sign-out must end this one
check('before sign-out the browser’s own session works', (await call('/conditions', { token: oldToken })).status === 200)
await openTab('conditions')
await signOutUi()
check('sign-out: the token and the saved lists are gone from the app', (await tokenInApp()) === null && (await cachedKeys()).length === 0, `token=${await tokenInApp()} cache=${JSON.stringify(await cachedKeys())}`)
check('sign-out: the server session is gone too (the old token → 401; POST /auth/logout ran)', (await call('/conditions', { token: oldToken })).status === 401)
await shot('live-signout.png')
await page.goto(`${APP}/messages`)
await id('screen-signin').waitFor()
check('signed out: opening /messages goes to /signin', true)

// ============ U2: AC-6 ============
await signIn(U2)
await page.waitForFunction(() => document.querySelectorAll('[data-testid^="row-"]').length > 0)
await page.waitForTimeout(400)
const u2Notified = await rowsShown()
await shot('live-u2-tab-messages.png')
await id('list-tab-held').click()
await page.waitForFunction((x) => document.querySelector(`[data-testid="row-${x}"]`), M(2, 'c'))
const u2Held = await rowsShown()
await shot('live-u2-tab-messages-held.png')
check('AC-6: U2 sees only its own messages (1 notified, 1 held), none of U1’s', JSON.stringify(u2Notified) === JSON.stringify([M(1, 'c')]) && JSON.stringify(u2Held) === JSON.stringify([M(2, 'c')]), JSON.stringify({ u2Notified, u2Held }))
check('AC-6: nothing of U1’s text is on the page', !(await page.content()).includes('ใบเสนอราคา') && !(await page.content()).includes('ทีมทดสอบ A'))
await openTab('conditions')
await id('conditions-screen').waitFor()
await page.waitForTimeout(400)
await shot('live-u2-tab-conditions.png')
check('AC-6: U2 has no rules, the default bar 70 and no sentences', (await id('conditions-rules-empty').count()) === 1 && (await text('conditions-bar-label')).includes('70%') && (await id('conditions-sentences').inputValue()) === '')
await id('conditions-add-kind-group').click()
const groupOptions = await id('conditions-add-group').locator('option').allInnerTexts()
check('AC-6: U2’s group picker lists only U2’s group', JSON.stringify(groupOptions) === JSON.stringify(['กลุ่มของผู้ใช้สอง']), JSON.stringify(groupOptions))
await openTab('channels')
await id('screen-channels').waitFor()
await page.waitForTimeout(500)
await shot('live-u2-tab-channels.png')
check('AC-6: U2 has no LINE link and no mailbox', (await id('channels-state-line').count()) === 0 && (await id('channels-state-zimbra').count()) === 0)
// the server's 404 rule (Team A's) with U2's token and U1's ids
const leak1 = await call(`/messages/${M(1)}`, { token: t2 })
const leak2 = await call(`/messages/${M(4)}/correction`, { token: t2, method: 'POST', body: { outcome: 'held' } })
check('AC-6 (server): U2 asking for U1’s message / correcting it → 404 NOT_FOUND', leak1.status === 404 && leak1.body.error?.code === 'NOT_FOUND' && leak2.status === 404, `${leak1.status}/${leak2.status}`)
await signOutUi()

check('no uncaught page errors', errors.length === 0, errors.slice(0, 2).join(' | '))
console.log('\nAC-4 WALK (route → how reached → screenshot):')
for (const w of walk) console.log(`| ${w.route} | ${w.how} | ${w.file} |`)
await browser.close()
console.log(ok.every(Boolean) ? 'ALL PASS' : 'SOME FAILED')
process.exit(ok.every(Boolean) ? 0 : 1)
