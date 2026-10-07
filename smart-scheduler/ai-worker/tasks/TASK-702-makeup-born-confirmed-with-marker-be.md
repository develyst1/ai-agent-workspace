# TASK-702 — BE: **REQ-115 — a make-up is a NORMAL class: born CONFIRMED, told like one, marked by a durable MARKER (T1) — with a migration that checks itself** — @Jason (M+, ≈ 3–4 days)
**From @Sober to @Jason, 2026-10-07.** **GO from @Porter on the owner's word.** **Ships as its OWN release** (not bundled — if it fails we must be able to say it was this). ⏱️ **Ceiling FRI 16; earlier only if the gates pass earlier.** 🚫 **Nothing shrunk to fit a date, no gate skipped.** **If it is bigger than M+, STOP and say so.**
**Read FIRST, whole:** `requirements/REQ-115-confirm-the-make-up-at-the-moment-of-leave.md` — **only the part BELOW "THE WHOLE DESIGN IS REPLACED" is in force** (N1–N5, and the 03:39 correction: **born CONFIRMED in BOTH cases, including inside a course whose other sessions are still PENDING**). Everything above it is superseded history. · `SPEC-REQ-115-makeup-marker-migration-check.md` — **built into §2 below, with two corrections of mine.**
🔑 **Why T1 (owner-ruled):** her two requirements — "a normal class" AND "still visibly an extended class" — are one fact today (the STATUS). **T1 splits them: STATUS = an ordinary confirmed class · MARKER = this one grew from a leave.**
✅ **Claim (Team A):** back `src/db/schema.ts` (the column) · `drizzle/0066_*` + journal · `src/services/scheduler.service.ts` · `src/lib/course-plan.ts` · `src/lib/course-history.ts` · `src/lib/booking-undo.ts` · `src/services/undo.service.ts` · `src/lib/bulk-confirm.ts` · `src/lib/attention.ts` · the booking DTO + `types` contract · their tests. **Touch a file outside this list ⇒ say so in the report.** 🚫 **No front end** (the badge follows as its own FE task once your DTO field is fixed). 🚫 **No new copy without a draft to me** (§3d).

## 1. The marker
**`bookings.is_makeup boolean NOT NULL DEFAULT false`** (name yours if you have a better one — then use it everywhere below). Migration **`0066`**.

