// cards-lib.mjs — shared helpers for the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43).
// Used by card-hook.mjs (hooks), distill.mjs and ready-to-clear.mjs. Node built-ins only. Never throws to a hook:
// callers wrap. team-proposed, cheap to delete: the pilot is off when no desk's ai-worker/checks.json carries
// `"hygiene": { "memory-cards": { "pilot": [<Name>, …] } }`.
// <root> = $MEMORY_ROOT (scratch tests) or the workspace root.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = process.env.MEMORY_ROOT
  ? path.resolve(process.env.MEMORY_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const CARD_CAP = 4096;
const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };
const okDesk = d => typeof d === 'string' && /^[A-Za-z0-9._-]+$/.test(d) && !d.startsWith('.');

export const aiWorker = desk => path.join(ROOT, desk, 'ai-worker');
export const cardsDir = desk => path.join(aiWorker(desk), 'cards');

// the pilot names of a desk, or null when the desk has not switched the pilot on
export function pilotOf(desk) {
  if (!okDesk(desk)) return null;
  try {
    const p = JSON.parse(read(path.join(aiWorker(desk), 'checks.json')))?.hygiene?.['memory-cards']?.pilot;
    return Array.isArray(p) ? p.filter(n => typeof n === 'string' && /^[A-Za-z][A-Za-z0-9_-]*$/.test(n)) : null;
  } catch { return null; }
}
export const inPilot = (desk, name) => {
  const p = pilotOf(desk);
  return !!(p && name && p.some(n => n.toLowerCase() === String(name).toLowerCase()));
};
// the pilot name as written in checks.json (the card's file name)
export const pilotName = (desk, name) => (pilotOf(desk) || []).find(n => n.toLowerCase() === String(name).toLowerCase()) || null;

export function pilotDesks() {
  let ds = [];
  try { ds = fs.readdirSync(ROOT).filter(okDesk); } catch { return []; }
  return ds.filter(d => fs.existsSync(path.join(aiWorker(d), 'checks.json')) && pilotOf(d));
}

// TEAMS.md rows: Name | Role · team | … | Inbox | Session name | …
export function roster(desk) {
  const out = [];
  let cols = null;
  for (const l of read(path.join(aiWorker(desk), 'TEAMS.md')).split('\n')) {
    if (!l.startsWith('|')) { cols = null; continue; }
    const cells = l.split('|').slice(1, -1).map(c => c.trim());
    if (/^name$/i.test(cells[0] || '')) { cols = cells.map(c => c.toLowerCase()); continue; }
    const m = /^([A-Z]{2,})\s*·\s*(\S+)/.exec(cells[1] || '');
    if (!m || !/^[A-Z][A-Za-z]+$/.test(cells[0])) continue;
    const at = h => (cols ? cols.findIndex(c => c.startsWith(h)) : -1);
    const clean = s => (s || '').replace(/`/g, '').trim();
    const inbox = clean(cells[at('inbox')]).match(/inbox\/([A-Za-z0-9-]+)\.md/);
    out.push({ name: cells[0], role: m[1], team: m[2], inbox: inbox ? inbox[1] : null, session: clean(cells[at('session')]) || null });
  }
  return out;
}

// The session name of the Claude process this hook/script runs under: the nearest ancestor whose argv is a
// `claude` binary with `-n <name>` / `--name <name>` (Atom starts every desk session that way, and the process —
// unlike the session id — survives /clear). Fallback: $CLAUDE_PID's argv, then the tmux session name of
// $TMUX_PANE. Linux /proc only; anywhere else → null.
function nameFromArgv(argv) {
  if (!argv.slice(0, 2).some(a => path.basename(a) === 'claude')) return null;
  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === '-n' || argv[i] === '--name') && argv[i + 1]) return argv[i + 1];
    if (argv[i].startsWith('--name=')) return argv[i].slice(7);
  }
  return null;
}
const argvOf = pid => read(`/proc/${pid}/cmdline`).split('\0').filter(Boolean);
const ppidOf = pid => { const m = /^\d+ \(.*\) \S (\d+)/s.exec(read(`/proc/${pid}/stat`)); return m ? Number(m[1]) : 0; };

export function sessionNameOfProcess() {
  let pid = process.ppid;
  for (let i = 0; i < 10 && pid > 1; i++) {
    const argv = argvOf(pid);
    if (argv.slice(0, 2).some(a => path.basename(a) === 'claude')) return nameFromArgv(argv); // nearest claude decides
    pid = ppidOf(pid);
  }
  const cp = Number(process.env.CLAUDE_PID);
  if (cp > 1) { const n = nameFromArgv(argvOf(cp)); if (n) return n; }
  const pane = process.env.TMUX_PANE;
  if (pane && /^%\d+$/.test(pane)) {
    const r = spawnSync('tmux', ['display-message', '-p', '-t', pane, '#S'], { encoding: 'utf8', timeout: 300 });
    const s = (r.stdout || '').trim();
    if (r.status === 0 && s) return s;
  }
  return null;
}

// session name → { desk, name, role } on a pilot desk, only for a pilot name
export function pilotBySession(sessionName) {
  if (!sessionName) return null;
  for (const desk of pilotDesks()) {
    const r = roster(desk).find(x => x.session && x.session.toLowerCase() === sessionName.toLowerCase());
    if (r && inPilot(desk, r.name)) return { desk, name: pilotName(desk, r.name), role: r.role };
  }
  return null;
}

export const stamp = (d = new Date()) => {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
