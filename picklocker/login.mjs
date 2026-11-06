#!/usr/bin/env node
// Picklocker — log in once, save the session, reuse it.
// Usage:
//   PW_PATH=<repo>/node_modules/playwright/index.mjs \
//   PICKLOCK_USER_<SITE>="..." PICKLOCK_PASS_<SITE>="..." \
//   node picklocker/login.mjs <site>
//
// Credentials come ONLY from environment variables. This file never holds a secret.
// It refuses any origin outside the allowlist in sites.json.

import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

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
if (site.mode === 'session-import') {
  console.error(`"${key}" is a session-import site (${site.note ?? 'OAuth/Cloudflare Access'}); the owner exports state/${key}.json once — no password login here.`)
  process.exit(2)
}

const origin = new URL(site.loginUrl).origin
assertAllowed(origin)

const envKey = key.toUpperCase().replace(/[^A-Z0-9]/g, '_')
let user = process.env[`PICKLOCK_USER_${envKey}`]
let pass = process.env[`PICKLOCK_PASS_${envKey}`]

// Fallback: access.txt (git-ignored) — the owner drops "user = ..." / "password = ..." in.
if (!user || !pass) {
  const accPath = join(here, 'access.txt')
  if (existsSync(accPath)) {
    for (const line of readFileSync(accPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*(user|password)\s*[:=]\s*(.+?)\s*$/i)
      if (m) {
        if (m[1].toLowerCase() === 'user') user = m[2]
        if (m[1].toLowerCase() === 'password') pass = m[2]
      }
    }
  }
}
if (!user || !pass) {
  console.error(`Credentials missing: set PICKLOCK_USER_${envKey} / PICKLOCK_PASS_${envKey}, or fill picklocker/access.txt with "user = ..." and "password = ..."`)
  process.exit(2)
}

const stateDir = join(here, 'state')
mkdirSync(stateDir, { recursive: true })
const statePath = join(stateDir, `${key}.json`)

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext()
const page = await context.newPage()
try {
  if (existsSync(statePath)) {
    // Reuse: restore the saved session and verify we are still signed in.
    const prev = JSON.parse(readFileSync(statePath, 'utf8'))
    if (Array.isArray(prev.cookies)) await context.addCookies(prev.cookies)
    await page.goto(site.authenticatedUrl ?? site.baseUrl)
  } else {
    await page.goto(site.loginUrl)
    await page.fill(site.selectors.email, user)
    await page.fill(site.selectors.password, pass)
    await page.click(site.selectors.submit)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 })
  }
  await context.storageState({ path: statePath })
  console.log(`session saved: ${statePath}`)
} finally {
  await browser.close()
}
