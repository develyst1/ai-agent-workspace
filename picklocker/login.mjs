#!/usr/bin/env node
// Picklocker — log in once, save the session, reuse it.
// Usage:
//   PW_PATH=<repo>/node_modules/playwright/index.mjs \
//   PICKLOCK_USER_<SITE>="..." PICKLOCK_PASS_<SITE>="..." \
//   node picklocker/login.mjs <site>
//
// Credentials come ONLY from environment variables. This file never holds a secret.
// It refuses any origin outside the allowlist in sites.json.

import { readFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { credentialsFor } from './creds.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const sites = JSON.parse(readFileSync(join(here, 'sites.json'), 'utf8'))

// 1. Hard allowlist — the owner's own domain, nothing else.
const ALLOWED_SUFFIXES = ['develyst.online']
const assertAllowed = (origin) => {
  const ok = ALLOWED_SUFFIXES.some((d) => origin === d || origin.endsWith('.' + d))
  if (!ok) throw new Error(`REFUSED: ${origin} is outside the picklocker allowlist`)
}

let PW = process.env.PW_PATH
const localPW = join(here, 'node_modules', 'playwright-core', 'index.mjs')
if (!PW && existsSync(localPW)) PW = localPW
if (!PW) {
  console.error('PW_PATH is required, or run: npm install playwright-core in picklocker/')
  process.exit(2)
}
const { chromium } = await import(pathToFileURL(PW).href)

const key = process.argv[2]
const site = sites[key]
if (!site) {
  console.error(`Unknown site "${key}". Known: ${Object.keys(sites).filter((k) => !k.startsWith('//')).join(', ')}`)
  process.exit(2)
}
if (site.mode === 'session-import' && !process.argv.includes('--allow-import')) {
  console.error(`"${key}" is a session-import site (${site.note ?? 'OAuth/Cloudflare Access'}); the owner exports state/${key}.json once — no password login here. A deliberate one-off needs --allow-import, and that is the owner's call, not a default.`)
  process.exit(2)
}

const origin = new URL(site.loginUrl).origin
assertAllowed(origin)

const { user, pass, envKey } = credentialsFor(here, key)
if (!user || !pass) {
  console.error(`Credentials missing: set PICKLOCK_USER_${envKey} / PICKLOCK_PASS_${envKey}, or fill picklocker/access.txt with "user = ..." and "password = ..."`)
  process.exit(2)
}

const stateDir = join(here, 'state')
mkdirSync(stateDir, { recursive: true })
const statePath = join(stateDir, `${key}.json`)

// Keep the previous session as a .prev copy, so a failed login never eats a working one.
if (existsSync(statePath)) copyFileSync(statePath, `${statePath}.prev`)

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext()
const page = await context.newPage()
let loginError = null
try {
  if (existsSync(`${statePath}.prev`) && process.env.PICKLOCK_REUSE === '1') {
    // Reuse: restore the saved session and verify we are still signed in.
    const prev = JSON.parse(readFileSync(`${statePath}.prev`, 'utf8'))
    if (Array.isArray(prev.cookies)) await context.addCookies(prev.cookies)
    await page.goto(site.authenticatedUrl ?? site.baseUrl)
  } else {
    // A client-rendered form (Mantine/Next) can be filled before React hydrates; the click then
    // does a native form submit and nothing happens. Retry the whole attempt on a fresh load.
    let lastUrl = ''
    for (let attempt = 1; attempt <= 3 && !loginError; attempt++) {
      try {
        await page.goto(site.loginUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
      } catch (e) {
        // a dropped connection is a retry, not a verdict
        lastUrl = `network: ${e.message.split('\n')[0]}`
        if (attempt === 3) loginError = `NOT_UNLOCKED — could not load ${site.loginUrl} (${lastUrl})`
        continue
      }
      // Client-rendered forms (Mantine/Next) answer the click with a native GET submit until
      // React hydrates. Waiting for network idle is what makes the React handler exist.
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
      await page.fill(site.selectors.email, user)
      await page.fill(site.selectors.password, pass)
      await page.waitForTimeout(300) // let the controlled inputs push their state
      await page.click(site.selectors.submit)
      try {
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
      } catch {
        lastUrl = page.url()
        if (attempt === 3) {
          const u = new URL(lastUrl)
          loginError = `NOT_UNLOCKED — login stayed on ${u.pathname}${u.search} after 3 attempts: credential refused, or the login page changed (stale credential is the usual cause — see UNLOCK-005)`
        }
      }
    }
  }
  if (!loginError) {
    await context.storageState({ path: statePath })
    console.log(`session saved: ${statePath}`)
  }
} finally {
  await browser.close()
}

if (loginError) {
  console.error(loginError)
  process.exit(1)
}

// Verify with a CLEAN context loaded from the saved file — "saved" is not an unlock.
const target = site.authenticatedUrl ?? site.baseUrl
const verifyBrowser = await chromium.launch({ channel: 'chrome', headless: true })
let res = null
let navError = null
try {
  const verifyContext = await verifyBrowser.newContext({ storageState: statePath })
  const verifyPage = await verifyContext.newPage()
  try {
    // 'commit' returns as soon as the response head is in, so a slow Cloudflare page cannot
    // turn a valid session into a false NOT_UNLOCKED; the final URL still tells us where we landed.
    res = await verifyPage.goto(target, { waitUntil: 'commit', timeout: 30000 })
    await verifyPage.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {})
  } catch (e) {
    navError = e.message.split('\n')[0]
  }
  const finalUrl = verifyPage.url()
  console.log(`verified: status ${res?.status() ?? 'no-response'} · ${finalUrl} · ${new URL(finalUrl).pathname.includes('/login') ? 'REDIRECTED TO LOGIN' : 'AUTHENTICATED'}${navError ? ` · nav: ${navError}` : ''}`)
  if (!res || new URL(finalUrl).pathname.includes('/login')) process.exitCode = 1
} finally {
  await verifyBrowser.close()
}
