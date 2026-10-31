#!/usr/bin/env node
// distill.mjs <Name> [--transcript <file.jsonl>] [--stub <model-output-file>] [--dry [--show]]
// distill.mjs <Name> --done
// The memory-card pilot's distill step (MARIE.md ORDER 43, owner GO 2026-10-30 14:43). Run by the pilot role itself
// (Porter, Sober, Silver on i-space — the list is the desk's checks.json "hygiene"."memory-cards"."pilot") when it
// has finished its own topic, before Atom may /clear it (ready-to-clear.mjs).
//
// 1. Takes THIS session's transcript (Claude's $CLAUDE_CODE_SESSION_ID, checked against the session-desk cache or
//    the process's `-n <Name>-<tag>`; else the newest transcript the session-desk cache gives this Name) from the
//    last distill mark onward (cards/<Name>.state.json), stripped to user and assistant TEXT only — no tool calls,
//    no tool output, no system reminders — plus cards/<Name>.capture.md.
// 2. Asks a cheap model once: `claude -p --model haiku --tools "" --no-session-persistence --setting-sources user`,
//    run from an empty temp folder (no desk hooks, no desk role, no tools). Each item must carry a verbatim quote
//    and its line; the script checks every quote against the cited line and flags the ones it cannot find.
// 3. Writes cards/<Name>.proposed.md. **It never writes the card.** The role keeps / edits / drops each item, moves
//    the kept ones into cards/<Name>.md (≤ 4 KB), then runs `distill.mjs <Name> --done`, which deletes
//    proposed.md and the capture lines this run consumed, and moves the mark (ready-to-clear.mjs reads it).
// Cost: the stripped input is capped at 60 KB (~15k tokens; one message ≤ 1,200 chars) and goes to haiku in one
// shot with a short system prompt — a fraction of one opus turn. --dry prints the size and calls nothing.
// --stub feeds a file as the model's answer (tests). Exit 0 ok · 1 refused (see message) · 2 usage/error.
// team-proposed, cheap to delete. Node built-ins only.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, CARD_CAP, cardsDir, pilotDesks, pilotName, sessionNameOfProcess, pilotBySession, stamp } from './cards-lib.mjs';

const args = process.argv.slice(2);
const flag = f => { const i = args.indexOf(f); return i >= 0 ? (args[i + 1] ?? '') : null; };
const NAME_IN = args[0];
const DONE = args.includes('--done');
const DRY = args.includes('--dry');
const INPUT_CAP = 60 * 1024;
const MSG_CAP = 1200;
const die = (code, msg) => { console.error(msg); process.exit(code); };

if (!NAME_IN || NAME_IN.startsWith('-')) die(2, 'usage: distill.mjs <Name> [--transcript <file>] [--stub <file>] [--dry] | <Name> --done');
const desk = pilotDesks().find(d => pilotName(d, NAME_IN));
if (!desk) die(2, `${NAME_IN} is not in any desk's memory-cards pilot (checks.json "hygiene"."memory-cards"."pilot")`);
const NAME = pilotName(desk, NAME_IN);
const dir = cardsDir(desk);
const F = {
  card: path.join(dir, `${NAME}.md`),
  capture: path.join(dir, `${NAME}.capture.md`),
  proposed: path.join(dir, `${NAME}.proposed.md`),
  state: path.join(dir, `${NAME}.state.json`),
};
const readState = () => { try { return JSON.parse(fs.readFileSync(F.state, 'utf8')); } catch { return {}; } };
const writeState = s => fs.writeFileSync(F.state, JSON.stringify(s, null, 2) + '\n');
const captureItems = () => { try { return fs.readFileSync(F.capture, 'utf8').split('\n').filter(l => l.startsWith('- ')); } catch { return []; } };
const rel = p => path.relative(ROOT, p).split(path.sep).join('/');

// ── --done: the role has reviewed proposed.md ────────────────────────────────────────────────────────────────
if (DONE) {
  const st = readState();
  if (!st.pending) die(1, `nothing to close: no distill run is pending for ${NAME} (run distill.mjs ${NAME} first)`);
  let cardBytes = 0; try { cardBytes = fs.statSync(F.card).size; } catch { /* no card yet */ }
  if (cardBytes > CARD_CAP) die(1, `${rel(F.card)} is ${cardBytes} B > ${CARD_CAP} B — trim it before --done`);
  if (fs.existsSync(F.capture) && st.pending.captureItems > 0) {
    const lines = fs.readFileSync(F.capture, 'utf8').split('\n');
    let drop = st.pending.captureItems;
    const kept = lines.filter(l => !(l.startsWith('- ') && drop-- > 0));
    const tmp = F.capture + '.tmp';
    fs.writeFileSync(tmp, kept.join('\n'));
    fs.renameSync(tmp, F.capture);
  }
  fs.rmSync(F.proposed, { force: true });
  writeState({ transcript: st.pending.transcript, lastLine: st.pending.toLine, distilledAt: new Date().toISOString(), distilledAtLocal: stamp() });
  console.log(`done: ${rel(F.proposed)} removed, ${st.pending.captureItems} capture line(s) consumed, mark at ${st.pending.transcript}:${st.pending.toLine}; card ${cardBytes} B`);
  process.exit(0);
}

