#!/usr/bin/env node
// check-hygiene.mjs — machine-enforced coordination-file discipline.
// Usage: node check-hygiene.mjs <project-folder-name>   (or bun check-hygiene.mjs ...)
// Exit 0 = PASS, exit 1 = FAIL (dispatcher must run a housekeeping hop first).
// Owned by Marie (MARIE.md). Thresholds agreed with the human 2026-08-25;
// v3 (knowledge file, active-team inbox, log-date rules) approved 2026-09-04.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WS = dirname(fileURLToPath(import.meta.url));
const project = process.argv[2];
if (!project) { console.error("usage: check-hygiene.mjs <project>"); process.exit(2); }
const AW = join(WS, project, "ai-worker");
if (!existsSync(AW)) { console.error(`no ai-worker at ${AW}`); process.exit(2); }

const KB = 1024;
const LIMITS = {
  board: 40 * KB,          // board.md total size
  cell: 300,               // chars per table cell on the board
  dispatcherState: 30 * KB,// dispatcher-state.md total size
  dispatcherRuns: 6,       // runs kept in dispatcher-state.md (rotate the rest)
  logToday: 40 * KB,       // today's log file
  logTodayLoud: 100 * KB,  // today's log, escalated (smart-scheduler's 09-01 hit 202KB)
  logEntryLines: 20,       // lines per log entry (rule says <=15; fail margin 20)
  logMissingDays: 3,       // no log for today, but one dated within N days ⇒ WARN
  activeDays: 14,          // newest log dated within N days ⇒ the team is active
  reqFile: 45 * KB,        // any single requirements/ file
  taskFile: 60 * KB,       // any single tasks/ file (DONE tasks are cold; warn-only)
  inboxMsg: 2 * KB,        // a single inbox file (should be near-empty)
  boardClosedWarn: 10,     // closed rows tolerated on the live board before a nudge
  boardClosedFail: 30,     // closed rows that force a sweep to archive/board-closed.md
};

// The project's Knowledge file: what the owner has already said and how the running
// system behaves. First match wins; the first name is the canonical one.
const KNOWLEDGE_FILES = ["SYSTEM-FACTS.md", "FACTS.md", "KNOWLEDGE.md"];

// NEVER compacted, never size-gated, by name. A knowledge file is append-only by
// construction — every line carries who said it and when — so "it got big" is the
// rule working, not the rule being broken. Trimming it would delete the provenance
// that makes it trustworthy, which is the one thing it exists to hold.
const NEVER_COMPACT = new Set(KNOWLEDGE_FILES);

const fails = [], warns = [];
const size = (p) => (existsSync(p) ? statSync(p).size : 0);
const fmt = (n) => `${(n / KB).toFixed(1)}KB`;

// TODAY, in LOCAL time. NOT `toISOString()` — that is UTC, and on a UTC+7 machine it
// reports YESTERDAY between 00:00 and 07:00 local. Found 2026-09-04: the gate was
// checking log/2026-09-03.md and never opening log/2026-09-04.md at all — in the one
// project that had misfiled its log by date four times in five days. A date gate with
// a date bug is worse than no gate: it reports PASS on the wrong file.
const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Log FILENAMES are the only reliable clock here — never mtime. The owner moves between
// machines constantly, and a fresh checkout stamps every file with the checkout time,
// which would make a long-dormant project look active and a busy one look idle.
const logDir = join(AW, "log");
const logDates = existsSync(logDir)
  ? readdirSync(logDir).map((f) => /^(\d{4}-\d{2}-\d{2})\.md$/.exec(f)?.[1]).filter(Boolean).sort()
  : [];
const newestLogDate = logDates.length ? logDates[logDates.length - 1] : null;
const daysSince = (iso) => Math.round((Date.parse(`${today}T00:00:00`) - Date.parse(`${iso}T00:00:00`)) / 86400000);
const active = newestLogDate !== null && daysSince(newestLogDate) <= LIMITS.activeDays;

