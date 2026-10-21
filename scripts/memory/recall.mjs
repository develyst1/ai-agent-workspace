#!/usr/bin/env node
// recall.mjs <desk> [--deep|--hook] <words…>
// Looks the words up in <desk>/ai-worker/memory/MAP.md (`[[name]] · aliases: a, b · kind`) and brings the knots back.
//   default  each hit knot's file (memory/<name>.md) in full, then the names of its [[threads]]
//   --hook   at most 3 knots; line 1 + up to 3 more lines (🔴, then 💚, then plain) + thread names, prefixed `จำได้ [<name>]:`;
//            no hit (or no MAP) → prints nothing, exit 0
//   --deep   default + the lines each knot's sources point to, ±2 lines:
//            `chat <session> <YYYY-MM-DD> <HH:MM>` → memory/digest/<date>.md · `digest <date>[:line]`
//            `talk <file>[:line]` → talks/<file> · `<path>:<line>` → desk ai-worker/, desk, then workspace root
// Matching is exact (no guessing): a name or alias counts when it appears in the words, case-insensitive;
// Latin/digit terms must not touch other letters, digits, `-` or `_` (JE ≠ object, ODA ≠ usb-oda), Thai may sit inside a sentence
// ("ถามพี่ชายเรื่อง…" hits "พี่ชาย"). Every hit is logged to memory/hits.log as `<date time> <knot> <mode>`.
// <desk> may also be a path to a desk folder (used for scratch tests). Design: BUNNY-DESIGN-2026-10-20.md §5.4.
// Node built-ins only.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const desk = args.shift();
let mode = 'default';
const words = [];
for (const a of args) {
  if (a === '--deep') mode = 'deep';
  else if (a === '--hook') mode = 'hook';
  else words.push(a);
}
const quiet = mode === 'hook';
const fail = (msg, code = 1) => { if (!quiet) console.error(msg); process.exit(quiet ? 0 : code); };
if (!desk || !words.length) fail('usage: node scripts/memory/recall.mjs <desk> [--deep|--hook] <words…>', 2);

const deskRoot = desk.includes('/') ? path.resolve(desk) : path.join(ROOT, desk);
const aiw = path.join(deskRoot, 'ai-worker');
const mem = path.join(aiw, 'memory');
const mapFile = path.join(mem, 'MAP.md');
if (!fs.existsSync(mapFile)) fail(`no ${mapFile}`);

// MAP lines → knots
const knots = [];
for (const line of fs.readFileSync(mapFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*(?:[-*]\s*)?\[\[([^\]]+)\]\](.*)$/);
  if (!m) continue;
  const name = m[1].trim();
  const al = m[2].match(/aliases?:\s*([^·]*)/i);
  const aliases = al ? al[1].split(',').map(s => s.trim()).filter(Boolean) : [];
  knots.push({ name, terms: [name, ...aliases] });
}

