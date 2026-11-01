# Board sections moved verbatim, 2026-11-01 (Marie ORDER 51, Atlas-approved) — from board.md md5 ed5c50e0dcb74d70c6eafe68a88e0d9b

The headings stay on the board with one pointer line each. Full pre-move copy: `archive/board-2026-11-01-pre-sections.md`.

## 🔴 DEADLINE (lines 4–13, the body under the heading)


> ⚖️ **"เลื่อนวัน ทำให้ตรงที่ลูกค้าขอ"** — he moved the date rather than ship a model the customer had not asked for.
> 🔑 **The leave model was guessed THREE times; only the third is HERS, in her own words, and it is the SMALLEST of the three:** a leave whose make-up cannot fit is **REFUSED** — at the parent's door AND the admin's. 🚫 **Not "created past the expiry" (Porter's §11.4 misquote), 🚫 not "held" (Porter's reading of her later answers).** **A COACH's leave and a school cancel NEVER refuse.** **Source: `REQ-112`, last blocks — quote THAT, never a restatement.**
> 🔑 **Earlier rulings kept the words "rigour, not scope": 🚫 nothing slid out comes back because the date moved** — `REQ-114 (iii)` · `TASK-639` · `TASK-652` **stay out.** 🚫 **Khwan's 192-string workbook is a ROUND OF ITS OWN — listed, not absorbed.**
> ▶️ **Gates: sid #1 THU 8 · QA FRI 9 · sid #2 SUN 11 · QA MON 12 · fix TUE 13 · sid #3 + QA WED 14 · uat THU 15 / FRI 16.** 🚫 **No QA step cut · no uat deploy without a sid pass · no team reported green alone.**
> 🔴 **Critical path: @Fern's `TASK-658` (the 13 approved copy rows).** `TASK-692` is **S**; `TASK-693` **dropped**.
> 🔴 **REQ-112 still ships only on a hand-checked expiry for one course of EACH size (4 / 6 / 10).**
> ⚠️ **The customer still holds SUN 11.** **One message on FRI 9, when QA #1 passes — the owner's to send, never an agent's.**
> 📌 **Plans: `PLAN-round-to-2026-10-14.md` (superseded, kept) ← `PLAN-round-to-2026-10-11.md` (superseded, kept).**


## TASK number blocks (lines 15–21)


> 🔴 **Neither SA reads the board to pick a number. Each allocates only from its own block.**
> **Team A (@Sober): 630–659 USED UP · 690–719 USED UP · now `800–829`** (issued by @Porter 2026-10-12, after Sober had already taken 800/801 for REQ-118 and asked; confirmed).
> **Team B (@Silver): 660–689 USED UP · 720–749 (744–749 left as of 10-18) · next `750–779`** (issued by @Porter 2026-10-18).
> ⚠️ **`696` `697` `698` are TEAM B's, by exception, 2026-10-07.** **They were cut inside Team A's block through @Porter's error** — he issued the block AND approved all three numbers without noticing — **and they are already embedded in file names and mutation-set ids** (`link-parent-create-task696.dom.test.tsx`, `action-gate-task696.mutations.json`). 🔑 ***A number that lives in a filename has stopped being a label and become an address; renumbering a finished task to tidy a ledger breaks the one link between the board and the code.*** ⇒ **the exception is cheaper than the correction, and it is written here so nobody "fixes" it later.**
> Numbers at or below 629 are already issued and are never reused. When a block runs low, the SA tells @Porter and @Porter issues the next one — **an SA never extends its own block, and never takes from the other's.**


## Batch claims — the closed batches only (lines 24–25 and 34–47)

**Batch 2026-10-08: Team A → REQ-116** (camp add-coach refusals, @Porter) · back `src/services/camp.service.ts` + tests (read only so far) · front the camp week edit dialog (`Camp/OpenWeekDialog.tsx`) + `src/lib/camp/grid.ts` + tests. Team B: nothing open.
**Batch 2026-10-12: Team B → REQ-119** (Daily Report: back `GET /reports/daily` serves Palm's contract; front is Palm's, read only). TASK-737 (Bob) claim granted by @Porter: new `lib/daily-report.ts` + `services/daily-report.service.ts` + tests · `api.ts`:312-314 · `validation.ts`:80 · `types/contract.ts`:290-299 · `openapi/document.ts`:390-397 · Team A: nothing open.

