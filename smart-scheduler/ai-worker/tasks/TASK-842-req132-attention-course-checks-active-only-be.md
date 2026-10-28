# TASK-842 — BE: **REQ-132 (Tanya's 🟡): the two Attention course checks count ACTIVE courses only** (not ended / paused) — @Jason, ≈ 0.3 d incl. +10%
**From @Sober, 2026-10-27.** GO by Porter; the owner: *"ก"* (it rides with REQ-132; re-tested on sid). **Git: on the owner's word only.**

## Why (my read, inbox/PM.md 10-27)
- `nearly_finished_courses` (`lib/attention.ts:53`) and `expiring_entitlements`' course part (`:128`) ask `courseEligible` = sessions left > 0 AND not past expiry (`lib/eligibility.ts:38-39`).
- **It never looks at `endedAt` / `droppedAt`,** so ended (ตัดจบ / ยกเลิก) and paused (พักคอร์ส) courses are counted. That's Tanya's 15 / 44 on uat.
- **Vouchers are fine already** (`voucherUsable` refuses an ended voucher).

## Do
1. **Both course predicates** also require **`courseStatus(c, today) === "ACTIVE"`**. That's THE one status rule (`lib/course-status.ts:45`); don't write a second one.
   - Load `endedAt` / `droppedAt` with the rows if `getCourses()` doesn't carry them already. **No extra read per row.**
2. **`courseEligible` is NOT changed** (its other callers: `scheduler.service.ts:794`, `som-report.service.ts:52`).
3. **The digest COUNT follows** (the same items feed it), still counts only. **No new words, no migration, no front change.**
4. **Same tree as TASK-840** (frozen, verified). Your change lands in `lib/attention.ts` on top of it. **Keep 840's behaviour byte-for-byte** (the names, the `link`), and re-run set 840.

## Tests by value
- An **ended** course with 1 left, expiring in 3 days ⇒ in **neither** list.
- A **paused** one ⇒ in neither.
- An **ACTIVE** one ⇒ in both (with 840's name + link).
- The digest count drops by exactly the ended / paused ones.
- A voucher is unaffected.

## Mutations
- The status check dropped from `isNearlyFinishedCourse`.
- The status check dropped from the expiring course predicate.
- `"ACTIVE"` widened to "not CANCELLED" (a paused course gets back in).

## Done means
- tests by value + set 842 + **set 840 re-run** (each bite shown);
- tsc 0 · the SAFE suite;
- `unhandled-between-tests: N`;
- `git status` in full.

**List every pin first.**


## Jason (BE) 2026-10-27 — TASK-842 BE (REQ-132 🟡): the two Attention course checks count ACTIVE courses only — GREEN

**Pins listed first: NONE to edit.** `isNearlyFinishedCourse` / `isCourseExpiringSoon` gained *optional* `endedAt?` / `droppedAt?` in their input type (a row without them reads as not ended / not paused), so the existing callers (`attention.test.ts:59-62`, `advance-leave-no-cap-req089.test.ts:126`, the 840 test's rows) compile and pass untouched. No pin file was touched.

**Built (`lib/attention.ts` only, on top of 840):**
- New private `isActiveCourse(c, today)` = `courseStatus({...c, endedAt: c.endedAt ?? null, droppedAt: c.droppedAt ?? null}, today) === "ACTIVE"` — THE one status rule (`lib/course-status.ts`), no second copy.
- `isNearlyFinishedCourse` and `isCourseExpiringSoon` now `isActiveCourse(c, today) && courseEligible(c, today) && …`.
- **`courseEligible` NOT changed** (eligibility.ts untouched; `scheduler.service:794`, `som-report.service:52` keep their meaning). Vouchers untouched (`voucherEligible`).
- **No extra read:** `getCourses()` → `coursesByIds` already returns the row's `endedAt` / `droppedAt`. No new words, no migration, no front change. The digest count follows (same items feed it), still counts only.
- 840's names + `link` are byte-for-byte the same.

**Tests (new `attention-active-courses-only-task842.test.ts`, 8, by value):** ended / paused / both ⇒ in NEITHER list; ACTIVE ⇒ in both with 840's `น้องเอ · course 10 · …` + link · digest count = active only, no name in the text · expiring voucher unaffected · a row without the two fields still counts · source pin (both predicates ask `isActiveCourse`; `eligibility.ts` has no `endedAt`/`droppedAt`).
**Set 842: 3/3 BITE, checksum identical** — A status check dropped from nearly-finished · B dropped from expiring · C `"ACTIVE"` → `!== "CANCELLED"` (paused gets back in).
**Set 840 re-run: 7/7 BITE (C1–C7), checksum identical.**

**Verified:** tsc 0 · SAFE suite **5,236 pass / 0 fail (373 files)** · unhandled-between-tests: 0 (the only "UNHANDLED" hits are `[line-in] postback … UNHANDLED action=` log lines of existing tests, not runner errors). `git status` (full): `M src/lib/attention.ts` · `M src/services/attention.service.ts` (840) · `?? attention-active-courses-only-task842.{test.ts,mutations.json}` · `?? attention-names-the-child-task840.{test.ts,mutations.json}` (840). Saved: `GIT-STATUS-back-842-2026-10-27.txt`. My run had `.env` present; the no-.env room is yours.

Ball: Sober.

## ✅ 2026-10-27 — @Sober: TASK-842 VERIFIED (with 840) → READY, folded into `DEPLOY-REQ-132-attention-names-and-links-2026-10-27.md`
- **No-`.env` clean room** of `f4aeb39` + 6 files (840 + 842): tsc 0 · SAFE suite **5,236 / 0** · unhandled 0 · 73 = 73 · sets 842 **3/3** (A / B / C) · 840 7/7.
- ⚠️ **My own set counter first read "0/0"**: it required a digit in the ID, and this set uses A / B / C. I read the raw output (3/3 BITES), and fixed the counters in all three of my scripts (they now also warn on 0 parsed). Not the code's fault.
- 🧊 The back is frozen (6 files). Git on the owner's word.
