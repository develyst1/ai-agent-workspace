# TASK-157: Repair already-stored gender/nationality in place (REQ-060 Part B.1) (BE)

- Source: SPEC-057 (REQ-060 Part B — requirements 4/5; AC-4/5/6/7/8)
- Status: DONE (SA-reviewed Sober 2026-08-22) — REQ-060 Part B.1 complete; owner runs on both boxes to clear the 24

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **624/0** (repair 11/0,
+11). Read the code:
- **Pure `lib/demographics-repair.ts` reuses `lib/demographics.ts`** (repair and importer can't drift). Per row:
  gender unreadable → reported, not changed; mis-cased → change; nationality mis-cased → change; **already-normalised
  → no change** ⇒ `คุณมะเหมี่ยว` (`female`) is untouched **by construction, no name check** (AC-6). A test pins that
  row by name anyway so a future edit can't lose it — the right belt-and-suspenders.
- **AC-5 made structural:** `repairValues` builds its object only from `changes`, whose `field` is typed
  `"gender" | "nationality"` — so the update statement **cannot** target another column. There's a test asserting
  no other key is producible. That's the honest form of "courses/bookings/names/LINE untouched".
- **Never blanks:** unreadable stored value (`?`) is left + reported; `Japan` passes through unchanged (not a casing
  error). Empty stays empty.
- **PII correct:** console = counts only (`formatRepairCounts`), a test asserts no name reaches stdout; the named
  per-row report goes to gitignored `project-docs/`. Dry-run throws `__dry_run_rollback__` **before** the write loop;
  `--commit` writes only changed rows in one tx. Idempotent (second run → 0), pinned.

**Verdict: DONE.** REQ-060 Part B.1 complete. Owner runs `demographics:repair` (dry-run → read the project-docs
report → `--commit`) on **both** boxes to clear the 24 on `uat` / ~130 on `sid`.

## Answer to Jason's Q1 (Part B.2)
**Agreed, and well-spotted:** the durable half of B.2 is **adopting `lib/demographics.ts` in the API write path**
(`parent.service`/`validation`) — the one door Part A deliberately left alone. That is BE, small, and stops a
non-normalised value entering through the UI/API in the first place; the FE forgiving-readers are the softer,
display-only half. When Porter schedules B.2, sequence the **BE write-path adoption first** (prevents new bad rows)
and treat the FE readers as the lower-value display guard. Recorded in SPEC-057's Part B.2 notes.
- Assignee: @Jason (BE)
- Depends on: `lib/demographics.ts` (TASK-154, DONE) — **reuse it**, so repair and importer never diverge. BE-only,
  owner-run, no migration.

## Why (one paragraph)

Part A fixed the importer for **new** rows. **24 rows on `uat`** (`Male` 14 + `Female` 10) and **~130 on `sid`** were
written **before** Part A and still read capitalised, so the product shows no gender / mislabels Thai children as
foreign for them. This repairs those rows in place — the customer never re-types — **without touching the one row
they already fixed by hand** (`คุณมะเหมี่ยว`, already `female`).

## What to build (smart-scheduler-back)

A script `scripts/repair-demographics.ts`, wired `"demographics:repair"`, house pattern (`db:reset` /
`import:students`):

1. **Load every student** (`id, name, gender, nationality`). For each, compute
   `normalizeGender(gender)` / `normalizeNationality(nationality)` from **`lib/demographics.ts`**.
2. **Candidate change** = normalised value is **non-null AND ≠ stored** (`Male`→`male`, `Thai`→`ไทย`). A value that
   already normalises to itself (`female`, `ไทย`, `Japan`) is **skipped** ⇒ `คุณมะเหมี่ยว` is untouched with **no
   special case** (AC-6).
3. **Never blank:** stored non-empty but `normalize().value === null` (unreadable) ⇒ **leave it, report it.** The
   repair fixes casing, never erases.
4. **Write only `students.gender` / `students.nationality`**, only for candidate rows, in one transaction. **Never**
   read/write names, DOB, courses, bookings, vouchers, quota, plans, LINE links (AC-5). No DDL.
5. **Dry-run by default** (`__dry_run_rollback__` sentinel); `--commit` writes.
6. 🔴 **PII — console = COUNTS ONLY** (`เพศ N · สัญชาติ M · อ่านไม่ออก K · ข้าม(ปกติแล้ว) Z`). The **named per-row
   report** (`name · gender from→to · nationality from→to`) → **gitignored `project-docs/`**, exactly like
   `import:students`. Never print a student name to the console; never write the report to a tracked file.
7. **Idempotent:** a second run finds 0 candidates and says so.

## Definition of Done

- [ ] Dry-run prints per-row (in the `project-docs/` report) which rows change and `from→to`, and **writes nothing**;
      console shows counts only, no student names (AC-4 + PII).
- [ ] `--commit` normalises only the capitalised/`Thai` rows; a re-run finds **0** (AC-4/AC-6 idempotent).
- [ ] `คุณมะเหมี่ยว` (already `female`) is reported **skipped/already-correct**, never rewritten (AC-6).
- [ ] A stored unreadable value is **left and reported**, never blanked.
- [ ] Only `gender`/`nationality` columns are written — assert in a test that the update statement targets no other
      column; courses/bookings/names/LINE untouched (AC-5).
- [ ] Pure decision unit-tested (reuse/extend `demographics.test.ts` or a small `repair-plan` helper): capitalised →
      change · already-normalised → skip · unreadable → leave+report.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.
- [ ] You run **nothing** against a DB. **Runsheet:** run on **BOTH boxes** (`uat` 24 rows, `sid` ~130) — dry-run →
      owner reads the `project-docs/` report → `--commit`, each box. Both boxes is correct (idempotent normalisation,
      not the divergent import).

## Notes / Questions

(Jason fills in. Part B.2 — forgiving readers — is deliberately **not** in this task; it is FE + a BE reader tweak,
low priority, and raised for Porter to schedule since Fern is stood down. This task is the repair only.)

## Implementation Notes
**Files:** `src/lib/demographics-repair.ts` (new, pure) · `src/lib/demographics-repair.test.ts` (new, 11 tests) ·
`scripts/repair-demographics.ts` (new) · `package.json` (`demographics:repair`).

- **Reuses `lib/demographics.ts`** — the same functions the importer calls, so repair and import cannot drift.
  That was the point of Part A leaving them in `lib/`.
- **The `คุณมะเหมี่ยว` protection is structural, not a special case.** The rule is "a value that already
  normalises to **itself** is skipped", so `female` → `female` produces no change and the hand-fixed row is
  untouched by construction. I deliberately did **not** write a name check: a repair that has to *remember* an
  exception is a repair waiting to break it. A test pins that row by name anyway, so a future edit can't lose it.
- **Unreadable values are left and reported**, never blanked — the repair fixes casing, it does not erase. Note
  `normalizeNationality` never returns "unreadable" (an unrecognised value passes through as itself), so `Japan`
  simply equals what is stored and produces no change.
- **Only `students.gender` / `students.nationality` are written**, and only for rows that actually change, in one
  transaction. `repairValues()` can *structurally* only produce those two keys — there is a test asserting that,
  which is the honest version of "courses/bookings/names/LINE untouched" (AC-5): the update statement has no other
  column available to it.
- **Dry-run by default** via the `__dry_run_rollback__` sentinel; `--commit` writes.
- 🔴 **PII split, as specced:** the console gets **counts only**
  (`นักเรียนทั้งหมด N · แก้เพศ … · แก้สัญชาติ … · อ่านไม่ออก(ไม่แตะ) … · ปกติอยู่แล้ว …`) — a test asserts no name
  can appear in that line. The **named** per-row report (`name — gender: Male → male`) goes to gitignored
  `project-docs/`. Unchanged rows are omitted from the report so the real changes aren't buried.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **624 pass / 0 fail** (73 files; +11). Tests: `Male`+`Thai`
both fixed · only the wrong field touched · **already-correct row skipped** · `Japan` untouched · unreadable left
+ reported · empty stays empty · only gender/nationality keys are ever produced · the count split · **a second
pass finds 0 (idempotent)** · console line carries no name · the file report names rows and flags the unreadable.

⚠️ **I ran nothing against a database.**

### Runsheet for the OWNER — BOTH boxes
```
bun run demographics:repair            # uat — DRY RUN, then read ../project-docs/demographics-repair-preview.txt
bun run demographics:repair --commit   # uat  (expect ~24 rows: Male 14 + Female 10)
bun run demographics:repair            # sid — DRY RUN
bun run demographics:repair --commit   # sid  (expect ~130)
```
Both boxes is correct — this is idempotent normalisation, not the divergent-data import. A re-run reports 0.

## Questions
- Q1 (for Part B.2, non-blocking): after this, stored values are lowercase/`ไทย` everywhere, so the "forgiving
  readers" work only protects against **future** non-normalised writes — chiefly the API path
  (`parent.service`/`validation`), which Part A deliberately left alone. If B.2 gets scheduled, adopting
  `lib/demographics.ts` in that write path is the smaller and more durable half of it.

  > answer: (Sober)
