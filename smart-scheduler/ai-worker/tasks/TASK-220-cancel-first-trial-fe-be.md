# TASK-220: Allow cancelling a 1st Trial booking — with its reason actually stored (REQ-009 gap) (FE + BE)

- Source: Porter's order (owner-found on uat, 2026-08-29). 🟢 LOW, 2 lines, cross-repo — **land together**. On `develop`.
- Status: ✅ **BOTH HALVES DONE (Sober 2026-08-29)** — FE `canCancelWithReason` + BE `REASON_ENUM_REQUIRED` both carry FIRST_TRIAL; reason required+stored+queryable like 1HR/voucher. tsc 0 both repos · 944/0 · build ok. No migration. Ship FE+BE together → deploy + sid/screen check @Porter.
- Repos: **smart-scheduler-front** + **smart-scheduler-back**.

## What (Porter, grounded)
An ATTENDED `FIRST_TRIAL` offers no cancel — the `⋯` menu hides it. It was never in REQ-009's scope (*"1HR or Voucher"*),
so this is a gap, not a defect. `ATTENDED` is **not** the blocker (cancel-delivered is allowed by design, TASK-105);
the gate is only the booking type.

## The change — two coupled one-liners (correcting Porter's "BE needs nothing")
1. **FE (`BookingModal.tsx:288`):** add `FIRST_TRIAL` to `canCancelWithReason` — the `⋯` menu then offers cancel and
   opens the existing reason dialog (TASK-212).
2. **BE (`scheduler.service.ts:2211`):** add `FIRST_TRIAL` to `REASON_ENUM_REQUIRED = {SINGLE_SESSION, VOUCHER}`.
   🔴 **Why this is NOT "BE needs nothing":** the FE dialog *requires* a reason, but the BE stores it only for the two
   types in that set — so **a first-trial cancel would force the staff to pick a reason and then silently drop it**
   (collected, not stored, not queryable). That defeats REQ-074's point ("find every admin-error cancellation" in one
   query). One BE line makes the first-trial reason **stored + queryable + required**, consistent with 1HR/voucher.
   No migration — `0025`'s `cancel_reason` column already exists and its CHECK already allows the three enum values.

## DoD — the OUTCOME
- [ ] An ATTENDED FIRST_TRIAL can be cancelled from the `⋯` menu with a required reason; status → CANCELLED, the
      **freelance hold is released** (service path, not raw SQL), and the **reason is stored** (a `SELECT` for
      `ADMIN_ERROR` finds the first-trial cancel alongside the others).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 (both repos) · `bun test` / `bun run build` green.

## Notes
(FE + BE land together — FE-alone loses the reason, BE-alone changes nothing visible. If the owner decides a first-trial
cancel should NOT carry a queryable reason after all, drop the BE line and the FE dialog just discards it — but the
default, consistent behaviour is to store it.)

---

## FE half done (Fern 2026-08-29) — ⛔ **must not ship without the BE line**
`canCancelWithReason` now covers the three **non-course** types: `SINGLE_SESSION | VOUCHER | FIRST_TRIAL`. A course
session still cancels from its **plan** (TASK-105), where the re-owe/make-up consequence is visible — a second door to
a different behaviour is worse than one door.

### 🔴 I checked the BE rather than assuming your correction had landed
`REASON_ENUM_REQUIRED` in `scheduler.service.ts:2211` is **still `{SINGLE_SESSION, VOUCHER}`** on this checkout. So as
of right now:
- the dialog **forces** staff to pick a reason for a 1st-Trial cancel, and
- the server **silently discards** it (not stored, not queryable).

That is worse than not asking: the record would *look* complete and be empty, which is the precise failure REQ-074
exists to prevent ("find every admin-error cancel"). **Your two-coupled-one-liners call was right**, and this is the
evidence that the coupling is real and not theoretical.

**I wrote the coupling into the code**, not just the log — the condition carries a `⛔ MUST ship with Jason's BE line`
comment naming why, so a future reader can't split them by accident.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · suite **41/0**.

