#!/usr/bin/env node
// Check-card — is a saved session still signed in? Read-only: never logs in, never reads credentials.
// Usage: node picklocker/check-card.mjs <site>
// Exit 0 = AUTHENTICATED, 1 = lapsed or missing (ask the access seat for a new card), 2 = usage.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const sites = JSON.parse(readFileSync(join(here, 'sites.json'), 'utf8'))

const key = process.argv[2]
const site = sites[key]
if (!site || key.startsWith('//')) {
  console.error(`Unknown site "${key}". Known: ${Object.keys(sites).filter((k) => !k.startsWith('//')).join(', ')}`)
  process.exit(2)
}

const statePath = join(here, 'state', `${key}.json`)
if (!existsSync(statePath)) {
  console.log(`card ${key}: MISSING · ${statePath}`)
  process.exit(1)
}

const PW = process.env.PW_PATH ?? join(here, 'node_modules', 'playwright-core', 'index.mjs')
if (!existsSync(PW)) {
  console.error('playwright-core missing: run npm install playwright-core in picklocker/')
  process.exit(2)
}
const { chromium } = await import(pathToFileURL(PW).href)

const target = site.authenticatedUrl ?? site.baseUrl
const browser = await chromium.launch({ channel: 'chrome', headless: true })
let ok = false
try {
  const context = await browser.newContext({ storageState: statePath })
  // Look only: abort every request that could write.
  await context.route('**/*', (route) => (route.request().method() === 'GET' ? route.continue() : route.abort()))
  const page = await context.newPage()
  let res = null
  try {
    res = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 })
  } catch {}
  const finalUrl = page.url()
  ok = !!res && !new URL(finalUrl).pathname.includes('/login')
  console.log(`card ${key}: ${ok ? 'AUTHENTICATED' : 'LAPSED'} · status ${res?.status() ?? 'no-response'} · ${finalUrl}`)
} finally {
  await browser.close()
}
process.exit(ok ? 0 : 1)