// ── find this session's transcript ──────────────────────────────────────────────────────────────────────────
const projectsDir = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'projects');
const transcriptOf = sid => {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(sid || '')) return null;
  let ds = []; try { ds = fs.readdirSync(projectsDir); } catch { return null; }
  for (const d of ds) { const f = path.join(projectsDir, d, `${sid}.jsonl`); if (fs.existsSync(f)) return f; }
  return null;
};
const cacheDir = path.join(ROOT, '.claude', 'session-desk');
const cacheSays = sid => { try { return fs.readFileSync(path.join(cacheDir, sid), 'utf8').trim().split(/\s+/); } catch { return []; } };
function findTranscript() {
  const t = flag('--transcript');
  if (t !== null) return t && fs.existsSync(t) ? path.resolve(t) : die(2, `--transcript: no such file: ${t}`);
  // candidates: this process's own session (when it is this Name) and every session the cache gives this Name;
  // the live one is the newest-written (it is writing while it runs this), which also covers a stale id after /clear
  let best = null, bestM = 0;
  const sid = process.env.CLAUDE_CODE_SESSION_ID;
  const own = transcriptOf(sid);
  if (own) {
    const me = pilotBySession(sessionNameOfProcess());
    if (me && me.desk === desk && me.name === NAME) { best = own; bestM = fs.statSync(own).mtimeMs; }
  }
  let sids = []; try { sids = fs.readdirSync(cacheDir); } catch { /* none */ }
  for (const s of sids) {
    const [d, n] = cacheSays(s);
    if (d !== desk || !n || n.toLowerCase() !== NAME.toLowerCase()) continue;
    const f = transcriptOf(s); if (!f) continue;
    const m = fs.statSync(f).mtimeMs; if (m > bestM) { best = f; bestM = m; }
  }
  return best || die(2, `no transcript found for ${NAME} — pass --transcript <file.jsonl>`);
}

if (fs.existsSync(F.proposed)) die(1, `${rel(F.proposed)} is still open — review it, move the kept items into your card, then run distill.mjs ${NAME} --done`);
const transcript = findTranscript();
const base = path.basename(transcript);
const st = readState();
const all = fs.readFileSync(transcript, 'utf8').split('\n');
if (all.length && all[all.length - 1] === '') all.pop();
const from = st.transcript === base ? (st.lastLine || 0) : 0; // a new session (after /clear) starts at its top

// ── strip to user + assistant text ──────────────────────────────────────────────────────────────────────────
const clean = s => s.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();
const entries = []; // {line, who, text}
for (let i = from; i < all.length; i++) {
  let o; try { o = JSON.parse(all[i]); } catch { continue; }
  if (!o || o.isSidechain) continue;
  let who = null, text = '';
  if (o.type === 'user') {
    const c = o.message?.content;
    if (o.origin?.kind === 'peer' && typeof o.origin.body === 'string') { who = `peer ${o.origin.name || ''}`.trim(); text = o.origin.body; }
    else if (o.isMeta) continue;
    else if (typeof c === 'string') { who = 'user'; text = c; }
    else if (Array.isArray(c) && !c.some(x => x?.type === 'tool_result')) { who = 'user'; text = c.filter(x => x?.type === 'text').map(x => x.text).join('\n'); }
    if (/<command-name>|<local-command-stdout>|^Caveat: /.test(text)) continue;
  } else if (o.type === 'assistant' && Array.isArray(o.message?.content)) {
    who = 'assistant'; text = o.message.content.filter(x => x?.type === 'text').map(x => x.text).join('\n');
  }
  text = clean(text || '');
  if (who && text) entries.push({ line: i + 1, who, text });
}
const caps = captureItems();
const one = s => s.replace(/\s+/g, ' ').trim();
let tLines = entries.map(e => `[L${e.line}] ${e.who}: ${one(e.text).slice(0, MSG_CAP)}`);
const cLines = caps.map((l, k) => `[C${k + 1}] ${l.slice(2)}`);
let cut = 0;
const size = () => Buffer.byteLength(tLines.join('\n') + cLines.join('\n'));
while (tLines.length && size() > INPUT_CAP) { tLines.shift(); cut++; } // keep the most recent part
const toLine = all.length;

if (!entries.length && !caps.length) {
  if (!DRY) writeState({ transcript: base, lastLine: toLine, distilledAt: new Date().toISOString(), distilledAtLocal: stamp() });
  console.log(`nothing new since the last distill (${base} lines ${from + 1}–${toLine}, no capture) — ${DRY ? 'dry run' : 'marked distilled'}`);
  process.exit(0);
}

