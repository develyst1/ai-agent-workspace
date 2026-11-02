// Throwaway: screenshots of corner-chat-app at a real 360x800 viewport via the Chrome DevTools protocol.
// Usage: node shoot.mjs <baseUrl> <outDir>   (Chrome must already run with --remote-debugging-port=9333)
import { writeFileSync, mkdirSync } from 'node:fs'

const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })

const shots = [
  ['list-notified', '/messages'],
  ['list-held', '/messages?tab=held'],
  ['list-line-filter', '/messages?channel=line'],
  ['list-empty', '/messages?fixtures=empty'],
  ['detail-ai', '/messages/m01'],
  ['detail-rule', '/messages/m02'],
  ['detail-ai-unavailable', '/messages/m06'],
  ['detail-mail-cc-attachments', '/messages/m03'],
  ['detail-held-reason', '/messages/m07'],
  ['detail-replies', '/messages/m11'],
  ['detail-corrected', '/messages/m10'],
]

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

for (const [name, path] of shots) {
  await send('Page.navigate', { url: base + path }, sessionId)
  await new Promise((r) => setTimeout(r, 2000))
  const m = await send(
    'Runtime.evaluate',
    {
      expression:
        'JSON.stringify({sw:document.documentElement.scrollWidth,iw:innerWidth,h:document.documentElement.scrollHeight,p:getComputedStyle(document.documentElement).getPropertyValue("--adm-color-primary").trim()})',
      returnByValue: true,
    },
    sessionId,
  )
  const { sw, iw, h, p } = JSON.parse(m.result.value)
  const shot = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 360, height: Math.max(800, h), scale: 1 } },
    sessionId,
  )
  writeFileSync(`${out}/${name}.png`, Buffer.from(shot.data, 'base64'))
  console.log(name, `innerWidth=${iw} scrollWidth=${sw} hScroll=${sw > iw}`, `height=${h}`, `--adm-color-primary=${p}`)
}
ws.close()
