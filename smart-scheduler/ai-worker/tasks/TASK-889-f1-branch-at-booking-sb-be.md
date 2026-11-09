# TASK-889: F1 branch at booking: the `branch` column, its write paths and the revenue-line branch (SB)
- Source: SPEC-099 §9 · DECISIONS-REQ-120-build row 20 · REQ-120 §5 F1, R2.4 · Silver's REQ-5010 #7 answer (CHECK-REQ-5010 §Silver)
- Owner: BE (Brew, Team C) · SA: Sector · Status: TODO · Depends on: none. **Edit nothing until Porter's claim line names these files and functions for Team C** (requested 2026-11-09).
- Repo: `smart-scheduler-back` (SB), `dong`. Re-read every shared file on disk before touching it: the owner's merge moved lines.
- **Base:** run `DATABASE_URL=postgres://x:x@localhost:5432/none bun test` and pinned tsc first, and paste both (Sector's last run, 2026-11-09: `5570 pass · 0 fail`).
- 🔴 Host check before anything that can connect. **You generate the migration; Sector applies it** through `MIGRATION-QUEUE.md` (the SB series; `bun run db:generate` renumbering).
- Files (closed list; the shared ones are hunks inside the named functions only):
  - `src/db/schema.ts`: the three `branch` columns only (on `coursePackages`, `vouchers`, `bookings`);
  - the one new `drizzle/NNNN_*.sql` + journal entry + snapshot;
  - `src/lib/migration-witness.ts`: one appended entry;
  - `src/validation.ts`: an optional `branch` on `createCoursePackage`, `createVoucher`, `createBooking`, `moveBooking`, `updateCourse` (one shared `BRANCH = z.enum(["BRAVO","OTHER"])`);
  - `src/services/scheduler.service.ts`: hunks inside `createCoursePackage`, `createVoucher`, the create-booking function behind `POST /bookings`, the move function behind `PATCH /bookings/:id`, and `updateCourse` (whole-course branch → the course + its not-yet-attended sessions);
  - the DTO mapper that returns these rows (`src/db/mappers.ts`), so `branch` is in the responses;
  - `src/lib/revenue-line.ts` + `src/lib/booking-sale-amount.ts` (+ tests): the line's branch comes from its source (SPEC-099 §9 "Revenue").
- Git writes: none.

## What to do
0. **Step 0 (Implementation Notes, file:line):** locate each named function and its existing body, and every consumer of the three tables' DTOs that a new field could break (`grep` the mappers and the SF types it feeds; an added optional field shouldn't break them, so say so with evidence).
1. **Migration (exact):**
   ```sql
   ALTER TABLE "course_packages" ADD COLUMN "branch" text DEFAULT 'BRAVO' NOT NULL;
   ALTER TABLE "vouchers"        ADD COLUMN "branch" text DEFAULT 'BRAVO' NOT NULL;
   ALTER TABLE "bookings"        ADD COLUMN "branch" text DEFAULT 'BRAVO' NOT NULL;
   ALTER TABLE "course_packages" ADD CONSTRAINT "course_packages_branch_ck" CHECK ("branch" IN ('BRAVO','OTHER'));
   ALTER TABLE "vouchers"        ADD CONSTRAINT "vouchers_branch_ck"        CHECK ("branch" IN ('BRAVO','OTHER'));
   ALTER TABLE "bookings"        ADD CONSTRAINT "bookings_branch_ck"        CHECK ("branch" IN ('BRAVO','OTHER'));
   ```
   - Additive: every existing row becomes BRAVO; nothing is dropped or renamed.
   - **Size check before apply:** `bookings` is the big table. Postgres 11+ adds a column with a constant default without rewriting the table; say which Postgres version sid runs (`SELECT version()`, read-only) in your notes.
2. **Writes (SPEC-099 §9):**
   - a course's sessions are created with the course's branch;
   - `moveBooking` with `branch` sets only that booking's;
   - `updateCourse` with `branch` sets the course + its sessions whose status is not ATTENDED/NO_SHOW/CANCELLED. A past class keeps where it happened.
   - Absent `branch` ⇒ unchanged; create ⇒ BRAVO.
3. **Revenue line:** `writeRevenueLine` uses the source's branch (course / voucher / booking) instead of fixed BRAVO. A line already written never changes branch.
4. **Tests (DB-free):**
   - the validators (accept BRAVO/OTHER, refuse anything else, absent OK);
   - each write rule;
   - the whole-course change skipping past sessions;
   - the revenue line's branch per source;
   - a mapper test that `branch` is in the DTO.

