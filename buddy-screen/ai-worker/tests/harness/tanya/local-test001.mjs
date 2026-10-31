// local-test001.mjs — TEST-001 (REQ-002) browser round against the LOCAL Vite demo.
// Proves: every screen in the index renders (TV 1920x1080, parent 375x667 + 1920x1080), the §13 strings
// appear verbatim, controls are hittable (elementFromPoint), no request leaves localhost, no camera/mic
// call, 0 console errors, and the AC-6 engagement timings measured in real time.
// Does NOT prove: anything about the real product (recognition, LINE, payment, timing accuracy R-T-3).
// Run:  node local-test001.mjs [baseUrl]    (default http://localhost:5173/; demo started with npm run dev)
// Output: JSON on stdout; screenshots into buddy-screen/project-docs/qa-2026-10-28/.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.argv[2] ?? 'http://localhost:5173/'
const BASE_ORIGIN = new URL(BASE).origin
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE_ORIGIN)) throw new Error(`refused: ${BASE_ORIGIN} is not local`)
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../../../project-docs/qa-2026-10-28', process.env.ROUND ?? '')
mkdirSync(OUT, { recursive: true })

const result = { base: BASE, requests: { local: 0, external: [] }, consoleErrors: [], mediaCalls: [], screens: [], interactions: {}, s13: {}, ac6: {} }

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })

async function newPage(viewport) {
  const ctx = await browser.newContext({ viewport })
  await ctx.addInitScript(() => {
    const md = navigator.mediaDevices
    if (md) {
      md.getUserMedia = (...a) => { window.__media = (window.__media || 0) + 1; return Promise.reject(new Error('blocked by QA')) }
    }
  })
  const page = await ctx.newPage()
  page.on('request', (r) => {
    const u = r.url()
    if (u.startsWith('data:') || u.startsWith(BASE_ORIGIN) || u.startsWith(BASE_ORIGIN.replace('http', 'ws'))) result.requests.local++
    else result.requests.external.push(u)
  })
  page.on('console', (m) => { if (m.type() === 'error') result.consoleErrors.push(`${page.url()} :: ${m.text()}`) })
  page.on('pageerror', (e) => result.consoleErrors.push(`${page.url()} :: pageerror ${e.message}`))
  return { ctx, page }
}

const allText = new Set()
async function grabText(page) { const t = await page.evaluate(() => document.body.innerText); allText.add(t); return t }

// Hit-test every visible control: centre point must hit the control itself (or its child).
async function hitTest(page) {
  return page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('button, input, a, label')) {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const onScreenX = r.left >= 0 && r.right <= window.innerWidth
      const hit = document.elementFromPoint(Math.min(Math.max(cx, 0), window.innerWidth - 1), Math.min(Math.max(cy, 0), window.innerHeight - 1))
      const ok = !!hit && (hit === el || el.contains(hit) || hit.contains(el) || (el.tagName === 'INPUT' && hit.closest('label')?.contains(el)))
      out.push({ tag: el.tagName, text: (el.innerText || el.value || '').slice(0, 30), x: Math.round(cx), y: Math.round(cy), onScreenX, hitOk: ok || cy > window.innerHeight })
    }
    const de = document.documentElement
    return { controls: out, hScroll: de.scrollWidth > de.clientWidth, scrollWidth: de.scrollWidth, clientWidth: de.clientWidth }
  })
}

// ---------- 1. index + every screen ----------
{
  const { ctx, page } = await newPage({ width: 1920, height: 1080 })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const links = await page.$$eval('main.index a', (as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.innerText })))
  result.index = { count: links.length, links }
  await page.screenshot({ path: `${OUT}/00-index.png`, fullPage: true })
  await grabText(page)
  await ctx.close()

  for (const l of links) {
    const isParent = l.href.startsWith('#/parent/')
    const viewports = isParent ? [{ width: 375, height: 667 }, { width: 1920, height: 1080 }] : [{ width: 1920, height: 1080 }]
    for (const vp of viewports) {
      const { ctx, page } = await newPage(vp)
      await page.goto(BASE + l.href, { waitUntil: 'networkidle' })
      const id = l.href.split('/').pop()
      const shot = `${OUT}/${isParent ? 'parent' : 'tv'}-${id}-${vp.width}.png`
      await page.screenshot({ path: shot, fullPage: true })
      const text = await grabText(page)
      const ht = await hitTest(page)
      const media = await page.evaluate(() => window.__media || 0)
      if (media) result.mediaCalls.push(`${l.href} x${media}`)
      result.screens.push({ href: l.href, vp: `${vp.width}x${vp.height}`, rendered: text.trim().length > 0, emoji: [...new Set(text.match(/\p{Extended_Pictographic}/gu) ?? [])].join(''), hScroll: ht.hScroll, badHits: ht.controls.filter((c) => !c.hitOk || !c.onScreenX), nControls: ht.controls.length, imgs: await page.$$eval('img, video, canvas', (e) => e.length), shot: path.basename(shot) })
      await ctx.close()
    }
  }
}

