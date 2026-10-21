#!/usr/bin/env node
// ring-after-handoff.mjs <desk> <Name> <ROLE> <transcript_path>
// Helper for scripts/hooks/ring-after-handoff.sh (Stop hook). Prints the block reason, or nothing.
// Origin: MARIE-ORDER-2026-10-21-ring-after-handoff.md (Atlas). team-proposed, cheap to delete.
//
// The current turn = transcript lines after the last real user message (operator typed, a peer session's
// message, or a task notification; tool results and injected isMeta text are not a boundary).
// In that turn, a Bash `>>` (or `tee -a`) onto <desk>/ai-worker/inbox/<X>.md, whose tool result is not an
// error, is a hand-off to X when X is not this session's own inbox, not WAKE.md, and not a "capped" relay
// line to PM.md. It is rung when a LATER SendMessage in the turn reached X's session (its `to`, `recipient`
// or the result's session title names X's person or the X token) and the result is not a failure that says
// not reachable / not delivered / capped, or when a LATER `>>` to inbox/PM.md contains "capped".
// Transcript shapes, seen on this machine (2026-10-21, ~3,100 SendMessage calls):
//   tool_use input {to, recipient, recipient_kind, message, …}; `to` is a session name (`<Name>-<tag>`) or a
//   `local_…` id; the result line carries toolUseResult {success, message}: success:true = delivered /
//   queued (message names the session as ("<Name>-<tag>")); success:false = "No agent named … is reachable",
//   "Not delivered: this session has already messaged …" (cap), "Not delivered to … session", "Failed to send
//   to uds:…", "… matches N agents by prefix".
// Hub desks (DECISIONS/PROTOCOL say "only the PM sends", not superseded in DECISIONS) → nothing.
// Never throws: any error → no output. Reads at most the last 8 MB of the transcript.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.MEMORY_ROOT
  ? path.resolve(process.env.MEMORY_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [desk, name, role, transcript] = process.argv.slice(2);
const TAIL = 8 * 1024 * 1024;

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };

function isHub(aw) {
  const dec = read(path.join(aw, 'DECISIONS.md'));
  const pro = read(path.join(aw, 'PROTOCOL.md'));
  const ONLY = /only the PM sends/i;
  // DECISIONS is dated and wins: a line that ends the hub (or supersedes "only the PM sends") turns it off,
  // even if PROTOCOL still carries the old sentence.
  if (dec.split('\n').some(l => /hub desk ended/i.test(l) || (/supersedes/i.test(l) && /only the PM sends/i.test(l.split(/supersedes/i)[1] || ''))))
    return false;
  return ONLY.test(dec) || ONLY.test(pro);
}

// inbox base name (e.g. SA-A) → person name, from TEAMS.md rows `| Name | ROLE · T | … | `inbox/X.md` | …`
function roster(aw) {
  const byInbox = new Map();
  for (const l of read(path.join(aw, 'TEAMS.md')).split('\n')) {
    const m = l.match(/^\|\s*([A-Z][A-Za-z]+)\s*\|[^|]*·[^|]*\|.*?inbox\/([A-Za-z0-9-]+)\.md/);
    if (m) byInbox.set(m[2], m[1]);
  }
  return byInbox;
}

