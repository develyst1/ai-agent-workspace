# TASK-916: the camp list's `amountMinor`, and `branch` on the course/voucher plan summaries (SB)
- Source: the TASK-901 review (the amount shows «—» before the press) · the TASK-898 review, Q7 (SB's plan summary has no `branch`) · SPEC-099 §9 / §11. Both were deferred by the deploy freeze, which lifted 2026-11-09.
- Owner: BE (Brew, Team C) · SA: Sector · Status: REVIEW (Brew, 2026-11-09; report at the end of this file) · Depends on: none (TASK-900 and TASK-889 are deployed). **Edit shared files only after Porter's claim names them for Team C** (requested 2026-11-09).
- Repo: `smart-scheduler-back` (SB), `dong`. Re-read each shared file on disk first.
- **Base:** paste `bun test` (dummy URL) + pinned tsc first.
- Files (closed list):
  - `src/lib/camp-confirm.ts`: one exported reader for the list (below) + its test;
  - `src/services/camp.service.ts` `listPackages` / `toPackageDTO`: one more list-only field, the same pattern as `confirmedOn`;
  - `src/services/scheduler.service.ts` `getEntitlementPlan`: `branch` on the course summary and the voucher summary (two lines);
  - the pins that mirror those shapes, if any go red (tagged `🔻 TASK-916`; say which).
- Git writes: none. No migration. No SF change: SF already reads both fields when they're present (TASK-901: `amountMinor` on the camp package; TASK-898: `plan.summary.branch`).

## What to do
1. **Camp list `amountMinor`:**
   - Each `GET /api/camp/packages` item gains `amountMinor`: the package's **net posted sale**. That's the same number `confirmCamp` would record, from the same `feeOf("CAMP", id)` rule (`camp-sale:<id>` + `discount:<id>`).
   - It's `null` when there's no sale or the net is ≤ 0. That is exactly the `NO_FEE` case.
   - **One query for the whole list** (like `confirmedOnByPackage`), never one per package. If `feeOf` is per-id, add a batched `feeByPackage(ids)` beside it that uses the same rule, and a test that pins the two agree on the same rows.
   - Single-package answers stay untouched (no key), the same as `confirmedOn`.
2. **Plan summaries `branch`:** `getEntitlementPlan` returns `summary.branch` (`"BRAVO" | "OTHER"`) on both the course plan and the voucher plan, read from the course / voucher row (`branchOf(...)`, as `db/mappers.ts` does). Nothing else in the plan changes.

## Definition of Done
- [ ] Suite (dummy URL): no new fails over your base. Pinned tsc: 0.
- [ ] Tests (DB-free):
  - `amountMinor` = net, with a discount, with none → `null`, and net 0 → `null`;
  - one query for N packages;
  - the batch and per-id rules agree;
  - `summary.branch` on both plan kinds, BRAVO and OTHER.
- [ ] `git diff -U0` on the shared files: only these hunks.
- [ ] **sid read-only proof** (host first; no write): `listPackages` for one student with a camp sale shows its net, and one plan shows its branch.

## Implementation Notes

## Questions

## Review

**Claim GRANTED (Porter, 2026-11-09; board line written). Edit the listed files now.**

---
## Report — Brew (Team C), 2026-11-09. TASK-916 built; for Sector's review. No migration, no git, no write on sid (the proof is read-only).
**Base (pasted as asked, before I touched anything):** SB `bun test` (dummy URL) `5754 pass · 0 fail · 386 files`; pinned tsc 5.9.2 → exit 0; the tree was clean (`git status` empty). Host of SB's `.env` = `154.197.124.206` (sid), checked before the one DB read.
**After:** `5771 pass · 0 fail · 387 files` (+17); tsc exit 0.

**Files (the claim).**
- `src/lib/camp-confirm.ts` (+ `camp-confirm.test.ts`): the new batched reader `feeByPackage(ids)` · `src/services/camp.service.ts`: `toPackageDTO` (one list-only field) and `listPackages` (the lookup) · `src/services/scheduler.service.ts` `getEntitlementPlan`: `summary.branch` on both plan kinds · new `src/services/entitlement-plan-branch-task916.test.ts`.
- **Hunks (`git diff -U0` headers):** `camp.service.ts` `@@ -16` (import), `@@ -358` (the DTO's `opts` type), `@@ -368,0 +369,2` (the field), `@@ -383,2 +385,2` (`listPackages`) · `scheduler.service.ts` `@@ -71,0 +72` (import), `@@ -2833,0 +2835` (course summary), `@@ -2859,0 +2862` (voucher summary) · `camp-confirm.ts` `@@ -18` (imports), `@@ -98,0 +100,20` (the reader). No other hunk in those files is mine.
- **One pin that mirrors the shape, tagged `🔻 TASK-916`:** `src/services/camp-scan-allow-list-task502.test.ts` (its by-value admin package DTO: `+ amountMinor: null`; the public scan allow-list is a separate shape and is untouched).

**What it does.**
1. **`amountMinor` on the camp list.** Each `GET /api/camp/packages` item gains `amountMinor`: the package's **net posted sale** (`camp-sale:<id>` + `discount:<id>`), `null` when there is no sale or the net is ≤ 0 — exactly `confirmCamp`'s `NO_FEE` case. `feeByPackage(ids)` makes **ONE query for the whole list** over the 2N keys and applies the confirm's own pure rule (`feeFromMovements`, not a copy); it returns only the packages with a net > 0. The list is now **two ledger-side queries in total** however many packages (the dates for `confirmedOn`, the nets for `amountMinor`), run in parallel. The single-package answers (the sale, redeem, the scans) carry **no `amountMinor`**, the same rule as `confirmedOn` (pinned).
2. **`summary.branch`** on both plan kinds from `getEntitlementPlan`: the course summary and the voucher summary each get `branch: branchOf(row.branch)` (BRAVO | OTHER; a row without it reads BRAVO). Nothing else in the plan changed.

**Evidence (dummy URL; pinned tsc 5.9.2).**
- **Tests, DB-free:** `amountMinor` = net with a discount, = the sale with none, `null` with no sale, `null` for a net of exactly 0, `null` for a negative net, `null` for a discount alone; another package's rows and a course's / voucher's sale never count; **one query for N packages over exactly the 2N keys**; an empty list asks nothing; **the batch and the per-id rule agree** on the same rows (the confirm's `feeOf`, run per package with `confirmCamp`'s refusal rule, gives the same net or the same null as the batch for five different row patterns); `feeByPackage` reuses `feeFromMovements` (source pin, no second sum); the real `listPackages` returns the right `amountMinor` per package and still two queries; `summary.branch` on a course and a voucher for BRAVO and OTHER, BRAVO for absent / null / empty / junk, `summary.branch` only (not on the plan), the voucher summary's exact key set, the course summary's other fields intact, and the two source lines.
- **Mutation set: 19 mutants, 18 killed + 1 equivalent.** The survivor, `net !== null && net > 0` → `net > 0`, is equivalent (`null > 0` is false). The first run also left `amountMinor: opts.amountMinor ?? null` (a key always present, i.e. a false null on the single answers); a pin now kills it. Files restored byte for byte (hash check; `camp.service.ts` and `scheduler.service.ts` are CRLF files, edited and restored with their own line endings).
- **sid read-only proof** (host first, no write; `list916-sid-read.ts` in my scratchpad): the three `branch` columns exist on sid (889's migration is applied). A real student with **9 camp packages that have a posted sale**: `listPackages` returns all 9 with `amountMinor` (2,600,000 ×4 · 520,000 · 260,000 ×3 · 1,050,000) and the new key set (`amountMinor`, `confirmedOn` among the 16 keys); **every package's `amountMinor` matches an independent SQL sum of its two movement keys (9 of 9 MATCH)**; `confirmedOn` is null for all (none confirmed yet). `getEntitlementPlan`: a real course → `summary.branch = BRAVO` (the row's column: BRAVO, MATCH); a real voucher → `summary.branch = OTHER` (the row's column: OTHER, MATCH; there is 1 OTHER voucher and 0 OTHER courses on sid).
- **Not exercised:** the front end (TASK-901/898 read these fields when present: not driven here), a confirmed camp in the list with a real `confirmedOn` (none confirmed on sid; the unit tests cover it, and TASK-900's rolled-back proof covered the write).

**Declared decisions (mine).** (1) The list's `amountMinor` is only present when the net is > 0, `null` otherwise (never 0). (2) `feeByPackage` lives in `camp-confirm.ts` beside `confirmedOnByPackage`, as the TASK's list says, and uses `payment-record.ts`'s `feeFromMovements` for the rule.

## Questions
None.

## Review (Sector, 2026-11-09): ✅ DONE
- **Re-run by me** (SAFE dummy URL): **5771 pass · 0 fail**. Pinned tsc 5.9.2: exit 0. `git status` shows only this TASK's files.
- **Hunks, read in the diff:**
  - `camp.service.ts`: one import word, the `toPackageDTO` option, and `listPackages` doing ONE `feeByPackage(ids)` beside `confirmedOnByPackage`, run in parallel;
  - `amountMinor` is list-only;
  - `scheduler.service.ts`: one import plus `branch: branchOf(...)` on the course and voucher summaries.

  All exactly as claimed.
- **The contract matches SF unchanged:** TASK-901 reads `amountMinor` on the package, and TASK-898 reads `plan.summary.branch`. So both screens start working when this deploys, with no front-end edit.
- The sid read-only proof (9/9 amounts equal an independent SQL sum; the plan branches match the rows) and the 18/19 mutants (the survivor is the equivalent `null <= 0` case) are accepted. The one mirror pin (`camp-scan-allow-list-task502`) is the usual DTO value.
- Security review: list-only read fields, no new route, no auth change, no personal data. **None.**
- **Ships with the next SB deploy (the owner's call).**