// ---------- 2. interactions (each on a fresh page) ----------
async function onScreen(href, vp, fn) {
  const { ctx, page } = await newPage(vp)
  await page.goto(BASE + href, { waitUntil: 'networkidle' })
  try { return await fn(page) } finally { await ctx.close() }
}
const PHONE = { width: 375, height: 667 }, TV = { width: 1920, height: 1080 }
const I = result.interactions

I.naming = await onScreen('#/tv/first-naming', TV, async (p) => {
  const before = await p.getByRole('button', { name: 'ใช้ชื่อนี้' }).isDisabled()
  await p.getByRole('button', { name: 'ดาว' }).click()
  const after = await p.getByRole('button', { name: 'ใช้ชื่อนี้' }).isDisabled()
  const price = /บาท|฿/.test(await grabText(p))
  return { confirmDisabledBefore: before, confirmDisabledAfterChoose: after, showsPrice: price }
})

I.invitations = await onScreen('#/tv/invitation', TV, async (p) => {
  const out = []
  for (const name of ['ออกกำลังกาย', 'ออกกำลังสมอง', 'คุยกัน', 'ฝึกคิด']) {
    await p.getByRole('button', { name, exact: true }).click()
    out.push(await p.locator('p.big').innerText())
    await grabText(p)
  }
  await p.screenshot({ path: `${OUT}/tv-invitation-last.png` })
  return out
})

I.overtimeApprove = await onScreen('#/parent/line-overtime-request', PHONE, async (p) => {
  await p.getByRole('button', { name: 'อนุมัติ', exact: true }).click()
  const t = await p.getByTestId('result').innerText(); await grabText(p)
  return t
})
I.overtimeDecline = await onScreen('#/parent/line-overtime-request', PHONE, async (p) => {
  await p.getByRole('button', { name: 'ไม่อนุมัติ', exact: true }).click()
  const t = await p.getByTestId('result').innerText(); await grabText(p)
  await p.screenshot({ path: `${OUT}/parent-overtime-declined-375.png`, fullPage: true })
  return t
})
I.sundayUsedUp = await onScreen('#/parent/liff-quota-settings', PHONE, async (p) => {
  const overtimeToggle = await p.locator('input[type=checkbox]').count()
  await p.getByRole('button', { name: 'ดูกรณีวันอาทิตย์ใช้หมด' }).click()
  const msg = await p.getByTestId('sunday-used-up').innerText()
  const ext = await p.getByTestId('paid-extension').innerText()
  const ht = await hitTest(p); await grabText(p)
  await p.screenshot({ path: `${OUT}/parent-sunday-used-up-375.png`, fullPage: true })
  return { overtimeToggle, msg, ext, badHits: ht.controls.filter((c) => !c.hitOk || !c.onScreenX) }
})
I.quotaZero = await onScreen('#/tv/quota-zero', TV, async (p) => {
  const first = await p.locator('p.big').innerText()
  await p.getByRole('button', { name: 'ถัดไป' }).click()
  const then = await p.locator('p.big').innerText(); await grabText(p)
  return { first, then }
})
I.consent = await onScreen('#/parent/liff-consent', PHONE, async (p) => {
  await p.getByRole('button', { name: 'ยินยอม', exact: true }).click()
  return await p.getByRole('status').innerText()
})
I.friendDelete = await onScreen('#/parent/liff-friend-consent', PHONE, async (p) => {
  const hasFriend = await p.getByText('ต้นกล้า').count()
  await p.getByRole('button', { name: 'ลบ', exact: true }).click()
  return { hasFriendBefore: hasFriend, after: await p.getByRole('status').innerText(), friendAfter: await p.getByText('ต้นกล้า').count() }
})
I.timelineDispute = await onScreen('#/parent/liff-session-timeline', PHONE, async (p) => {
  const n = await p.getByRole('button', { name: 'ขอให้ตรวจสอบช่วงนี้' }).count()
  await p.getByRole('button', { name: 'ขอให้ตรวจสอบช่วงนี้' }).nth(2).click()
  return { intervals: n, status: await p.getByRole('status').innerText() }
})
I.report = await onScreen('#/parent/liff-report-choice', PHONE, async (p) => ({ radios: await p.locator('input[type=radio]').count(), text: await p.locator('.phone-body').innerText() }))
I.gifts = await onScreen('#/parent/liff-gift-choice', PHONE, async (p) => ({ radios: await p.locator('input[type=radio]').count(), text: await p.locator('.phone-body').innerText() }))
I.goals = await onScreen('#/parent/liff-goals', PHONE, async (p) => ({ areas: await p.locator('legend').count(), topics: await p.locator('input[type=checkbox]').count() }))
I.rename = await onScreen('#/parent/liff-rename', PHONE, async (p) => p.locator('.phone-body').innerText())
I.borrowed = await onScreen('#/parent/line-borrowed', PHONE, async (p) => ({ text: await p.locator('.phone-body').innerText(), links: await p.locator('.phone-body a, .phone-body button').count() }))
I.faceReg = await onScreen('#/tv/face-gesture-registration', TV, async (p) => p.locator('section.tv').innerText())