function main() {
  if (!desk || !transcript || !/^[A-Za-z0-9._-]+$/.test(desk)) return;
  const aw = path.join(ROOT, desk, 'ai-worker');
  if (!fs.existsSync(aw) || isHub(aw)) return;
  const byInbox = roster(aw);
  let own = null;
  for (const [x, n] of byInbox) if (n.toLowerCase() === String(name).toLowerCase()) own = x;
  if (!own && role && role !== '-') own = role;

  const st = fs.statSync(transcript);
  const fd = fs.openSync(transcript, 'r');
  const len = Math.min(st.size, TAIL);
  const buf = Buffer.alloc(len);
  fs.readSync(fd, buf, 0, len, st.size - len);
  fs.closeSync(fd);
  let lines = buf.toString('utf8').split('\n');
  if (st.size > len) lines = lines.slice(1); // first line may be cut

  // find the turn start, walking backwards
  const recs = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i];
    if (!t || t[0] !== '{') continue;
    let o; try { o = JSON.parse(t); } catch { continue; }
    if (o.isSidechain) continue;
    if (o.type === 'user') {
      const c = o.message?.content;
      const isResult = Array.isArray(c) && c.some(x => x?.type === 'tool_result');
      const kind = o.origin && typeof o.origin === 'object' ? o.origin.kind : o.origin;
      const boundary = !isResult && (['human', 'peer', 'task-notification'].includes(kind) || (!kind && !o.isMeta));
      if (boundary) break;
    }
    recs.push(o);
  }
  recs.reverse();

  const results = new Map(); // tool_use_id → {err, text, ok}
  for (const o of recs) {
    if (o.type !== 'user' || !Array.isArray(o.message?.content)) continue;
    for (const x of o.message.content) {
      if (x?.type !== 'tool_result') continue;
      const c = x.content;
      const text = typeof c === 'string' ? c : Array.isArray(c) ? c.map(y => y?.text ?? '').join('\n') : '';
      const tur = o.toolUseResult && typeof o.toolUseResult === 'object' ? o.toolUseResult : null;
      let ok = tur && typeof tur.success === 'boolean' ? tur.success : null;
      if (ok === null) { try { const j = JSON.parse(text); if (typeof j.success === 'boolean') ok = j.success; } catch { /* plain text */ } }
      results.set(x.tool_use_id, { err: !!x.is_error, text: text + '\n' + (tur?.message ?? ''), ok });
    }
  }

  const events = []; // in order: {kind:'append', inbox, capped} | {kind:'send', target text, rung}
  const otherDesk = p => {
    const m = p.match(/(?:^|\/)([^/\s]+)\/ai-worker\/inbox\//);
    return m && m[1] !== desk && fs.existsSync(path.join(ROOT, m[1], 'ai-worker'));
  };
  const FAIL = /not reachable|no agent named|not delivered|already messaged|since your user last typed|paused until your user|failed to send|matches \d+ agents by prefix|unreachable/i;
  for (const o of recs) {
    if (o.type !== 'assistant' || !Array.isArray(o.message?.content)) continue;
    for (const u of o.message.content) {
      if (u?.type !== 'tool_use') continue;
      const res = results.get(u.id);
      if (u.name === 'Bash') {
        if (!res || res.err) continue;
        const cmd = String(u.input?.command ?? '');
        const re = /(?:>>|\btee\s+-a)\s*["']?([^\s"';|&<>()]*ai-worker\/inbox\/([A-Za-z0-9-]+)\.md)/g;
        let m;
        while ((m = re.exec(cmd))) {
          if (otherDesk(m[1])) continue;
          events.push({ kind: 'append', inbox: m[2], capped: /capped/i.test(cmd) });
        }
      } else if (u.name === 'SendMessage') {
        if (!res) continue;
        const failed = res.err || res.ok === false;
        const rung = !(failed && FAIL.test(res.text)); // an unexplained failure is not held against the role
        const tag = [u.input?.to, u.input?.recipient].filter(v => typeof v === 'string').join(' ');
        const title = (res.text.match(/session local_[\w-]+ \(\\?"([^"\\]+)\\?"\)/) || [])[1]
          || (res.text.match(/([A-Za-z][\w-]*) \(another Claude session/) || [])[1] || '';
        events.push({ kind: 'send', target: `${tag} ${title}`, rung });
      }
    }
  }

  const named = (text, x) => {
    const n = byInbox.get(x);
    const words = [x, n].filter(Boolean).map(w => new RegExp(`(^|[^A-Za-z0-9])${esc(w)}([^A-Za-z0-9]|$)`, 'i'));
    return words.some(r => r.test(text));
  };
  const missing = [];
  events.forEach((e, i) => {
    if (e.kind !== 'append') return;
    const x = e.inbox;
    if (x === 'WAKE' || (own && x.toLowerCase() === own.toLowerCase())) return;
    if (x === 'PM' && e.capped) return; // the capped relay line itself
    const later = events.slice(i + 1);
    if (later.some(f => f.kind === 'send' && f.rung && named(f.target, x))) return;
    if (later.some(f => f.kind === 'append' && f.inbox === 'PM' && f.capped)) return;
    if (!missing.includes(x)) missing.push(x);
  });
  if (!missing.length) return;
  const reason = missing.map(x =>
    `You wrote to ${x}'s inbox but did not ring ${x}. Ring them now (SendMessage), or if your sends are capped write one line to inbox/PM.md: "ring ${x} — <file> (my sends are capped)".`
  ).join('\n');
  process.stdout.write(reason);
}

try { main(); } catch { /* a hook helper must never fail its caller */ }
process.exit(0);
