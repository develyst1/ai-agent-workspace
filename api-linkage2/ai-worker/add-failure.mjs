#!/usr/bin/env node
// add-failure.mjs — the only way a role adds an entry to FAILURES.md. It picks the id; you never do.
//   node ai-worker/add-failure.mjs <entry-file>
// The entry file holds ONE entry, written as the FAILURES.md header shows, heading
//   ## F-NNN — YYYY-MM-DD — <Role> — <one line: what went wrong>
// and a `- **Status:** …` line. Under a lock file (exclusive create, retried), this script finds the
// highest `## F-<digits>` id in FAILURES.md, gives the entry the next one, forces `Status:** NEW`,
// inserts it directly under the `<!-- newest entry goes directly below this line -->` marker, and
// prints the id. Two roles running it at the same moment get two different ids.
// Refuses (writes nothing, exit 1) on: no such heading, more than one heading, no Status line,
// no marker. Exit 2 = usage. No dependencies.
// Why: intelligence-space FAILURES ids collided twice in four days (F-057, F-071) — two writers took
// "the next number" at the same time. Owned by Marie. Origin: MARIE-ORDER-2026-10-13-kill-hook-and-failure-ids.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MARKER = '<!-- newest entry goes directly below this line -->';
const HEADING = /^##[ \t]+F-(?:NNN|\d+)[ \t]+—[ \t]+\d{4}-\d{2}-\d{2}[ \t]+—[ \t]+\S.*?[ \t]+—[ \t]+\S.*$/;
const ANY_HEADING = /^##[ \t]+F-/;
const STATUS = /^([ \t]*-[ \t]*)\*\*Status:\*\*.*$/m;

let locked = null; // the lock path while we hold it — process.exit skips `finally`, so refuse releases it
const refuse = (msg) => {
  if (locked) { try { fs.unlinkSync(locked); } catch {} }
  console.error(`REFUSED: ${msg}\nNothing written.`);
  process.exit(1);
};
const arg = process.argv[2];
if (!arg) { console.error('usage: node ai-worker/add-failure.mjs <entry-file>'); process.exit(2); }

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, 'FAILURES.md');
const entryPath = path.resolve(arg);
if (entryPath === target) refuse('give the scratch file holding your entry, not FAILURES.md itself');
if (!fs.existsSync(entryPath)) refuse(`${arg} not found`);

// Check the entry before taking the lock.
let entry = fs.readFileSync(entryPath, 'utf8').replace(/\r\n/g, '\n').trim();
if (!entry) refuse(`${arg} is empty`);
const lines = entry.split('\n');
if (!HEADING.test(lines[0])) {
  refuse(`the first line must be the heading "## F-NNN — YYYY-MM-DD — <Role> — <what went wrong>" (em dashes); got: ${lines[0]}`);
}
if (lines.slice(1).some((l) => ANY_HEADING.test(l))) refuse('one entry per run — the file holds more than one "## F-" heading');
if (!STATUS.test(entry)) refuse('no "- **Status:** …" line in the entry');
entry = entry.replace(STATUS, '$1**Status:** NEW');

// Lock: exclusive create, retried. A lock older than STALE_MS is left over from a crashed run.
const lock = `${target}.lock`;
const STALE_MS = 60_000, WAIT_MS = 15_000, STEP_MS = 25;
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const started = Date.now();
for (;;) {
  try { fs.writeFileSync(lock, `${process.pid} ${new Date().toISOString()}\n`, { flag: 'wx' }); locked = lock; break; }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    try {
      if (Date.now() - fs.statSync(lock).mtimeMs > STALE_MS) { fs.unlinkSync(lock); console.error('removed a stale lock (older than 60 s)'); continue; }
    } catch { continue; } // the holder released it between our two calls
    if (Date.now() - started > WAIT_MS) refuse(`${path.basename(lock)} has been held for more than ${WAIT_MS / 1000} s — another add-failure run is stuck; check it, then retry`);
    sleep(STEP_MS + Math.floor(Math.random() * STEP_MS));
  }
}

let id;
try {
  if (!fs.existsSync(target)) refuse(`${target} not found`);
  const text = fs.readFileSync(target, 'utf8');
  const at = text.indexOf(MARKER);
  if (at < 0) refuse(`no "${MARKER}" line in FAILURES.md`);
  if (text.indexOf(MARKER, at + 1) >= 0) refuse('the marker line appears more than once in FAILURES.md');
  let max = 0, width = 3;
  for (const m of text.matchAll(/^##[ \t]+F-(\d+)\b/gm)) {
    const v = Number(m[1]);
    if (v > max) max = v;
    width = Math.max(width, m[1].length);
  }
  id = `F-${String(max + 1).padStart(width, '0')}`;
  const body = entry.replace(/^(##[ \t]+)F-(?:NNN|\d+)/, `$1${id}`);
  const head = text.slice(0, at + MARKER.length);
  const rest = text.slice(at + MARKER.length).replace(/^\n+/, '');
  const out = `${head}\n\n${body}\n${rest ? `\n${rest}` : ''}`;
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, out);
  fs.renameSync(tmp, target);
} finally {
  try { fs.unlinkSync(lock); } catch {}
  locked = null;
}
console.log(`${id} added to ${path.basename(path.dirname(here))}/ai-worker/FAILURES.md (Status: NEW)`);