const text = words.join(' ').toLowerCase();
// Word edge for Latin/ASCII aliases: `-` and `_` count as part of a word, so "ODA" never hits inside "usb-oda"
// and "JE" never inside "objects" (Atlas 2026-10-20). Thai aliases keep substring matching.
const isLatin = ch => /[a-z0-9_-]/i.test(ch || '');
function firstAt(term) {
  const t = term.toLowerCase();
  let i = text.indexOf(t);
  while (i >= 0) {
    const before = text[i - 1], after = text[i + t.length];
    const edgeOk = (!isLatin(t[0]) || !isLatin(before)) && (!isLatin(t[t.length - 1]) || !isLatin(after));
    if (edgeOk) return i;
    i = text.indexOf(t, i + 1);
  }
  return -1;
}
let hits = [];
for (const k of knots) {
  const pos = Math.min(...k.terms.map(firstAt).map(p => (p < 0 ? Infinity : p)));
  if (pos !== Infinity) hits.push({ ...k, pos });
}
const readKnot = name => {
  const f = path.join(mem, `${name}.md`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

// Feeling marks (BUNNY-DESIGN §11): a knot line `- 🔴 …` (never again) or `- 💚 …` (do this again), optional `×N`.
// After line 1, lines go 🔴 first, then 💚 (higher ×N first within each), then plain — original order otherwise.
const FEEL = /^\s*(?:[-*]\s*)?(🔴|💚)/u;
const feelRank = l => { const m = l.match(FEEL); return m ? (m[1] === '🔴' ? 0 : 1) : 2; };
const timesOf = l => { const m = l.match(/×\s*(\d+)/); return m ? Number(m[1]) : 1; };
const byFeeling = (a, b) => feelRank(a) - feelRank(b) || (feelRank(a) < 2 ? timesOf(b) - timesOf(a) : 0);
const hasFeeling = body => body != null && body.split('\n').some(l => feelRank(l) < 2);
// Full-file order for default/--deep: everything up to line 1 and the blank lines after it stays put; the rest is reordered.
function feelingOrder(body) {
  const lines = body.split('\n');
  let i = lines.findIndex(l => l.trim());
  if (i < 0) return body;
  i++;
  while (i < lines.length && !lines[i].trim()) i++;
  return [...lines.slice(0, i), ...lines.slice(i).sort(byFeeling)].join('\n');
}

// A knot with a feeling-marked line wins a tie against one without.
for (const h of hits) h.feel = hasFeeling(readKnot(h.name)) ? 0 : 1;
hits.sort((a, b) => a.pos - b.pos || a.feel - b.feel);
if (!hits.length) { if (!quiet) console.error(`no knot for: ${words.join(' ')}`); process.exit(0); }
if (mode === 'hook') hits = hits.slice(0, 3);
const threadsOf = (body, self) => [...new Set([...body.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1].trim()))].filter(n => n !== self);

function around(file, line, label) {
  if (!fs.existsSync(file)) return `  (${label}: file not found)`;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const from = Math.max(0, line - 3), to = Math.min(lines.length, line + 2);
  return [`  ── ${label}`, ...lines.slice(from, to).map((l, i) => `  ${String(from + i + 1).padStart(5)}${from + i + 1 === line ? '>' : ' '} ${l}`)].join('\n');
}
function deepSources(body) {
  const out = [], seen = new Set();
  const add = (key, fn) => { if (!seen.has(key)) { seen.add(key); out.push(fn()); } };
  for (const m of body.matchAll(/\bchat\s+([0-9a-f][0-9a-f-]{5,})\S*\s+(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})/g)) {
    const [, sess, date, time] = m;
    add(m[0], () => {
      const f = path.join(mem, 'digest', `${date}.md`);
      if (!fs.existsSync(f)) return `  (chat ${sess} ${date} ${time}: no digest — run extract-day.mjs)`;
      const lines = fs.readFileSync(f, 'utf8').split('\n');
      let inSec = false, at = -1;
      const hm = `[${time.padStart(5, '0')}]`;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('## ')) inSec = lines[i].includes(sess);
        else if (inSec && lines[i].startsWith(hm)) { at = i + 1; break; }
      }
      return at > 0 ? around(f, at, `chat ${sess} ${date} ${time} → digest/${date}.md:${at}`) : `  (chat ${sess} ${date} ${time}: not in digest)`;
    });
  }
  for (const m of body.matchAll(/\bdigest\s+(\d{4}-\d{2}-\d{2})(?::(\d+))?/g))
    add(m[0], () => around(path.join(mem, 'digest', `${m[1]}.md`), Number(m[2] || 1), `digest/${m[1]}.md:${m[2] || 1}`));
  for (const m of body.matchAll(/\btalk\s+([^\s:)`,]+)(?::(\d+))?/g))
    add(m[0], () => around(path.join(aiw, 'talks', m[1]), Number(m[2] || 1), `talks/${m[1]}:${m[2] || 1}`));
  for (const m of body.matchAll(/(?<![\w/.-])((?:[\w.-]+\/)*[\w.-]+\.[A-Za-z]{1,5}):(\d+)/g)) {
    if (/^digest\/|^talks\//.test(m[1]) || /\btalk\s+$/.test(body.slice(Math.max(0, m.index - 6), m.index))) continue;
    add(m[0], () => {
      const f = [path.join(aiw, m[1]), path.join(deskRoot, m[1]), path.join(ROOT, m[1])].find(p => fs.existsSync(p)) || m[1];
      return around(f, Number(m[2]), `${m[1]}:${m[2]}`);
    });
  }
  return out;
}

const out = [];
for (const h of hits) {
  const body = readKnot(h.name);
  if (mode === 'hook') {
    if (body == null) continue;
    const lines = body.split('\n').map(l => l.replace(/^\s*(?:#+|[-*])\s*/, '').trim()).filter(l => l && !l.startsWith('~~')); // struck facts are not served
    const th = threadsOf(body, h.name);
    out.push(`จำได้ [${h.name}]: ${[lines[0], ...lines.slice(1).sort(byFeeling).slice(0, 3)].join(' · ')}${th.length ? ` → ${th.map(t => `[[${t}]]`).join(' · ')}` : ''}`);
  } else {
    out.push(`═══ memory/${h.name}.md`);
    out.push(body == null ? `(knot file missing: memory/${h.name}.md)` : feelingOrder(body).trimEnd());
    const th = body ? threadsOf(body, h.name) : [];
    out.push(`threads: ${th.length ? th.map(t => `[[${t}]]`).join(' · ') : '(none)'}`);
    if (mode === 'deep' && body) {
      const src = deepSources(body);
      out.push('sources:', ...(src.length ? src : ['  (no source lines found)']));
    }
    out.push('');
  }
}
if (out.length) console.log(out.join('\n'));

// hits.log — every knot that was served
try {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  const served = mode === 'hook' ? hits.filter(h => readKnot(h.name) != null) : hits;
  fs.appendFileSync(path.join(mem, 'hits.log'), served.map(h => `${stamp} ${h.name} ${mode}\n`).join(''));
} catch { /* logging must never break a hook */ }
