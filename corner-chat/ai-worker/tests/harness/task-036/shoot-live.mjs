// Throwaway (TASK-036): the TEST-002 row-18 path LIVE at 360 x 800 — the app's own navigation, the REAL back end, the owner's Postgres
// server (database corner_chat_test_fern only), and Jason's mail STAND-IN (mail-stand-in/run.ts) in place of Zimbra.
//   1. stand-in #1 + back end #1 (my own port 8095); a user, a mailbox connected to the stand-in, an "always notify" sender rule;
//      a mail arrives in the stand-in INBOX and is taken in.
//   2. stand-in #1 is KILLED (SMTP is now a closed port) → in the app: open the mail → reply → the reply goes `failed`
//      → LEAVE the reply screen → the detail shows the failed reply with the retry button        [screenshot BEFORE]
//   3. SMTP restored: stand-in #2 (empty, its own --sent-dir) + back end restarted on its ports (the mailbox and the reply are in the DB)
//      → tap the retry button → กำลังส่ง → ส่งแล้ว                                                [screenshot AFTER]
//   4. the stand-in's --sent-dir holds exactly ONE message (the reply), and nothing reached stand-in #1.
// Secrets: DATABASE_URL arrives as an ENV var from `eval "$(node mkurl.mjs)"` and is only handed to the children's env — never printed or
// passed as an argument. The owner login is read from the back end's .env (never printed). LINE_LIVE is never set; LINE/FCM/AI values are fake.
// usage (from corner-chat-back, after `eval "$(node <scratchpad>/t36/mkurl.mjs)"`): node shoot-live.mjs <playwright-core/index.mjs> <workdir>
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync, openSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const { chromium } = await import(pathToFileURL(process.argv[2]).href)
const WORK = process.argv[3]
const here = dirname(fileURLToPath(import.meta.url))
const BACK = 'H:/corner-chat/corner-chat-back'
const APPDIR = 'H:/corner-chat/corner-chat-app'
const STAND = join(here, '..', 'mail-stand-in', 'run.ts')
const API = 'http://127.0.0.1:8095/api/v1'
const APP = 'http://localhost:5180'
if (!process.env.DATABASE_URL || !/\/corner_chat_test_fern(\?|$)/.test(process.env.DATABASE_URL)) throw new Error('DATABASE_URL must name corner_chat_test_fern')

