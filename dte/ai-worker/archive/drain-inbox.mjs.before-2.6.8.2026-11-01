#!/usr/bin/env node
// drain-inbox.mjs — the only way a role deletes messages from its inbox.
//   node ai-worker/drain-inbox.mjs <INBOX-NAME>                       print every message, write nothing
//   node ai-worker/drain-inbox.mjs <INBOX-NAME> <hash> <line> [<line>…]  delete exactly those lines
// <INBOX-NAME> is the file name in ai-worker/inbox/, with or without `.md` (e.g. PM, SA-B).
// Print mode shows every line after the header with its line number, and a short hash of the file.
// Delete mode refuses unless the file still has that hash (a message arrived since you read it),
// refuses a header line or a line number that does not exist, and never takes a pattern.
// Why a tool: three inboxes lost unread messages in one day under a prose rule (Atlas order 2026-10-12).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const usage = 'usage: node drain-inbox.mjs <INBOX-NAME>  |  node drain-inbox.mjs <INBOX-NAME> <hash> <line> [<line>…]';
const [name, hash, ...lineArgs] = process.argv.slice(2);
if (!name) { console.error(usage); process.exit(2); }
if (!/^[A-Za-z0-9_-]+(\.md)?$/.test(name)) { console.error(`refused: "${name}" is not an inbox name (letters, digits, - and _ only)`); process.exit(2); }

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, 'inbox', name.endsWith('.md') ? name : `${name}.md`);
if (!fs.existsSync(file)) { console.error(`refused: ${path.relative(path.dirname(here), file)} does not exist`); process.exit(2); }

const shortHash = (text) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);

// Header = line 1 (`# Inbox — …`) plus the `>` lines right under it (blank lines between them allowed).
// Everything after the last such `>` line is body.
function headerEnd(lines) {
  if (!/^#\s/.test(lines[0] || '')) return 0;
  let end = 1;
  for (let i = 1; i < lines.length; i++) {
    if (/^>/.test(lines[i])) end = i + 1;
    else if (lines[i].trim() !== '') break;
  }
  return end; // count of header lines (1-based last header line number)
}

const text = fs.readFileSync(file, 'utf8');
const lines = text.split('\n');
const trailingNewline = text.endsWith('\n');
if (trailingNewline) lines.pop();
const hEnd = headerEnd(lines);
const rel = path.relative(path.dirname(here), file);

if (hash === undefined) {
  const msgs = [];
  lines.forEach((l, i) => { if (i >= hEnd && l.trim() !== '') msgs.push(`${String(i + 1).padStart(4)}: ${l}`); });
  console.log(`${rel} — hash ${shortHash(text)} — ${msgs.length} message line(s), header = lines 1-${hEnd}`);
  if (msgs.length) console.log(msgs.join('\n'));
  else console.log('(empty — nothing waiting)');
  console.log(`To delete, after acting on them: node ai-worker/drain-inbox.mjs ${name} ${shortHash(text)} <line> [<line>…]`);
  process.exit(0);
}

if (!lineArgs.length) { console.error(`refused: no line numbers given — nothing deleted\n${usage}`); process.exit(2); }
if (hash !== shortHash(text)) {
  console.error(`refused: ${rel} changed since you printed it (hash now ${shortHash(text)}, you gave ${hash}) — a message may have arrived. Print it again, read it, then retry. Nothing deleted.`);
  process.exit(1);
}
const targets = new Set();
for (const a of lineArgs) {
  if (!/^\d+$/.test(a)) { console.error(`refused: "${a}" is not a line number (patterns are never accepted) — nothing deleted`); process.exit(2); }
  const n = Number(a);
  if (n < 1 || n > lines.length) { console.error(`refused: line ${n} does not exist (file has ${lines.length}) — nothing deleted`); process.exit(1); }
  if (n <= hEnd) { console.error(`refused: line ${n} is part of the header (lines 1-${hEnd}) — nothing deleted`); process.exit(1); }
  targets.add(n);
}

const kept = lines.filter((_, i) => !targets.has(i + 1));
const out = kept.join('\n') + (trailingNewline ? '\n' : '');
// Re-check right before writing, so a message appended while we ran is not lost.
if (shortHash(fs.readFileSync(file, 'utf8')) !== hash) {
  console.error(`refused: ${rel} changed while running — nothing deleted. Print it again.`);
  process.exit(1);
}
const tmp = `${file}.drain-${process.pid}.tmp`;
fs.writeFileSync(tmp, out);
fs.renameSync(tmp, file);
console.log(`deleted ${targets.size} line(s) from ${rel}:`);
[...targets].sort((a, b) => a - b).forEach((n) => console.log(`${String(n).padStart(4)}: ${lines[n - 1]}`));
console.log(`${rel} — hash now ${shortHash(out)} — ${kept.length} line(s) left`);
