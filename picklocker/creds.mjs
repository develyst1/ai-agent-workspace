// Shared credential lookup for picklocker tools.
// Values never leave the caller: no caller prints them, no file is rewritten.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export const envKeyFor = (key) => key.toUpperCase().replace(/[^A-Z0-9]/g, '_')

// Priority: PICKLOCK_USER_<KEY> / PICKLOCK_PASS_<KEY>, then access.txt [key], then its default block.
export function credentialsFor(here, key) {
  const envKey = envKeyFor(key)
  let user = process.env[`PICKLOCK_USER_${envKey}`]
  let pass = process.env[`PICKLOCK_PASS_${envKey}`]

  if (!user || !pass) {
    const accPath = join(here, 'access.txt')
    if (existsSync(accPath)) {
      const sections = {}
      let current = ''
      for (const line of readFileSync(accPath, 'utf8').split(/\r?\n/)) {
        const sec = line.match(/^\s*\[([^\]]+)\]\s*$/)
        if (sec) { current = sec[1].trim(); continue }
        const m = line.match(/^\s*(user|password)\s*[:=]\s*(.+?)\s*$/i)
        if (!m) continue
        const bucket = (sections[current] ??= {})
        bucket[m[1].toLowerCase()] = m[2]
      }
      const chosen = sections[key] ?? sections[''] ?? {}
      if (!user && chosen.user) user = chosen.user
      if (!pass && chosen.password) pass = chosen.password
    }
  }
  return { user, pass, envKey }
}