// 1) board.md — size + cell length
const boardPath = join(AW, "board.md");
const boardSize = size(boardPath);
if (boardSize > LIMITS.board) fails.push(`board.md ${fmt(boardSize)} > ${fmt(LIMITS.board)}`);
if (boardSize) {
  const longCells = readFileSync(boardPath, "utf8").split("\n")
    .filter((l) => l.trim().startsWith("|"))
    .flatMap((l) => l.split("|"))
    .filter((c) => c.length > LIMITS.cell).length;
  if (longCells > 0) fails.push(`board.md has ${longCells} table cell(s) > ${LIMITS.cell} chars (evidence belongs in the TASK/REQ file)`);

  // Closed rows (DONE / DELIVERED / CODE ACCEPTED) belong in archive/board-closed.md,
  // not on the live board. They never shrink, so a board that keeps them grows
  // monotonically and hits the size gate again no matter how short the cells are.
  // Evidence (smart-scheduler, 2026-08-31): a board compacted to 39.2KB by shortening
  // prose was back over 40KB in 1.5 days — 191 of its 272 rows were already closed,
  // 39% of the file. Sweep a row to the archive at the moment it closes.
  const closedRows = readFileSync(boardPath, "utf8").split("\n")
    .filter((l) => /^\|\s*(REQ|TASK|DEF)-/.test(l))
    .filter((l) => {
      const status = (l.split("|")[4] || "").replace(/[*`]/g, "").replace(/^[^A-Za-z]+/, "");
      return /^(DONE|DELIVERED|CODE ACCEPTED)\b/i.test(status);
    }).length;
  // Proportionate on purpose: piling up closed rows only BLOCKS once the board is
  // actually running out of room (>60% of the size gate). Below that it is a nudge,
  // not a stop — a small board carrying old rows is on the wrong trajectory, not in
  // danger, and a gate that reds out a healthy 13KB board teaches people to ignore it.
  if (closedRows > LIMITS.boardClosedFail && boardSize > 0.6 * LIMITS.board)
    fails.push(`board.md carries ${closedRows} closed rows > ${LIMITS.boardClosedFail} at ${fmt(boardSize)} (sweep DONE/DELIVERED rows to archive/board-closed.md)`);
  else if (closedRows > LIMITS.boardClosedWarn)
    warns.push(`board.md carries ${closedRows} closed rows (sweep them to archive/board-closed.md before they pile up)`);
}

// 2) dispatcher-state.md — size + run count
const dsPath = join(AW, "dispatcher-state.md");
const dsSize = size(dsPath);
if (dsSize > LIMITS.dispatcherState) fails.push(`dispatcher-state.md ${fmt(dsSize)} > ${fmt(LIMITS.dispatcherState)}`);
if (dsSize) {
  const runs = (readFileSync(dsPath, "utf8").match(/^## RUN /gm) || []).length;
  if (runs > LIMITS.dispatcherRuns) fails.push(`dispatcher-state.md holds ${runs} runs > ${LIMITS.dispatcherRuns} (rotate old runs to archive/)`);
}

// 3) today's log — existence, size, entry length
const logPath = join(AW, "log", `${today}.md`);
const logExists = existsSync(logPath);
const logSize = size(logPath);

// A MISSING today's log used to score size 0 and sail through silently — which is exactly
// how this workspace misfiled its log by date four times in five days without the gate
// ever saying a word. An absent file is not evidence of a quiet day; it is equally
// evidence that someone is appending to yesterday's file right now.
if (!logExists && newestLogDate && daysSince(newestLogDate) <= LIMITS.logMissingDays)
  warns.push(`no log/${today}.md, but log/${newestLogDate}.md is ${daysSince(newestLogDate)} day(s) old — someone may be appending to the WRONG file (create today's, never reuse the newest)`);

// Logs are append-only (never rewritten by housekeeping) → WARN, not FAIL:
// the discipline applies to the NEXT entries, not retroactively. That is also why the
// escalated tier stays a WARN — a FAIL on an append-only file would be unfixable by design.
if (logSize > LIMITS.logTodayLoud)
  warns.push(`🔴 log/${today}.md ${fmt(logSize)} > ${fmt(LIMITS.logTodayLoud)} — this file is now too big for a fresh role to read honestly; point at files instead of retelling`);
else if (logSize > LIMITS.logToday)
  warns.push(`log/${today}.md ${fmt(logSize)} > ${fmt(LIMITS.logToday)} (append-only; write shorter entries from now on)`);
if (logSize) {
  const entries = readFileSync(logPath, "utf8").split(/^## /m).slice(1);
  const long = entries.filter((e) => e.split("\n").length > LIMITS.logEntryLines).length;
  if (long > 0) warns.push(`log/${today}.md has ${long} entr(ies) > ${LIMITS.logEntryLines} lines (rule: <=15 — point at files instead of retelling)`);
}

// 4) requirements/ and tasks/ file sizes
for (const [dir, limit, hard] of [["requirements", LIMITS.reqFile, true], ["tasks", LIMITS.taskFile, false]]) {
  const dd = join(AW, dir);
  if (!existsSync(dd)) continue;
  for (const f of readdirSync(dd)) {
    if (NEVER_COMPACT.has(f)) continue;   // knowledge file: exempt from every size rule
    const s = size(join(dd, f));
    if (s > limit) (hard ? fails : warns).push(`${dir}/${f} ${fmt(s)} > ${fmt(limit)}${hard ? " (needs consolidation)" : " (cold if DONE; consider splitting history)"}`);
  }
}

// 5) inbox/ — the delivery channel. Optional for a dormant project; required for a live one.
const inboxDir = join(AW, "inbox");
if (existsSync(inboxDir)) {
  for (const f of readdirSync(inboxDir)) {
    const s = size(join(inboxDir, f));
    if (s > LIMITS.inboxMsg) warns.push(`inbox/${f} ${fmt(s)} — messages piling up unread?`);
  }
} else if (active) {
  // FAIL only for a team that is actually working. A dormant project has no messages to
  // lose; a busy one without an inbox routes everything through the log, where an `@`
  // scrolls away unread (smart-scheduler carried 61 `@Porter` mentions in one day's log).
  fails.push(`no inbox/ directory and this project is ACTIVE (newest log ${newestLogDate}, ${daysSince(newestLogDate)}d ago) — create ai-worker/inbox/<ROLE>.md`);
} else {
  warns.push(`no inbox/ directory (dormant: newest log ${newestLogDate ?? "none"}) — required once the team is active again`);
}

// 6) the Knowledge file — what the owner already said, and how the running system behaves.
// Absent is a gap. Present-but-unreachable is worse than absent, because it LOOKS solved:
// the file exists, nobody's startup path names it, and the team re-derives its contents
// from the logs anyway. smart-scheduler proved the cost — "QA cannot test LINE" was
// written down and lost five separate times before it was finally recorded.
const knowledgeFile = KNOWLEDGE_FILES.find((f) => existsSync(join(AW, f)));
if (!knowledgeFile) {
  warns.push(`no ${KNOWLEDGE_FILES[0]} — owner-stated facts have nowhere to live but the logs, where they scroll away`);
} else {
  const protoPath = join(AW, "PROTOCOL.md");
  const referenced = existsSync(protoPath) && readFileSync(protoPath, "utf8").includes(knowledgeFile);
  if (!referenced)
    fails.push(`${knowledgeFile} exists but PROTOCOL.md never points at it — an unreachable memory file is worse than none (it looks solved)`);
}

for (const w of warns) console.log(`WARN  ${w}`);
for (const f of fails) console.log(`FAIL  ${f}`);
if (fails.length) {
  console.log(`\nRESULT: FAIL (${fails.length}) — run a PM housekeeping hop before dispatching work.`);
  process.exit(1);
}
console.log(`RESULT: PASS${warns.length ? ` (${warns.length} warning(s))` : ""} — board ${fmt(boardSize)}, dispatcher-state ${fmt(dsSize)}, today's log ${fmt(logSize)} (${today}, local).`);
