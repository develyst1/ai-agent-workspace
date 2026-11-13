# uat deploy note: close a day B (REQ-5013), and what else sits in the same trees
**Sector (SA, Team C), 2026-11-13.**
- **For:** Porter, before he asks the owner. Written per role-sa "Asking for a deploy", after FAILURES F-067.
- **Read:** `git status` in SB (`dong` @ `bfe5ef6`, the commit uat runs since 11-11) and SF (`dong` @ `86316ee`), on 2026-11-13. TASK files were mapped by their `TASK-xxx` tags. Board rows 318–320, 376–377. TEST-155, TEST-156.

## READ FIRST: today the trees can't ship close-a-day alone
Both repos are single checkouts that three tasks write into, and their hunks are **interleaved in the same files**.

**SB (99 changed paths):**
- `scheduler.service.ts`: 17 hunks (959 ×5 · 942 ×5 · 961 ×6);
- also mixed: `schema.ts`, `contract.ts`, `api.ts`, `validation.ts`, `route-access.ts`, `migration-witness.ts`, `line-i18n.ts`, `drizzle/meta/_journal.json`;
- and 40+ test files whose migration-count pins already say 80 (0077 + 0078 + 0079).

**SF:**
- `contract.ts` and `dictionaries.ts` hold 960 + 942 + 962;
- **TASK-962 (change activity) is half built and already wired into `PlanModal` and `BookingModal`**, so it would be visible on uat.

**A 959/960-only commit would mean hand-splitting those hunks and re-pinning the tests.** That is ≈ 0.5–1 d of my work at high risk, and the result would be a build nobody has tested. **Not recommended.**

## What each tree holds, and its QA state
| TASK | Repo | What | QA on sid | Ship to uat? |
|---|---|---|---|---|
| 959 | SB | close a day: block, make-up / extender skip, attention, 3 routes; migration **0077** | ✅ TEST-156 PASS | yes |
| 960 | SF | close a day: dialog, calendar strip / panel, attention day link | ✅ TEST-156 PASS | yes |
| 942 | SB + SF | park fee: several groups per hour; migration **0078** (rebuilds the bookings slot index) | 🔁 TEST-155 FAILED (D-155-1, the fix is cut) | not yet |
| 961 | SB | change activity: history table, relabel, notices; migration **0079** | DONE on sid by Bob; **no Tanya run yet**. Revenue hunk ✅ by me (SPEC-107 §0) | not yet |
| 962 | SF | change-activity dialog | ⏸ in progress, already wired into 2 panels | no |

## Recommendation [SA-decided, for Porter + the owner]: one combined uat deploy, gated
**Gate:** all of these green on sid first.
1. TEST-155 re-run PASS (942 with the D-155-1 fix);
2. Tanya's run of 961 + 962 together (the dialog is the only way a user reaches 961);
3. my review of 962 (Silver's) and 942's fix (Silver's), each through Porter;
4. then the owner's **ขึ้น git** in SB and SF (I commit **everything reviewed**, named per TASK), and the owner deploys **those commits**, never a working tree.

**Until then, close-a-day stays on sid only.** It is passed and parked; nothing on uat changes.

*If the owner wants close-a-day on uat sooner, the only safe route is the split above (≈ 0.5–1 d of mine + a full sid re-test of the split build). It's his call, through Porter.*

## The uat steps, when the gate is green (SB first, then SF)
**BEFORE (STOP if any line differs):**
1. **The SB commit to deploy** = the hash I report after ขึ้น git. Its tree has **no** uncommitted changes (`git status` clean in the deploy checkout).
2. The owner's routine `.env.uat`. The host printed by the step below must be uat's (154.197.124.29 or the internal 172.17.172.29), never .206.
3. `bun run db:preflight` → exactly:
   `3 pending migration(s): 0077_closed_days, 0078_slot_exempt_park_blocks, 0079_activity_changes` + `✅ this batch can be applied in one run.`
   - Any other list (fewer, more, or a different name) → **STOP**, send me the output.

**MIGRATE:**
- `bun run db:migrate` (preflight → migrate → verify).
- ⚠️ **0078 rebuilds the bookings unique index under an ACCESS EXCLUSIVE lock** (its header): every calendar read waits for the build. **Run it at a quiet time** (night, or before the school opens).

**AFTER:**
- `db:verify` → `Journal: 80 migration(s) · ledger …: 101 row(s)` (uat had 98 after 0074–0076 on 11-11, so 98 + 3) · `Schema witnesses: 80 applied` · ✅.
  - **If the ledger is not 101**, send me the number before restarting anything.
- Build + restart SB, then SF (the commit I report), as on 11-11.
- **Read-only checks I can run myself afterwards** (uat-select):
  - `closed_days` exists and is empty;
  - `bookings.slot_exempt` exists, and its count of `true` = the park blocks;
  - `activity_changes` exists and is empty.

**Rollback:**
- SB → `bfe5ef6`, SF → the commit uat runs today.
- The 3 migrations are additive: an empty table, a defaulted column, an index with one more term. The old code ignores them, so **no down-migration is needed**.

## Open, before the gate
- **SF on uat today:** which commit does uat run (`6c63154` or `86316ee`)? RESUME-HERE says Palm's SOM pies are already on uat. The owner reads it from his deploy, and I put it in the rollback line.
