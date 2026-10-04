# TASK-623 — add the two new leave notifications to the message inventory — BE, XS (script only, not deployable)
- Source: REQ-111 item A follow-up · Porter's go 2026-10-03 (an explicit exception to the freeze) · follows TASK-620
- Status: DONE (reviewed by Silver, 2026-10-04) — ✅ **UNBLOCKED 2026-10-04 (Silver):** the owner approved `T-608` "1 ผ่านหมด" (`COPY-REVIEW-2026-09-29.md`, foot of the file). I compared the approved text with `line-i18n.ts:774-782`, and the two match word for word.
  - 🔑 **The approved copy file is the source of truth.** Your DoD therefore includes checking the rendered rows against it.
  - 🔴 **Testing rule (owner, 2026-10-04): you do NOT run anything against `sid`.** The script needs no database, so it is fine as it is.
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-03)
- Depends on: Team A's copy for `teacher_leave_recorded` / `teacher_leave_lifted` approved by the owner (Porter tells me; I unblock this)

## §0 Why
- TASK-608 (Team A) added two teacher notifications, `teacher_leave_recorded` and `teacher_leave_lifted` (`src/lib/line-message.ts`).
- The inventory script now refuses to run: `renderer kinds not in the inventory: teacher_leave_recorded, teacher_leave_lifted`.
  - ✅ **@Porter, verbatim in spirit:** the guard refusing to run, rather than quietly emitting an incomplete list, is **exactly the behaviour he wants.** That is your drift guard, Bob, and it caught a list that was about to reach the owner already wrong.
- ⇒ The 10-02 workbook is stale and is HELD.

