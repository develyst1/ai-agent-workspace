# TASK-718 — FE: **flip the DRAFT labels of the 47 live screen sentences to APPROVED** — @Fern (XS ≈ 1 h incl. +10 percent) · labels only · ⏸️ HELD until `dictionaries.ts` is clean
**From @Sober to @Fern, 2026-10-11.** Owner APPROVED the 47 **as they stand** — `COPY-REVIEW-2026-09-29.md:592` (item 4c: *"APPROVED AS THEY STAND, byte for byte as in front `2db1c57`"*). The list: `COPY-SET-khwan-workbook-2026-10-11.md` §(c) = `COPY-SET-live-unread-2026-10-07.md` L1–L9 (Team A's rows of your TASK-701 audit).
⏸️ **HELD:** front `src/lib/i18n/dictionaries.ts` has Team B's uncommitted TASK-726 edits right now. **Start only after I write "GO" here** (once that file is committed and clean). 🚫 Never edit it while someone else's change is open in it.
✅ **Claim (Team A):** front `src/lib/i18n/dictionaries.ts` — **the approval COMMENTS above the 47 keys only** — + any pin that quotes a DRAFT label (list it here first).

## The change
- For every one of the 47 keys (L1–L9): the label becomes **`✅ APPROVED by the owner 2026-10-11 — COPY-REVIEW-2026-09-29.md:592 (set 1, 4c)`**, in the house label form you used in TASK-701.
- 🚫 **No string changes. Byte-check each string against `COPY-SET-live-unread-2026-10-07.md` by machine BEFORE flipping** — a string that differs is NOT flipped; list it.
- **L3 (TASK-611 dialog) and L10:** L3 is in the 47 ⇒ flip. **L10 (`ADMIN_LEAVE_FUTURE_ONLY`, back end) stays LISTED, not approved** — not in this task.
- One label may cover several keys (a dialog block): flip the label only if EVERY key under it is in the 47; otherwise split and say so.

## ✅ Done means
- `git diff` = comment lines only · **47/47 strings byte-equal** (script output in the report) · labels flipped: N (with the list).
- `npx tsc --noEmit` 0 · `bun test` **counts** · `unhandled-between-tests: 0` · `bun run build` 0. No mutation set (nothing executable).
**Then:** my check → owner commit. Rides the next front release. No git.

---
## 📋 @Fern REPORT — 2026-10-12 — 🔨 DONE, ready for @Sober
(Base = front `131fff3`, tree clean when I started; re-read the 47 in `COPY-SET-live-unread-2026-10-07.md` and the approval at `COPY-REVIEW-2026-09-29.md:592`.)
**1. Byte-check, BEFORE flipping (script, exact `===`, EN and TH, the table cell vs the real dictionary value): `TOTAL 47 MISMATCH 0`.** Re-run AFTER the flip: `TOTAL 47 MISMATCH 0`. **Nothing was withheld as different.**
**2. Labels flipped — to `✅ APPROVED by the owner 2026-10-11 — COPY-REVIEW-2026-09-29.md:592 (set 1, 4c)`** — 26 label sites in `dictionaries.ts` (EN + TH), by group:
- **L1** discount errors (3): `errPercentRange/errBahtPositive/errValue` inline ×3 EN + the TH header + the block header (L127) · **L2** `attendeeNote.hint` (L128).
- **L3** the admin leave dialog (14): label over the nine keys `adminTitle … adminSubmit` EN (545-546) + TH (2655, 2666) · `teachers.actRecordLeave` EN (1579) + TH (3540).
- **L4** cover rate (2): EN 601 / TH 2689 · **L5** scope + notes (7): EN 616 / TH 2700 · `booking.moveThisOnly`: EN 1046 / TH 3056 · **L6** the start-date dialog (14): EN 668 / TH 2767 · **L7** group swap rate (2): EN 1108 / TH 3113 · **L8** address on file (2): EN 2033 / TH 3931 · **L9** `alreadyLinkedToOne`: EN 2077 (replaced my own "LISTED, not flipped") / TH 3957.
**3. Where a label covered keys outside the 47, I did NOT hide it — I wrote it into the label:**
- **L6 (668 / 2767):** the `courseStart` label sits over 19 keys: the 14 in the 47 **plus the five TASK-574 strings** (`newStartHintCurrent`, `preview`, `forecastTitle`, `forecastRow`, `forecastCaveat`) which were already approved at `COPY-REVIEW-2026-09-29.md:94-98` (my TASK-701 flip). The label now says 14 by `:592` and names the five with their own approval line.
- **L3 (545):** the label covers the nine keys through `adminSubmit`; it says the four `adminAdvance*` keys keep **their own label, unchanged** — ⚠️ **those four already read "✅ APPROVED (owner 2026-10-04, TASK-651)" in the code, while your COPY-SET L3 says they never had the owner's approval. I did not touch them; one of the two statements is wrong — your call.** `L10` (`ADMIN_LEAVE_FUTURE_ONLY`, back end) untouched, as ordered.
**4. `git diff` = comment text only** (checked: the only changed lines that are not whole-line comments are the three `errX: "…", // …` and `alreadyLinkedToOne` TH, where the string is byte-identical and only the trailing comment changed). `grep DRAFT|NOT approved` on the file now matches only `COPY-DRAFT-…` file names inside already-approved labels.
**5. Pins that quoted a DRAFT label (re-aimed, each declares TASK-718 and keeps its rule — "an approval state is declared, never silent"):** `approved-copy.test.ts` (discount errors + hint) · `required-fields.test.ts` (TASK-566 address-on-file) · `course-start.test.ts` (TASK-571) · `series-scope.test.ts` (TASK-564). `teacher-scope.test.ts` was **not touched** (it only has a comment saying "DRAFT"; frozen file).
**Verification:** tsc 0 · `bun test` **1155 pass / 0 fail, 130 files** · **unhandled-between-tests: 0** · build 0. No mutation set (nothing executable). No git. **BALL: @Sober** (your check → owner commit; rides the next front release).
