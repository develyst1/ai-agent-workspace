#!/usr/bin/env node
// check-hygiene.mjs — machine-enforced coordination-file discipline.
// Usage: node check-hygiene.mjs <project-folder-name>   (or bun check-hygiene.mjs ...)
// Exit 0 = PASS, exit 1 = FAIL (dispatcher must run a housekeeping hop first).
// Owned by Marie (MARIE.md). Thresholds agreed with the human 2026-08-25.

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
  logEntryLines: 20,       // lines per log entry (rule says <=15; fail margin 20)
  reqFile: 45 * KB,        // any single requirements/ file
  taskFile: 60 * KB,       // any single tasks/ file (DONE tasks are cold; warn-only)
  inboxMsg: 2 * KB,        // a single inbox file (should be near-empty)
};

const fails = [], warns = [];
const size = (p) => (existsSync(p) ? statSync(p).size : 0);
const fmt = (n) => `${(n / KB).toFixed(1)}KB`;

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
}

// 2) dispatcher-state.md — size + run count
const dsPath = join(AW, "dispatcher-state.md");
const dsSize = size(dsPath);
if (dsSize > LIMITS.dispatcherState) fails.push(`dispatcher-state.md ${fmt(dsSize)} > ${fmt(LIMITS.dispatcherState)}`);
if (dsSize) {
  const runs = (readFileSync(dsPath, "utf8").match(/^## RUN /gm) || []).length;
  if (runs > LIMITS.dispatcherRuns) fails.push(`dispatcher-state.md holds ${runs} runs > ${LIMITS.dispatcherRuns} (rotate old runs to archive/)`);
}

// 3) today's log — size + entry length
const today = new Date().toISOString().slice(0, 10);
const logPath = join(AW, "log", `${today}.md`);
// Logs are append-only (never rewritten by housekeeping) → WARN, not FAIL:
// the discipline applies to the NEXT entries, not retroactively.
const logSize = size(logPath);
if (logSize > LIMITS.logToday) warns.push(`log/${today}.md ${fmt(logSize)} > ${fmt(LIMITS.logToday)} (append-only; write shorter entries from now on)`);
if (logSize) {
  const entries = readFileSync(logPath, "utf8").split(/^## /m).slice(1);
  const long = entries.filter((e) => e.split("\n").length > LIMITS.logEntryLines).length;
  if (long > 0) warns.push(`log/${today}.md has ${long} entr(ies) > ${LIMITS.logEntryLines} lines (rule: <=15 — point at files instead of retelling)`);
}

// 4) requirements/ and tasks/ file sizes
for (const [dir, limit, hard] of [["requirements", LIMITS.reqFile, true], ["tasks", LIMITS.taskFile, false]]) {
  const d = join(AW, dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) {
    const s = size(join(d, f));
    if (s > limit) (hard ? fails : warns).push(`${dir}/${f} ${fmt(s)} > ${fmt(limit)}${hard ? " (needs consolidation)" : " (cold if DONE; consider splitting history)"}`);
  }
}

// 5) inbox/ — should exist in dispatcher-mode projects and stay near-empty
const inboxDir = join(AW, "inbox");
if (existsSync(inboxDir)) {
  for (const f of readdirSync(inboxDir)) {
    const s = size(join(inboxDir, f));
    if (s > LIMITS.inboxMsg) warns.push(`inbox/${f} ${fmt(s)} — messages piling up unread?`);
  }
} else {
  warns.push("no inbox/ directory (fine for manual-mode projects; required for dispatcher mode)");
}

for (const w of warns) console.log(`WARN  ${w}`);
for (const f of fails) console.log(`FAIL  ${f}`);
if (fails.length) {
  console.log(`\nRESULT: FAIL (${fails.length}) — run a PM housekeeping hop before dispatching work.`);
  process.exit(1);
}
console.log(`RESULT: PASS${warns.length ? ` (${warns.length} warning(s))` : ""} — board ${fmt(boardSize)}, dispatcher-state ${fmt(dsSize)}, today's log ${fmt(logSize)}.`);
