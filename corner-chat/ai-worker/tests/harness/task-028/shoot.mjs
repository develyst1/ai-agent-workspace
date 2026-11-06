// Throwaway: screenshots of the LINE screens at a real 360x800 viewport (Chrome DevTools protocol).
// Usage: node shoot.mjs fake <baseUrl> <outDir>      FAKE build: channels, line code/linked, names, groups
//        node shoot.mjs signin <baseUrl> <outDir>    VITE_FAKE=false with no back end: /signin before and with an error
// Chrome must already run with --remote-debugging-port=9333.
import { writeFileSync, mkdirSync } from 'node:fs'

const [mode, base, out] = process.argv.slice(2)
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
const go = async (path, ms = 1800) => {
  await send('Page.navigate', { url: base + path }, sessionId)
  await wait(ms)
}
async function shot(name) {
  const h = await ev('document.documentElement.scrollHeight')
  const s = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 360, height: Math.max(800, h), scale: 1 } },
    sessionId,
  )
  writeFileSync(`${out}/${name}.png`, Buffer.from(s.data, 'base64'))
}
const text = (testId) => ev(`document.querySelector('[data-testid="${testId}"]')?.innerText ?? null`)
const click = (testId) => ev(`document.querySelector('[data-testid="${testId}"]').click()`)
const fill = (testId, value) =>
  ev(`(() => { const el = document.querySelector('[data-testid="${testId}"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)
const hScroll = () => ev('document.documentElement.scrollWidth > innerWidth')

if (mode === 'fake') {
  await go('/channels')
  console.log('channels: rows =', await ev(`[...document.querySelectorAll('[data-testid^=channels-open-]')].map(e => e.innerText.replace(/\\n+/g,' | '))`), '| hScroll', await hScroll())
  await shot('channels')

  await go('/channels/line')
  console.log('line-code:', await text('line-code'), '|', await text('line-countdown'), '| hScroll', await hScroll())
  await shot('line-code')

  // the fake turns linked on the 3rd poll (3 s apart)
  for (let i = 0; i < 20 && !(await text('line-linked')); i++) await wait(1000)
  console.log('line-linked:', await text('line-linked'), '|', await text('line-display-name'), '| hScroll', await hScroll())
  await shot('line-linked')

  await go('/channels/line/names')
  console.log('names (empty):', await text('names-empty'))
  await shot('line-names-empty')
  for (const n of ['เอ', 'Aey', 'น้องเอ']) {
    await fill('name-input', n)
    await click('name-add')
    await wait(500)
  }
  console.log('names rows:', await ev(`[...document.querySelectorAll('[data-testid^=name-row-]')].map(e => e.innerText.replace(/\\n+/g,' | '))`), '| hScroll', await hScroll())
  await shot('line-names')

  await go('/channels/line/groups')
  console.log('groups:', await ev(`[...document.querySelectorAll('[data-testid^=group-row-]')].map(e => e.innerText.replace(/\\n+/g,' | '))`), '| help visible:', !!(await text('groups-help')), '| hScroll', await hScroll())
  await shot('line-groups')

  await go('/channels/line/groups?fixtures=empty')
  console.log('groups (empty):', await text('groups-empty'), '| help visible:', !!(await text('groups-help')))
  await shot('line-groups-empty')
}

if (mode === 'signin') {
  // VITE_FAKE=false and nothing listening behind the proxy: the sign-in call fails, which shows the generic error.
  await go('/signin')
  const top = () => ev(`Math.round(document.querySelector('[data-testid=signin-submit]').getBoundingClientRect().top)`)
  const before = await top()
  console.log('signin before: error =', await text('signin-error'), '| button top =', before)
  await shot('signin-before')
  await fill('signin-email', 'someone@corner.test')
  await fill('signin-password', 'whatever-123')
  await click('signin-submit')
  await wait(2500)
  const after = await top()
  console.log('signin with error: error =', await text('signin-error'), '| button top =', after, '| moved by', after - before, 'px')
  await shot('signin-error')
}

ws.close()
