#!/usr/bin/env node
// ready-to-clear.mjs <desk> <Name>
// May Atom /clear this pilot role now? (MARIE.md ORDER 43; owner 2026-10-30 14:43: "ห้าม clear ใครขณะงานค้าง ให้ clear
// เมื่อคนนั้นจบเรื่องของตัวเองเท่านั้น"). Prints `READY` (exit 0) or `NOT READY — <Name>` and one `- <reason>` per
// line (exit 1). Exit 2 = usage / not a pilot role. Read only: it never writes anything.
// READY only when ALL hold:
//   1. the role's own inbox (TEAMS.md) holds no message line;
//   2. it owns nothing IN_PROGRESS, no SPEC still DRAFT/IN_PROGRESS, no REQ it is mid-way through (IN_SPEC or
//      DRAFT naming it; for the PM any DRAFT REQ), and — for an SA — no TASK of its team's engineers in REVIEW;
//   3. the board's Ball column does not name it (its name, its inbox token, or for the PM "PM");
//   4. cards/<Name>.state.json says it was distilled at or after its last `## [HH:MM] <Name> (` log entry (all parts of
//      a day are read, latest part first: log/<date>.N.md … log/<date>.md — ORDER 46), and
//      cards/<Name>.proposed.md is gone.
// team-proposed, cheap to delete. Node built-ins only.

import fs from 'node:fs';
import path from 'node:path';
import { aiWorker, cardsDir, pilotName, roster } from './cards-lib.mjs';

const [desk, nameIn] = process.argv.slice(2);
if (!desk || !nameIn) { console.error('usage: ready-to-clear.mjs <desk> <Name>'); process.exit(2); }
const NAME = pilotName(desk, nameIn);
if (!NAME) { console.error(`${nameIn} is not in ${desk}'s memory-cards pilot (ai-worker/checks.json)`); process.exit(2); }
const AW = aiWorker(desk);
const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const word = w => new RegExp(`(^|[^\\w-])${esc(w)}([^\\w-]|$)`, 'i');
const team = roster(desk);
const me = team.find(r => r.name === NAME) || { name: NAME, role: '-', team: '-', inbox: null };
const reasons = [];