## 2. 🔴 The migration BACKFILLS and VERIFIES ITSELF — one transaction, no half state
### 2a. WHICH rows are make-ups — ⚠️ **TWO CORRECTIONS to the SPEC, found today in code**
| | population | |
|---|---|---|
| **P1** | `status = 'EXTENDED'` | the engine creates every make-up in this status |
| **P2** | `extended_from_id IS NOT NULL` | linked to the leave it replaces |
| **P3** 🔻 | `note IN ('คาบขยายอัตโนมัติจากการปรับแผนคอร์ส', 'คาบขยายอัตโนมัติจากการลา')` | 🔴 **CORRECTION 1: the SPEC listed only the first note. The leave writer (`scheduler.service.ts` ≈ `:4210`) writes the SECOND.** |
| **P4** 🆕 | `status = 'CANCELLED' AND note IN ('ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)', 'ยกเลิกคาบขยาย — ย้อนกลับการลา')` | 🔴 **CORRECTION 2: the TRIM overwrites the note when it cancels (`≈ :2977`)** ⇒ an UNLINKED make-up that was trimmed is in NONE of P1–P3. History only (a cancelled row is never trimmed), but the badge reads it. ⚠️ **Verify the undo note's exact bytes in code before using it.** |
**All over `booking_type = 'COURSE_PACKAGE'`, ANY status.** **Marker = P1 ∪ P2 ∪ P3 ∪ P4.**
🔴 **Before the population list is FROZEN — step 0, a READ by the owner (bare SQL, via @Porter), on sid AND on uat:** every distinct note on course rows that mentions `ขยาย`, with its count — **so the list above is checked against REAL data, not against today's code.** *(A note an older version wrote, or a person typed, is exactly what code-reading cannot see.)*
```sql
SELECT note, status, (extended_from_id IS NOT NULL) AS linked, count(*)
FROM bookings
WHERE booking_type = 'COURSE_PACKAGE' AND note LIKE '%ขยาย%'
GROUP BY 1, 2, 3 ORDER BY 4 DESC;
```
**If it shows a note not in P3/P4: STOP, report it to me — I amend the list; you do not guess.**
### 2b. Self-check, in the SAME migration, after the backfill `UPDATE` (SPEC §2, unchanged)
1. **`missed`** = rows in the union whose marker is NOT set → **must be 0** · 2. **`extra`** = rows marked but in no population → **must be 0** · 3. **`marked`** = **must equal the size of the union**, counted in the same transaction.
▶️ **Any check fails ⇒ `RAISE EXCEPTION` with the numbers ⇒ the whole migration ROLLS BACK ⇒ no column, no marks ⇒ `db:verify` RED ⇒ the new code is NOT started.**
### 2c. ⚖️ **"If the counts disagree" — DECIDED NOW, not on deploy night**
- **BEFORE migrating:** the owner's count (2d) differs from the expected number (2e) by more than the make-ups created since the read ⇒ **STOP. Do not migrate. Send both numbers to @Sober.**
- **The migration RAISEs:** **STOP. Nothing was written (rollback). Do NOT start the new code; the OLD code keeps running and never reads the column, so the customer is unharmed.** **Send the three numbers to @Sober.** 🚫 **Never "fix it by hand" on the box. Never re-run with a looser check.**
- **AFTER, the counts differ** (cannot happen if the RAISE works — that is why it is listed): same as above, plus **roll the CODE back** (no DB step: the column is unread by old code).
### 2d. BEFORE / AFTER counts — the owner, SELECT only, **sid first**, then uat (in the release note)
```sql
SELECT count(*) FILTER (WHERE status = 'EXTENDED') AS p1,
       count(*) FILTER (WHERE extended_from_id IS NOT NULL) AS p2,
       count(*) FILTER (WHERE note IN ('คาบขยายอัตโนมัติจากการปรับแผนคอร์ส','คาบขยายอัตโนมัติจากการลา')) AS p3,
       count(*) FILTER (WHERE status = 'CANCELLED' AND note IN ('ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)','ยกเลิกคาบขยาย — ย้อนกลับการลา')) AS p4,
       count(*) FILTER (WHERE status = 'EXTENDED' OR extended_from_id IS NOT NULL
                          OR note IN ('คาบขยายอัตโนมัติจากการปรับแผนคอร์ส','คาบขยายอัตโนมัติจากการลา')
                          OR (status = 'CANCELLED' AND note IN ('ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)','ยกเลิกคาบขยาย — ย้อนกลับการลา'))) AS union_
FROM bookings WHERE booking_type = 'COURSE_PACKAGE';
-- AFTER: SELECT count(*) FROM bookings WHERE is_makeup;  ⇒ must equal union_ (and union_ itself must not have changed)
```
**Keep the two SQL texts (the migration's populations and this read) GENERATED FROM ONE LIST in code, or pinned equal by a test** — two copies of the population list drift.
### 2e. The expected number — known BEFORE we go
**The 10-06 figure (≈ 461, P2 ∪ old-P3) is STALE and used the uncorrected P3.** ⇒ **the expected number is the owner's step-0 + 2d read on uat, taken the day before the release**, written into the release note. **On release night `union_` = that number + make-ups created since.**
### 2f. 🔴 The abort path must be PROVEN, not assumed — **on sid** (rewritten 2026-10-07, @Porter GO)
**Why sid and not a local database:** the owner ruled **NO LOCAL STACK** (2026-10-04) and it STANDS. **sid is valid** because a refused migration leaves nothing: this repo's `db:migrate` is `drizzle-kit migrate`, and drizzle `0.45.2` runs every pending statement **and the ledger row** in ONE transaction ⇒ the RAISE takes the column, the marks and the ledger row back with it. *(@Tanya stopped rather than run it against the default `.env`, which points at the SERVER — the right call.)*
**DB-unreachable tests still pin the SQL by value** (the populations, the four checks, the `RAISE`). **This proves the ROLLBACK on a real database.**

**⏱️ WAITS FOR:** `702` committed — which waits for **round 1 on uat**. **The OWNER runs every `db:migrate`** (no agent, no QA runs migrations on a server). **The OLD code keeps running on sid throughout** (it never reads the column).

**THE ORDER — every step in sequence, none skipped:**
1. **The owner's step-0 read on sid FIRST** (§2a) — the REAL notes. 🔑 *Before anything is planted — otherwise her test note comes back in his read as real data and we chase it.*
2. **@Tanya plants ONE test note through the app's own API** — no SQL: on **one class of HER OWN test COURSE** (a `COURSE_PACKAGE` row that is NOT `EXTENDED` and has no `extended_from_id`), `PATCH /api/bookings/:id` with `{"note": "ทดสอบขยาย TASK-702"}`. **She records the booking id.**
3. **EXPECTED OUTPUT — written down HERE, before the run:**
   - `db:migrate` **FAILS** with `is_makeup backfill REFUSED — missed=0 extra=0 marked=<n> expected=<n> suspect=1 …` *(`marked` = `expected`, because the UPDATE and those two checks share one condition; **`suspect=1` is her note**)*;
   - **R1 = 0** and **R2 = 0** (the reads below): **no column, no ledger row.**
   🚫 **Anything else is a FAIL of the proof** — record it, stop, send it to @Sober. *A test whose expected result is decided after seeing the actual one is not a test.*
4. **The owner runs `db:migrate` on sid. Then the two READS (SELECT only):**
```sql
-- R1 — must be 0 after a refusal: the column does not exist
SELECT count(*) AS has_column FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'is_makeup';
-- R2 — must be 0 after a refusal: no ledger row for 0066 (journal "when" = 1783000000062)
SELECT count(*) AS has_ledger_row FROM drizzle.__drizzle_migrations_scheduling WHERE created_at = 1783000000062;
```
5. **@Tanya clears her note** — `PATCH /api/bookings/:id` with `{"note": ""}` on the SAME id.
6. **The owner runs `db:migrate` again ⇒ GREEN, with the §2d BEFORE / AFTER counts** ⇒ **R1 = 1, R2 = 1.** 🔑 **This second run IS the real sid migration** — the proof costs one extra `db:migrate`, not a separate rehearsal.
7. Then @Tanya's sid gate on screen (with `703` and Team B's grid task — the declared ship-set).

