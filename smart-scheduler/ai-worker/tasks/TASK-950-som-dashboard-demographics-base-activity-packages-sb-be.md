# TASK-950 — BE: **build SPEC-104**: SOM Dashboard **#3 demographics base** + **#5 `activityPackages`** (smart-scheduler-back) — @Bob — now
**From @Silver, 2026-11-11.** Porter, 19:55: *"BUILD SPEC-104 now … Palm's front end is DONE (smart-scheduler-front develop 86316ee) and waits on us."* **The contract is `specs/SPEC-104-…`, read it whole; it wins over this summary.** Branch `dong`. **No git command** (I commit after sid + Tanya). **No migration.** **Size ≈ 1.25–1.5 d.** The desk stop is lifted for this task.

## Build (SB, `lib/som-contract.ts` + `services/som-contract.service.ts`)
1. **#3:** `demographics` people = **Total Customer (the `totalCustomers` set, l.~305) ∪ the 1 HR (last 3 months) set (`recentSingleSession`'s children, l.~299)**, each child once, archived out. This replaces "attended in range" (l.316–320) **for `demographics` only.**
   - Add `demographics.base: "CUSTOMERS_PLUS_RECENT_1HR"`. The shape is otherwise unchanged.
   - Lift the two sets out as named sets (not just counts) so both sections share **one** definition.
2. **#5:** a NEW `activityPackages: { month, from, to, base, activities: [{ key, label, total, packages: [{ kind: "COURSE", size, count } | { kind: "SINGLE_SESSION", count }], firstTrial }] }`.
   - `COURSE` = **active courses** (the same active rule as the Active-course card), counted as courses, by the course's own `subject_id` + `size`.
   - `SINGLE_SESSION` = **children** with a 1 HR of that activity in **the card's** last-3-months window.
   - **Vouchers are never counted.**
   - `firstTrial` = 1st Trials of that activity in the range; **not in `total`**.
   - `total` = Σ packages.
   - Every active subject is listed, 0 included; `unknown` comes last, only when > 0.
   - Packages are ordered by count, largest first. The badge filter applies.
3. **`activityProgram` stays exactly as it is** (the old screen + Palm's fallback).
4. **The service mapper** must load what (2) needs. **Courses need their `subject_id` + `size`.** Check what `SomCourse` carries today and add the fields optionally, so other readers are untouched. List the consumers you grepped.

## Tests (SAFE env; each must fail when its code is removed)
- **The SPEC's worked example** as a fixture: SURFSKATE = 61 × Course 10 + 11 × Course 6 + 15 × 1 HR → `total` 87; BIKE = 25 × 1 HR + 10 × Course 4 → 35.
- A voucher holder adds nothing to `activityPackages` but **is** in the `demographics` base.
- A child with 2 courses of one activity → `count` 2.
- A child with a 1 HR in 2 activities → 1 in each.
- 1st Trial is not in `total`.
- **The demographics base:** `gender.total` = customers ∪ 1 HR children (one each); an archived child is out; a child who only attended a 1st Trial is **not** in the base.
- `activityProgram` is unchanged (a snapshot of the old fixture's output).
- The badge filter.
- A mutation set over the base union, the course / voucher rule, the trial exclusion and `total`.

## Files (claim; Porter puts it on the board)
- `src/lib/som-contract.ts`, `src/services/som-contract.service.ts`, `src/types/contract.ts` (if the DTO type lives there);
- new `src/lib/som-activity-packages-task950.test.ts` (+ `.mutations.json`).
- Pure mirror pins are pre-approved (tagged `🔻 TASK-950`, listed).

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0;
- SAFE suite green (before / after);
- the mutants bite;
- **a read-only sid call** (host .206): `GET /api/reports/som?month=<this month>` returns both new fields, and `gender.total` = customers + 1 HR as the Existing Customers cards show. Paste the counts, no names.
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run. **Then "frozen"** until the owner's SB sid deploy.

## Bob — 2026-11-11 — DONE (see inbox/SA-B.md): tsc 0, SAFE 5834/0, 950 mutants 19/19, read-only .206 call matches the cards (gender.total 38 = 33 + 5; Σ COURSE 79 = Active course). Frozen until the owner's SB sid deploy.

## Review — @Silver, 2026-11-11: ✅ ACCEPTED (DONE; frozen for the owner's SB sid deploy → Tanya → I commit)
- **Re-run by me:** SB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; SAFE `bun test` = **5834 pass / 0 fail**.
- **`git status`:** `som-contract.ts` · `types/contract.ts` · the new 950 test + mutations · the 741 test + mutations (tagged pins). That's all claimed or pre-approved; **the service mapper needed no change**.
- **The 741 test edits:** read. The people fixtures became 1 HR rows so they stay in the NEW base, and one `activityProgram` assertion moved from `course` to `singleSession` **because the fixture's booking type changed, not the code**. `activityProgram`'s logic is untouched. Accepted.
- **The worked example (SURFSKATE 87 / BIKE 35)** is in the new test; 19 / 19 mutants.
- **Read-only sid call (Bob, .206):** `gender.total` 38 = 33 customers + 5 non-customer 1 HR children; Σ COURSE 79 = the Active-course card's 79.
- **Security review:** none. Read-only aggregates, no new route or input.