// 1. inbox
if (me.inbox) {
  const msgs = read(path.join(AW, 'inbox', `${me.inbox}.md`)).split('\n').filter(l => l.trim() && !/^\s*(>|#)/.test(l));
  if (msgs.length) reasons.push(`inbox/${me.inbox}.md holds ${msgs.length} message line(s) — drain it first`);
} else reasons.push('no inbox for this name in TEAMS.md — cannot check it');

// 2. work in flight
const names = [NAME, ...(me.role === 'PM' ? ['the PM'] : [])].map(word);
const namesMe = l => names.some(r => r.test(l));
const statusOf = lines => {
  const l = lines.find(x => /^\s*[-*]?\s*\**Status\b/i.test(x));
  // only the current status counts: history after "· was …" / "— was …" is not read
  const cur = l ? l.split(/\s+(?:·|—|-)\s+was\b/i)[0] : '';
  return l ? { line: cur, s: (/Status\**\s*:?\**\s*([A-Z_]+)/i.exec(cur)?.[1] || '').toUpperCase() } : null;
};
const ownerOf = lines => lines.find(x => /^\s*[-*]?\s*\**Owner\b/i.test(x)) || '';
const myEngineers = me.role === 'SA' ? team.filter(r => (r.role === 'BE' || r.role === 'FE') && r.team === me.team).map(r => r.name) : [];
for (const sub of ['tasks', 'specs', 'requirements', 'tests']) {
  let files = []; try { files = fs.readdirSync(path.join(AW, sub)).filter(f => f.endsWith('.md')).sort(); } catch { continue; }
  for (const f of files) {
    const lines = read(path.join(AW, sub, f)).split('\n').slice(0, 40);
    const st = statusOf(lines); if (!st) continue;
    const id = f.replace(/^([A-Z]+-\d+).*$/, '$1');
    const owner = ownerOf(lines);
    if (st.s === 'IN_PROGRESS' && (namesMe(st.line) || namesMe(owner))) reasons.push(`${id} is IN_PROGRESS and names you (${sub}/${f})`);
    else if (sub === 'specs' && /^(DRAFT|IN_PROGRESS|WIP)$/.test(st.s) && (namesMe(st.line) || namesMe(owner)))
      reasons.push(`${id} is ${st.s} — a SPEC you are mid-way through (${sub}/${f})`);
    else if (sub === 'requirements' && ((/^(DRAFT|IN_SPEC)$/.test(st.s) && namesMe(st.line)) || (me.role === 'PM' && st.s === 'DRAFT')))
      reasons.push(`${id} is ${st.s} — a REQ you are mid-way through (${sub}/${f})`);
    else if (sub === 'tasks' && st.s === 'REVIEW' && myEngineers.some(n => word(n).test(owner)))
      reasons.push(`${id} is in REVIEW by your team's engineer — your review is owed (${sub}/${f})`);
  }
}

// 3. the board's ball
// a role token followed by a team letter ("SA B") is that team's role only: Sober's "SA" must not catch "SA B"
const roleTok = t => new RegExp(`(^|[^\\w-])${esc(t)}(?![\\w-])(?!\\s+[A-Z](?![\\w-]))`, 'i');
const tokens = [word(NAME), me.inbox && roleTok(me.inbox), me.role === 'PM' && roleTok('PM'),
  /^[A-Z]$/.test(me.team) && word(`${me.role} ${me.team}`)].filter(Boolean);
let ballCol = -1;
for (const l of read(path.join(AW, 'board.md')).split('\n')) {
  if (!l.startsWith('|')) { ballCol = -1; continue; }
  const cells = l.split('|').slice(1); if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
  const hi = cells.findIndex(c => /^\s*ball\s*$/i.test(c));
  if (hi >= 0) { ballCol = hi; continue; }
  if (ballCol < 0 || /^\s*:?-{2,}/.test(cells[0] || '')) continue;
  const ball = (cells[ballCol] || '').trim();
  if (ball && tokens.some(r => r.test(ball))) reasons.push(`board: the ball is on you — ${cells[0].trim()} (Ball: ${ball})`);
}

// 4. distilled after the last log entry, proposed.md gone
const dir = cardsDir(desk);
if (fs.existsSync(path.join(dir, `${NAME}.proposed.md`))) reasons.push(`cards/${NAME}.proposed.md is still open — review it and run distill.mjs ${NAME} --done`);
let lastLog = null;
// every part of every day, newest first: log/<date>.N.md … log/<date>.2.md, log/<date>.md (ORDER 46 rollover)
const partKey = f => { const m = /^(\d{4}-\d{2}-\d{2})(?:\.(\d+))?\.md$/.exec(f); return m ? [m[1], m[2] ? Number(m[2]) : 1] : null; };
let logs = []; try { logs = fs.readdirSync(path.join(AW, 'log')).filter(f => partKey(f)).sort((a, b) => { const [da, na] = partKey(a), [db, nb] = partKey(b); return da === db ? nb - na : (da < db ? 1 : -1); }); } catch { /* none */ }
const head = new RegExp(`^## \\[(\\d{2}:\\d{2})\\] ${esc(NAME)} \\(`, 'gm');
for (const f of logs) {
  const hits = [...read(path.join(AW, 'log', f)).matchAll(head)];
  if (hits.length) { lastLog = `${f.slice(0, 10)} ${hits[hits.length - 1][1]}`; break; }
}
let state = {}; try { state = JSON.parse(read(path.join(dir, `${NAME}.state.json`)) || '{}'); } catch { /* bad file */ }
const distilled = state.distilledAtLocal || null;
if (!distilled) reasons.push(`never distilled — run node scripts/memory/distill.mjs ${NAME}, review, then --done`);
else if (lastLog && distilled < lastLog) reasons.push(`last distill ${distilled} is before your last log entry ${lastLog} — distill again`);

if (!reasons.length) { console.log(`READY — ${NAME} (${desk}); last log ${lastLog || 'none'}, distilled ${distilled}`); process.exit(0); }
console.log(`NOT READY — ${NAME} (${desk})`);
for (const r of reasons) console.log(`- ${r}`);
process.exit(1);
