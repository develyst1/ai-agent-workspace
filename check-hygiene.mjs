#!/usr/bin/env node
// check-hygiene.mjs — machine-enforced coordination-file discipline.
// Usage: node check-hygiene.mjs <project-folder-name>   (or bun check-hygiene.mjs ...)
// Exit 0 = PASS, exit 1 = FAIL (dispatcher must run a housekeeping hop first).
// Owned by Marie (MARIE.md). Thresholds agreed with the human 2026-08-25;
// v3 (knowledge file, active-team inbox, log-date rules) approved 2026-09-04.
// v4 (knowledge SHAPE, inbox FAIL, boot budget) — Atlas ORDER 6, owner's go 2026-09-23.
// v5 (FAILURES.md route, RESUME-HERE.md, REQ→TASK coverage) — ORDER 12+13, owner 2026-09-28.

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
  inboxMsgLines: 5,        // ONE message inside it (the rule says 1-3; 5 is the hard limit)
  boardClosedWarn: 10,     // closed rows tolerated on the live board before a nudge
  boardClosedFail: 30,     // closed rows that force a sweep to archive/board-closed.md
  bootWarn: 60 * KB,       // one role's startup read (knowledge+PROTOCOL+role+board+its inbox)
  bootFail: 120 * KB,      // same read, escalated
  failuresNewFail: 10,     // unreviewed FAILURES.md entries before the gate stops the team
  resumeWarn: 8 * KB,      // RESUME-HERE.md — it is a page, not a log
  resumeFail: 20 * KB,     // same, escalated
  resumeStaleDays: 2,      // RESUME-HERE.md older than the newest log by more than N days
};

// Which files a single role actually reads to start a session, per PROTOCOL.md's
// startup ritual. The inbox name is the ROLE name, not the role FILE name:
// the SA Lead reads SA-Lead.md and inbox/SA.md.
const ROLE_FILES = {
  PM: "PM.md", SA: "SA-Lead.md", BE: "BE.md", FE: "FE.md", QA: "QA.md",
  // Team B — smart-scheduler only (Atlas ORDER 14, owner's go 2026-10-02). A project
  // without these files skips them, so this costs the other 12 desks nothing. They are
  // here because a role the gate does not know is a role whose boot cost nobody pays
  // attention to — which is exactly how the first boot budget was blown.
  "SA-B": "SA-Lead-B.md", "BE-B": "BE-B.md", "FE-B": "FE-B.md",
};

// The project's Knowledge file: what the owner has already said and how the running
// system behaves. First match wins; the first name is the canonical one.
const KNOWLEDGE_FILES = ["SYSTEM-FACTS.md", "FACTS.md", "KNOWLEDGE.md"];

// NEVER compacted, never size-gated, by name. A knowledge file is append-only by
// construction — every line carries who said it and when — so "it got big" is the
// rule working, not the rule being broken. Trimming it would delete the provenance
// that makes it trustworthy, which is the one thing it exists to hold.
//
// ⚠️ Exempt from SIZE is not exempt from SHAPE (ORDER 6, 2026-09-23). Exempting a file
// from the gate entirely turned it into the cheapest place to hide the mess: at
// smart-scheduler a PM moved two board dumps into SYSTEM-FACTS.md to make the board gate
// pass, and the knowledge file reached 323KB. A role is measured on making the gate pass;
// only Marie is measured on keeping the shape. See the MOVED-FROM check in section 6.
const NEVER_COMPACT = new Set(KNOWLEDGE_FILES);

