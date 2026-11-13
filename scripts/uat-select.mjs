#!/usr/bin/env bun
// uat-select — one read-only query against a desk's customer database (uat), for SA seats only.
// Usage (from the workspace root): bun scripts/uat-select.mjs "<SELECT …>"
//
// The URL comes from the git-ignored `.env.uat-readonly` (UAT_READONLY_DATABASE_URL=…), set by the owner.
// It is never printed: only its host. Read-only three times over: the owner's SELECT-only role (server
// fact), a READ ONLY transaction that is always rolled back, and a refusal of anything but one read
// statement. Max 200 rows printed. (Atlas, 2026-11-08; owner via Porter: "หากเป็นการ read อย่างเดียว
// มอบสิทธิ์ให้ SA ทำเองได้".)

import { SQL } from 'bun'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// `--target trolley` reads the owner's Trolley board DB instead (`.env.trolley`, 2026-11-08), still read-only.
const TARGETS = {
  uat: { file: '.env.uat-readonly', key: 'UAT_READONLY_DATABASE_URL' },
  trolley: { file: '.env.trolley', key: 'TROLLEY_DATABASE_URL' },
}
const MAX_ROWS = 200

const fail = (msg) => {
  console.error(`REFUSED: ${msg}`)
  process.exit(2)
}

const args = process.argv.slice(2)
const t = args.indexOf('--target')
const targetName = t === -1 ? 'uat' : args.splice(t, 2)[1]
const target = TARGETS[targetName]
if (!target) fail(`unknown target "${targetName}" (known: ${Object.keys(TARGETS).join(', ')})`)
const ENV_FILE = join(process.cwd(), target.file)
const KEY = target.key

const query = (args[0] ?? '').trim().replace(/;\s*$/, '')
if (!query) fail('give one SELECT as the only argument')
if (query.includes(';')) fail('one statement only')
if (!/^(select|with|explain|show|table)\b/i.test(query)) fail('read statements only (SELECT / WITH / EXPLAIN / SHOW / TABLE)')
if (/^explain\b[^]*\banalyze\b/i.test(query)) fail('EXPLAIN ANALYZE runs the statement; use plain EXPLAIN')

if (!existsSync(ENV_FILE)) fail(`${ENV_FILE} is missing; the owner sets it`)
const line = readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${KEY}=`))
const url = line?.slice(KEY.length + 1).trim()
if (!url) fail(`${KEY} is empty in ${target.file}; the owner sets it`)

console.log(`host: ${new URL(url).hostname}  (check it against the desk's SYSTEM-FACTS before trusting the rows)`)

const db = new SQL(url)
const conn = await db.reserve()
try {
  await conn.unsafe('BEGIN TRANSACTION READ ONLY')
  await conn.unsafe("SET LOCAL statement_timeout = '15s'")
  const rows = await conn.unsafe(query)
  console.log(`rows: ${rows.length}${rows.length > MAX_ROWS ? ` (showing ${MAX_ROWS})` : ''}`)
  console.log(JSON.stringify(rows.slice(0, MAX_ROWS), null, 2))
} finally {
  await conn.unsafe('ROLLBACK').catch(() => {})
  conn.release()
  await db.close()
}
