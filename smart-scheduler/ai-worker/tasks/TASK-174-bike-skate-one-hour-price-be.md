# TASK-174: 🔴 `bike-skate` gains a 1-hour price (฿1,390) — unblocks single-session bookings (REQ-066) (scheduler-back)

- Source: REQ-066. 🔴 **HIGHEST — blocking live single-session bookings on `uat` right now.**
- Status: REVIEW (Jason 2026-08-23). Next step: @Sober → owner deploy
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. One-line price + a deploy step. No migration, no FE.

## The change
`sale-items.ts` `CARD["bike-skate"]`: add **`1: THB(1390)`** →
`{ 1: THB(1390), 4: THB(4790), 6: THB(6490), 10: THB(9790) }`. **Only bike-skate changes** — onewheel (1,690) /
balance-private (1,390) / balance-group (1,090) keep their own 1-hour rates (REQ-061-confirmed).

That one entry:
- makes `isSellable("bike-skate", 1)` true ⇒ **REQ-061's SINGLE_SESSION guard stops firing for the blue block**
  (the guard is **kept, dormant** — it still refuses a program whose price group is NULL: AC-4);
- auto-defines the sale item `session-bike-skate` @ ฿1,390 in `SALE_ITEMS` (via `sessionItemRef`).

## Deploy discipline (state it in the runsheet — this is the 08-22 failure mode)
**Code deploy → `sale:ensure-items` on the box → verify `session-bike-skate` exists @ 139000.** Without
`ensure-items`, the booking is accepted but **the revenue silently does not post** (exactly 2026-08-22). Both boxes,
`sid` first. Owner-run.

## Definition of Done
- [ ] AC-1: `isSellable("bike-skate", 1)` true; a SINGLE_SESSION on a bike-skate program is **accepted** (guard no
      longer fires), `ราคาเต็ม 1,390`. Unit-test the predicate + that the guard now passes bike-skate.
- [ ] AC-4: a program with a **NULL** price group still refuses a single session, same message (guard dormant, not
      deleted) — test it.
- [ ] `sellablePackages()` includes `session-bike-skate` @ 1390; `SALE_ITEMS` gains it (so `ensure-items` will
      create the bo.item). Course sizes unaffected (single ≠ course; COURSE_SIZES still 4/6/10).
- [ ] Nothing else moves — courses/vouchers/rentals/1st-Trial/the other three groups' 1-hour rates byte-identical.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green (update the sale-items tests that asserted bike-skate had no 1-hour).
- [ ] Runsheet note for the owner: code → `sale:ensure-items` (creates `session-bike-skate`) → verify, both boxes.
      **AC-2 (posts ฿1,390 at day-end) is the owner's/Tanya's ledger check, not the screen.**

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-23).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **707/0** (+1).
`CARD["bike-skate"] = { 1: THB(1390), 4, 6, 10 }` (`sale-items.ts:70`) — only bike-skate; the other three unchanged.
`isSellable("bike-skate",1)` → true (AC-1); a null/unknown group still → false so the guard fires (AC-4, tested);
`session-bike-skate`@1390 derives into `SALE_ITEMS` for `ensure-items`. **The real value beyond the one line:** the
comments that called these gaps intentional are corrected (one still named bike-skate) and now carry the standing
warning — *a gap in `CARD` is "not offered" only if the owner's card says so.* That's the recurring
inference-as-fact lesson finally written where the next reader will see it. The guard is untouched, only its
mis-describing comment. **DONE (code).** The blocker clears on the owner's deploy runsheet:
**code → `sale:ensure-items` → verify `session-bike-skate`@139000, `sid` then `uat`** — without step 2 the booking
is accepted while revenue silently doesn't post (the 08-22 hole). AC-2 is the owner's/Tanya's ledger check.

## Notes / Questions
(Jason fills in. REQ-061's guard is deliberately kept — do NOT remove it; with all four groups priced it simply
stops firing and still protects the next unpriced program. `ensure-items` after deploy is not optional.)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-174 | scheduler-back (BE): 🔴 **REQ-066 (blocking)** — `CARD["bike-skate"]` gains `1: THB(1390)` (only bike-skate). `isSellable(bike-skate,1)`→true ⇒ REQ-061 SINGLE_SESSION guard stops firing (KEPT/dormant; NULL-group still refused, AC-4); auto-defines `session-bike-skate`@1390. Deploy: code → `sale:ensure-items` → verify (both boxes; else revenue silently unposted). Update the sale-items tests. No migration, no FE. | REQ-066 | ✅ **DONE (code) — SA-reviewed Sober 2026-08-23** — tsc 0 · 707/0. `bike-skate` gains `1: THB(1390)`; `isSellable(bike-skate,1)`→true (AC-1), null-group still refused (AC-4, tested); `session-bike-skate` derives for `ensure-items`. Killed the "gap = intentional" comment lie (both file-level + guard). Guard untouched. **Blocker clears on deploy: code → `sale:ensure-items` → verify, sid→uat.** AC-2 = ledger check. — _prior:_ 🔎 REVIEW (Jason 2026-08-23 — `1: THB(1390)` on bike-skate; guard KEPT and now dormant, with its own AC-4 test because a quiet guard is exactly what someone deletes. 🔴 **The test asserted the bug — again**: "bike/skate has NO single-hour rate" passed while every single-session booking on the busiest program was refused. Rewritten from the owner’s card, and since this is the second time (Onewheel 10 h was the first) I corrected the two file comments that listed these absences as deliberate — one still named bike/skate — and added a standing warning: **a gap in `CARD` is only "not offered" if the card says so.** tsc 0 · **707/0**, no migration, no FE. ⛔ **Owner-run, sid first: deploy → `bun run sale:ensure-items` → VERIFY `session-bike-skate` @ 139000 before anyone books** — without it the booking is accepted and the revenue silently does not post, exactly 2026-08-22. AC-2 is a ledger check, not a screen.) | Sober | |
```
