// Throwaway (TASK-030 A2): heights of the other buttons whose CSS I touched (names add/delete, new-code, unlink dialog).
const [base] = process.argv.slice(2)
const http = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json())
const ws = new WebSocket(http.webSocketDebuggerUrl)
let id = 0; const pend = new Map()
const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })) })
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id) } }
await new Promise((r) => (ws.onopen = r))
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true }, sessionId)
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)).result.value
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const h = (t) => ev(`(() => { const e = document.querySelector('[data-testid="${t}"]'); return e ? Math.round(e.getBoundingClientRect().height * 10) / 10 : null })()`)
const click = (t) => ev(`document.querySelector('[data-testid="${t}"]').click()`)
const fill = (t, v) => ev(`(() => { const el = document.querySelector('[data-testid="${t}"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)

await send('Page.navigate', { url: base + '/channels/line/names' }, sessionId); await wait(2000)
await fill('name-input', 'เอ'); await wait(300)
console.log('name-add (enabled, with text):', await h('name-add'))
await click('name-add'); await wait(800)
console.log('name-delete-0:', await h('name-delete-0'))

await send('Page.navigate', { url: base + '/channels/line' }, sessionId)
let nc = null; for (let i = 0; i < 6 && !nc; i++) { await wait(800); nc = await h('line-new-code') }
console.log('line-new-code (code open):', nc)
for (let i = 0; i < 25 && !(await h('line-unlink')); i++) await wait(1000)
await click('line-unlink'); await wait(600)
console.log('unlink-cancel:', await h('unlink-cancel'), '| unlink-confirm:', await h('unlink-confirm'))
ws.close()
