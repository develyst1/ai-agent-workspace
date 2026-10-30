#!/usr/bin/env node
// new-id.mjs — the only way a role creates a REQ, SPEC, TASK or TEST file. It picks the number; you never do.
//   node ai-worker/new-id.mjs <REQ|SPEC|TASK|TEST> <slug>        e.g.  node ai-worker/new-id.mjs TASK caw-back-export
// Under a lock file (exclusive create, retried), it finds the highest `<TYPE>-<digits>` in that type's folder
// (requirements/ specs/ tasks/ tests/), takes the next number — never below 101, this desk's start (PROTOCOL.md
// § Hard boundaries: the old team's IDs are never reused) — and creates `<TYPE>-<n>-<slug>.md` with an exclusive
// create (`wx`). On EEXIST it tries the next number. It never overwrites. It prints the new file's path; the
// file holds one heading line, `# <TYPE>-<n>: <slug>` — fill it from your role's template.
// Refuses (writes nothing, exit 1) on: a bad slug, a missing folder, a lock held too long. Exit 2 = usage.
// No dependencies.
// Why: F-008 (2026-10-29) — two SAs listed tasks/, wrote for several minutes, then both created TASK-105/106.
// Checking the folder early is not checking it at write time. Owned by Marie. Origin: ORDER 42 (P4), MARIE.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FOLDERS = { REQ: 'requirements', SPEC: 'specs', TASK: 'tasks', TEST: 'tests' };
const START = 101; // this desk's first number; below it are the old team's IDs
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

let locked = null; // the lock path while we hold it — process.exit skips `finally`, so refuse releases it
const refuse = (msg) => {
  if (locked) { try { fs.unlinkSync(locked); } catch {} }
  console.error(`REFUSED: ${msg}\nNothing written.`);
  process.exit(1);
};
const [type, slug] = process.argv.slice(2);
if (!FOLDERS[type] || !slug || process.argv.length > 4) {
  console.error('usage: node ai-worker/new-id.mjs <REQ|SPEC|TASK|TEST> <slug>   e.g. TASK caw-back-export');
  process.exit(2);
}
if (!SLUG.test(slug)) refuse(`slug "${slug}" — use lower-case words joined by "-" (a-z, 0-9), e.g. caw-back-export`);

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, FOLDERS[type]);
if (!fs.existsSync(dir)) refuse(`${FOLDERS[type]}/ not found next to new-id.mjs`);

// Lock: exclusive create, retried. A lock older than STALE_MS is left over from a crashed run.
const lock = path.join(here, `new-id.${type}.lock`);
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
    if (Date.now() - started > WAIT_MS) refuse(`${path.basename(lock)} has been held for more than ${WAIT_MS / 1000} s — another new-id run is stuck; check it, then retry`);
    sleep(STEP_MS + Math.floor(Math.random() * STEP_MS));
  }
}

let rel;
try {
  const re = new RegExp(`^${type}-(\\d+)(?!\\d)`);
  let max = START - 1;
  for (const f of fs.readdirSync(dir)) {
    const m = re.exec(f);
    if (m && Number(m[1]) > max) max = Number(m[1]);
  }
  for (let n = max + 1; ; n++) {
    const id = `${type}-${String(n).padStart(3, '0')}`;
    const file = path.join(dir, `${id}-${slug}.md`);
    try { fs.writeFileSync(file, `# ${id}: ${slug}\n`, { flag: 'wx' }); }
    catch (e) { if (e.code === 'EEXIST') continue; throw e; }
    rel = `ai-worker/${FOLDERS[type]}/${id}-${slug}.md`;
    break;
  }
} finally {
  try { fs.unlinkSync(lock); } catch {}
  locked = null;
}
console.log(rel);