const ok = []
const check = (name, pass, detail = '') => { ok.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const envFile = Object.fromEntries(readFileSync(join(BACK, '.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]))
if (!envFile.OWNER_EMAIL || !envFile.OWNER_PASSWORD) throw new Error("the back end's .env has no owner login")

rmSync(WORK, { recursive: true, force: true })
const dirs = { inbox: join(WORK, 'inbox'), inbox2: join(WORK, 'inbox2'), sent1: join(WORK, 'sent1'), sent2: join(WORK, 'sent2') }
for (const d of [WORK, ...Object.values(dirs)]) mkdirSync(d, { recursive: true })
const kids = []
const run = (cmd, args, { cwd, env, log }) => {
  const fd = openSync(join(WORK, log), 'a')
  const c = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', fd, fd], windowsHide: true })
  kids.push(c)
  return c
}
const stop = (c) => { try { c.kill() } catch {} }

const MAIL = { user: 'fern@test.local', password: `mb-${Date.now().toString(36)}-pw` }
async function startStand(n, sentDir) {
  const portsFile = join(WORK, `ports${n}.json`)
  rmSync(portsFile, { force: true })
  const c = run('bun', [STAND, '--dir', n === 1 ? dirs.inbox : dirs.inbox2, '--ports-file', portsFile, '--user', MAIL.user, '--password', MAIL.password, '--sent-dir', sentDir], { cwd: BACK, env: {}, log: `stand${n}.log` })
  for (let i = 0; i < 100 && !existsSync(portsFile); i++) await sleep(150)
  if (!existsSync(portsFile)) throw new Error(`stand-in ${n} did not start`)
  await sleep(200)
  return { c, ...JSON.parse(readFileSync(portsFile, 'utf8')) }
}
const beEnv = (s) => ({
  PORT: '8095', HOST: '127.0.0.1', ZIMBRA_IMAP_HOST: '127.0.0.1', ZIMBRA_IMAP_PORT: String(s.imapPort), ZIMBRA_SMTP_HOST: '127.0.0.1', ZIMBRA_SMTP_PORT: String(s.smtpPort),
  MAIL_POLL_SECONDS: '3', MAIL_APPEND_SENT: 'false', FILTER_PAUSED: 'false', LLM_GATEWAY_URL: 'http://127.0.0.1:1', LLM_GATEWAY_KEY: '',
  LINE_CHANNEL_SECRET: 'made-up-not-real', LINE_CHANNEL_ACCESS_TOKEN: 'made-up-not-real', LINE_API_BASE: 'http://127.0.0.1:1', LINE_LIVE: '', FCM_SERVICE_ACCOUNT_JSON: '',
})
async function startBack(s, n) {
  const c = run('bun', ['src/index.ts'], { cwd: BACK, env: beEnv(s), log: `back${n}.log` })
  for (let i = 0; i < 100; i++) { // any HTTP answer = up
    try { await fetch(`${API}/auth/login`, { method: 'POST' }); return c } catch { await sleep(200) }
  }
  throw new Error(`back end ${n} did not answer`)
}
const call = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(`${API}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

let vite, browser
try {
  // ---- 1. up, with SMTP reachable ----
  let stand = await startStand(1, dirs.sent1)
  let back = await startBack(stand, 1)
  vite = run('node', [join(APPDIR, 'node_modules/vite/bin/vite.js'), '--port', '5180', '--strictPort'], { cwd: APPDIR, env: { VITE_FAKE: 'false', VITE_PROXY_TARGET: 'http://127.0.0.1:8095' }, log: 'vite.log' })
  for (let i = 0; i < 100; i++) { try { if ((await fetch(APP)).ok) break } catch {} await sleep(200) }

  const owner = (await call('/auth/login', { method: 'POST', body: { email: envFile.OWNER_EMAIL, password: envFile.OWNER_PASSWORD } })).body.token
  if (!owner) throw new Error('owner login failed')
  const U = { name: 'ฝ่ายทดสอบ Fern (ทดสอบ)', email: `fern-t36-${Date.now().toString(36)}@corner.test`, password: `u-${Date.now().toString(36)}-long-pw` }
  const made = await call('/admin/users', { token: owner, method: 'POST', body: U })
  if (made.status !== 201) throw new Error(`creating the test user failed: ${made.status}`)
  const tok = (await call('/auth/login', { method: 'POST', body: { email: U.email, password: U.password } })).body.token
  const conn = await call('/channels/mail', { token: tok, method: 'PUT', body: { email: MAIL.user, password: MAIL.password } })
  check('the mailbox connects to the stand-in (IMAP + SMTP both verified)', conn.status === 200, `status ${conn.status}`)
  const rule = await call('/conditions/rules', { token: tok, method: 'POST', body: { kind: 'sender', value: 'customer@example.test', action: 'always' } })
  check('an "always notify" sender rule is saved', rule.status === 201, `status ${rule.status}`)
  writeFileSync(join(dirs.inbox, '001.eml'), ['From: Customer <customer@example.test>', `To: ${MAIL.user}`, 'Subject: row18 reply retry', 'Message-ID: <row18-1@example.test>', 'Date: Sun, 01 Nov 2026 10:00:00 +0700', 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', '', 'Please confirm the order. (TASK-036 live run, made-up mail)', ''].join('\r\n'))
  let msgId = null
  for (let i = 0; i < 60 && !msgId; i++) {
    const l = await call('/messages?tab=notified', { token: tok })
    msgId = (l.body.items ?? [])[0]?.id ?? null
    if (!msgId) await sleep(1000)
  }
  check('the mail is taken in and notified', !!msgId, msgId ? '' : 'no message after 60 s')
  if (!msgId) throw new Error('no message')

  // ---- 2. SMTP is a closed port: reply → failed → leave the reply screen → detail ----
  browser = await chromium.launch({ channel: 'chrome' })
  const page = await (await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 })).newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  const id = (x) => page.getByTestId(x)
  const shot = (f) => page.screenshot({ path: join(here, f), fullPage: true })
  await page.goto(`${APP}/signin`)
  await id('signin-email').fill(U.email)
  await id('signin-password').fill(U.password)
  await id('signin-submit').click()
  await id(`row-${msgId}`).waitFor({ timeout: 30000 })
  await id(`row-${msgId}`).click()
  await id('detail-open-reply').waitFor()

  stop(stand.c) // IMAP + SMTP gone: the back end's SMTP port is now closed
  await sleep(1500)
  await id('detail-open-reply').click()
  await id('reply-body').fill('Confirmed — shipping tomorrow. (TASK-036 row 18)')
  await id('reply-send').click()
  await page.getByText('ส่งไม่สำเร็จ ลองอีกครั้ง').first().waitFor({ timeout: 60000 })
  check('SMTP closed → the reply screen shows ส่งไม่สำเร็จ ลองอีกครั้ง (status failed)', true)

  await id('nav-back').click() // LEAVE the reply screen
  await id('detail-replies').waitFor()
  const retry = page.locator('[data-testid^="detail-reply-retry-"]')
  await retry.first().waitFor()
  const h = await retry.first().evaluate((e) => Math.round(e.getBoundingClientRect().height))
  check('on the detail the failed reply has the retry button, text ลองอีกครั้ง', (await retry.count()) === 1 && (await retry.first().innerText()).trim() === 'ลองอีกครั้ง')
  check('the retry button is at least 44 px high', h >= 44, `${h}px`)
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  check('no horizontal scroll at 360 px', m.sw <= m.cw, JSON.stringify(m))
  await shot('live-01-detail-failed-with-retry.png')
  check('nothing reached the first stand-in', readdirSync(dirs.sent1).length === 0)

  // ---- 3. SMTP restored (a new stand-in + the back end restarted on its ports), then tap ----
  stop(back)
  stand = await startStand(2, dirs.sent2)
  back = await startBack(stand, 2)
  await sleep(1500)
  check('the failed reply is still failed after the restart (nothing is retried on its own)', (await retry.count()) === 1 && readdirSync(dirs.sent2).length === 0)
  await retry.first().click()
  await page.waitForFunction(() => /กำลังส่ง/.test(document.querySelector('[data-testid^="reply-"]')?.textContent ?? ''), null, { timeout: 15000 }).catch(() => {})
  await page.waitForFunction(() => /ส่งแล้ว/.test(document.querySelector('[data-testid^="reply-"]')?.textContent ?? ''), null, { timeout: 60000 })
  await sleep(400)
  check('after the tap the row reads ส่งแล้ว and the retry button is gone', (await retry.count()) === 0)
  await shot('live-02-detail-sent-after-retry.png')

  // ---- 4. exactly once ----
  await sleep(9000) // three outbox/poll rounds: a duplicate would show by now
  const files = readdirSync(dirs.sent2).sort()
  check('the stand-in received the mail EXACTLY once', files.length === 1, `files: ${files.join(',')}`)
  if (files.length) {
    const raw = readFileSync(join(dirs.sent2, files[0]), 'latin1')
    check('and it is the reply (Re: subject, our body, to the customer)', /customer@example\.test/.test(raw) && /Subject: Re: row18 reply retry/i.test(raw) && /shipping tomorrow/.test(raw))
  }
  check('still nothing on the first stand-in', readdirSync(dirs.sent1).length === 0)
  const final = await call(`/messages/${msgId}`, { token: tok })
  const rs = (final.body.message ?? final.body).replies ?? []
  check('the server has ONE reply and it is sent', rs.length === 1 && rs[0].status === 'sent', rs.map((r) => r.status).join(','))
  check('no uncaught page errors', errors.length === 0, errors.slice(0, 2).join(' | '))
} finally {
  if (browser) await browser.close().catch(() => {})
  for (const c of kids) stop(c)
  await sleep(500)
}
console.log(ok.length && ok.every(Boolean) ? 'ALL PASS' : 'SOME FAILED')
process.exit(ok.length && ok.every(Boolean) ? 0 : 1)
