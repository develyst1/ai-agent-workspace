#!/usr/bin/env node
// Basic-auth cards — for a site behind HTTP Basic (nginx), which has no form and no
// storageState to hand over. The credential stays in the git-ignored access.txt; what a
// harness receives is a browser context that already carries it, never the value itself.
//
// CLI (verify a card, prints status + URL only):
//     node picklocker/basic-auth.mjs <site-key> [url-path]
// Code (a QA harness — no secret ever enters its output):
//     import { openCard } from '<workspace>/picklocker/basic-auth.mjs'
//     const { context, page } = await openCard(browser, 'som-gr')
//     await page.goto('https://som-gr.develyst.online/')

import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { credentialsFor } from './creds.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const sites = JSON.parse(readFileSync(join(here, 'sites.json'), 'utf8'))
const ALLOWED_SUFFIXES = ['develyst.online']
const assertAllowed = (origin) => {
  const ok = ALLOWED_SUFFIXES.some((d) => origin === d || origin.endsWith('.' + d))
  if (!ok) throw new Error(`REFUSED: ${origin} is outside the picklocker allowlist`)
}

// A browser context that carries the Basic credentials; throw (never print) if missing.
export async function openCard(browser, key) {
  const site = sites[key]
  if (!site) throw new Error(`Unknown site "${key}"`)
  if (site.mode !== 'basic-auth') throw new Error(`"${key}" is mode "${site.mode}", not basic-auth`)
  assertAllowed(new URL(site.baseUrl).origin)

  const { user, pass, envKey } = credentialsFor(here, key)
  if (!user || !pass) {
    throw new Error(`no credential for "${key}": fill picklocker/access.txt [${key}] or set PICKLOCK_USER_${envKey} / PICKLOCK_PASS_${envKey}`)
  }
  const context = await browser.newContext({
    httpCredentials: { username: user, password: pass, send: 'always' },
  })
  const page = await context.newPage()
  return { context, page, site }
}

// --- CLI -------------------------------------------------------------------
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const key = process.argv[2]
  const pathSuffix = process.argv[3] ?? ''
  const site = sites[key]
  if (!site) {
    console.error(`Unknown site "${key}". Known: ${Object.keys(sites).filter((k) => !k.startsWith('//')).join(', ')}`)
    process.exit(2)
  }
  const { chromium } = await import(pathToFileURL(join(here, 'node_modules', 'playwright-core', 'index.mjs')).href)
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  let ok = false
  try {
    const { page } = await openCard(browser, key)
    const target = site.baseUrl.replace(/\/$/, '') + pathSuffix
    let res = null
    try { res = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 }) } catch (e) { console.log('nav:', e.message.split('\n')[0]) }
    ok = !!res && res.status() === 200
    console.log(`card ${key}: ${ok ? 'AUTHENTICATED' : 'LAPSED'} · status ${res?.status() ?? 'no-response'} · ${page.url()}`)
  } catch (e) {
    console.log(`card ${key}: MISSING · ${e.message}`)
  } finally {
    await browser.close()
  }
  process.exit(ok ? 0 : 1)
}