const fails = [], warns = [];
const size = (p) => (existsSync(p) ? statSync(p).size : 0);
const fmt = (n) => `${(n / KB).toFixed(1)}KB`;
// Split on newlines without caring whether a file was saved LF or CRLF. These files are
// edited on more than one machine, and a check that silently stops matching on one of
// them is worse than no check: it reports PASS on a file it never looked at.
const NL = /\r?\n/;

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
  // ORDER 15.3 item 2 (owner's go 2026-10-02): the COUNT alone made this a HUNT. The
  // board grew 5.7x in four days with this FAIL showing the whole time, because "55
  // cells somewhere" is not an instruction — it is a search you do before you can start.
  // Naming the rows turns it into one edit. A gate you can act on in a minute gets acted
  // on; one that opens with a hunt gets deferred, and then it is the GATE that looks
  // unreasonable rather than the board.
  const longCellRows = [];
  let longCells = 0;
  for (const l of readFileSync(boardPath, "utf8").split(NL)) {
    if (!l.trim().startsWith("|")) continue;
    const over = l.split("|").filter((c) => c.length > LIMITS.cell).length;
    if (!over) continue;
    longCells += over;
    const id = /\b((?:REQ|TASK|DEF)-\d+)/.exec(l);
    longCellRows.push(id ? id[1] : "(row with no id)");
  }
  if (longCells > 0) {
    const rows = [...new Set(longCellRows)];
    fails.push(
      `board.md has ${longCells} table cell(s) > ${LIMITS.cell} chars in ${rows.length} row(s) ` +
      `(${rows.slice(0, 12).join(", ")}${rows.length > 12 ? `, +${rows.length - 12} more` : ""}) ` +
      `— evidence belongs in the TASK/REQ file; the cell keeps a pointer`);
  }

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

  // REQ -> TASK coverage (ORDER 12.3 ⑥, from Porter's own failure report). A REQ that is
  // past SPEC_DONE but names no TASK id has nothing carrying it; that is how the Undo item
  // shipped "done" and unusable TWICE, because only the BE half was ever cut.
  // Deliberately narrow: this flags a MISSING LINK, which is a fact. It does NOT try to
  // infer BE-vs-FE completeness from prose — that is Sober's judgement, and a gate that
  // guesses gets ignored, which costs more than the check is worth.
  const POST_SPEC = /^(SPEC_DONE|READY_FOR_(BE|FE|DEV)|IN_PROGRESS|IN_DEV|IN_TEST|TEST_PASSED|TEST_FAILED|QA[_ ]|DELIVERED|DONE|CODE ACCEPTED)/i;
  const uncovered = readFileSync(boardPath, "utf8").split("\n")
    .filter((l) => /^\|\s*REQ-/.test(l))
    .filter((l) => POST_SPEC.test((l.split("|")[4] || "").replace(/[*`]/g, "").replace(/^[^A-Za-z]+/, "")))
    .filter((l) => !/TASK-\d/.test(l))
    .map((l) => (l.split("|")[1] || "").trim());
  if (uncovered.length)
    warns.push(`board.md: ${uncovered.length} REQ row(s) past SPEC_DONE naming no TASK id (${uncovered.slice(0, 6).join(", ")}${uncovered.length > 6 ? ", …" : ""}) — nothing is carrying them; @SA to link or split`);
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
    // FAIL for an active team, WARN for a dormant one. An inbox is a QUEUE: a message is
    // deleted the moment it is processed. A 834KB queue (smart-scheduler, 2026-09-23) is
    // not a busy team, it is a second log that nobody is draining — and every session of
    // that role pays to read it. Dormant projects keep the WARN: nothing is arriving.
    if (s > LIMITS.inboxMsg)
      (active ? fails : warns).push(`inbox/${f} ${fmt(s)} > ${fmt(LIMITS.inboxMsg)} — an inbox is a queue, not a log (delete what you processed; escalate what you cannot)`);

    // ORDER 15.3 item 1 (owner's go 2026-10-02) — measure the MESSAGE, not the file.
    // The file-size rule above catches the symptom about a week late. By then the habit
    // has written 94 messages in 3 days (smart-scheduler inbox/SA.md, 181.7KB) and every
    // session of that role is paying to read them. A message over 5 lines is a BRIEF, and
    // a brief in an inbox is a brief written in the wrong file: the message says WHAT and
    // WHERE, the REQ/TASK/SPEC it points at says the rest. This rule fires the same day.
    //
    // A message starts at a `##` heading and runs to the next one, counting the heading
    // and every non-blank line under it. The file preamble (title + the delivery-channel
    // note + any drain note) sits above the first heading and is deliberately not
    // measured: it is the rules, not a message.
    //
    // ⚠️ `###` is NOT a boundary, and getting that wrong is how the first version of this
    // check lied on the day it shipped. The inbox convention puts `###` SUBSECTIONS inside
    // a message, so treating them as separate messages split one 60-line brief into eight
    // innocent-looking blocks — the check under-reported the exact behaviour it exists to
    // catch, and named "2. ✅ What DOES exist for the" as a sender. A six-subsection
    // message is the clearest possible case of a brief in the wrong file; it must count
    // as one long message, because that is what it is.
    const blocks = [];
    let cur = null;
    for (const raw of readFileSync(join(inboxDir, f), "utf8").split(NL)) {
      if (/^##\s+\S/.test(raw)) { if (cur) blocks.push(cur); cur = { head: raw, lines: 1 }; continue; }
      if (cur && raw.trim()) cur.lines++;
    }
    if (cur) blocks.push(cur);
    const tooLong = blocks.filter((b) => b.lines > LIMITS.inboxMsgLines);
    if (tooLong.length) {
      // Name the SENDER: the fix belongs with whoever is writing briefs into a queue, and
      // a rule nobody is named by is a rule nobody owns. The sender is whatever stands to
      // the LEFT of the arrow — "@Porter → @Sober" and "Tanya (QA) → @Porter" are both in
      // use, so taking the first `@` in the line would have blamed the RECIPIENT half the
      // time. Accusing the wrong role is worse than naming nobody.
      const who = [...new Set(tooLong.map((b) => {
        const left = b.head.replace(/^#+\s*/, "").split(/→|->/)[0];
        const m = /@([A-Za-z][A-Za-z-]*)/.exec(left);
        if (m) return `@${m[1]}`;
        const plain = left.replace(/^[\d:\s—–-]+/, "").trim().slice(0, 24);
        return plain || "(sender not named)";
      }))];
      (active ? fails : warns).push(
        `inbox/${f}: ${tooLong.length} message(s) over ${LIMITS.inboxMsgLines} lines ` +
        `(longest ${Math.max(...tooLong.map((b) => b.lines))}) from ` +
        `${who.slice(0, 6).join(", ")}${who.length > 6 ? ", …" : ""} — a message is 1-3 lines ` +
        `saying WHAT and WHERE; the brief belongs in the REQ/TASK/SPEC it points at`);
    }
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

  // SHAPE, not size. A knowledge file holds facts — what the owner said, how the running
  // system behaves. It is not an overflow tank for a board that failed the size gate.
  // Both markers below are what the offending dumps actually look like in the wild.
  const kText = readFileSync(join(AW, knowledgeFile), "utf8");
  const moved = kText.split("\n").filter((l) => /⬅️\s*MOVED FROM|^#{1,6}\s.*MOVED FROM .*board/i.test(l));
  if (moved.length)
    fails.push(`${knowledgeFile} contains ${moved.length} "MOVED FROM" dump heading(s) — the knowledge file is exempt from SIZE, not from SHAPE; moving content between files is Marie's alone (report the FAIL to the human: "เรียก Marie")`);
}

// 7) FAILURES.md — the workforce's own defect log, and the ROUTE that reaches Atlas.
// Roles cannot call Atlas; only the owner can. So nobody has to remember to escalate:
// the gate counts unreviewed entries and prints them where the owner already looks.
// A role may only add an entry and set `Status: NEW`; only Atlas changes a status.
// Exempt from SIZE (append-only, like the knowledge file) — NEVER from SHAPE. We have
// already learned, twice, what a file exempt from the gate turns into (ORDER 6).
{
  const fPath = join(AW, "FAILURES.md");
  if (existsSync(fPath)) {
    const text = readFileSync(fPath, "utf8");
    const lines = text.split("\n");
    const newIds = [];
    let currentId = null;
    for (const l of lines) {
      const h = /^##\s+(F-\d+)\b/.exec(l);
      if (h) { currentId = h[1]; continue; }
      // Consume the FIRST Status line of each entry, whatever it says, then stop looking.
      // Otherwise an entry that quotes the word "Status: NEW" in its body (describing an
      // earlier state) would be counted as unreviewed — a gate that miscounts gets ignored.
      if (currentId && /^\s*[-*]?\s*\**Status\b/i.test(l.replace(/\*\*/g, "*"))) {
        if (/^\s*[-*]?\s*\**Status:?\**\s*:?\s*NEW\s*$/i.test(l.replace(/\*\*/g, "*"))) newIds.push(currentId);
        currentId = null;
      }
    }
    if (newIds.length >= LIMITS.failuresNewFail)
      fails.push(`🔴 FAILURES.md: ${newIds.length} unreviewed (${newIds.slice(0, 8).join(", ")}${newIds.length > 8 ? ", …" : ""}) — the team is decaying faster than it is being repaired; stop shipping features on top and เรียก Atlas`);
    else if (newIds.length > 0)
      warns.push(`FAILURES.md: ${newIds.length} unreviewed (${newIds.join(", ")}) — เรียก Atlas`);

    const fMoved = lines.filter((l) => /⬅️\s*MOVED FROM|^#{1,6}\s.*MOVED FROM .*board/i.test(l));
    if (fMoved.length)
      fails.push(`FAILURES.md contains ${fMoved.length} "MOVED FROM" dump heading(s) — it is exempt from SIZE, not from SHAPE`);
  } else if (active) {
    warns.push(`no FAILURES.md and this project is ACTIVE — the team has nowhere to record its own defects, so they repeat (template: _templates/project/ai-worker/FAILURES.md)`);
  }
}

// 8) RESUME-HERE.md — what a COLD session reads to know where the project is.
// The previous attempt (PROJECT-STATUS.md) died of three things, and all three are
// checked here rather than left to a prose rule that decayed exactly once already:
// it was appended to instead of replaced, it sat outside ai-worker/ where nothing
// measured it, and nothing pointed at it. A memory file nothing measures is not memory.
{
  const rPath = join(AW, "RESUME-HERE.md");
  if (existsSync(rPath)) {
    const rSize = size(rPath);
    if (rSize > LIMITS.resumeFail) fails.push(`RESUME-HERE.md ${fmt(rSize)} > ${fmt(LIMITS.resumeFail)} — it is a page, not a log; it is REPLACED each session, never appended to`);
    else if (rSize > LIMITS.resumeWarn) warns.push(`RESUME-HERE.md ${fmt(rSize)} > ${fmt(LIMITS.resumeWarn)} (one page: what is live, what it waits on, from whom)`);

    // The append disease, detectable by shape — exactly like MOVED FROM in ORDER 6.
    // A snapshot that is appended to is no longer a snapshot.
    const snapHeads = readFileSync(rPath, "utf8").split("\n")
      .filter((l) => /^#{1,6}\s/.test(l) && /RESUME HERE|Where we are/i.test(l)).length;
    if (snapHeads > 1)
      fails.push(`RESUME-HERE.md has ${snapHeads} "RESUME HERE"/"Where we are" headings — it is being APPENDED to. It is a snapshot: replace it, never stack it (that is what killed PROJECT-STATUS.md)`);

    // Staleness is measured against the LOG DATE, never mtime — a fresh checkout
    // restamps every file, and the owner moves between machines constantly.
    if (newestLogDate) {
      const rDate = new Date(statSync(rPath).mtime);
      const rIso = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, "0")}-${String(rDate.getDate()).padStart(2, "0")}`;
      const behind = daysSince(newestLogDate) === null ? 0 : Math.round((Date.parse(`${newestLogDate}T00:00:00`) - Date.parse(`${rIso}T00:00:00`)) / 86400000);
      if (behind > LIMITS.resumeStaleDays)
        fails.push(`RESUME-HERE.md is ${behind} day(s) behind the newest log (${newestLogDate}) — a cold session would read a stale situation and look lost. PM rewrites it before ending any session`);
      else if (behind > 0)
        warns.push(`RESUME-HERE.md is ${behind} day(s) behind the newest log (${newestLogDate}) — the team moved and the situation file did not`);
    }
  } else if (active) {
    warns.push(`no RESUME-HERE.md and this project is ACTIVE — a cold PM session has nothing telling it where the project is (template: _templates/project/ai-worker/RESUME-HERE.md)`);
  }
}

// 9) the boot budget — what ONE role pays to read before it does any work.
// Not a context-window test: k3 holds 1M tokens and this would fit. It is a COST and
// CORRECTNESS test. Every session pays this read on every vendor's bill, and a knowledge
// file full of superseded, duplicated statements makes any model confidently wrong —
// "it fits" is not "it is read honestly" (owner supplied the vendor facts, 2026-09-23).
{
  const shared = size(join(AW, "PROTOCOL.md")) + size(boardPath) + (knowledgeFile ? size(join(AW, knowledgeFile)) : 0);
  for (const [role, roleFile] of Object.entries(ROLE_FILES)) {
    const rolePath = join(AW, roleFile);
    if (!existsSync(rolePath)) continue;   // role not staffed on this project
    const boot = shared + size(rolePath) + size(join(AW, "inbox", `${role}.md`));
    const detail = `${role} boot read ${fmt(boot)} (PROTOCOL+board+${knowledgeFile ?? "no knowledge file"}+${roleFile}+inbox/${role}.md)`;
    if (boot > LIMITS.bootFail) fails.push(`🔴 ${detail} > ${fmt(LIMITS.bootFail)} — paid on every session, on every vendor's bill`);
    else if (boot > LIMITS.bootWarn) warns.push(`${detail} > ${fmt(LIMITS.bootWarn)}`);
  }
}

for (const w of warns) console.log(`WARN  ${w}`);
for (const f of fails) console.log(`FAIL  ${f}`);
if (fails.length) {
  console.log(`\nRESULT: FAIL (${fails.length}) — run a PM housekeeping hop before dispatching work.`);
  process.exit(1);
}
console.log(`RESULT: PASS${warns.length ? ` (${warns.length} warning(s))` : ""} — board ${fmt(boardSize)}, dispatcher-state ${fmt(dsSize)}, today's log ${fmt(logSize)} (${today}, local).`);