// Round 2 (DEF-1, DEF-3): follow the links a user would tap, at phone width; hit-test the link first.
const tapLink = async (p, name) => {
  const a = p.getByRole('link', { name, exact: true })
  const box = await a.boundingBox()
  const hit = await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('a')?.innerText ?? null, [box.x + box.width / 2, box.y + box.height / 2])
  await a.click()
  await p.waitForLoadState('networkidle')
  return { hit, height: Math.round(box.height) }
}
I.declineToTv = await onScreen('#/parent/line-overtime-request', PHONE, async (p) => {
  await p.getByRole('button', { name: 'ไม่อนุมัติ', exact: true }).click()
  const link = await tapLink(p, 'ดูหน้าจอทีวี')
  const url = p.url().split('#')[1]
  const text = await grabText(p)
  await p.screenshot({ path: `${OUT}/r2-decline-to-tv.png`, fullPage: true })
  return { link, url, tvLine: await p.locator('p.big').innerText(), emoji: text.match(/\p{Extended_Pictographic}/gu) }
})
I.borrowedToBuyBack = await onScreen('#/parent/line-borrowed', PHONE, async (p) => {
  const link = await tapLink(p, 'ไปที่เมนูโควต้า')
  const url = p.url().split('#')[1]
  const info = await p.locator('#buyback-title + p').innerText()
  const amount = await p.getByTestId('buyback-amount').innerText()
  const ht = await hitTest(p)
  await p.getByRole('button', { name: 'ซื้อคืน', exact: true }).click()
  const done = await p.getByTestId('buyback-done').innerText()
  await grabText(p)
  await p.screenshot({ path: `${OUT}/r2-buyback-done-375.png`, fullPage: true })
  return { link, url, info, amount, done, badHits: ht.controls.filter((c) => !c.hitOk || !c.onScreenX), hScroll: ht.hScroll }
})