## Definition of Done
- [ ] `bun test` (dummy URL) → 0 fail, pass > base; pinned tsc → 0.
- [ ] `git diff -U0 src/services/scheduler.service.ts src/validation.ts | grep "^@@"`: name the function for each hunk.
- [ ] The migration SQL pasted; additive only.
- [ ] **After I apply it:** a rolled-back sid proof (scratch script, host first, C-TEST ids):
  - a course created with OTHER gives its sessions OTHER;
  - a move sets one booking;
  - a whole-course change skips an ATTENDED session;
  - a revenue line written for an OTHER course says OTHER.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes

## Questions

## Review

**Claim (Porter, 2026-11-09; the board line is written):**
- **Start now:** `validation.ts`, `mappers.ts`, `revenue-line.ts` / `booking-sale-amount.ts` + tests.
- **HELD:** `schema.ts` and the `scheduler.service.ts` hunks, until Silver says Bob's TASK-870 Amendment 3 is accepted. I ring you.
- **The migration is generated only after `schema.ts` is released**, because the columns are declared there.
- **Until then:** type the `branch` field in your own code (`"BRAVO" | "OTHER"`), and test the validators and the revenue-line branch logic DB-free.

---
## Report (half 1 of 2) — Brew (Team C), 2026-11-09. TASK-889: `validation.ts`, `mappers.ts` and the revenue-line branch are DONE and tested. HELD for Bob: `schema.ts` + the `scheduler.service.ts` hunks; the migration comes after `schema.ts` is released.
**Base (pasted as asked):** SB `bun test` (dummy URL) `5570 pass · 0 fail · 382 files`; pinned tsc 5.9.2 → exit 0. Host of SB's `.env` = `154.197.124.206` (sid), checked before the one read below. No git; I did not touch `schema.ts`, `scheduler.service.ts` or any migration.

**Step 0 — consumers a new field could break (evidence, not assumption).**
- **Who reads the three DTOs:** `toBookingDTO` (`mappers.ts:214`), `toCourseWithStudent` (`:327`), `toVoucherDTO` (`:353`). The only strict readers are tests that pin the DTO's exact key set, and the full suite found exactly two of them: `planned-at-creation-dto-task542.test.ts` (the admin booking DTO's key list) and `public-checkin-shape-req108.test.ts` (its key COUNT 35 → 36). I added `branch` to both with a `🔻 TASK-889` tag (mirror edits, listed below). Nothing else failed.
- **The PUBLIC check-in answer does not carry it:** it is a separate allow-list (`toPublicCheckinBooking`); a new test feeds it an OTHER booking and asserts the public object has no `branch` key and no "OTHER" anywhere in its JSON. The existing source pins on that allow-list pass untouched.
- **An optional field cannot break the front end's types** (TypeScript structural typing: extra fields on a response are ignored); the SF is Team B's and was not changed.
- **Where each named function is** (for the held hunks; located, not edited): `createCoursePackage` (`scheduler.service.ts` ~2530–2680), `createVoucher` (~3050–3105); the create-booking and move functions behind `POST /bookings` and `PATCH /bookings/:id`, and `updateCourse`, to be located again when `schema.ts` is released (the merge moves lines).

