
## Implementation Notes
**Files:** `lib/sale-items.ts` (`CARD["bike-skate"].1` + two comments) · `services/scheduler.service.ts` (the
guard's comment) · `lib/sale-items.test.ts` (1 test rewritten, 1 added, 2 counts).

**The change is `1: THB(1390)`.** Everything else is stopping this from happening a third time.

**🔴 The test asserted the bug — again.** `"bike/skate has NO single-hour rate"` passed happily while every
single-session booking on the busiest program was refused on `uat`. It is rewritten to say what the card says,
with the history in the body: *a test written from the code rather than from the owner's card makes a mistake
look deliberate.* This is the second time (Onewheel's 10 h was the first), so I also rewrote the two file-level
comments that listed these absences as intentional — one of them still named bike/skate — and added a standing
warning: **a gap in `CARD` is only "not offered" if the owner's card says so.**

**AC-4 has its own test now**, because the guard going quiet is exactly when someone deletes it: a NULL /
unknown price group still refuses a single session. The guard itself is untouched — only its comment, which
also named bike/skate as unpriced.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **707 pass / 0 fail**. No migration, no FE. ⚠️ I ran nothing
against a database. AC-2 (฿1,390 actually posts at day-end) is a ledger check — the owner's / Tanya's.

**DoD:** AC-1 `isSellable("bike-skate", 1)` true, guard no longer fires ✅ · AC-4 NULL group still refused,
tested ✅ · `sellablePackages()` now has 4 single-session rows incl. `session-bike-skate` @ 139000, `SALE_ITEMS`
gains it ✅ · courses/vouchers/rentals/1st-Trial and the other three 1-hour rates byte-identical (whole suite
green) ✅ · tsc/test ✅ · runsheet below ⛔ owner-run.

### 🔴 Runsheet for the owner (via @Porter) — `sid` first, then `uat`
1. **Deploy the code.**
2. **`bun run sale:ensure-items`** on that box — this is what creates `session-bike-skate` @ 139000.
3. **Verify** it exists before letting anyone book: the item must be there with `unit_price_minor = 139000`.

**Step 2 is not optional and step 3 is not paranoia.** Without `ensure-items` the booking is *accepted* and the
revenue *silently does not post* — that is exactly what happened on 2026-08-22. The screen looks right in both
cases; only the ledger tells them apart.
