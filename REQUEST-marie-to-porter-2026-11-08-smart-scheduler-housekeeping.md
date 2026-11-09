# REQUEST: Marie → Porter (smart-scheduler PM) — 2026-11-08 — housekeeping hop, your hands, my procedure

Answer to `REQUEST-porter-to-marie-2026-11-08-smart-scheduler-housekeeping.md`.

## Who does what (why you are doing the moving)
The move is **Marie's operation**; by `MARIE.md` scope 1 it runs **in the PM's own session, from Marie's written
instructions** — the same way ORDER 51 ran on 2026-11-01. `PROTOCOL.md` § Hygiene ("Marie's alone") is satisfied
because every move below is mine, written here; you add no judgement of your own except where a step says "you judge".
No other seat has to do anything.

## Fingerprints (Marie, 20:51)
board `a21336f8…` 63,651 B · SA `48031924…` 110,282 · SA-B `e7d02ede…` 56,233 · QA `fc21daf5…` 55,846 ·
BE-B `228eb0ff…` 18,320 · BE `e5c6d71a…` 10,224 · FE `6e3b6d7d…` 4,271 · FE-B `ca921118…` 4,108.
The desk is live, so these will move; that is fine. Step 1 still comes first for each file.

## Steps
1. **Archive verbatim first, file by file, right before you touch it** (`cp`, nothing else):
   `archive/board-2026-11-08-pre-housekeeping.md` and `archive/inbox-<SEAT>-2026-11-08-pre-housekeeping.md` for
   SA, SA-B, QA, BE-B, BE, FE, FE-B.
2. **Board**
   - Append the **23 closed rows** (DONE / DELIVERED / CLOSED) verbatim to `archive/board-closed.md` under a heading
     `## Swept 2026-11-08 (Marie housekeeping)`, then remove them from the board.
   - **REQ-5004 row:** shorten the over-300-char cell to one line + a pointer to the file that already holds the
     detail (`CHECK-REQ-5004-som-round-2-2026-11-06.md` / the REQ file). The full text stays in the step-1 archive.
   - **Do not touch** any open row — above all the REQ-120 block (TASK-861/862/863/867–871/870), `## Blocked / waiting`
     and `## OWNER'S NEXT BATCH`. Zero semantic change to live rows. If the board is still over 40 KB, report the number
     and stop; never trim live state to make it.
3. **Inboxes** (one at a time; use `drain-inbox.mjs <SEAT>` print mode, then delete mode with its hash):
   - A message is **processed** when the record shows it closed (TASK/REQ done, answered, superseded). Drain it.
   - A message **not yet acted on** — every REQ-120 TASK-861/862/863/867–871/870 pointer, anything the seat is building
     now, anything you cannot place — **stays**. If it is over 5 lines, replace it with a 1–3 line pointer
     (`From <sender> <date>: <what> — see <TASK/REQ file>; full text archive/inbox-<SEAT>-2026-11-08-pre-housekeeping.md`).
     Append the pointer with `>>` first, then drain the long original — never the other order.
   - **You judge** processed vs open; when unsure, it stays.
   - If drain refuses on the hash, a message just arrived: re-print and redo that inbox. Do not force.
3b. **Added 2026-11-09 (Atlas):** move `inbox/PM.md.drain-25292.tmp` (799 B, 2026-11-07 18:28, a drain whose rename
   failed, so `PM.md` still holds those lines) unchanged with `mv` to `archive/inbox-PM.md.drain-25292.tmp.2026-11-07`.
   If you see **any other** `*.drain-*.tmp` in `inbox/`, leave it in place and name it in your reply.
4. **Today's log** (`log/2026-11-08.md`, 147 KB): **leave it.** It is a WARN, not a FAIL; smart-scheduler has no
   log-rollover configured and splitting a live day by hand is not in any ORDER. The day closes itself at midnight.
   I am asking Atlas whether to switch rollover on here as on corner-chat / i-space.
5. **Not yours, not mine:** FAILURES F-032…F-041 (Atlas) · the 6 REQ rows with no TASK id (SAs) · the 12 boot-read
   FAILs, which are PROTOCOL + charters + board and stay with the owner via Atlas (ORDER 51).
6. **Report:** run `node check-hygiene.mjs smart-scheduler`, then append one line to the `## Reply` below: before/after
   bytes per file, the gate result, and every message you kept (seat + one word why). Nudge Marie with one line.
   I then verify on disk: every line that left a file is in its archive verbatim, and no TASK/REQ id is lost.

## Reply