const prompt = `You read part of a work session of ${NAME} on the desk "${desk}", plus prompts captured from it.
List what ${NAME} must still know after its memory is wiped: decisions taken, working habits, corrections ${NAME} received, and the owner's preferences. Not task status, not progress, not facts that only describe the code.
Rules:
- One line per item, at most 15 items, no other text, no headings.
- Exact form: - <kind>: <the item, one short sentence> — source: "<verbatim quote, at most 200 characters, copied exactly from the cited line>" (<ref>)
- <kind> is one of: decision, habit, correction, owner-preference.
- <ref> is the id in brackets at the start of the line you quote, e.g. L123 or C4. The quote must appear in that line exactly as written.
- If nothing qualifies, output exactly: NONE

=== TRANSCRIPT (L<n> = transcript line n) ===
${tLines.join('\n')}

=== CAPTURED PROMPTS (C<n>) ===
${cLines.join('\n') || '(none)'}
`;
const inBytes = Buffer.byteLength(prompt);
if (DRY) { console.log(`dry run: ${base} lines ${from + 1}–${toLine}, ${entries.length} text message(s) (${cut} oldest cut), ${caps.length} capture line(s), prompt ${inBytes} B`); if (args.includes('--show')) console.log(prompt); process.exit(0); }

// ── the model ───────────────────────────────────────────────────────────────────────────────────────────────
let out;
const stub = flag('--stub');
if (stub !== null) out = fs.readFileSync(stub, 'utf8');
else {
  const bin = process.env.DISTILL_CLAUDE || ['claude', path.join(os.homedir(), '.local', 'bin', 'claude')].find(b => b.includes('/') ? fs.existsSync(b) : spawnSync('sh', ['-c', `command -v ${b}`]).status === 0);
  if (!bin) die(2, 'claude CLI not found (set DISTILL_CLAUDE)');
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'distill-'));
  const r = spawnSync(bin, ['-p', '--model', 'haiku', '--tools', '', '--no-session-persistence', '--setting-sources', 'user',
    '--output-format', 'text', '--system-prompt', 'You extract short memory items from a work transcript. Output only the list the user asks for.'],
  { input: prompt, cwd, encoding: 'utf8', timeout: 240000, maxBuffer: 4 * 1024 * 1024 });
  fs.rmSync(cwd, { recursive: true, force: true });
  if (r.status !== 0 || !r.stdout) die(2, `model call failed (exit ${r.status}${r.error ? ', ' + r.error.code : ''}): ${(r.stderr || '').slice(0, 300)}`);
  out = r.stdout;
}

// ── check every quote, write proposed.md ────────────────────────────────────────────────────────────────────
const byLine = new Map(entries.map(e => [e.line, e]));
const RE = /^\s*-\s*(decision|habit|correction|owner-preference)\s*:\s*(.+?)\s+—\s+source:\s*["“](.+?)["”]\s*\(\s*([LC])(\d+)\s*\)\s*$/i;
const items = [];
let unparsed = 0;
for (const l of out.split('\n')) {
  if (!l.trim() || /^\s*NONE\s*$/.test(l)) continue;
  const m = RE.exec(l);
  if (!m) { unparsed++; continue; }
  const [, kind, item, quote, kindRef, nStr] = m;
  const n = Number(nStr), q = one(quote);
  let pointer = null, ok = false;
  if (kindRef.toUpperCase() === 'L') {
    const e = byLine.get(n);
    ok = !!e && one(e.text).includes(q);
    pointer = `transcript ${base}:${n}`;
  } else {
    const c = caps[n - 1];
    ok = !!c && one(c).includes(q);
    const hit = ok && entries.find(e => e.who === 'user' && one(e.text).includes(q));
    pointer = hit ? `transcript ${base}:${hit.line}` : `capture ${(c || '').slice(2, 18)} ${((c || '').match(/\[[^\]]+\]/) || [''])[0]}`.trim();
  }
  items.push(`- ${kind.toLowerCase()}: ${item} — source: "${quote}" (${pointer})${ok ? '' : ' ⚠️ quote NOT found at the cited line — check it or drop it'}`);
}

const head = `# Proposed card items — ${NAME} (${desk}) — for ${NAME} to review, never copied as is

> Written by scripts/memory/distill.mjs ${stamp()} (ORDER 43). Source: ${base} lines ${from + 1}–${toLine}
> (${entries.length} text messages${cut ? `, ${cut} oldest cut to fit` : ''}) + ${caps.length} capture line(s); model haiku, one shot,
> input ${inBytes} B. **Review:** keep, edit or drop each line; move the kept ones into \`${rel(F.card)}\` (≤ 4 KB,
> one line each, pointers not copies); then run \`node scripts/memory/distill.mjs ${NAME} --done\` (deletes this file
> and the consumed capture lines). Only ${NAME} edits the card.

`;
fs.writeFileSync(F.proposed, head + (items.length ? items.join('\n') + '\n' : '(the model proposed nothing)\n') + (unparsed ? `\n<!-- ${unparsed} model line(s) not in the item form were dropped -->\n` : ''));
writeState({ ...st, pending: { transcript: base, toLine, captureItems: caps.length, at: new Date().toISOString() } });
console.log(`wrote ${rel(F.proposed)}: ${items.length} item(s), ${items.filter(i => i.includes('⚠️')).length} flagged, ${unparsed} unparsed; input ${inBytes} B`);
