# RESUME HERE — where this project is right now

> 🔴 **REPLACED, NEVER APPENDED TO.** A snapshot, not a log. Its predecessor (`../PROJECT-STATUS.md`) died by
> stacking dated blocks to 47.9 KB, nine days stale; it is kept verbatim at
> `archive/PROJECT-STATUS-2026-09-28-pre-split.md`.
> **One page, ~4–6 KB.** History → `log/` · decisions → `SYSTEM-FACTS.md` · state → `board.md`.
> **Written by** the PM before ending any session; **read by** the PM and the SA Lead, first. **On opening,**
> check it against `board.md` + today's log and **report any disagreement to the owner** — never silently trust
> it, never silently fix it. Provenance on every line.

**Written:** 2026-09-29 by Porter (PM) · **Newest log at the time:** `log/2026-09-29.md`

## What we are in the middle of

1. **The D7/D8 round is through sid QA and is now the CUSTOMER's to test on `sid`.** `[owner-approved 2026-09-29]`
   Deployed to `sid` 09-29: TASK-551 (same-slot make-up suppression) · TASK-552 (B) (a re-owe inherits only the
   cancelled make-up's own link) · TASK-554 (shop-QR 2nd-tick crash) · TASK-556 (migration `0061`, the expiry
   marker row). `sid` is at **migration 62, ledger 102, verify green**. Tanya: D7 ✅ on a real phone, D8 ✅ fixed,
   smoke ✅. **Flow from here: Khwan tests on `sid` → then `uat`.** `uat` is still at **57 and needs 58–62.**
2. **REQ-110 — Khwan's 12-item final front-office feedback — is in intake, SIZING ONLY.** `[customer-asked 2026-09-29]`
   The owner dispatched items **1–6, 8, 9, 11 to @Sober for sizes, no build** `[owner-approved 2026-09-29]`.
   Items **7, 10 and 12 the owner has asked Khwan himself**; they are not with us.
3. **Scope for the current round is FROZEN by the owner** `[owner-approved 2026-09-29]` — D7 + same-slot
   suppression only. Everything else named this week (F5 digit-search, copy nits, the gaining coach) is next round.

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| D7/D8 round → `uat` | **Khwan** (customer), via the owner | 2026-09-29 | her run on `sid`; then the owner deploys `uat` with migrations 58–62 |
| REQ-110 sizing | **@Sober** (items 1–6, 8, 9, 11) | 2026-09-29 | his sizes back to @Porter — sizes only, nothing is dispatched to build |
| REQ-110 items 7, 10, 12 | **Khwan**, asked by the owner directly | 2026-09-29 | her answers |
| TASK-555 (the 8 §D2 LINE-admin strings) | **@Porter — HELD deliberately** | 2026-09-29 | the next round opening; the copy is already owner-approved 09-28 |
| TASK-553 (make-up link backfill) | **parked by @Sober** | 2026-09-29 | the round closing; order is writers-link → dry-run backfill → the planner line |
| Old-course expiry refusal wording | **nobody — `NOT_TESTED`** | 2026-09-29 | no live pre-cutoff course exists on `sid` to open; Tanya scanned read-only |

## Decided recently, not yet in a REQ

- **Retire `repair-course-expiry.ts` (FIX-007) to a refusing stub** — a re-run would shorten expiries and erase
  recorded stretches/admin moves, unrecorded. `[owner-approved 2026-09-29]` (recorded in SYSTEM-FACTS + TASK-556.)
- **`lib/expiry-repair-plan.ts` + its test are to be retired too**, on the condition that any unique reasoning is
  lifted into the stub or SYSTEM-FACTS first — *delete the code, keep the knowledge*. `[team-proposed 2026-09-29]`
- **A make-up cancel that re-plans onto the SAME date+time sends NO family notice**; a different date/time still
  notifies. `[owner-approved 2026-09-28]`
- **The coach who GAINS a re-added class is told in neither case** — declared, accepted, deferred to next round.
  `[team-proposed 2026-09-28]`
- **The sid/uat admin password was changed by the owner on the web and he updated the credential file himself**
  (09-29). Not a deploy defect. **No password ever travels through an inbox.** `[owner-approved 2026-09-29]`

## What becomes urgent, and when

- **`uat` is five migrations behind `sid` (58–62).** Every multi-migration `uat` deploy has hit the TASK-085 silent
  ledger skip: `db:seed-ledger` dry-run → read it → `--apply` → `db:migrate` → `db:verify`. `[carried-over]`
- **The demo OA's monthly LINE push quota resets 1 Oct.** Until it does, a silent push on `sid` proves nothing —
  read `notification_outbox.error` before calling a notice broken. `[carried-over]`
- **Fixture course `47be0cc9` is kept on `sid` as the D8 repro** until @Sober releases it. `[team-proposed 2026-09-29]`

## What we already tried that did NOT work

- **The shop-QR crash was TASK-237 returning, nineteen tasks later.** A comment in `lib/scheduler/other-booking.ts`
  already described the exact shape and why it survives review. **We lacked a TEST, not knowledge** — Fern added a
  repo-wide sweep (`lib/ui/event-in-updater.test.ts`). 🚫 `e.currentTarget?.checked` is NOT the fix: it stops the
  crash and silently records the wrong child. `[team-proposed 2026-09-29]`
- **"Read the applied time of a migration from the DB" is not possible** — Drizzle stores the journal's synthetic
  `when`, identical on every box. A constant disguised as evidence; caught before code. `[team-proposed 2026-09-29]`
- **"A cancelled make-up is not a make-up" as a one-line planner rule was wrong** — pause→resume and admin inserts
  answer a leave without linking, so the line would have moved D7 onto every paused or inserted course. Shipped as
  (B) instead: inherit the cancelled row's OWN link; an absent link **stays absent and is said, not invented**.
  `[team-proposed 2026-09-29]`
- **A render-only test passes on the broken tick** — the first tick always works. Prove a control by CLICKING it.
  `[carried-over]`
- **Yesterday's "clean" D8 forecast was the bug, not the baseline.** `[team-proposed 2026-09-29]`

## Open questions with the owner

- **Q5–Q7** (read-only counts behind TASK-556) were sent up and **have been run by nobody**; they are optional and
  block nothing. `[team-proposed 2026-09-29]`
- **Copy nit for the next round:** the `LEAVE_CHARGE_UNKNOWN` / `MAKEUP_CHAIN` refusals end in a bare
  *"กรุณาแก้ไขด้วยตนเอง"*. `[team-proposed 2026-09-29]`
- **REQ-086** (the customer edits the message words) remains the known LAST big item, on his order; `SPEC-078`
  written. `[carried-over]`
