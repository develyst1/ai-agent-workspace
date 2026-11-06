// Throwaway (TASK-030 "A2"): measure the height of `signin-submit` and `line-unlink` in a real 360x800 Chrome (CDP).
// Usage: node a2-measure.mjs <baseUrl> <label> [<outDir>]   (FAKE build; Chrome already on --remote-debugging-port=9333)
import { writeFileSync } from 'node:fs'

const [base, label, out] = process.argv.slice(2)
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
const rect = (t) =>
  ev(`(() => { const e = document.querySelector('[data-testid="${t}"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { h: r.height, w: r.width } })()`)
const shot = async (name) => {
  if (!out) return
  const s = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
  writeFileSync(`${out}/${name}.png`, Buffer.from(s.data, 'base64'))
}

await send('Page.navigate', { url: base + '/signin' }, sessionId)
await wait(2000)
const a = await rect('signin-submit')
console.log(`[${label}] signin-submit  getBoundingClientRect().height = ${a?.h}  (width ${a?.w})`)
await shot(`a2-${label}-signin`)

// the fake links on its 3rd poll after a code (3 s apart): wait for the linked screen
await send('Page.navigate', { url: base + '/channels/line' }, sessionId)
let b = null
for (let i = 0; i < 25 && !b; i++) {
  await wait(1000)
  b = await rect('line-unlink')
}
console.log(`[${label}] line-unlink    getBoundingClientRect().height = ${b?.h}  (width ${b?.w})`)
await shot(`a2-${label}-line-linked`)
ws.close()
