#!/usr/bin/env node
// Keep-fresh — re-verify every password-mode site's saved session; re-login only if it lapsed.
// Usage: node picklocker/keep-fresh.mjs
// No AI involved: the standby watcher runs this, and wakes PokerVault only on exit 1.
// Writes one line per run to state/keep-fresh.log (git-ignored with state/).

import { readFileSync, appendFileSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const sites = JSON.parse(readFileSync(join(here, 'sites.json'), 'utf8'))
const login = join(here, 'login.mjs')

const run = (key, reuse) =>
  spawnSync(process.execPath, [login, key], {
    env: { ...process.env, ...(reuse ? { PICKLOCK_REUSE: '1' } : {}) },
    encoding: 'utf8',
  }).status === 0

const results = []
for (const [key, site] of Object.entries(sites)) {
  if (key.startsWith('//') || site.mode !== 'password') continue
  if (run(key, true)) results.push(`${key}=ok`)
  else if (run(key, false)) results.push(`${key}=relogged`)
  else results.push(`${key}=FAILED`)
}

const line = `${new Date().toISOString()} ${results.join(' ')}`
mkdirSync(join(here, 'state'), { recursive: true })
appendFileSync(join(here, 'state', 'keep-fresh.log'), line + '\n')
console.log(line)
if (results.some((r) => r.endsWith('=FAILED'))) process.exit(1)
