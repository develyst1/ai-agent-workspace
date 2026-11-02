// Throwaway: the LIVE check of TASK-028 against the real local back end.
// Signs in through /signin, opens /channels/line, writes the open code to <outDir>/live-code.txt, then waits
// until the screen turns "เชื่อม LINE แล้ว" (someone sends the code through send-event.ts). A code lives 10 min:
// when the countdown hits 00:00 the script taps `ขอรหัสใหม่` and writes the new code to the same file.
// Usage: node live.mjs <baseUrl> <outDir> <email> <password> [maxMinutes]
// Chrome must already run with --remote-debugging-port=9333.
import { writeFileSync, mkdirSync } from 'node:fs'

const [base, out, email, password, maxMin = '25'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })

const http = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json())
const ws = new WebSocket(http.webSocketDebuggerUrl)
let id = 0
const pend = new Map()
const send = (method, params = {}, sessionId) =>
  new Promise((res) => {
    const i = ++id
    pend.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params, sessionId }))
  })
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pend.has(m.id)) {
    pend.get(m.id)(m.result)
    pend.delete(m.id)
  }
}
await new Promise((r) => (ws.onopen = r))
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true }, sessionId)

const ev = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)).result.value
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const text = (t) => ev(`document.querySelector('[data-testid="${t}"]')?.innerText ?? null`)
const click = (t) => ev(`document.querySelector('[data-testid="${t}"]').click()`)
const fill = (t, v) =>
  ev(`(() => { const el = document.querySelector('[data-testid="${t}"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(v)});
    el.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)
async function shot(name) {
  const h = await ev('document.documentElement.scrollHeight')
  const s = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 360, height: Math.max(800, h), scale: 1 } },
    sessionId,
  )
  writeFileSync(`${out}/${name}.png`, Buffer.from(s.data, 'base64'))
}
const stamp = () => new Date().toISOString().slice(11, 19)

await send('Page.navigate', { url: base + '/signin' }, sessionId)
await wait(2000)
await fill('signin-email', email)
await fill('signin-password', password)
await click('signin-submit')
await wait(2500)
console.log(stamp(), 'signed in -> path', await ev('location.pathname'))

// into the app and onto the LINE screen through its own navigation (Channels tab -> the LINE row)
await click('tab-channels')
await wait(1500)
console.log(stamp(), 'channels: rows =', await ev(`[...document.querySelectorAll('[data-testid^=channels-open-]')].map(e => e.innerText.replace(/\\n+/g, ' | '))`))
await shot('live-channels')
await click('channels-open-line')
await wait(2500)

let lastCode = null
const deadline = Date.now() + Number(maxMin) * 60_000
while (Date.now() < deadline) {
  if (await text('line-linked')) {
    console.log(stamp(), 'LINKED:', await text('line-linked'), '| name:', await text('line-display-name'))
    await shot('live-linked')
    const chan = await ev(`location.pathname`)
    console.log(stamp(), 'path', chan, '| links:', await ev(`[...document.querySelectorAll('[data-testid^=line-open-]')].map(e => e.innerText)`))
    ws.close()
    process.exit(0)
  }
  const code = await text('line-code')
  if (code && code !== lastCode) {
    lastCode = code
    writeFileSync(`${out}/live-code.txt`, `${code}\n`)
    console.log(stamp(), 'OPEN CODE:', code, '|', await text('line-countdown'))
    await shot('live-code')
  }
  if ((await text('line-countdown')) === 'รหัสหมดอายุใน 00:00') {
    console.log(stamp(), 'code expired -> asking for a new one')
    await shot('live-code-expired')
    await click('line-new-code')
    await wait(1500)
  }
  await wait(1000)
}
console.log(stamp(), 'GAVE UP: never linked within', maxMin, 'min')
ws.close()
process.exit(2)
