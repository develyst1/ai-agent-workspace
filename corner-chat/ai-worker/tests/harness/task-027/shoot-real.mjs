// Throwaway: drives corner-chat-app in a real 360x800 Chrome (CDP) against the real local back end.
// Usage: node shoot-real.mjs <baseUrl> <outDir> <email> <password>   (Chrome already running with --remote-debugging-port=9333)
import { writeFileSync, mkdirSync } from 'node:fs'

const [base, out, email, password] = process.argv.slice(2)
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
async function shot(name) {
  const h = await ev('document.documentElement.scrollHeight')
  const s = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 360, height: Math.max(800, h), scale: 1 } },
    sessionId,
  )
  writeFileSync(`${out}/${name}.png`, Buffer.from(s.data, 'base64'))
}
// React controlled inputs: use the native setter, then fire `input`.
const fill = (testId, value) =>
  ev(`(() => { const el = document.querySelector('[data-testid="${testId}"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)
const click = (testId) => ev(`document.querySelector('[data-testid="${testId}"]').click()`)
const texts = (sel) => ev(`[...document.querySelectorAll('${sel}')].map(e => e.innerText.replace(/\\n+/g, ' | '))`)

await send('Page.navigate', { url: base + '/messages' }, sessionId)
await wait(2000)
console.log('1. protected route without a token ->', await ev('location.pathname'), '| title:', await ev('document.querySelector("[data-testid=screen-title]")?.textContent'))
await shot('browser-signin')

await fill('signin-email', email)
await fill('signin-password', 'a-wrong-password')
await click('signin-submit')
await wait(1500)
console.log('2. wrong password ->', await ev('document.querySelector("[data-testid=signin-error]")?.textContent'), '| path:', await ev('location.pathname'))
await shot('browser-signin-wrong')

await fill('signin-email', email)
await fill('signin-password', password)
await click('signin-submit')
await wait(2500)
console.log('3. right password -> path:', await ev('location.pathname'), '| token kept:', await ev('!!localStorage.getItem("CapacitorStorage.cc.token")'))
console.log('   notified rows:', JSON.stringify(await texts('[data-testid^=row-]'), null, 1))
await shot('browser-list-notified')

await click('list-tab-held')
await wait(1500)
console.log('4. held rows:', JSON.stringify(await texts('[data-testid^=row-]'), null, 1))
await shot('browser-list-held')
console.log('   hScroll:', await ev('document.documentElement.scrollWidth > innerWidth'))

ws.close()
