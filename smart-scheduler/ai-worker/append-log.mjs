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
// Rollover (ORDER 46, opt-in): checks.json "hygiene": { "log-rollover": { "part-kb": 90 } }. Today's parts are
// log/<date>.md, then log/<date>.2.md, .3.md, … When the latest part is at or above part-kb, this run starts the next
// part (first line `# Log <date> — part N (continues part N-1)`) and closes the previous one with
// `→ continued in log/<date>.N.md`. Choosing the part and writing is done under log/.append.lock (open 'wx'), so two
// roles appending at once never both start a part. No key ⇒ no rollover, no lock: the old behaviour.
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
const logDir = path.join(here, 'log');
fs.mkdirSync(logDir, { recursive: true });
// part number of a log file name: 2026-10-30.md → 1, 2026-10-30.2.md → 2; anything else → null
const partOf = (f) => { const m = /^(\d{4}-\d{2}-\d{2})(?:\.(\d+))?\.md$/.exec(f); return m ? { date: m[1], n: m[2] ? Number(m[2]) : 1 } : null; };
const partName = (n) => (n === 1 ? `${today}.md` : `${today}.${n}.md`);
let partBytes = 0;
try {
  const kb = JSON.parse(fs.readFileSync(path.join(here, 'checks.json'), 'utf8'))?.hygiene?.['log-rollover']?.['part-kb'];
  if (typeof kb === 'number' && kb > 0) partBytes = Math.round(kb * 1024);
} catch { partBytes = 0; }

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
// never sees later edits). Previous entry = the last `## [HH:MM] <who>` heading in today's log (all its parts,
// latest part first), else in the newest earlier log that has one; its time is that date + HH:MM. Every
// <workspace>/.claude/skills/*/SKILL.md with a newer mtime is named. Never blocks the append.
function changedSkills() {
  try {
    const days = fs.readdirSync(logDir).map((f) => ({ f, p: partOf(f) })).filter((x) => x.p && x.p.date <= today)
      .sort((a, b) => (a.p.date === b.p.date ? b.p.n - a.p.n : a.p.date < b.p.date ? 1 : -1)).map((x) => x.f);
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
const header = `# Log — ${today} — ${project}\n\n> Append-only. Every role adds an entry at session end. Format: see PROTOCOL.md.\n`;
// 'wx' creates a file only if it does not exist; if a race created it first, fall through.
const createOnce = (f, text) => { try { fs.writeFileSync(f, text, { flag: 'wx' }); return true; } catch (e) { if (e.code !== 'EEXIST') throw e; return false; } };

// log/.append.lock: held only for choose-part + write (milliseconds; the gate ran above, outside it). A lock older
// than 30 s is a crashed run's and is removed. After 15 s of waiting we append anyway — an entry is never dropped.
const lockFile = path.join(logDir, '.append.lock');
const nap = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function lock() {
  const until = Date.now() + 15000;
  for (;;) {
    try { fs.writeFileSync(lockFile, `${process.pid} ${new Date().toISOString()}\n`, { flag: 'wx' }); return true; } catch (e) { if (e.code !== 'EEXIST') throw e; }
    try { if (Date.now() - fs.statSync(lockFile).mtimeMs > 30000) { fs.rmSync(lockFile, { force: true }); continue; } } catch { continue; }
    if (Date.now() > until) { console.error('append-log: log/.append.lock busy for 15 s — appending without it'); return false; }
    nap(20 + Math.floor(Math.random() * 30));
  }
}

let target = partName(1);
let rolled = '';
const held = partBytes > 0 ? lock() : false;
try {
  createOnce(path.join(logDir, partName(1)), header);
  if (partBytes > 0) {
    let n = 1;
    for (const f of fs.readdirSync(logDir)) { const p = partOf(f); if (p && p.date === today && p.n > n) n = p.n; }
    target = partName(n);
    if (fs.statSync(path.join(logDir, target)).size >= partBytes) {
      const next = partName(n + 1);
      if (createOnce(path.join(logDir, next), `# Log ${today} — part ${n + 1} (continues part ${n})\n\n> Append-only. Every role adds an entry at session end. Format: see PROTOCOL.md.\n`)) {
        fs.appendFileSync(path.join(logDir, target), `\n→ continued in log/${next}\n`);
        rolled = `log/${target} reached ${fs.statSync(path.join(logDir, target)).size} bytes ≥ ${partBytes}: started log/${next}`;
      }
      target = next;
    }
  }
  const file = path.join(logDir, target);
  fs.appendFileSync(file, entry);
  if (rolled) console.log(rolled);
  console.log(`appended ${Buffer.byteLength(entry)} bytes to log/${target} (now ${fs.statSync(file).size} bytes)`);
} finally {
  if (held) fs.rmSync(lockFile, { force: true });
}
if (skillNote) console.log(skillNote);
