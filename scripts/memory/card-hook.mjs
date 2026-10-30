#!/usr/bin/env node
// card-hook.mjs capture [<desk> <Name> <ROLE>]   (stdin: the UserPromptSubmit hook input)
// card-hook.mjs start                            (stdin: the SessionStart hook input)
// Helper for scripts/hooks/memory-cards.sh — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43).
// team-proposed, cheap to delete: remove this file, cards-lib.mjs, memory-cards.sh and its two blocks in
// .claude/settings.json and scripts/run/run-settings.json.
//
// Who the session is: for `capture`, the desk line from scripts/memory/session-desk.mjs (passed by the hook, as
// memory-cue.sh does); when that is empty, and always for `start`, the session name of the Claude process
// (`claude -n <Name>-ISP`, which survives /clear) looked up in the pilot desk's TEAMS.md "Session name" column.
// For `start` with source resume|compact and no process name, the session-desk cache of this session_id is read
// (read only). Nothing happens unless the desk's checks.json switches the pilot on and the name is in its pilot.
//
// capture: appends one line to <desk>/ai-worker/cards/<Name>.capture.md —
//   `- <YYYY-MM-DD HH:MM> [<source>] (s:<session8>) <prompt, newlines as ⏎, ≤1500 chars>`
//   source: `peer` (a cross-session message), `owner via Atom` (Atom relaying the owner), `Atom`, else `owner`.
//   Skipped: empty prompts, bare nudges (ไปเลย / ไปต่อ / continue / ok …), Atom's inbox nudge line, slash
//   commands, machine-made turns (<task-notification>, local command / bash echoes). No model call. The capture file stops growing at 256 KB.
// start: prints {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":…}} with the card (≤4 KB)
//   and a pointer to RESUME-HERE.md.
// Never throws, never blocks: any error → no output, exit 0.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CARD_CAP, cardsDir, inPilot, pilotName, sessionNameOfProcess, pilotBySession, stamp } from './cards-lib.mjs';

const CAPTURE_CAP = 256 * 1024;
const [mode, deskArg, nameArg] = process.argv.slice(2);

const TRIVIAL = new Set(['', 'ไปเลย', 'ไปต่อ', 'ต่อ', 'ทำต่อ', 'ต่อเลย', 'ลุย', 'ลุยเลย', 'continue', 'go', 'go on', 'goon',
  'ok', 'okay', 'k', 'yes', 'y', 'ใช่', 'ได้', 'ได้เลย', 'โอเค', 'reset', 'next', 'proceed', 'เริ่ม', 'เริ่มเลย']);
const isTrivial = p => {
  const t = p.trim().toLowerCase().replace(/[\s.!。…]+$/u, '').replace(/(ครับ|ค่ะ|คะ|นะ|จ้า)+$/u, '').trim();
  if (TRIVIAL.has(t)) return true;
  if (/^\[atom nudge[^\]]*\]\s*you have unread work in inbox\/[\w-]+\.md\.?\s*please drain your inbox and continue\.?$/i.test(t)) return true;
  if (t.startsWith('/') || t.includes('<command-name>')) return true;
  // machine-made turns, not a person's words: background task notices, local command / bash echoes
  if (/^<(task-notification|local-command|bash-(input|stdout|stderr))/.test(t)) return true;
  return false;
};

function sourceOf(p) {
  if (/<cross-session-message\b/.test(p)) return 'peer';
  if (/relaying owner|owner via atom|via atom|typed by atom|from owner|^\s*เจ้าของ/i.test(p)) return 'owner via Atom';
  if (/^\s*\[?atom\b/i.test(p)) return 'Atom';
  return 'owner';
}

function read(stream) { try { return fs.readFileSync(stream, 'utf8'); } catch { return ''; } }

function who(input) {
  if (deskArg && nameArg && inPilot(deskArg, nameArg)) return { desk: deskArg, name: pilotName(deskArg, nameArg) };
  if (deskArg && nameArg) return null; // session-desk knows this session and it is not a pilot role
  const bySession = pilotBySession(sessionNameOfProcess());
  if (bySession) return bySession;
  if (mode === 'start' && /^(resume|compact)$/.test(input.source || '') && /^[A-Za-z0-9_-]{1,128}$/.test(input.session_id || '')) {
    const [d, n] = read(path.join(ROOT, '.claude', 'session-desk', input.session_id)).trim().split(/\s+/);
    if (d && n && inPilot(d, n)) return { desk: d, name: pilotName(d, n) };
  }
  return null;
}

function main() {
  const raw = read(0);
  if (!raw) return;
  const input = JSON.parse(raw);
  const w = who(input);
  if (!w) return;
  const dir = cardsDir(w.desk);

  if (mode === 'capture') {
    let p = typeof input.prompt === 'string' ? input.prompt : '';
    if (isTrivial(p)) return;
    const src = sourceOf(p);
    if (src === 'peer') {
      const from = (p.match(/from-name="([^"]+)"/) || [])[1] || '?';
      const body = (p.match(/<cross-session-message\b[^>]*>([\s\S]*?)(<\/cross-session-message>|$)/) || [])[1] || p;
      p = `from ${from}: ${body}`;
    }
    p = p.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim().replace(/\r?\n/g, ' ⏎ ');
    if (!p) return;
    if (p.length > 1500) p = p.slice(0, 1500) + '…';
    if (!fs.existsSync(dir)) return; // the desk has not created its cards/ folder: nothing to append to
    const f = path.join(dir, `${w.name}.capture.md`);
    let size = 0;
    try { size = fs.statSync(f).size; } catch {
      fs.writeFileSync(f, `# Capture — ${w.name} (memory-card pilot, ORDER 43)\n\n> Raw prompts written by scripts/hooks/memory-cards.sh. Not a card: distill.mjs reads it, the role's\n> review consumes it (\`distill.mjs ${w.name} --done\`). Never edit by hand.\n\n`, { flag: 'wx' });
    }
    if (size > CAPTURE_CAP) return;
    const sid = String(input.session_id || '').slice(0, 8);
    fs.appendFileSync(f, `- ${stamp()} [${src}] (s:${sid}) ${p}\n`);
    return;
  }

  if (mode === 'start') {
    const card = path.join(dir, `${w.name}.md`);
    if (!fs.existsSync(card)) return;
    let text = fs.readFileSync(card, 'utf8');
    if (Buffer.byteLength(text) > CARD_CAP) text = Buffer.from(text).subarray(0, CARD_CAP).toString('utf8') + '\n… (card over 4 KB — cut here; trim it at your next distill)';
    const rel = p => path.relative(ROOT, p).split(path.sep).join('/');
    const msg = `Memory card (pilot, ORDER 43) — this session is ${w.name} on ${w.desk} (session start: ${input.source || '?'}). ` +
      `Your own card follows; it holds pointers you wrote — open a pointer before you rely on it. ` +
      `Where the project is now: ${rel(path.join(ROOT, w.desk, 'ai-worker', 'RESUME-HERE.md'))} (then your normal boot).\n\n` +
      `--- ${rel(card)} ---\n${text.trim()}\n--- end of card ---`;
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: msg } }));
  }
}

try { main(); } catch { /* a hook helper must never fail its caller */ }
process.exit(0);