**🔴 NAMED ROLLBACK — if step 4 wrongly SUCCEEDS** (R1 = 1 after step 4): **the safety check does not work** — the most important failure we could find, found on the rehearsal box and not on Khwan's. ⇒ **Do NOT start the new code. Do NOT re-run.** **The recovery SQL is written and reviewed HERE, NOW — the owner runs a PREPARED statement, never improvised on a server at the moment of discovery** (the same rule as the migration's own counts). **sid ONLY — 🚫 NEVER uat.** A DATA REQUEST the owner runs:
```sql
-- sid ONLY. Undo a WRONGLY-SUCCESSFUL 0066 — the column, its marks, and its ledger row, in one transaction.
BEGIN;
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "is_makeup";
DELETE FROM drizzle.__drizzle_migrations_scheduling WHERE created_at = 1783000000062;
COMMIT;
-- Then R1 and R2 above ⇒ both must be 0.
```
**Safe because:** the old code never reads `is_makeup` (dropping it changes nothing it does); the delete matches 0066's row by its journal timestamp, which covers EITHER line-ending hash of the file (`TASK-655`). **Then her note is cleared (step 5), the numbers go to @Sober, and 702 goes back to @Jason** — nothing proceeds to the second run until the check is fixed and re-proven.

## 3. The behaviour (N1–N4)
### 3a. 🔴 Born CONFIRMED — through the ONE confirm path, not a copy
**Both make-up writers** (the reconcile append ≈ `:3069`, the leave writer ≈ `:4207`) **set `is_makeup = true` and confirm the row through the SAME helper a single-session confirm uses today** — so it gets **exactly** a confirm's side effects: `confirmedAt` · the check-in token · the freelance/budget hold · the coach-leave guard · **the normal confirmed notice to the family and the coach** (N3 — the existing `booking_confirmed` message; 🚫 no new wording). **In BOTH course states** — including a course whose other sessions are `PENDING` (her 03:39 correction). **Inside the leave's transaction.** 🚫 **Extract the helper if confirm's side effects live inline; do not re-implement them** — two confirm paths drift (the LAST-badge lesson).
### 3b. 🔴 When the confirm REFUSES (e.g. the freelance budget is spent) — **the LEAVE must not fail**
**My 10-06 finding: confirm can refuse; a leave that fails because its make-up could not be confirmed is worse than today.** ⇒ **fallback: the make-up is created UNCONFIRMED (`EXTENDED`, marked), exactly as today, and the ADMINS are told** (one notice, §3d). **A test proves the leave commits and the admins are told.** *(My ruling; @Porter may overturn.)*
### 3c. Every reader of `EXTENDED` — CLASSIFIED, not search-and-replaced
**For each reader decide ONE question: is it asking "is this a MAKE-UP?" (⇒ read the MARKER) or "is this UNCONFIRMED?" (⇒ keep reading the STATUS).** **Today's list (back, non-test):** `course-plan.ts:150` (`canInsert`) · `:303` (**the TRIM**) · `course-history.ts:60` · `attention.ts:135` · `booking-undo.ts:76` · `bulk-confirm.ts:17` · `freelance-budget.ts:39` · `scheduler.service.ts:2884, 3199, 3274, 3277, 3340, 4055, 5034` · `undo.service.ts:168`. **Your report carries a table: file:line · question · marker/status · why.** ⚠️ **Anything you find that is not in my list goes in the table too.**
- 🔴 **THE TRIM (`:303`) — the heart of it:** today it removes *"newest-dated LIVE EXTENDED first"*; **born CONFIRMED, it would never trim again.** ⇒ **it trims the newest-dated LIVE MARKED make-ups** (`PENDING`/`CONFIRMED`/`EXTENDED`). `canInsert` (`:150`) the same.
- 🔴 **A trimmed make-up was ANNOUNCED at birth now** ⇒ **the trim sends the NORMAL cancel notice** (family + coach — the existing cancel kinds; 🚫 no new wording). Today it cancels unannounced rows silently; that silence becomes wrong.
### 3d. New words — ONE, and only for the fallback (§3b)
**The admins' "a make-up could not be confirmed" notice** — DRAFT, in Khwan's terse style, to me in your report: e.g. `🔔 Make-up for {student} on {date} is NOT confirmed ({reason}) — please confirm it.` **It goes to the owner via @Porter; nothing ships on a draft.**
### 3e. The DTO
**Expose the marker on the booking DTO and the shared contract (`isMakeup: boolean`)** so the front's `ขยายคาบ` badge reads it (Khwan kept the badge as a REQUIREMENT). **The FE task follows from your field name — tell me it the day you fix it.**
### 3f. Existing rows — FORWARD-ONLY
**The migration MARKS existing make-ups and changes NO status.** The 305-ish live `EXTENDED` rows stay unconfirmed until an admin confirms them (bulk confirm exists and sends the proper notices). **Whether the owner wants more is a ship-day decision, not a build one.** 🚫 **No status rewrite in the migration** — a status flip cannot issue tokens, holds or notices.