**What is built (all in files on the TASK's list):**
- `src/lib/booking-sale-amount.ts`: `BRANCHES = ["BRAVO","OTHER"]`, `type Branch`, `isBranch`, `branchOf` (a stored value passes through; absent / unknown reads as BRAVO, the column's default, never a guess). `RevenueLineInput.branch?`. The four source-backed builders (`trialOrSingleLine`, `courseLine`, `parkFeeLine`, `voucherLine`) take the source's `branch` and put it on the line. The rental builder does NOT (a rental has no branch source; it stays BRAVO; see Q1).
- `src/lib/revenue-line.ts`: `writeRevenueLine` writes `branch: branchOf(line.branch)` instead of the fixed BRAVO. The entry points read it from the row that produced the line: a course line from the **course** (a session's confirm uses its course's branch, not the session's), a voucher line from the voucher, a trial / single / park fee from the booking. **A line already written never changes branch:** the insert is still `ON CONFLICT DO NOTHING` and nothing updates it (a test asserts there is no update).
- `src/validation.ts`: one shared `BRANCH = z.enum(BRANCHES)`, and an optional `branch` on exactly the five bodies — hunks `@@ -210 createBooking`, `@@ -352 createCoursePackage`, `@@ -438 createVoucher`, `@@ -634 moveBooking`, `@@ -694 updateCourse` (+ the import and the `BRANCH` line). Absent stays absent (the service supplies BRAVO on a create and "unchanged" on an edit); `moveBooking`'s "at least one field" rule counts a lone `branch` as an edit.
- `src/db/mappers.ts`: `branch: branchOf(x.branch)` on the three DTOs (`@@ -215 toBookingDTO`, `@@ -328 toCourseWithStudent`, `@@ -354 toVoucherDTO`), so `branch` is in every response; a row that lacks it (before the migration) reads `BRAVO`.

**Evidence (dummy URL).**
- **SB `5570 → 5644 pass · 0 fail · 383 files`** (+74: the new file `src/lib/branch-f1-task889.test.ts`); tsc exit 0.
- **Tests (DB-free), each must fail if its code goes:** the validators (accept BRAVO / OTHER; refuse `bravo`, `MAIN`, empty, null, numbers, arrays; absent OK) on all five bodies; the value is carried through, not stripped; the DTOs by value both ways and with the field absent; the public shape stays clean; the revenue line's branch per source — course, voucher, trial, single session, park fee, a course session (the course's branch wins over the session's), absent ⇒ BRAVO, a junk value ⇒ BRAVO; a written line never changes (no update, `ON CONFLICT DO NOTHING`); source pins that the insert has no fixed BRAVO and the five validators share one `BRANCH`.
- **Mutation set: 30 mutants, 30 killed** (first run 29; the survivor was the trial / single path's `branch: b.branch`, now tested). Files restored byte for byte (hash check; `validation.ts` and `mappers.ts` are CRLF files, edited and restored with their own line endings so `git diff` shows only my lines).
- **Read-only look at sid (host printed first):** PostgreSQL **18.4**. `bookings` ≈ 2,854 rows (1.6 MB), `course_packages` ≈ 277, `vouchers` ≈ 35; none has a `branch` column yet. Postgres 11+ adds a column with a constant default without rewriting the table, so the migration is instant on sid. (I did not read uat; its size is not mine to look at.)

**Files touched in this half:** `src/lib/booking-sale-amount.ts` · `src/lib/revenue-line.ts` · `src/validation.ts` · `src/db/mappers.ts` · new `src/lib/branch-f1-task889.test.ts`. **Two mirror test edits outside the list (needs your OK, the suite is red without them):** `src/lib/planned-at-creation-dto-task542.test.ts` (+`"branch"` in the 35-key list) and `src/services/public-checkin-shape-req108.test.ts` (35 → 36). `git status` also still shows TASK-875's files (uncommitted, in REVIEW).

**Still to do after Bob's release (I wait for your ring):** `schema.ts` (the three columns), the migration — I generate it, exactly the six statements of the TASK, hand-checked, plus journal, snapshot and one witness entry — the `scheduler.service.ts` hunks (the sessions of a new course get the course's branch; `moveBooking` sets one booking; `updateCourse` sets the course + sessions not ATTENDED / NO_SHOW / CANCELLED; absent = unchanged, create = BRAVO), then the rolled-back sid proof after you apply the migration.

## Questions (for Sector)
1. **Rentals stay BRAVO.** A rental line (`recordRental`: the paid press, a course's upfront rental, a standalone rental) is built from a movement key, not from a booking / course / voucher row, and the TASK's list has no rental branch source. If a course's rental should follow its course's branch, `recordRental` would need the course id → branch (a hunk in `rental.service.ts` or its caller): say so and I'll add it, otherwise rentals stay BRAVO.
2. **The two mirror test edits above:** keep?

**Review of half 1 (Sector, 2026-11-09): ACCEPTED; half 2 waits for the release.**
- **Re-run by me:** SB `5644 pass · 0 fail`; pinned tsc → 0.
- **Deploy-safe as it stands** (it shares the tree with TASK-875, which ships next):
  - every DTO and revenue line reads `branchOf(row.branch)`, and the column doesn't exist yet, so that is `branchOf(undefined)` = **BRAVO**, today's truth;
  - the validators accept an optional `branch` that no service reads yet, and no front sends one.
  - Nothing is live until half 2 + the migration.
- **The two mirror test edits** (`planned-at-creation-dto-task542`, `public-checkin-shape-req108`: the DTO key list +`branch`): **accepted.** A DTO-shape test has to list a new key.
  - **Noted:** `branch` now also appears in the **public** check-in response. It's harmless (BRAVO/OTHER, no personal data), but it's a public shape change. Keep it, and say so in your final report.
- **Rentals:** don't leave them BRAVO. In half 2, `recordRental` (`rental.service.ts`, Team C's file) passes the branch of the row its `refId` points at (the course or the booking). A standalone rental with no ref → BRAVO.
- Postgres 18.4 on sid, so the column adds are instant. Noted.
- **Correction (Sector, 2026-11-09, on Brew's word, checked):** `branch` does **not** reach the public check-in response. The `public-checkin-shape-req108` edit is the **admin** DTO's key count (35 → 36). The public answer, `toPublicCheckinBooking`, is an allow-list, and Brew's `branch-f1-task889.test.ts` asserts it carries no `branch`. My "public shape change" note above was wrong; there's nothing to flag.

**🔀 HALF 2 → BOB (Team B)** (Porter's staffing call, 2026-11-09; Bob's TASK-870 Amendment 3 is DONE, so the held SB files are released). **Brew does not touch half 2.**
- **Bob builds:**
  - `src/db/schema.ts`: the three `branch` columns;
  - `src/services/scheduler.service.ts`: hunks in `createCoursePackage`, `createVoucher`, the create-booking function, the move function and `updateCourse` (SPEC-099 §9 write rules; a whole-course change skips ATTENDED/NO_SHOW/CANCELLED sessions);
  - `src/services/rental.service.ts` `recordRental`: the ref's branch (course or booking), standalone → BRAVO (my half-1 review);
  - one migration (§1's SQL exactly) via `MIGRATION-QUEUE.md`, plus its witness entry.
  - Half 1 (validators, mappers, the revenue-line branch, Brew's) is already in the tree; build on it, don't redo it.
- **Bob's report** goes at the end of this file, and reaches me via Silver. **I review it** (Sector stays the reviewer) and apply the migration on sid after review, through the queue.
- **DoD:** the TASK's own DoD as written (suite, tsc, hunk headers naming functions, the rolled-back sid proof).

---
## Report (half 2 of 2) — Bob (Team B), 2026-11-09. TASK-889 half 2: DONE-pending-review, **one red pair that needs a GO** (below). Migration written, NOT applied (Sector applies after review). Nothing committed.
**Built (SB, `dong`):**
- `src/db/schema.ts`: `branch text NOT NULL DEFAULT 'BRAVO'` on `course_packages`, `vouchers`, `bookings`.
- **Migration `0076_branch_on_course_voucher_booking.sql`** (hand-authored per drizzle/README, journal idx 76, witness = LAST object `bookings_branch_ck`): the three `ADD COLUMN IF NOT EXISTS … DEFAULT 'BRAVO' NOT NULL` and the three CHECKs `("branch" IN ('BRAVO','OTHER'))` — the TASK's six statements exactly, only made re-runnable (column IF NOT EXISTS, each CHECK DROP IF EXISTS + ADD). Additive: nothing dropped but our own constraints, no data written. Postgres 18.4 on sid (Brew's read) ⇒ constant default = no rewrite.
- `scheduler.service.ts` hunks (names from `git diff -U0 | grep ^@@`): **`insertBooking`** (`@@ -1303`: the branch = the booking's own, else its COURSE's via the new private `courseBranchOf`, else the column default; `@@ -1378`: it is in the `values`) — this is the ONE inserter, so create-booking needs **no hunk** (`createBooking` already passes the whole body) and a make-up / extra session born later by `reconcileCoursePlan` is held where its course is; **`createCoursePackage`** (`@@ -2554` the course row takes the body's branch; `@@ -2580` every session is inserted with `input.branch ?? "BRAVO"`); **`createVoucher`** (`@@ -3077`); **`moveBooking`** (`@@ -5004` the type, `@@ -5028` `patch.branch`, written by the same single-row update — absent ⇒ unchanged); **`updateCourse`** (`@@ -5420`: the course row and its sessions whose status is NOT ATTENDED / NO_SHOW / CANCELLED, in ONE transaction; absent ⇒ no transaction, no write). One import word (`notInArray`, line 4). The other hunks in that diff (@@ -70, -1404, -4584, -5404) are other tasks'.
- `rental.service.ts`: new exported `refBranchOf(refId)` (course first, else booking; no ref / unknown / a read that throws ⇒ undefined ⇒ BRAVO; never blocks a rental) and `recordRental` passes it to `postRentalRevenue`; `revenue-line.ts` forwards it and `booking-sale-amount.ts` `rentalLine` puts `branchOf(r.branch)` on the line (your review: «don't leave rentals BRAVO»). A standalone rental ⇒ BRAVO.
- Half 1 untouched (validators, mappers, line builders).

**Evidence (SAFE dummy URL):** new `branch-f1-half2-task889.test.ts` 23 pass (migration text/journal/witness, schema, each write rule, the whole-course change BY VALUE with a spied tx — course row first, then sessions, absent ⇒ nothing — and the status list by source, `refBranchOf` by value, `rentalLine`). **Mutation set `branch-f1-half2-task889.mutations.json`: 30 mutants, 30 BITE, 0 survive**, files restored byte-identical. Full suite **5712 pass · 2 fail** (base before my work 5687/0 per your re-run; the new tests are +25). tsc 5.9.3 → exit 0.

**Mirror edits (all tagged 🔻 TASK-889, pins that mirror lines I changed):** the journal/file count `76 → 77` in 37 test files (61 pins; same bump every migration gets); `school-issue-reason-task690.test.ts` (2 lengths); `group-session-req095-2a.test.ts` (the pinned `courseId … coStudentId` lines now have the branch line between them); `first-coach-task860.mutations.json` S1/S2 anchors (the `.values({ …links,` lines gained my branch line); `branch-f1-task889.test.ts` (Brew's: «4 builders set `branch: branchOf(`» → 5, the rental one now does).

**🔴 NEEDS A GO — 2 red tests in `src/lib/migrate-preflight.test.ts` (test LOGIC, outside my claim, so I did not touch them):** the TASK-266 preflight flags any LATER migration that mentions an enum label an earlier file adds. 0029 adds the booking-type label `OTHER` (`ALTER TYPE … ADD VALUE`), and 0076's CHECK says `('BRAVO','OTHER')` — a string, not the enum — so it reports a new "pair" `0029 adds / 0076 uses 'OTHER'`. It is a **false positive for sid** (0029 has been applied for months; the preflight only matters when both are in ONE pending batch, i.e. a fresh database, which already needs the split twice per the test's own Q1 note). Proposed fix, test-only: in "a batch is clean whenever it does not ADD a label" also drop `0029_other_booking_type` from `noAdders`; in "Q1 the FULL journal…" add the third expected pair `{adds 0029_other_booking_type, label OTHER, uses 0076_branch_on_course_voucher_booking}` in journal order. I'm NOT proposing to change the migration's text (the TASK says the SQL exactly). **GO / NO-GO?** Until then those 2 stay red.

**Not done on purpose:** the rolled-back sid proof (DoD) — needs the migration applied; Sector applies it after your review, then I run it (host first, C-TEST ids: OTHER course ⇒ its sessions OTHER; a move sets one booking; a whole-course change skips an ATTENDED session; a revenue line for an OTHER course says OTHER). Ring me when it is applied.

## Silver (Bob's SA) — ruling on the `migrate-preflight.test.ts` pair, 2026-11-09: ✅ GO, test-only, exactly as Bob proposed
- **Why it's safe:**
  - 0076's `'OTHER'` is a **text literal** in a CHECK on a `text` column, not a use of the `booking_type` enum label 0029 adds. So Postgres's "new enum value used in the same transaction" failure can't happen.
  - The preflight is conservative by design: it matches label text. Recording the pair only means a **fresh** database splits its batch at 0029 / 0076 once more, which costs nothing. On sid, 0029 was applied months ago.
- **Edit only:**
  - `noAdders` drops `0029_other_booking_type`;
  - the Q1 full-journal pins gain `{ adds: 0029_other_booking_type, label: OTHER, uses: 0076_branch_on_course_voucher_booking }` in journal order;
  - both tagged `🔻 TASK-889`.
  - **No change** to the preflight's logic or to 0076's SQL.
- **Then:** the full SAFE suite must be 0 fail. The rest of the review is **Sector's** (he reviews 889 and applies 0076); I only ruled this pair.
**Update (Bob, 2026-11-09, after Silver's GO):** the two `migrate-preflight.test.ts` edits are in exactly as proposed (0029 dropped from `noAdders`; the third pair `0029 / OTHER / 0076` added to Q1 in journal order, both tagged 🔻 TASK-889). Full SAFE **5745 pass · 0 fail**; tsc 5.9.3 0. Waiting for Sector to apply 0076, then I run the rolled-back sid proof.

## Review of half 2 (Sector, 2026-11-09): ✅ ACCEPTED (build). The rolled-back sid proof is still Bob's DoD item.
- **Re-run by me** (SAFE dummy URL, the whole shared SB tree, Brew's TASK-900 files included): **5745 pass · 0 fail**. Pinned tsc 5.9.2: exit 0.
- **Migration 0076:**
  - the TASK's six statements, made re-runnable only (IF NOT EXISTS; DROP IF EXISTS + ADD on each CHECK);
  - additive, no data written;
  - the witness is the last object (`bookings_branch_ck`).
- **Write rules (SPEC-099 §9), read in the diff:**
  - `insertBooking`: own branch → the course's (`courseBranchOf`) → default. That covers make-up and extra sessions.
  - `createCoursePackage`: the course row plus every session.
  - `createVoucher`.
  - `moveBooking`: one row; absent ⇒ unchanged.
  - `updateCourse`: one transaction, course row + sessions `notInArray(status, ATTENDED/NO_SHOW/CANCELLED)`; absent ⇒ no write.
  - `recordRental` → `refBranchOf`: course, then booking; anything else or an error ⇒ BRAVO, and it never blocks.
  - All as designed.
- **Preflight pair:** Silver's test-only GO, applied as ruled (`migrate-preflight.test.ts`, tagged). The preflight logic is unchanged.
- **Mirror pins** (count 76 → 77, anchors): the usual bump for a migration. Accepted.
- **0076 APPLIED on sid** (MIGRATION-QUEUE, applied · verified: journal 77 · ledger 125 · witnesses 77).
- **➡ Bob: run the rolled-back sid proof now** (host first, C-TEST ids, the four checks in the DoD). Paste it here. Then 889 is DONE.
- Security review: input is a closed enum (zod `BRANCH`) plus a DB CHECK. No new route, no personal data, no auth change. **None.**

## Sid proof (Bob, 2026-11-09) — DONE: 19/19 PASS, rolled back, residue 0
Host printed first: **154.197.124.206 = sid** (host only). ONE transaction, rolled back by a thrown sentinel; scratch script `scripts/proof889.tmp.ts` deleted after the run. The real service functions (`insertBooking`, `moveBooking`, `updateCourse`, `refBranchOf`, `writeRevenueLine`) ran against it. Test names C-TEST (course subject "C-TEST", key `…C-TEST-889…`, dates in 2099).
- the `branch` column exists on all three tables (bookings, course_packages, vouchers);
- a course created OTHER ⇒ its sessions are OTHER (given the branch, and a session inserted with NO branch inherits the course's); a single booking with no branch ⇒ BRAVO;
- `moveBooking{branch:BRAVO}` on one session changed that booking only (OTHER, OTHER, OTHER, BRAVO);
- `updateCourse{branch:BRAVO}`: the course is BRAVO; the ATTENDED session and the CANCELLED session keep OTHER; the two not-yet-attended sessions moved to BRAVO; `updateCourse` without `branch` changed nothing;
- a revenue line built from an OTHER course says OTHER; re-writing it after the course went BRAVO is a duplicate and the line stays OTHER; `refBranchOf`: course ⇒ OTHER, booking ⇒ its own, none ⇒ undefined; a rental line for the OTHER course says OTHER;
- the CHECK refuses `'MAIN'`.
**Residue after rollback:** course_packages 0 · bookings dated ≥ 2099 0 · revenue lines with the test key 0. **Caveat, honest:** `postCourseRevenue` needs a posted sale movement (a different transaction), so the revenue line was written through `writeRevenueLine` + `courseLine` — the same two functions `postCourseRevenue` calls — not through `postCourseRevenue` itself.

## Review: sid proof (Sector, 2026-11-09): ✅ DONE
- Bob's rolled-back sid proof (relayed by Porter from Silver): **19/19 PASS on .206, residue 0**. It covers the DoD's four checks.
- The caveat is accepted: the revenue line was proven through `writeRevenueLine` + `courseLine`, not `postCourseRevenue`, because that needs a posted sale. The builder path is the same. The posted-sale path is Tanya's round after the deploy (an OTHER course sold → its revenue line says OTHER).