## What to do (only once this is unblocked)
1. Add two rows to `KINDS` in `scripts/inventory-line-messages.ts`:
   - audience `teacher`;
   - a fake fixture: a date, `classes` of 0 **and** above 0 for the recorded case (the "nothing was cancelled" line only prints when classes > 0), and an invented actor name;
   - a one-line "when it is sent" (an admin records / removes a leave day on the teacher's behalf).
   - Add a variant row so Fern sees both versions of "recorded", the same way you handled the earlier title variants.
2. Re-run into `smart-scheduler/project-docs/req111-message-inventory/`, overwriting `push.csv` / `replies.csv`.
3. 🚫 **Do not touch `line-i18n.ts` or `line-message.ts`** (Team A's copy). 🚫 Nothing else in the repo.

## Definition of Done
- [ ] The script runs to completion; `unrendered: []`; the push row count is in your notes (it was 41).
- [ ] Both new kinds appear in TH and EN, and the recorded kind appears in both the 0-class and the classes variants.
- [ ] **Every rendered line of both kinds matches the approved `T-608` entry** in `COPY-REVIEW-2026-09-29.md` (the four "recorded" lines and the three "removed" lines). Any difference is reported, not fixed: the copy belongs to Team A.
- [ ] Privacy greps as in TASK-620: no UUID; the only phone number is the dictionary's own example.
- [ ] `git status`: only the script changed. Nothing committed.

## Implementation Notes
**Bob, 2026-10-04.**

**What changed:** `scripts/inventory-line-messages.ts`, `+4` lines (one comment and three `KINDS` rows). Nothing else of mine changed in the repo.
- ⚠️ `git status` also shows Team A's uncommitted work: `line-i18n.ts`, `scheduler.service.ts`, `other-series.service.ts`, `scripts/mutation/*`, and several tests and mutation files. None of it is mine and I touched none of it.
- `git diff -- src/lib/line-message.ts` → 0 lines.

**The three rows (all audience `teacher`, all fixture values fake):**
- `teacher_leave_recorded (classes on that day)`: `classes: 2`, actor `Admin D`.
- `teacher_leave_recorded (no classes that day)`: `classes: 0`. The "not cancelled" line correctly does not print.
- `teacher_leave_lifted`: `actor: null`, exactly as the producer sends it (`scheduler.service.ts:3448`). So it has no "Recorded by" line, which matches the approved three-line removal notice.
- **Declared:** the "when" lines say "not sent when the coach records it themselves". That is the producer's `onBehalf` rule (`:3362`), and Fern should know a coach's own leave triggers nothing.

**Run:**
```
bun run scripts/inventory-line-messages.ts <workspace>/smart-scheduler/project-docs/req111-message-inventory
```
- Result: **`pushRows: 44`** (was 41, +3) · `pushKinds: 36` · `rendererCases: 31` (was 29, +2) · `unrendered: []`.
- Flags unchanged: NO WORDING YET 5 · NO PRODUCER 3 · HARD-CODED 32. `replyRows: 169`, unchanged, because the new dictionary keys are all shown in push.
- No DB, no LINE, nothing against `sid`; the script blanks that env before importing anything.
- Overwrote `push.csv` + `replies.csv` (BOM `EF BB BF` checked). Silver's `.xlsx` in that folder is untouched.

**Checked against the approved `T-608` entry (`COPY-REVIEW-2026-09-29.md`):**
- A throwaway check (in my scratchpad, not in the repo) pulled every quoted phrase from the `## T-608` section and compared every rendered line of the 3 rows, TH and EN, against them.
- `{n}`, `{admin}` and the sample date were compared as shapes.
- Result: **26 lines, 26 OK, 0 mismatches.**
  - Recorded with classes: 5 lines. Recorded with 0 classes: 4 lines. Removed: 3 lines. Each in both languages.
  - Every label matches too: `Date:` and `Recorded by:` / `บันทึกโดย:` use the old `label: value` shape, which is what the approved copy shows.

**Privacy greps:**
- Phone: `grep -aEn '0[0-9]{9}' push.csv replies.csv` → 1 hit, `replies.csv:90`, `verify_parent_badphone`. That is the dictionary's own example number, kept per your Q1 answer on TASK-620.
- UUID grep → nothing (exit 1).

**Typecheck:** `bunx --package typescript@5.6.3 tsc --noEmit --strict --types bun scripts/inventory-line-messages.ts` → exit 0. I did not run the test suite: this TASK changes no product code, and the script is the whole deliverable.

**Housekeeping:** my 10-02 `SYSTEM-FACTS.md` line advised `--env-file=.env.sid` for test runs. The owner's 10-04 ruling supersedes it, so I appended a SUPERSEDED note under it (the old line is kept, not deleted).

## Questions
(Bob asks; Silver answers as `> answer: ...`.)
- None.

## Review
**Silver, 2026-10-04 — ✅ DONE.**
- **Diff read:** `scripts/inventory-line-messages.ts`, +4 lines (one comment and three `KINDS` rows). All fixture values are fake.
  - The other files in `git status` belong to Team A (`scripts/mutation/*` and more). None of them were touched by this TASK.
- **Re-run by me** into my scratchpad: `pushRows 44 · rendererCases 31 · replyRows 169 · unrendered []`. **Both CSVs are byte-identical** to the delivered ones (`cmp`).
- **Copy:** the rendered "recorded" row reads exactly as the approved `T-608` entry, which I read myself. That agrees with Bob's 26/26 check.
- **Privacy:** UUID grep 0. The only phone number is the dictionary's own example (see TASK-620 Q1).
- **Good calls, accepted:**
  - The "lifted" fixture uses `actor: null`, exactly as the producer sends it, so the sheet shows the true three-line notice.
  - The "when" line tells Fern that a coach's own leave triggers nothing.
- 📌 **A tracked script in a shared tree:** the script now shows as `M`, not `??`, so the owner has committed it. A new notification kind will keep tripping its guard (SYSTEM-FACTS § LINE), which is what we want.
- **Workbook rebuilt:** `project-docs/req111-message-inventory/REQ-111-message-inventory-DRAFT-v2-2026-10-04-for-owner-review.xlsx`.
  - `Notifications (push)` has 44 rows, including the 3 new ones at rows 34–36, and `Chat replies` has 169.
  - I read it back to check.
  - The 10-02 v1 file stays in the folder as the old version, and **must not be sent.**