// ---------- 3. §13 verbatim, across everything seen ----------
const corpus = [...allText].join('\n')
const s13 = {
  'TV name-call': 'เรียกฉันรึเปล่า',
  'TV invitation x4': ['ออกกำลังกาย', 'ออกกำลังสมอง', 'คุยกัน', 'ฝึกคิด'].map((a) => `มาเล่นด้วยกันไหม วันนี้เรามี ${a} นะ`),
  'TV off-task': 'ตอนนี้ทำอะไรอยู่จ๊ะ',
  'TV going to sleep': 'งั้นพักก่อนนะ เรียกฉันได้ทุกเมื่อเลย',
  'LINE overtime request': ['น้องมะลิ เล่นครบเวลาของวันนี้แล้วครับ ต้องการให้เล่นต่อไหม', 'อนุมัติ', 'ไม่อนุมัติ'],
  'LINE borrowed': 'ไม่ได้รับคำตอบใน 3 ชั่วโมง ระบบยืมเวลาจากวันอาทิตย์ 30 นาทีแล้วครับ ซื้อคืนได้ที่เมนูโควต้า',
  'LIFF quota': 'เหลือเวลาสัปดาห์นี้ 31 ชม. 20 นาที · วันนี้ใช้ไป 2 ชม. 10 นาที',
  'LIFF rename': 'เปลี่ยนชื่อ AI ครั้งละ 99 บาท',
  'LIFF friend consent': 'ผู้ปกครองของเพื่อนตกลงให้ลงทะเบียนใบหน้าแล้ว (เก็บแค่ข้อมูลจำหน้า ไม่เก็บรูป)',
  'TV activity names': ['ออกกำลังกาย', 'ออกกำลังสมอง', 'คุยกัน', 'ฝึกคิด'],
  'TV first-use naming': ['อยากเรียกฉันว่าอะไรดี', 'ชื่อตัวอย่าง: ปุยฝ้าย · ดาว · โบ๊ะ'],
  'TV face registration': 'มองกล้องนิ่งๆ แป๊บนึงนะ ฉันจะจำหน้าเธอไว้',
  'TV gesture registration': 'มาตั้งท่าลับของเรากัน ทำท่าให้ดูหน่อย',
  'TV sleep screen': 'เรียกชื่อฉันได้เลยนะ',
  'TV quota zero': 'วันนี้เล่นครบเวลาแล้วนะ พรุ่งนี้มาเล่นกันใหม่นะ',
  'LINE overtime declined (TV)': 'วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย',
  'LIFF Sunday used up': 'เวลาที่ยืมได้ของสัปดาห์นี้หมดแล้ว ซื้อเวลาเพิ่มได้ ชั่วโมงละ 12.50 บาท',
}
for (const [k, v] of Object.entries(s13)) {
  const parts = Array.isArray(v) ? v : [v]
  result.s13[k] = parts.every((x) => corpus.includes(x)) ? 'OK' : `MISSING: ${parts.filter((x) => !corpus.includes(x)).join(' | ')}`
}

// ---------- 4. AC-6 timings, real time, parallel pages ----------
async function timed(label, script) {
  const { ctx, page } = await newPage(TV)
  await page.goto(BASE + '#/tv/activity-in-progress', { waitUntil: 'networkidle' })
  const inFrame = page.locator('.sim input[type=checkbox]').nth(0)
  const responding = page.locator('.sim input[type=checkbox]').nth(1)
  const read = async () => page.evaluate(() => {
    const [m, s] = document.querySelector('[data-testid=counter]').textContent.split(':').map(Number)
    return { state: document.querySelector('[data-testid=state]').getAttribute('data-state'), counted: m * 60 + s }
  })
  const trace = []
  const t0 = Date.now()
  const at = () => +((Date.now() - t0) / 1000).toFixed(2)
  const poll = async (untilSec) => { while (at() < untilSec) { const r = await read(); const last = trace[trace.length - 1]; if (!last || last.state !== r.state || last.counted !== r.counted) trace.push({ t: at(), ...r }); await page.waitForTimeout(100) } }
  try { await script({ inFrame, responding, poll, at, trace, page }) } finally { await page.screenshot({ path: `${OUT}/ac6-${label}.png` }); await ctx.close() }
  return trace
}
const [silent, absent, recover, nine, backIn] = await Promise.all([
  timed('silent', async ({ responding, poll, trace, at }) => { await poll(3); await responding.uncheck(); trace.push({ t: at(), event: 'responding OFF' }); await poll(36) }),
  timed('absent', async ({ inFrame, poll, trace, at }) => { await poll(5); await inFrame.uncheck(); trace.push({ t: at(), event: 'inFrame OFF' }); await poll(28) }),
  timed('recover', async ({ responding, poll, trace, at }) => { await poll(2); await responding.uncheck(); trace.push({ t: at(), event: 'responding OFF' }); await poll(16); await responding.check(); trace.push({ t: at(), event: 'responding ON' }); await poll(22) }),
  timed('nine', async ({ responding, poll, trace, at }) => { await poll(2); await responding.uncheck(); trace.push({ t: at(), event: 'responding OFF' }); await poll(10.85); await responding.check(); trace.push({ t: at(), event: 'responding ON' }); await poll(15) }),
  timed('backin', async ({ inFrame, poll, trace, at }) => { await poll(4); await inFrame.uncheck(); trace.push({ t: at(), event: 'inFrame OFF' }); await poll(14); await inFrame.check(); trace.push({ t: at(), event: 'inFrame ON' }); await poll(20) }),
])
result.ac6 = { silent, absent, recover, nine, backIn }

await browser.close()
console.log(JSON.stringify(result, null, 1))