**Status: FE ready, BLOCKED on TASK-220's BE half.** If the owner decides a trial cancel needs no queryable reason,
the honest alternative is to drop **my** line too and leave the action unavailable — not to ship a dialog that asks a
question nobody records.

## Implementation Notes (BE half)
**Files:** `services/scheduler.service.ts` (one line + the reasoning) · `services/cancel-reason.test.ts`
(pin updated, +1).

`REASON_ENUM_REQUIRED` is now `{SINGLE_SESSION, VOUCHER, FIRST_TRIAL}`. No migration — `0025`'s column and
CHECK already carry all three reasons, which is what made this a one-line completion rather than a new feature.

**I verified the premise at the source rather than taking it from the task.** A first trial **bills**: the
day-end job selects `bookingType IN ('FIRST_TRIAL','SINGLE_SESSION')` when ATTENDED and posts `first-trial`
(`jobs.service.ts:107`, `sale-items.ts:111`). So a trial is a **standalone session that moves money**, exactly
like a 1HR — which is why it belongs in the same audit set and why leaving it out made *"find every
cancellation someone made by mistake"* **silently incomplete**. That is the worst kind of wrong for a query
whose entire purpose is completeness: it answers, and the answer is short.

**`COURSE_PACKAGE` stays out, unchanged** — a course session's cancel is a *reschedule that re-owes a make-up*
with its own door (the plan editor, TASK-105). The existing test that its path is byte-identical still passes.

**⛔ The coupling is written at both sites, not just in a task file.** Fern put a `MUST ship with Jason's BE
line` comment on `canCancelWithReason`; the BE set now carries the mirror of it, and **a test asserts that
comment names `canCancelWithReason`** — so if someone edits one list, the other is one grep away instead of one
support call away. If they are split, the dialog asks for a reason nobody stores, or the API refuses a cancel
the UI offers.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **944 pass / 0 fail** (+1).

**DoD:** the enum is required for a first-trial cancel and stored in `cancel_reason` ✅ · no migration ✅ ·
tsc/test ✅ · ⛔ **the outcome — cancel an ATTENDED first trial on `sid` and see CANCELLED + the hold released +
`SELECT … WHERE cancel_reason = 'ADMIN_ERROR'` finding it** — needs `0025` applied and is Tanya's, with the FE.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-220 | scheduler-front + scheduler-back: **cancel a FIRST_TRIAL with a reason** — Fern's dialog half + the BE line that makes the reason storable/queryable. Ships as a pair. | SPEC-067 (REQ-074) | 🔎 **REVIEW — BE half done** (Jason 2026-08-29 — `REASON_ENUM_REQUIRED` = `{SINGLE_SESSION, VOUCHER, FIRST_TRIAL}`; **no migration** (`0025`'s column + CHECK already carry all three), which is what made this a one-line completion rather than a feature. **I verified the premise at the source instead of taking it from the task**: the day-end job selects `FIRST_TRIAL`/`SINGLE_SESSION` when ATTENDED and posts `first-trial` — a trial is **a standalone session that moves money**, exactly like a 1HR, so leaving it out made *"find every cancellation made by mistake"* **silently incomplete**: the worst kind of wrong for a completeness query, because it answers and the answer is short. `COURSE_PACKAGE` stays out (a reschedule that re-owes, own door — its byte-identical test still passes). ⛔ **The coupling is written at BOTH sites**: Fern's comment on `canCancelWithReason` is mirrored on the BE set, and **a test asserts the BE comment names `canCancelWithReason`** — split them and the dialog asks for a reason nobody stores, or the API refuses a cancel the UI offers. tsc 0 · **944/0** (+1). ⛔ Outcome (cancel an ATTENDED trial on sid → CANCELLED + hold released + a `SELECT ADMIN_ERROR` finds it) needs `0025` applied — Tanya's, with the FE.) | Sober | — |
```
