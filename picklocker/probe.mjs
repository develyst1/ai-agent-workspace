#!/usr/bin/env node
// Read-only probe: open a URL, print the form controls. GET only, no credential, no click.
// Usage: node picklocker/probe.mjs <url>      (allowlisted *.develyst.online only)
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const url = process.argv[2]
if (!url) { console.error('usage: node picklocker/probe.mjs <url>'); process.exit(2) }
const host = new URL(url).hostname
if (!(host === 'develyst.online' || host.endsWith('.develyst.online'))) {
  console.error(`REFUSED: ${host} is outside the allowlist`); process.exit(2)
}

const { chromium } = await import(pathToFileURL(join(here, 'node_modules', 'playwright-core', 'index.mjs')).href)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext()
// Look only: abort everything that is not a GET.
await context.route('**/*', (r) => (r.request().method() === 'GET' ? r.continue() : r.abort()))
const page = await context.newPage()
let res = null
try { res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }) } catch (e) { console.log('nav:', e.message.split('\n')[0]) }
console.log('url:', page.url())
try { console.log('title:', await page.title()) } catch {}
console.log('status:', res?.status?.())
const controls = await page.evaluate(() => [...document.querySelectorAll('input,button')].slice(0, 20).map((el) => ({
  tag: el.tagName, type: el.type, name: el.name, id: el.id, placeholder: el.placeholder, text: (el.textContent || '').trim().slice(0, 30),
})))
console.log('controls:', JSON.stringify(controls))
console.log('body:', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 300))
await browser.close()