- **Batch 2026-10-02 (REQ-111, 8 items):**
  **Team A → the LEAVE & TEACHER machinery** · back `src/services/scheduler.service.ts` · `src/lib/leave-*` · the leave/teacher-leave paths in `src/services/line-webhook.service.ts` and their routes · front `src/components/partials/Calendar/Modal/*` (incl. `BookingModal.tsx` — the booking detail and the leave dialog) · `src/components/partials/OtherSeries/*` (`TeacherDialog`, `OtherSeriesModal`) for item E · `src/components/partials/Teachers/*` (added 2026-10-02 for item C's entry point). 🔻 **Corrected 2026-10-02: `partials/Schedule/` does not exist — @Silver found it while sizing. `OtherSeries` is added to Team A because item E's door lives there.**
  **Team B → MESSAGES, BOOKINGS-LIST and the CALENDAR GRID** · back `src/lib/line-i18n.ts` · `src/lib/line-message.ts` · `src/lib/line-message-fields.ts` · the bulk-confirm route + the booking-history/permission read · front `src/components/partials/Bookings/*` · `CalendarGrid.tsx` · `CalendarWeekGrid.tsx` · **`CalendarContent.tsx`** · **`lib/scheduler/teacher-scope.ts`** · `lib/camp/grid.test.ts`. 🔻 **Added 2026-10-02 (@Silver's Q5): those two shared files have ONE owner this batch and it is Team B.** 🔴 **If Team A's item C needs `CalendarContent.tsx`, it STOPS and tells @Porter — it does not reach.**
  ⚖️ **2026-10-04 — CORRECTION by @Porter: the copy-write reservation on the line below does NOT reach `empty_checkin` / `qr_none`.** **Team B writes those two keys in its OWN file (`back/src/lib/line-i18n.ts`) for `TASK-661`, owner-approved copy (Draft A′).** 🔑 *The reservation was written to stop two teams editing wording WHILE item A catalogued it; item A is delivered, so that reason has expired for these two keys.* 🔴 **Conditional: @Sober must confirm the `TASK-609` cap removal does NOT touch `line-i18n.ts`. @Bob holds for @Porter's GO/WAIT and does not ask @Sober himself.** 📌 **The board contradicted itself — line 18 gives Team B the file, line 20 gives Team A all copy. Both were @Porter's words.**
  🔴 **Team B's item A is READ-ONLY on the dictionaries** — it produces an inventory document, it does not edit wording. **Team A keeps the WRITE on all copy this batch.** If A turns into an edit, it comes back to @Porter before anyone writes.
  🔴 **Palm's files stay untouched by both teams** (SYSTEM-FACTS, owner 2026-09-29).
  ➕ **2026-10-04 — Team B also claims `back/src/services/parent.service.ts` and its test**, for `TASK-660` (F5). Granted by @Porter after @Silver stopped rather than reached: no Team A task touches those files and the tree was clean at the time of the claim.
- **Batch 2026-10-05 (post-REQ-111: the parentless-children fix + the LAST badge):** claimed by @Porter 2026-10-04 after the owner committed the REQ-111 batch.
  **Team A (@Sober) → `TASK-645` (REQ-113, the LAST badge) — BACK END ONLY** · back `src/services/scheduler.service.ts` · `src/lib/course-plan.ts` (was unclaimed) · **with their co-located tests.** ✅ **No front-end change at all**, so nothing crosses.
  **Team B (@Silver) → `TASK-644` piece A, then piece B (parentless children)** · back `src/validation.ts` (was unclaimed) · front `src/components/common/StudentSelect.tsx` (🔴 **SHARED — one owner this batch and it is Team B**) · `src/components/partials/Bookings/ImportBalanceModal.tsx` · `src/components/partials/People/*` (for piece B) · **with their co-located tests.**
  🔴 **Team A is TOLD, not asked: `StudentSelect.tsx` is used by Team A's booking modal and the camp dialogs. Its behaviour CHANGES — a NEW student will require a household on the booking path.** 🚫 **Team A does not open that file. If Team A needs it, it STOPS and tells @Porter.**
  🔑 **Why this split and not the obvious one: @Sober SIZED `TASK-644`, but sizing is not ownership.** **Piece A's files are Team B's (the import modal) and the shared picker, and @Silver was idle.** ⇒ **Two teams, two whole items, zero shared files.**
  ➕ **2026-10-04 (same batch), granted by @Porter:** **Team A also claims `back/src/db/mappers.ts` — for ONE COMMENT, nothing else** (the badge field's comment still says the opposite of what `TASK-645` built). 🔑 *The rename caught every CODE reader at compile time; a comment is a reader the compiler cannot see.* · **Team B also claims the `student.*` keys in `front/src/lib/i18n/dictionaries.ts`** (the picker's "(optional)" label must change with `TASK-644` piece A). ✅ **No collision: the REQ-111 batch that held the copy write is committed and closed, and Team A's `TASK-645` is back-end only.**
  ⚠️ **`lib/scheduler/teacher-scope.test.ts` stays as `TASK-653` says: nobody touches it until the dialog's pins are moved next to the dialog.**

## Project context (lines 50–100)


> 📌 This block was moved OUT of here into `SYSTEM-FACTS.md` on 2026-09-09. It is board context, not knowledge.
> Durable part only; the full original block is verbatim in `archive/SYSTEM-FACTS-2026-09-28-investigations.md` §Project info.

| | |
|---|---|
| **Product** | Scheduling + back-office ERP for a balance/wheeled sports activity centre. 🔴 **Not a tutoring school** — docs that say so are wrong. |
| **Repos — scheduler** | `smart-scheduler-back` scheduling API, Bun + Drizzle, **:4006** → Jason · `smart-scheduler-front` staff calendar UI, Next.js, **:3016** → Fern. |
| **Repos — backoffice** | `smart-scheduler-backoffice-back` finance API, **:4010** → Jason · `smart-scheduler-backoffice-front` admin money UI, Next.js, **:3018** → Fern · plus `smart-scheduler-requirement`. |
| **Paths** | 🔴 Absolute repo paths live ONLY in `machine.local.md` at the workspace root. Never in a committed file. |
| **Branch** | 🔴 **`develop` is the CANONICAL central branch in every repo** (owner, 2026-08-28). `dong`/`dong2`/`dong3` are not the reference. |
| **Shared ground** | **Another team also builds on `develop`.** Before speccing calendar, course card, cell, expiry or LINE, read what `develop` already does (`git show develop:<path>`) and re-apply only what is genuinely missing. Never build against a remembered tree. |
| **DB** | One PostgreSQL: `public.*` (scheduling) + `bo.*` (finance, same `smart_scheduler` DB; `ops` RETIRED by REQ-006 / TASK-027). Reading the Drizzle schema files is fine — the DATA REQUEST rule covers real data and live environments. |
| **Read first** | `ai-worker/SYSTEM-FACTS.md` → `ai-worker/project-understanding.md` (as-built map) → monorepo root `CLAUDE.md` + `docs/`. Newest wins. |
| **Team** | Porter (PM/BA) · Sober (SA) · Jason (BE) · Fern (FE) · **Tanya (QA — trial, this project only)**. |
| **QA trial** | Tanya talks to Porter only; tests on **local + `sid`**, never `uat`; owns `IN_TEST` / `TEST_PASSED` / `TEST_FAILED`. A REQ is `DELIVERED` only after a `TEST_PASSED` **and** a post-deploy re-check. |
| **QA test data** | She **may create test data on `sid`**, declaring and retiring the footprint in the TEST file. |
| **Environments** | Exactly TWO servers. Read `ai-worker/SYSTEM-FACTS.md` § ENVIRONMENTS before any deploy talk. |


> **State only:** ID · title · status · owner · pointer. Detail, evidence and history live in `requirements/`,
> `tasks/`, `specs/`, `tests/`, `log/` — never in a cell.
> 🧹 **Compacted 2026-08-29 (Marie housekeeping, owner-approved). Nothing deleted:** the pre-compaction board is
> `archive/board-2026-08-29-pre-compaction.md` (verbatim), each row's old narrative was appended to its own REQ/TASK
> file, and prose belonging to no single file is in `archive/board-2026-08-29-parked-notes.md`.
> 🧹 **Compacted 2026-09-23 (Marie housekeeping, owner-approved, ORDER 6). Nothing deleted:** the
> pre-compaction board is `archive/board-2026-09-23-pre-compaction.md` (verbatim), closed rows are in
> `archive/board-closed.md`, and prose belonging to no single file is in
> `archive/board-2026-09-23-parked-notes.md`.
> 🔴 **Line 1 of this board was CORRUPT** (a collapsed status column, 4,764 chars, first seen 2026-09-19).
> Restored to the title; the corrupt line is preserved verbatim in `archive/board-2026-09-23-corrupt-line1.md`.
> **Open for the owner:** REQ-085 → REQ-104 have no Requirements row here, one Tasks row-tail lost its head,
> and no status has been guessed back — see `archive/board-2026-09-23-parked-notes.md`.
> 🧹 **Compacted 2026-09-29 (Marie housekeeping, owner-approved). Nothing deleted:** the
> pre-compaction board is `archive/board-2026-09-29-pre-compaction.md` (verbatim), closed rows are
> in `archive/board-closed.md`, the 112 orphan rows found above the title are in
> `archive/board-2026-09-29-orphan-rows.md`, and prose belonging to no single file is in
> `archive/board-2026-09-29-parked-notes.md`. **Second compaction — the first was 2026-09-23,
> when the board was 22 KB.**
> 🧹 **Swept 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the pre-sweep board is
> `archive/board-2026-10-02-pre-sweep.md` (verbatim, 140,891 B), the **11 orphan rows found above the
> title** are in `archive/board-2026-10-02-orphan-rows.md`, closed rows are in
> `archive/board-closed.md` → `## Swept 2026-10-02`, and prose belonging to no single file is in
> `archive/board-2026-10-02-parked-notes.md`. **Third sweep — 2026-09-23, 2026-09-29, 2026-10-02.**
> 🔴 **THE CAUSE IS NOT FIXED.** Every board row written since the 2026-09-23 repair (TASK-446 → TASK-556)
> landed ABOVE this title instead of in the `## Tasks` table — the table's high-water mark sat at TASK-328
> in both the 2026-09-23 commit and today. Whatever writes this file anchors on the START OF THE FILE, not
> on the `## Tasks` heading. **Before writing a row, check that it went INTO the table**; if rows are above
> the title again, stop and tell the owner — do not just tidy them away. Evidence: the report of 2026-09-29
> and `archive/board-2026-09-29-orphan-rows.md`.