## 4. ✅ Done means
**`tsc` (5.6.3) · DB-unreachable `bun test` with COUNTS · `unhandled-between-tests: 0` · `67 = 67`** · **tests:** a leave ⇒ make-up born CONFIRMED + marked + the family and coach told, in a PENDING course AND a confirmed one · the confirm refuses ⇒ the leave still commits, the make-up is `EXTENDED` + marked, the admins told · **the TRIM removes a CONFIRMED marked make-up, newest first, and sends the cancel notice** · `canInsert` reads the marker · an ordinary CONFIRMED class is NEVER trimmed (the one thing a marker bug would break) · the migration SQL pinned by value (populations = the read's list; three checks; RAISE) · the classification table's each line pinned.
**Mutations (list recorded HERE):** trim reads status not marker · a make-up born unmarked (each writer) · born PENDING/EXTENDED when confirm would succeed · confirm side effects skipped (no token / no hold / no notice) · the leave fails when confirm refuses · the trim cancels silently · the migration's `missed` check removed · `extra` check removed · P3 missing the leave note · P4 dropped · an ordinary class trimmed.
**Report:** the classification table · the DTO field name · the §3d draft · **anything bigger than M+ ⇒ said the moment you see it.** **Then: the owner's step 0 on sid → @Tanya's abort proof ON SID (§2f) → the second, real sid migration with the owner's counts → my release note.**

---
✅ **2026-10-07 — @Porter:** §3b (a refused confirm never fails the leave) **CONFIRMED** — send the §3d admin sentence as a draft in your report. §2f (Tanya's local abort proof) **he routes when you report.** 📌 **For the FE badge task that follows:** Team A holds `front/src/components/partials/Calendar/Calendar.config.ts` **for REQ-115 only, that one file** — a bounded carve-out; if the badge touches more of Team B's area, it STOPS and goes to Porter.

## ✅ 2026-10-07 — @Jason: `TASK-702` (REQ-115, T1) BUILT — a make-up is born CONFIRMED + marked; migration `0066` backfills and checks itself — 24 / 24 bite. **NOT shipped: it still needs (1) the owner's step-0 note read, (2) @Tanya's local abort proof, (3) your release note.**
**`tsc` 0 (5.6.3) · DB-unreachable suite `4276 pass · 0 fail` (was 4233) · `unhandled-between-tests: 0` · `67 .sql = 67 journal tags` (`0066_booking_is_makeup`).** **Set: `src/services/makeup-born-confirmed-task702.mutations.json` — 24 / 24 BITE**, baseline 122, CHECKSUM identical, test list in the file. **Earlier sets re-run from their files after the harness change: `692` 12/12 · `657` 16/16 · `656` 29/29 · `699` 10/10 · `609` 7/7 · `646` 3/3 · `690` 9/9 · `656b` 7/7 · `659` 8/8 — all bite, checksums identical.** Sized M+ as briefed; nothing compressed.
**DTO field name: `isMakeup: boolean`** — on the booking DTO (`BookingDTO`, `toBookingDTO`) AND the plan row (`PlanSessionRow`, `toSessionRow`), always a boolean, never undefined. **Column: `bookings.is_makeup boolean NOT NULL DEFAULT false`.** ▶️ Tell Fern: the «ขยายคาบ» badge reads `isMakeup`, **never `status === "EXTENDED"`** (a make-up is CONFIRMED now).

### §3a — born CONFIRMED, through the ONE confirm (not a copy)
The confirm's side effects (status + `confirmedAt` · every teacher's `booking_confirmed` · the check-in token · the parent's copies) were **moved VERBATIM** out of `updateBookingStatus` into one helper, **`applyConfirm`**; the single-session confirm calls it (existing source pins re-aimed to it; behaviour byte-identical) and so does **`confirmMakeupAtBirth`**, which BOTH make-up writers (the reconcile append, the leave writer) call right after their insert, inside their transaction. It adds the coach-leave guard and the freelance hold, run **BEFORE** the status write so a refusal changes nothing. **By value:** a leave in a course whose other sessions are **PENDING** AND in one that is **CONFIRMED** ⇒ make-up `CONFIRMED` + `isMakeup` + `confirmedAt` + token, `booking_confirmed` to the family and the coach, hold asked as a CONFIRMED draw while the row is still EXTENDED (`B5`/`B6` un-confirm each writer; `B7`/`B8`/`B9` drop hold/token/family notice — all bite).
### §3b — the confirm REFUSES ⇒ the LEAVE still commits
Budget spent / coach on advance leave ⇒ the make-up is created **EXTENDED + marked, exactly as before this task**, the leave commits, **ONE admin notice** `makeup_not_confirmed`, no `booking_confirmed` for it. Only an `ApiException` is a refusal; anything else propagates. `B10` (the leave fails on a refusal) bites.
### §3c — the trim
It reads the MARKER: **newest-dated LIVE MARKED make-up (PENDING/CONFIRMED/EXTENDED) first**; **an ordinary CONFIRMED class is never trimmed, however over-long the plan** (`B2` bites); `canInsert` the same (`B12`). **The trim now sends the NORMAL cancel notice** (family `class_cancelled_parent` + coach `class_cancelled_teacher`) **only for a CONFIRMED marked make-up** (it was announced); a legacy unconfirmed (EXTENDED) one is trimmed **silently, byte-identical** (`B11`).
**THE CLASSIFICATION TABLE — each reader asked ONE question (all pinned by source in the test):**
| file:line | question | reads | why |
|---|---|---|---|
| `course-plan.ts:309` | the TRIM — which row goes? | **MARKER** | born CONFIRMED, a status trim would never fire again |
| `course-plan.ts:155` | `canInsert` — a make-up to net out? | **MARKER** | same |
| `course-history.ts:53` | the history kind `makeup-appended` | **MARKER** | "is it a make-up?" — a live marked row; delivered/cancelled keep their kind |
| `scheduler.service.ts:2887` | `reowedForOf` — an unlinked MAKE-UP says so | **MARKER** | |
| `scheduler.service.ts:4112` | door 4 / TASK-551 same-slot rule | **MARKER** | the rule is about a cancelled MAKE-UP in any status |
| `scheduler.service.ts:2988` | the trim's notice | **MARKER + CONFIRMED** | announce only what was announced |
| `scheduler.service.ts:3214, 3289` | cancel notices (coach · family) | STATUS | was it ANNOUNCED / held (CONFIRMED or EXTENDED)? |
| `scheduler.service.ts:3355` | the move notice | STATUS | announced / held |
| `scheduler.service.ts:5093` | pause | STATUS | may this status be paused |
| `course-plan.ts:7` | `COURSE_LIVE_STATUSES` | STATUS | still owed / scheduled |
| `attention.ts:135` | `ORPHAN_LIVE` | STATUS | is the row live |
| `booking-undo.ts:76` | Undo's `UNDO_MAKEUP_STATE` | STATUS | a make-up in an undoable state |
| `bulk-confirm.ts:17` | bulk confirm | STATUS | is it UNCONFIRMED (legacy EXTENDED still confirms) |
| `freelance-budget.ts:39` | the hold | STATUS | does this status consume an hour |
| `undo.service.ts:169` | the Undo's coach notice | STATUS | was it HELD |
| **NOT IN YOUR LIST — found, all are STATUS or one needed a change:** `scripts/audit-imported-courses.ts:67` | counts "appended make-ups" | **MARKER (changed)** | an out-of-claim one-liner — it would have undercounted every born-CONFIRMED make-up · `src/db/seed.ts` | the dev seed's EXTENDED row | marked | out-of-claim, one line · `daily-reminder.ts`, `ics.ts`, `teacher-schedule.ts`, `weekly-digest.ts` | status sets | STATUS | unchanged — a CONFIRMED make-up now gets a reminder / digest line like any class, which is the point |

### §2 — the migration (`drizzle/0066_booking_is_makeup.sql`)
**One list in code (`src/lib/makeup-marker.ts`): the four notes, `makeupPopulationSql()`, the owner's two reads (`MAKEUP_NOTES_READ_SQL` step 0, `MAKEUP_COUNT_READ_SQL` §2d) — and a test pins the migration TEXT to it** (the population appears VERBATIM 5× — UPDATE + 4 checks; the four notes pinned BY THEIR BYTES; **I verified the Undo note's exact bytes in code: `ยกเลิกคาบขยาย — ย้อนกลับการลา`, em dash included**). P1∪P2∪P3∪P4 as you corrected (both birth notes, both cancel notes). `ADD COLUMN IF NOT EXISTS … NOT NULL DEFAULT false` → backfill `UPDATE` → one `DO $$` block counting `missed` / `extra` / `marked` / `expected` and **`RAISE EXCEPTION` with the numbers** if any disagree ⇒ the whole file rolls back (drizzle runs the pending batch in ONE transaction — the migrate scripts say so). **No status is rewritten** (`M8` bites). Witness = the COLUMN (the column and the marks cannot exist apart), **`rerunnable: false`** (and why, in the file).
**🔻 ONE ADDITION to your three checks — your veto:** a **4th check `suspect`** — a course row whose note mentions `ขยาย` and is in NO population ⇒ RAISE. **It is the only check that looks at data the backfill itself does not match** — the three checks you specified all use the SAME predicate as the UPDATE, so by construction they can never disagree (a "marker-less make-up the backfill cannot see" is invisible to all three). It is what makes Tanya's §2f proof possible (seed a marker-less make-up with an unlisted note ⇒ RAISE). **The cost: a harmless typed note containing `ขยาย` would abort the deploy** — that is exactly what the owner's step-0 read finds first. `M4` bites without it. Say "drop it" and it is one clause.
### 🔴 FLAGGED — decisions that are yours
1. **Creation-time declared absences:** `createCoursePackage` reaches the reconcile append when a course is created with declared absences (TASK-361). **The reconcile writer is born-CONFIRMED unconditionally (your §3a: "both writers"), so those make-ups are now CONFIRMED and the family is told at creation — before the course itself is confirmed.** That matches her 03:39 ("including inside a PENDING course") but is the one place no *leave* happened. If you want creation's make-ups left EXTENDED + marked, it is one option on the reconcile call.
2. **Her open question (REQ-115, "does a CONFIRMED class inside a PENDING course break …"):** what I read in code — `confirmCourse` confirms only `PENDING` rows and counts already-CONFIRMED ones as `already`; `reconfirmNeededSince` clears when nothing is left PENDING — **a born-CONFIRMED make-up does not break either**; the daily reminder and the day-end (CONFIRMED-only) now include make-ups, so **a make-up nobody marks auto-attends and consumes quota like any class** (REQ-070's own design). Not proven against a database.
3. **Legacy rows:** the ≈305 live `EXTENDED` rows are MARKED and stay unconfirmed (forward-only, §3f). They remain trim candidates (marked + live).
4. **Out-of-claim touches, all one-liners/needed:** `scripts/audit-imported-courses.ts`, `src/db/seed.ts`, `src/lib/migration-witness.ts`, `src/lib/line-i18n.ts` + `line-message.ts` (the §3d notice), the harness of the 656/657/692/699/646 tests (below).
### §3d — the DRAFT (to you → owner via Porter; nothing ships on a draft)
`makeup_not_confirmed`, admins only, marked 📋 DRAFT beside the key. **TH:** `🔔 คาบชดเชยของ {student} วันที่ {date} ยังไม่ได้ยืนยัน ({reason}) — กรุณายืนยันคาบนี้` · **EN:** `🔔 Make-up for {student} on {date} is NOT confirmed ({reason}) — please confirm it.` (`{reason}` = the refusal's own Thai message, e.g. the budget one; date `dd-mm-yyyy`.)
### ⚠️ What I changed in existing pins — each with its reason
`67` count pins (61 files, scripted, each `· 🔻 TASK-702: +0066`) · kind count 34→35 ×3, `?? "-"` 13→14, date-format 4→5 · DTO key set 34→35 · `sendClassCancelledToFamilies(` 2→3 (the trim) ×2 · the confirm-source pins in `attendee-note`, `other-booking-line`, `bulk-confirm-extended` re-aimed to `applyConfirm` · TASK-512's coach inventory (`booking_confirmed` now produced by `applyConfirm`) · TASK-551's same-slot rule now by MARKER, with a NEW test that a CONFIRMED marked make-up put straight back tells nobody and an unmarked CONFIRMED class is never suppressed · fixtures (`course-plan.test` and 5 others) carry the marker as the backfill would. **Harness (656/657/692/699/646 fakes):** the fake transaction's OUTBOX now rolls back with it (so "no notice for a refused leave" stays provable) and an awaited `select()` chain reads as no rows.
### Not done here, by design
No FE. **The ROLLBACK is proven by @Tanya on her local database (§2f), not here** — this environment is DB-unreachable; the SQL is pinned by value. **Step 0 (the owner's note read) and §2d's counts are still owed before the list is frozen/released; the expected number comes from his uat read the day before.**
▶️ **Ball: Sober — verify 702, rule the 4th check and flag #1, send the §3d draft to Porter; then Tanya's local abort proof → step 0 → sid → your release note.**

---
🔴 **2026-10-07 — SHIP-SET declared and held by @Porter:** `702` + `703` + **Team B's GRID task (the purple make-up mark on the calendar cells, @Silver → Fanta)** go to sid TOGETHER and to uat TOGETHER — **none alone.** *A make-up born confirmed that has LOST its mark is worse than today.* **NOT round 1** (round 1 builds from `de61a7d`). Team A stops at `BookingBadges.tsx` + `Calendar.config.ts`; the grid files are Team B's. The marker field name (`isMakeup`) reaches Silver through Porter.

---
🔻 **2026-10-07 — §2f REWRITTEN for sid on @Porter's GO** (no local database: the owner's "no local stack" ruling of 2026-10-04 STANDS). **Every "local abort proof" above this line is SUPERSEDED by §2f** — owner's step 0 FIRST → Tanya plants one note via the API → expected output written before the run → R1/R2 reads → clear the note → the second green run IS the real sid migration · the recovery SQL for a wrong success is PREPARED in §2f (sid only, never uat).
