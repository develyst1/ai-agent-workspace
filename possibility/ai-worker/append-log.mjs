#!/usr/bin/env node
// append-log.mjs — the only way a role writes to log/<TODAY>.md.
//   node ai-worker/append-log.mjs "<Name (ROLE)>" < entry-body.md
// Runs the hygiene gate first and writes its RESULT line as `Gate: ...` under the heading
// (a FAIL is still appended; a gate that cannot run is written as `Gate: NOT RUN — <reason>`).
// Append-only (flag 'a', never truncates). The heading is written by this
// script, so a role cannot put another role's name over its own words.
// TODAY is the LOCAL date, never UTC (see ATLAS.md: date discipline).
// After appending, prints "Skills changed since your last entry: …" when a workspace skill's SKILL.md
// changed after this role's previous entry (MARIE-ORDER-2026-10-14-wake-hint-and-skill-changes.md).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const who = process.argv[2];
if (!who) { console.error('usage: node append-log.mjs "<Name (ROLE)>" < body'); process.exit(2); }
const body = fs.readFileSync(0, 'utf8').trim();
if (!body) { console.error('empty entry: nothing written'); process.exit(2); }

const here = path.dirname(fileURLToPath(import.meta.url));
const d = new Date();
const p2 = (n) => String(n).padStart(2, '0');
const today = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const file = path.join(here, 'log', `${today}.md`);
fs.mkdirSync(path.dirname(file), { recursive: true });

const project = path.basename(path.dirname(here));

// The gate's RESULT line goes on every entry, written by this script, not by the role.
function gateLine() {
  const gate = path.join(here, '..', '..', 'check-hygiene.mjs');
  if (!fs.existsSync(gate)) return `Gate: NOT RUN — ${gate} not found`;
  const r = spawnSync(process.execPath, [gate, project], { encoding: 'utf8', timeout: 60000 });
  if (r.error) return `Gate: NOT RUN — ${r.error.message}`;
  const lines = `${r.stdout || ''}`.split('\n').filter((l) => l.startsWith('RESULT:'));
  if (!lines.length) {
    const why = `${r.stderr || ''}`.trim().split('\n').pop() || `exit ${r.status}, no RESULT line`;
    return `Gate: NOT RUN — ${why}`;
  }
  return `Gate: ${lines[lines.length - 1].trim()}`;
}
const hasGate = /^(RESULT:|Gate:)/.test(body);
const gate = hasGate ? '' : `${gateLine()}\n`;

// Skills changed since this role's previous entry on this desk (a long session read its skills once and
// never sees later edits). Previous entry = the last `## [HH:MM] <who>` heading in today's log, else in the
// newest earlier log that has one; its time is that date + HH:MM (local, minute start). Every
// <workspace>/.claude/skills/*/SKILL.md with a newer mtime is named. Never blocks the append.
function changedSkills() {
  try {
    const logDir = path.dirname(file);
    const days = fs.readdirSync(logDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f) && f <= `${today}.md`).sort().reverse();
    const esc = who.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^## \\[(\\d{2}):(\\d{2})\\] ${esc}\\s*$`, 'gm');
    let since = null;
    for (const f of days) {
      const hits = [...fs.readFileSync(path.join(logDir, f), 'utf8').matchAll(re)];
      if (!hits.length) continue;
      const [y, mo, da] = f.slice(0, 10).split('-').map(Number);
      const last = hits[hits.length - 1];
      since = new Date(y, mo - 1, da, Number(last[1]), Number(last[2])).getTime();
      break;
    }
    if (since === null) return '';
    const skills = path.join(here, '..', '..', '.claude', 'skills');
    if (!fs.existsSync(skills)) return '';
    const names = fs.readdirSync(skills).filter((n) => {
      const p = path.join(skills, n, 'SKILL.md');
      return fs.existsSync(p) && fs.statSync(p).mtimeMs > since;
    }).sort();
    return names.length ? `Skills changed since your last entry: ${names.join(', ')} — re-read them with the Skill tool before your next unit.` : '';
  } catch { return ''; }
}
const skillNote = changedSkills();

const entry = `\n## [${p2(d.getHours())}:${p2(d.getMinutes())}] ${who}\n${gate}${body}\n`;
// 'wx' creates the header only if no file exists; if a race created it first, fall through to append.
try {
  fs.writeFileSync(file, `# Log — ${today} — ${project}\n\n> Append-only. Every role adds an entry at session end. Format: see PROTOCOL.md.\n`, { flag: 'wx' });
} catch (e) { if (e.code !== 'EEXIST') throw e; }
fs.appendFileSync(file, entry);
console.log(`appended ${Buffer.byteLength(entry)} bytes to log/${today}.md (now ${fs.statSync(file).size} bytes)`);
if (skillNote) console.log(skillNote);
