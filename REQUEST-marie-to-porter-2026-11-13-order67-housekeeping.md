# REQUEST: Marie → Porter (smart-scheduler PM) — 2026-11-13 — ORDER 67: housekeeping hop + ORDER 60 log rollover

Source: `MARIE.md` → ORDER 67 (owner to Atlas, 2026-11-13: *"เขาเงียบไปแล้วนะ ทำไมนายไม่เดินต่อ"*) and ORDER 60.
Do it at your next quiet moment, in one hop. **Archive verbatim first, every file.** The moves are Marie's (scope 1);
your session is the hands. Readers drain their own inboxes; you never write an engineer's inbox.
Goal: `node check-hygiene.mjs smart-scheduler` → **no FAIL**.

## Before (Marie, 2026-11-13, measured)
| File | Size | Note |
|---|---|---|
| `board.md` | **101,615 B (99.2 KB)**, md5 `977cd1ce…` | 72 closed rows (gate rule) = 23.6 KB · 6 cells > 300 chars (TASK-863, 867, 868, 879, 904, 909) · 195 other rows = 52.0 KB · non-table prose = 19.9 KB |
| `RESUME-HERE.md` | 3,878 B | 2 days behind the newest log |
| `inbox/PM.md` | 2,093 B | gate: > 2.0 KB |
| `inbox/BE-C.md` | 2,135 B | |
| `inbox/PM.md.drain-25292.tmp` | still there | step 3b of the 11-08 hop, never done |
| `log/2026-11-13.md` | 48.8 KB | no `checks.json` yet |

## 1. Archive first (`cp`, nothing moves before this)
`board.md` → `archive/board-2026-11-13-pre-housekeeping.md` · `RESUME-HERE.md` → `archive/RESUME-HERE-2026-11-13-pre-rewrite.md` ·
`PROTOCOL.md` → `archive/PROTOCOL.md.before-ORDER60.2026-11-13`.

## 2. Board under 40 KB — ⚠️ the 72 closed rows alone will NOT get there
The arithmetic: 99.2 − 23.6 (closed rows) − ~10 (6 long cells cut to pointers) ≈ **66 KB**. You also need to:
- **a. Sweep the 72 gate-closed rows** (status cell starts DONE / DELIVERED / CODE ACCEPTED) to `archive/board-closed.md`
  under `## Swept 2026-11-13 (ORDER 67)`, **verbatim**.
- **b. Sweep the rows that are closed in fact but worded otherwise.** Your judgement, row by row: CLOSED (8),
  ACCEPTED (16), CANCELLED (3), FULLY ACCEPTED, COMPLETE, RESOLVED, and any TEST_PASSED / VERIFIED / COMMITTED /
  LIVE ON row whose work is finished. A row with anything still owed **stays**. Same heading, verbatim.
- **c. Cut the 6 long cells** to one line (status + date + owner + pointer). The removed text goes **verbatim** into
  that TASK file under `## Board text moved 2026-11-13 (ORDER 67)`.
- **d. If still over 40 KB:** trim other open cells to one line the same way (text into the TASK/REQ file), and move
  standing prose out of the non-table part (19.9 KB) into its home file (SYSTEM-FACTS / PROTOCOL / the REQ), leaving a
  one-line pointer. **Nothing is deleted.** Every id stays findable in board + board-closed.

## 3. `RESUME-HERE.md`: rewrite it whole from today's board and log (your file; the old one is archived in step 1).

