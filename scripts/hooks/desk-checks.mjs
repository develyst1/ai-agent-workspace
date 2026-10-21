#!/usr/bin/env node
// desk-checks.mjs — helper for scripts/hooks/desk-checks.sh. Reads the hook JSON on stdin.
// Origin: MARIE-ORDER-2026-10-21-desk-checks.md (Atlas). team-proposed, cheap to delete.
//
// The desk is resolved from the PATH being written (never from the session): <root>/<desk>/… → the rules in
// <root>/<desk>/ai-worker/checks.json. No file, a bad file, a bad regex, any error → no output, exit 0.
//   checks.json = { "checks": [ { id, born, when: { write: "<glob, relative to the desk>" },
//                                 require?: regex, forbid?: regex, forbid_values_from?: "<desk-relative file>",
//                                 message } ] }
//   PreToolUse  Write|Edit|MultiEdit → content / new_string(s) tested against forbid + forbid_values_from.
//   PreToolUse  Bash → each `>` / `>>` / `>|` / `tee [-a]` target inside a desk; the whole command text is tested.
//   PostToolUse Write|Edit|MultiEdit → the file on disk must match `require` (multiline: ^ = start of a line).
// Output: Pre block → exit 2, reason on stderr. Post block → stdout {"decision":"block","reason":…}, exit 0.
// A forbidden VALUE is never printed — the reason names the check id, the message and the values file only.
// Values file: one value per line; blank lines, `#` lines and values shorter than 4 characters are ignored.
// The values file itself (and any *.local.txt under ai-worker/checks/) is never checked.
// $CHECKS_ROOT overrides the workspace root (scratch tests).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(process.env.CHECKS_ROOT || process.env.CLAUDE_PROJECT_DIR
  || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..'));

const quiet = () => process.exit(0);
process.on('uncaughtException', quiet);

