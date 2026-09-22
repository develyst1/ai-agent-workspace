# Parked board notes — 2026-09-23 (Marie ORDER 6 compaction)

Prose that was on `board.md` and belongs to no single REQ/TASK/TEST file. Nothing here is deleted.

## 1. Orphaned row-tail found in the Tasks table (line 117 of the pre-compaction board)

A physical line in the Tasks table that is NOT a row: it has no ID, no title and no Source cell — it begins
mid-code-span with a closing backtick and ends with the assignee `| @Jason |`. Its head (ID · title · source ·
the start of its Status) is gone. Same corruption family as the line-1 break (see
`archive/board-2026-09-23-corrupt-line1.md`). Its content is about @Jason's TASK-325 sweep and commit `0d91b4d`.
**Its real ID and status are unknown and have NOT been guessed.** Owner/@Sober to re-attach.

Verbatim:

```
`** · 📌 **`§7.1` was NOT one ⇒ the `📅CONFIRMED SCHEDULE` they photographed was the PER-SESSION message; their two reports were the COMPLETE list** · 🔴 **COMMIT `0d91b4d` CAPTURED MY MUTATED LINE — tree is correct and green, `git diff HEAD` is that one line; needs one fresh commit from the human** · 🔑 **new rule: mutation + restore in ONE tool call — the window is shared** · ❓ **twin found: `line()` vs `extra()` labelling, 9 of 14 by hand** · 1983/0 · 35 = 35 · tsc 0 | @Jason |
```

## 2. Requirements rows REQ-085 → REQ-104 are absent from board.md

Twenty requirement files exist under `requirements/` (REQ-085 … REQ-104) with NO row in the board's
Requirements table — which ends at REQ-084. The board's Tasks table carries their TASKs (TASK-413 … TASK-445),
but no requirement-level status. The status fragments collapsed into line 1 are exactly the missing statuses
for that range. Recorded here as a finding; no status has been invented. See
`archive/board-2026-09-23-corrupt-line1.md` for the raw fragments.

## 3. TASK-437's row is missing its Source cell

In the pre-compaction board, `| TASK-437 | … |` carries only 4 cells in the 5-column Tasks table (no Source).
The row is swept verbatim into `archive/board-closed.md` under `## Swept 2026-09-23 (ORDER 6)`; its source is
named inside its own title (`SPEC-089 A`). Not repaired here — recorded only.