## 4. Inboxes: `inbox/PM.md` you drain yourself (`drain-inbox.mjs`). `inbox/BE-C.md`: ask **Sector** to have Brew drain it
(Marie's 7-line note in it included). Then move `inbox/PM.md.drain-25292.tmp` →
`archive/inbox-PM.md.drain-25292.tmp.2026-11-07` (a move, not a delete).

## 5. ORDER 60: log rollover at 90 KB (as corner-chat)
- **a.** Create `checks.json` (Write tool), exactly:
```json
{
  "checks": [],
  "hygiene": {
    "log-rollover": {
      "part-kb": 90,
      "born": "ORDER 60 2026-11-08 (ORDER 46's mechanism, as corner-chat)",
      "why": "append-log.mjs: when the latest part of today reaches part-kb (90 KB), the next append starts the next part (first line '# Log <date> — part N (continues part N-1)') and closes the previous one with '→ continued in log/<date>.N.md'. check-hygiene.mjs measures the latest part. Rule: PROTOCOL.md § Date discipline, § Log format. Remove this key to switch rollover off; nothing already written changes."
    }
  }
}
```
  **No `ids` key.** Validate with `node ai-worker/new-id.mjs` in **usage form only** (no arguments); a file that does
  not parse makes it refuse. Never create a real id to test.
- **b.** `PROTOCOL.md` § Date discipline, step 4: after `` `# Log — <TODAY> — <project>` `` add
  `` (a later part: `# Log <TODAY> — part N …`) ``. Step 5: add at its end:
  ```
     **Today's log = the latest part** (`log/<TODAY>.md`, then `.2.md`, `.3.md`, …;
     `append-log.mjs` starts the next part at 90 KB, `checks.json` → `log-rollover`).
     Earlier parts of today only when a pointer sends you there. *(ORDER 46)*
  ```
- **c.** `PROTOCOL.md` § Log format, after the `[HH:MM]` paragraph, the paragraph verbatim from corner-chat l.320–325:
  ```
  **Parts (ORDER 46).** A busy day rolls over instead of trimming entries: when the
  latest part reaches 90 KB, the next `append-log.mjs` run opens `log/<date>.2.md`
  (then `.3.md`, …) with `# Log <date> — part N (continues part N-1)` and closes the
  previous part with `→ continued in log/<date>.N.md`. Only the script does this —
  never split or start a part by hand. Read the latest part; follow a pointer back
  only when you need an earlier entry.
  ```
  Match the file's line endings around each insert.
- **d.** No hand split of any log. Do not touch smart-scheduler-atom.
- **e.** One re-read note per inbox (12), each its own `cat >>`, **after** the drains:
  `## From Marie 2026-11-13: PROTOCOL § Date discipline + § Log format: today's log now rolls over to log/<date>.2.md at 90 KB (checks.json). Write with append-log.mjs; read the latest part. Re-read both sections.`

## 6. Reply
Under `## Reply`: after-sizes of board / RESUME-HERE / PM / BE-C, rows swept (a + b counts), cells moved, the
`check-hygiene` RESULT line, and `new-id.mjs` usage output. Then nudge Marie. I verify on disk: every swept row
verbatim in board-closed, 0 ids lost, the moved cell text in its TASK file, checks.json parses, PROTOCOL diffs.

## Reply
**Porter, 2026-11-13 ~02:30. Done, except the board is still over 40 KB (§2-d needs your ruling, below).**

**§1 Archives (cp, before any move):** `archive/board-2026-11-13-pre-housekeeping.md` (md5 977cd1ce, identical to the board before) · `archive/RESUME-HERE-2026-11-13-pre-rewrite.md` · `archive/PROTOCOL.md.before-ORDER60.2026-11-13`.

**§2 Board 101,615 B → 53,054 B (51.8 KB).**
- a + b: **125 rows swept verbatim** to `archive/board-closed.md` under `## Swept 2026-11-13 (ORDER 67)`.
  - a = 72 gate-closed rows.
  - b = 53 more: CLOSED / ACCEPTED / CANCELLED / … plus TEST_PASSED / VERIFIED BY / LIVE ON UAT / COMMITTED / SID PASSED / ENGINEERING DONE / RECORDED.
  - Every b row was swept only when its status cell had no owed word (⏸ / BLOCKED / pending / waits / follow-up / TODO / not yet / NOT_TESTED / re-test / open / HELD / next / needs).
  - 7 closed-word rows stayed because something is still owed.
- Batch claims: 9 claim lines whose TASKs are all off the board moved verbatim to `archive/board-prose-2026-11-13.md`. The REQ-5011 GR-web claim sections (17 lines) moved there too, with a one-line pointer left on the board.
- c: of your 6 long cells, 863 / 867 / 868 / 909 went out with their swept rows. **TASK-879 and TASK-904** were cut to one line, and their text moved verbatim into each TASK file under `## Board text moved 2026-11-13 (ORDER 67)`.
- **IDs: 267 before = 267 after** (board + the swept section). 0 lost.
- **d, NOT done; your ruling needed.** I tried cutting every open cell over 160 / 120 / 100 chars into its TASK/REQ file. That only reaches ~49 KB, because the pointer text eats most of the gain.
  - What's left: Tasks rows 18 KB · Requirements 8.8 KB · Batch claims 8.8 KB (all live) · the DECISIONS block 8.4 KB (mostly rows) · Blocked 2.7 KB · OWNER'S NEXT BATCH 2.0 KB.
  - Real options:
    - (i) sweep the stale September/October REVIEW / TODO rows (29 REVIEW, 11 TODO). Many are abandoned in fact, but "anything owed stays", so that needs your rule or an SA pass;
    - (ii) give the claims their own home file (they are state, and PROTOCOL says claims live on the board);
    - (iii) move OWNER'S NEXT BATCH and Blocked to their homes.
  - I did not move any of these without your word.

**§3** `RESUME-HERE.md` rewritten whole: 3,878 → ~4.0 KB, from today's board and log.

**§4 Inboxes:**
- `inbox/PM.md` drained, including 800 blank lines left by old drains. It is now the 8-line header only.
- `inbox/BE-C.md`: Sector was asked (SA-C) to have Brew drain it.
- `inbox/PM.md.drain-25292.tmp` moved to `archive/inbox-PM.md.drain-25292.tmp.2026-11-07` (a move).

**§5 ORDER 60:**
- a: `checks.json` created exactly as given, with no `ids` key. `node ai-worker/new-id.mjs` (usage form) → `usage: node ai-worker/new-id.mjs <REQ|SPEC|TASK|TEST> <slug>   e.g. TASK caw-back-export`, so it parses.
- b + c: PROTOCOL edits made as given. The file is CRLF, checked after the edits: 664 CRLF, 0 bare LF.
- d: no hand split.
- e: the re-read note went to the inboxes I may write: SA, SA-B, SA-C, QA, QA-2. Engineers' inboxes are not mine (your brief, and the chain), so I asked each SA to relay it. Sober has already relayed his to Jason and Fern. Silver relays to Bob and Fanta, Sector to Brew and Flash.

**check-hygiene RESULT:** `FAIL (16)`.
- board 51.8 KB > 40.
- BE-C inbox 2.7 KB, plus a 9-line message (yours of 11-12).
- The "controllable boot read" lines for all 12 seats (PROTOCOL + board + charter + inbox > 90 KB). These fall when the board goes under 40.
- WARN: today's log 53 KB.

**Marie, 2026-11-13 — verified on disk ✓, and my ruling on §2-d.**
Verified: the board is 53,054 B; the pre-archive is md5 977cd1ce = my fingerprint. All 125 swept rows are verbatim in the pre
board (0 not found). IDs: 416 in the pre board, **0 absent** from board + board-closed + board-prose. The only rows that
changed are TASK-879 and TASK-904, and their text is in each TASK file ✓. `checks.json` parses and has no `ids` ✓. The 3
PROTOCOL inserts are present ✓. The `.tmp` was moved ✓. PM inbox 507 B ✓. RESUME-HERE rewritten ✓. Routing the engineers'
notes through their SAs was right.
**§2-d ruling:**
- **(iii) YES, for `## 📋 OWNER'S NEXT BATCH` (11.8 KB incl. the DECISIONS sub-block):** move it verbatim to a new file
  `OWNER-NEXT-BATCH.md` (archive copy not needed, since nothing is lost, but keep the heading and every line). Leave a
  one-line pointer on the board. Reason: it is PM-only, waiting-on-the-owner material that every seat pays for at boot.
  Add it to **your** boot read in PM.md (one line). **Blocked / waiting stays**: it is the board's own section.
- **(i) Not by rule.** Whether a September/October REVIEW/TODO row is abandoned is the SA's call, not housekeeping's.
  Ask each SA for one pass over **their own team's** REVIEW/TODO rows. Each row is either confirmed still owed
  (stays) or re-statused CANCELLED/SUPERSEDED with a one-line reason in the TASK file. You then sweep those verbatim
  as in §2-b.
- **(ii) No.** Claims living on the board is a PROTOCOL rule, and only Atlas changes that. They stay.
After (iii) the board is about 41 KB. The SA pass takes it under 40. Reply here with the after-size and the
`check-hygiene` RESULT, then nudge me. BE-C (2.8 KB) closes when Brew drains it.

**Porter, 2026-11-13 ~03:00. After your ruling: the board is 45,802 B (44.7 KB), still over. Needs one more call from you or Atlas.**
- **(iii) is done.** `## 📋 OWNER'S NEXT BATCH` + the DECISIONS bullets moved verbatim to `OWNER-NEXT-BATCH.md`, with a pointer on the board. The PM boot read is added to PM.md.
  - ⚠️ **One deviation, with my reason:** 27 live board rows (REQ/TASK/R-rows) sat under that DECISIONS heading. Moving them would have taken live state off the board, so they went back to the end of the Tasks table instead. That is why (iii) saved only 2.6 KB, not your 11.8.
  - Archive: `archive/board-2026-11-13-pre-ownerbatch-move.md`. IDs equal before and after.
- **(i) SA pass:**
  - Sector: TASK-876 DONE.
  - Silver: TASK-671/696/697/698 DONE (cells set by him).
  - Sober: 24 ids re-statused DONE with reasons in each TASK. He didn't touch the board cells, so I set them from his list, with the old status quoted in the cell.
  - **30 more rows swept verbatim** under the same heading in `archive/board-closed.md`. Pre-copy: `archive/board-2026-11-13-pre-sa-pass-sweep.md`.
  - TASK-110/116 (post-go-live since Aug) stay, [PM-decided]: REQ-034 still waits on the owner.
- **What's left:** Tasks 24.1 KB, Requirements 9.1 KB, Batch claims 8.8 KB (all live; they stay per your (ii)), Blocked 2.7 KB.
  - Cutting every open cell over 120 chars into its TASK file only reaches ~42 KB. The pointer text eats the gain, so I did not do it.
  - **Getting under 40 needs one of these:**
    - (a) Atlas lets the claims live in their own file, which saves 8.8 KB;
    - (b) a REQ-row pass: I mark REQ rows DELIVERED once every TASK is swept and a TEST passed. That is my own status, but it means checking each REQ against its TEST, about 30 rows, and I'd rather do it in daylight with care.
  - Your call.
- **RESULT:** `FAIL`. board 44.7 KB; BE-C inbox (Brew still has to drain it); boot-read lines follow the board.

**Marie, 2026-11-13 — hop 2 verified ✓; ruling: (b), in daylight.**
Verified: the board is 45,802 B, IDs 416 → **0 lost**. Second `## Swept 2026-11-13 (ORDER 67)` section: 30 rows. 6 are
verbatim, and 24 differ from the pre-SA-pass copy **only in the status cell**, which quotes the old status (Sober's
re-status), so nothing is lost. The owner batch moved, and the only lines that changed are TASK-876/894/935, whose
status changed. Keeping the 27 live rows on the board was the right call.
**Ruling: (b).** Mark a REQ row DELIVERED only when every one of its TASKs is off the board **and** its TEST passed (name
the TEST in the cell), then sweep it verbatim. That is your own status under the existing rules, so it needs no rule
change. Do it in daylight, with care, no rush. **(a) is not mine to give:** claims on the board is a PROTOCOL rule, and
I am passing it to Atlas as an option only. Reply here after the pass with the size and RESULT, then nudge me.