function globRe(g) {
  let s = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*' && g[i + 1] === '*') {
      if (g[i + 2] === '/') { s += '(?:.*/)?'; i += 2; } else { s += '.*'; i += 1; }
    } else if (c === '*') s += '[^/]*';
    else if (c === '?') s += '[^/]';
    else s += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${s}$`);
}

const deskCache = new Map();
// abs path → { desk, deskDir, rel, checks } or null
function locate(abs) {
  const r = path.relative(ROOT, abs);
  if (!r || r.startsWith('..') || path.isAbsolute(r)) return null;
  const parts = r.split(path.sep);
  if (parts.length < 2) return null;
  const desk = parts[0];
  if (!deskCache.has(desk)) {
    let checks = null;
    try {
      const j = JSON.parse(fs.readFileSync(path.join(ROOT, desk, 'ai-worker', 'checks.json'), 'utf8'));
      if (Array.isArray(j.checks)) checks = j.checks.filter(c => c && typeof c === 'object' && c.id && c.when && typeof c.when.write === 'string');
    } catch { checks = null; }
    deskCache.set(desk, checks);
  }
  const checks = deskCache.get(desk);
  if (!checks || !checks.length) return null;
  return { desk, deskDir: path.join(ROOT, desk), rel: parts.slice(1).join('/'), checks };
}

const applies = (c, loc) => {
  try { return globRe(c.when.write).test(loc.rel); } catch { return false; }
};
const isValuesFile = (c, loc) =>
  (c.forbid_values_from && loc.rel === c.forbid_values_from) || /^ai-worker\/checks\/.*\.local\.txt$/.test(loc.rel);

function values(c, loc) {
  try {
    return fs.readFileSync(path.join(loc.deskDir, c.forbid_values_from), 'utf8').split(/\r?\n/)
      .map(v => v.trim()).filter(v => v.length >= 4 && !v.startsWith('#'));
  } catch { return []; }
}

// the first forbid hit for this text, as a reason (no value in it), or ''
function forbidHit(loc, text) {
  for (const c of loc.checks) {
    if (!applies(c, loc) || isValuesFile(c, loc)) continue;
    if (typeof c.forbid === 'string') {
      let re = null;
      try { re = new RegExp(c.forbid, 'm'); } catch { re = null; }
      if (re && re.test(text)) return `Blocked by desk check "${c.id}" (${c.born || 'no born'}) on ${loc.desk}/${loc.rel}: ${c.message || ''}`;
    }
    if (typeof c.forbid_values_from === 'string') {
      if (values(c, loc).some(v => text.includes(v)))
        return `Blocked by desk check "${c.id}" (${c.born || 'no born'}) on ${loc.desk}/${loc.rel}: ${c.message || ''} (a value listed in ${loc.desk}/${c.forbid_values_from} is in the text being written; the value is not shown here)`;
    }
  }
  return '';
}

function bashTargets(cmd, cwd) {
  const out = [];
  const add = t => {
    t = t.replace(/^['"]|['"]$/g, '');
    if (!t || t === '/dev/null' || t.startsWith('&')) return;
    if (t.startsWith('~/')) t = path.join(process.env.HOME || '', t.slice(2));
    out.push(path.resolve(cwd || ROOT, t));
  };
  for (const m of cmd.matchAll(/(?:^|[^<>&\d])\d*(?:&)?(>>|>\||>)(?!&)[ \t]*("[^"\n]*"|'[^'\n]*'|[^\s;&|<>()]+)/g)) add(m[2]);
  for (const m of cmd.matchAll(/(?:^|[\s;&|(])tee((?:[ \t]+(?:-[a-zA-Z]+|"[^"\n]*"|'[^'\n]*'|[^\s;&|<>()]+))+)/g))
    for (const a of m[1].trim().match(/"[^"\n]*"|'[^'\n]*'|\S+/g) || []) if (!a.startsWith('-')) add(a);
  return out;
}

let raw = '';
try { raw = fs.readFileSync(0, 'utf8'); } catch { quiet(); }
let input;
try { input = JSON.parse(raw); } catch { quiet(); }
const event = input.hook_event_name || '';
const tool = input.tool_name || '';
const ti = input.tool_input || {};
const cwd = typeof input.cwd === 'string' ? input.cwd : ROOT;

if (event === 'PreToolUse' && /^(Write|Edit|MultiEdit)$/.test(tool)) {
  if (typeof ti.file_path !== 'string') quiet();
  const loc = locate(path.resolve(cwd, ti.file_path));
  if (!loc) quiet();
  const text = [ti.content, ti.new_string, ...(Array.isArray(ti.edits) ? ti.edits.map(e => e && e.new_string) : [])]
    .filter(s => typeof s === 'string').join('\n');
  const why = forbidHit(loc, text);
  if (why) { process.stderr.write(why + '\n'); process.exit(2); }
  quiet();
}

if (event === 'PreToolUse' && tool === 'Bash') {
  const cmd = typeof ti.command === 'string' ? ti.command : '';
  if (!/>|\btee\b/.test(cmd)) quiet();
  for (const t of bashTargets(cmd, cwd)) {
    const loc = locate(t);
    if (!loc) continue;
    const why = forbidHit(loc, cmd);
    if (why) { process.stderr.write(why + '\n'); process.exit(2); }
  }
  quiet();
}

if (event === 'PostToolUse' && /^(Write|Edit|MultiEdit)$/.test(tool)) {
  if (typeof ti.file_path !== 'string') quiet();
  const abs = path.resolve(cwd, ti.file_path);
  const loc = locate(abs);
  if (!loc) quiet();
  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch { quiet(); }
  for (const c of loc.checks) {
    if (typeof c.require !== 'string' || !applies(c, loc)) continue;
    let re = null;
    try { re = new RegExp(c.require, 'm'); } catch { continue; }
    if (!re.test(text)) {
      process.stdout.write(JSON.stringify({ decision: 'block',
        reason: `Desk check "${c.id}" (${c.born || 'no born'}) failed on ${loc.desk}/${loc.rel} after your edit: ${c.message || ''} Fix the file now.` }) + '\n');
      process.exit(0);
    }
  }
  quiet();
}
quiet();
