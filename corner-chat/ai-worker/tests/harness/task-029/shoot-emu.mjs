// Throwaway (TASK-029 REWORK item 2): AC-5 on the EMULATOR — airplane mode on / off in the real APK (native Capacitor Network plugin).
//   - every adb call names the emulator: `-s emulator-5554`. The owner's real phone (a second device in `adb devices`) is never addressed.
//   - back end: bun src/index.ts on :8094 (own throwaway database corner_chat_app_a, seeded by seed.sql); the APK reaches it at 10.0.2.2:8094.
//   - the app's WebView is driven over raw DevTools (adb forward + a WebSocket; Playwright cannot attach to a WebView), so the test ids
//     are used; screenshots are the whole emulator screen (adb screencap).
// The owner's login is read from the back end's own .env at run time; U1 / U2 are made up. LIVE_URL (env) is only for the seed + one extra message.
// usage: node shoot-emu.mjs <corner-chat-back/.env> <path to app-debug.apk>
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const env = Object.fromEntries(
  readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)
const APK = process.argv[3]
const LIVE_URL = process.env.LIVE_URL
if (!env.OWNER_EMAIL || !env.OWNER_PASSWORD || !LIVE_URL || !APK) throw new Error('need the back end .env, env LIVE_URL and the apk path')

const here = dirname(fileURLToPath(import.meta.url))
const ADB = 'H:/dev-tools/android-sdk/platform-tools/adb.exe'
const DEV = 'emulator-5554'
const PKG = 'com.develyst.cornerchat'
const API = 'http://127.0.0.1:8094/api/v1'
const ok = []
const check = (name, pass, detail = '') => { ok.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- adb (always the emulator) ----
const adb = (...args) => execFileSync(ADB, ['-s', DEV, ...args], { encoding: 'utf8', timeout: 120000 }).trim()
const screenshot = (file) => writeFileSync(join(here, file), execFileSync(ADB, ['-s', DEV, 'exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024, timeout: 60000 }))

// psql gets the database URL as an argument; Node puts the command line in a failed call's message: never let that out (F-018).
function psql(args) {
  try {
    return execFileSync('psql', [LIVE_URL, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (e) {
    const why = String(e.stderr ?? '').split(/\r?\n/).find((l) => l.trim()) ?? 'unknown error'
    throw new Error(`psql failed: ${why.replace(LIVE_URL, '[db url]')}`)
  }
}
const sql = (q) => psql(['-At', '-v', 'ON_ERROR_STOP=1', '-c', q])
/** SQL with Thai in it goes through a UTF-8 file: a Windows command-line argument is mangled by the console code page. */
const sqlFile = (text) => {
  const f = join(tmpdir(), `t29-${process.pid}.sql`)
  writeFileSync(f, text, 'utf8')
  try { return psql(['-q', '-v', 'ON_ERROR_STOP=1', '-f', f]) } finally { unlinkSync(f) }
}
const call = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(`${API}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

// ---- users + seed (repeatable) ----
const stamp = Date.now().toString(36)
const U1 = { name: 'ผู้ใช้หนึ่ง (ทดสอบ)', email: 'u1-t29@corner.test', password: `u1-${stamp}-long-pw` }
const U2 = { name: 'ผู้ใช้สอง (ทดสอบ)', email: 'u2-t29@corner.test', password: `u2-${stamp}-long-pw` }
sql(`delete from users where email in ('${U1.email}', '${U2.email}')`)
sql(`delete from line_groups where group_id like 'G-T29-%'`)
const owner = (await call('/auth/login', { method: 'POST', body: { email: env.OWNER_EMAIL, password: env.OWNER_PASSWORD } })).body.token
if (!owner) throw new Error('owner login against the real back end failed')
for (const u of [U1, U2]) {
  const r = await call('/admin/users', { token: owner, method: 'POST', body: u })
  if (r.status !== 201) throw new Error(`creating ${u.email} failed: ${r.status}`)
}
psql(['-q', '-v', 'ON_ERROR_STOP=1', '-f', join(here, 'seed.sql')])
const M = (n) => `bbbbbbbb-0000-4000-8000-00000000000${n}`

// ---- the emulator is up ----
adb('wait-for-device')
for (let i = 0; i < 90 && adb('shell', 'getprop', 'sys.boot_completed') !== '1'; i++) await sleep(2000)
check('emulator-5554 has finished booting', adb('shell', 'getprop', 'sys.boot_completed') === '1')
console.log('device:', adb('shell', 'getprop', 'ro.product.model'), '· API', adb('shell', 'getprop', 'ro.build.version.sdk'), '· wm size', adb('shell', 'wm', 'size').replace('Physical size: ', ''))
adb('shell', 'cmd', 'connectivity', 'airplane-mode', 'disable') // a known start
await sleep(1500)

// ---- install, clean start ----
adb('install', '-r', APK)
adb('shell', 'pm', 'clear', PKG) // no token, no saved pages
adb('shell', 'am', 'start', '-n', `${PKG}/${PKG}.MainActivity`)
await sleep(8000)

// ---- attach to the WebView over DevTools ----
let sock = ''
for (let i = 0; i < 30 && !sock; i++) {
  sock = (adb('shell', 'cat', '/proc/net/unix').match(/@?(webview_devtools_remote_\d+)/) ?? [])[1] ?? ''
  if (!sock) await sleep(1000)
}
check('the app’s WebView exposes DevTools (debug build)', sock !== '', sock)
execFileSync(ADB, ['-s', DEV, 'forward', 'tcp:9333', `localabstract:${sock}`])

let target
for (let i = 0; i < 30 && !target; i++) {
  try {
    target = (await (await fetch('http://127.0.0.1:9333/json')).json()).find((t) => t.type === 'page' && /^https?:\/\/localhost/.test(t.url))
  } catch { /* not ready */ }
  if (!target) await sleep(1000)
}
if (!target) throw new Error('no app page in the WebView')
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('DevTools socket failed')) })
let seq = 0
const pending = new Map()
ws.onmessage = (m) => {
  const d = JSON.parse(m.data)
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) }
}
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })) })
/** Runs JS inside the app's page and returns its value. */
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(`page error: ${r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text}`.slice(0, 300))
  return r.result?.result?.value
}
const q = (testId) => `document.querySelector('[data-testid="${testId}"]')`
const exists = (testId) => ev(`!!${q(testId)}`)
const textOf = (testId) => ev(`(${q(testId)}?.innerText ?? '').trim()`)
const click = (testId) => ev(`(() => { const e = ${q(testId)}; if (!e) throw new Error('no ${testId}'); e.click(); return true })()`)
const fill = (testId, value) => ev(`(() => {
  const e = ${q(testId)}; if (!e) throw new Error('no ${testId}')
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(value)})
  e.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)
async function until(exprBool, what, ms = 60000) {
  const end = Date.now() + ms
  while (Date.now() < end) { if (await ev(`!!(${exprBool})`)) return; await sleep(500) }
  throw new Error(`timed out waiting for: ${what}`)
}
const rowsShown = () => ev(`[...document.querySelectorAll('[data-testid^="row-"]')].map((e) => e.getAttribute('data-testid').slice(4))`)
const hasRow = (n) => `${q('row-' + M(n))}`

check('the page runs inside the native Capacitor shell (not a browser)', await ev(`!!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())`))

// ---- sign in as U1 on the emulator ----
await until(q('screen-signin'), 'the sign-in screen')
await sleep(500)
screenshot('emu-01-signin.png')
await fill('signin-email', U1.email)
await fill('signin-password', U1.password)
await click('signin-submit')
await until(q('screen-messages'), 'the messages screen')
await until(`document.querySelectorAll('[data-testid^="row-"]').length > 0`, 'the first list')
await sleep(800)
const first = await rowsShown()
check('U1 signed in on the emulator and sees its 3 notified messages (list from the real back end over 10.0.2.2)', JSON.stringify([...first].sort()) === JSON.stringify([M(1), M(2), M(3)].sort()), JSON.stringify(first))
screenshot('emu-02-list-online.png')

// both tabs loaded online -> both first pages are saved
await click('list-tab-held')
await until(hasRow(5), 'the held list')
await click('list-tab-notified')
await until(hasRow(1), 'the notified list')
await sleep(500)
check('banner absent while online', !(await exists('offline-banner')))

// ---- AIRPLANE MODE ON ----
adb('shell', 'cmd', 'connectivity', 'airplane-mode', 'enable')
await until(q('offline-banner'), 'the offline banner', 40000)
check('airplane mode on → the native Network plugin raises the banner ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด', (await textOf('offline-banner')) === 'ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด')
check('airplane mode really on at the OS', adb('shell', 'settings', 'get', 'global', 'airplane_mode_on') === '1')
await click('list-tab-held') // a view that now has to come from the saved page
await until(hasRow(5), 'the saved held list', 30000)
await sleep(800)
check('offline: the last held list is shown from the saved page, no error state', (await rowsShown()).includes(M(5)) && !(await exists('list-error')), JSON.stringify(await rowsShown()))
screenshot('emu-03-airplane-offline-list.png')
await click('list-tab-notified')
await until(hasRow(1), 'the saved notified list', 30000)

// a message arrives on the server while the phone is offline
sqlFile(`insert into messages (id, user_id, channel, external_id, sender_key, sender_name, group_id, group_name, text, recipient_kind, has_attachments, attachment_names, received_at, filter_state, outcome, notified_at)
     select '${M(7)}'::uuid, id, 'line', 'seed-7', 'U0007', 'คุณใหม่', 'G-T29-1', 'ทีมทดสอบ A', E'ข้อความใหม่ที่มาตอนมือถือออฟไลน์\\nต้องขึ้นหลังต่อเน็ตกลับ', 'to', false, '{}', now(), 'done', 'notified', now() from users where email = '${U1.email}';`)
sqlFile(`insert into decisions (message_id, decided_by, outcome, summary, score, reason, bar, layer1_provider, layer1_model, prompt_version, decided_at)
     values ('${M(7)}', 'ai', 'notified', 'ข้อความใหม่ตอนออฟไลน์', 90, 'มาตอนมือถือออฟไลน์ (ข้อมูลทดสอบ)', 70, 'deepseek', 'deepseek-flash', 'v1', now());`)
check('the new message is not on the phone yet (offline)', !(await rowsShown()).includes(M(7)))

// ---- AIRPLANE MODE OFF ----
adb('shell', 'cmd', 'connectivity', 'airplane-mode', 'disable')
await until(`!${q('offline-banner')}`, 'the banner to go', 90000)
await until(hasRow(7), 'the list to reload with the new message', 60000)
await sleep(800)
check('airplane mode off → the banner goes and the list reloads by itself (the new message appears)', !(await exists('offline-banner')) && (await rowsShown()).includes(M(7)), JSON.stringify(await rowsShown()))
check('airplane mode really off at the OS', adb('shell', 'settings', 'get', 'global', 'airplane_mode_on') === '0')
screenshot('emu-04-back-online-refreshed.png')

// ---- sign out on the device clears the saved pages ----
await click('menu-open')
await sleep(600)
await click('menu-signout')
await until(q('signout-confirm'), 'the sign-out dialog')
await click('signout-confirm')
await until(q('screen-signin'), 'the sign-in screen again', 30000)
const left = await ev(`(async () => { const { keys } = await window.Capacitor.Plugins.Preferences.keys(); return keys.filter((k) => k.startsWith('cc.cache.') || k === 'cc.token') })()`)
check('sign-out on the device cleared the token and every saved page', Array.isArray(left) && left.length === 0, JSON.stringify(left))
screenshot('emu-05-signed-out.png')

ws.close()
execFileSync(ADB, ['-s', DEV, 'forward', '--remove', 'tcp:9333'])
console.log(ok.every(Boolean) ? 'ALL PASS' : 'SOME FAILED')
process.exit(ok.every(Boolean) ? 0 : 1)
