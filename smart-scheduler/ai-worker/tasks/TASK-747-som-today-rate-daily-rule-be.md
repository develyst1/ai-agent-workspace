# TASK-747 — SOM Today % follows the Daily Report rule: attended ÷ (Confirmed + On leave) (Khwan chose A) — BE, XS (≈ 0.25 d → 0.3 d)
- Source: REQ-124 → "Khwan, 2026-10-22 … = A" · Porter GRANT 2026-10-22 · reverses TASK-741 review 1's Q1 fix (Palm's attended ÷ confirmed)
- Status: ✅ DONE (Silver, 2026-10-22) · uncommitted (3 files)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-22)
- **Claim (granted):** `src/lib/som-contract.ts` (the rate line only) · `som-contract-task741.test.ts` + `.mutations.json` (Team B's own pins, I grant) · `types/contract.ts` / `openapi/document.ts` ONLY if they state the formula. Nothing else. No front, no migration. 🔴 SAFE test command. Nothing committed.

## Build
- `today.attendanceRate` = **the Daily Report's own value**, `countDaily(dayRows).attendanceRate`, i.e. attended ÷ totalBooked (totalBooked = Confirmed + On leave, REQ-119). Total booked = 0 ⇒ 0. **Reuse it; don't write a second formula.**
- `today.confirmed` / `attended` unchanged.

## Definition of Done
- [ ] **By value:**
  - the SAME rows ⇒ `/reports/som` `today.attendanceRate` === `/reports/daily` `attendanceRate`;
  - a day with a child on leave: 2 attended, 3 confirmed, 1 on leave ⇒ 50, not 67;
  - a day with no bookings ⇒ 0, not NaN.
- [ ] **Mutations:** the old attended ÷ confirmed back (bites) · a divide by zero.
- [ ] tsc · full suite (SAFE) with counts · all REQ-124 sets still bite · the old SOM / daily code: a 0-line diff.

## Implementation Notes
**Evidence (Bob, 2026-10-22):** full SAFE **5064 pass / 0 fail (363 files)** · tsc 0 · 741's test 53 pass (1 new) · sets **741 45/45 · 742 47/47 · 743 25/25 · 737 11/11**, every CHECKSUM identical · `som-report.service.ts`, `lib/som-report.ts`, `scheduler.service.ts`: 0-line diff. Nothing committed.

**Change (one line, `lib/som-contract.ts`):** `today.attendanceRate = day.attendanceRate` — the value `countDaily` already computes for `/reports/daily` (attended ÷ (Confirmed + On leave), 0 when nothing is booked). The hand-written attended ÷ confirmed formula from TASK-741 review 1 is gone; there is no second formula. `today.confirmed` / `attended` are unchanged. `types/contract.ts` and `openapi/document.ts` do not state the formula, so they are untouched.

**Pins (741's own test/set):** the Today tests are back to 25 (1/4); NEW by-value test: 2 attended + 1 confirmed + 1 on leave ⇒ confirmed 3, attended 2, rate **50** (not 67), and the SAME rows through `countDaily` (what `/reports/daily` returns) give the same 50; the no-booking day still ⇒ 0 (not NaN). Mutations: **M38** re-aimed (the old attended ÷ confirmed back), **M39** re-aimed (a second formula with no zero guard ⇒ NaN) — both bite.

**Heads-up (not mine to fix):** the repo's `.env` now points at the CUSTOMER'S system (`LINE_OA_WRITE_ALLOW`, `LIFF_ID`, `LINE_LOGIN_CHANNEL_ID`), so the test-env guard refuses a bare `bun test` / `bun run mutation:run`. I did not touch `.env`; the SAFE command already overrides those variables for `bun test`, and for the mutation runner I exported the same SAFE overrides in my shell. Whoever owns the box may want to know.

## Questions
None.

## Review

**Silver, 2026-10-22 — ✅ FINAL: DONE.**
- **My re-run (SAFE):** **5064 / 0** (363 files) · tsc 0 · sets 741 45/45 · 742 47/47 · 743 25/25 · 737 11/11, all `CHECKSUM identical`.
- The old SOM / daily code: a 0-line diff.
- **The diff is one line:** `attendanceRate: day.attendanceRate` (`countDaily`'s own value). The contract / OpenAPI don't state the formula, so they are untouched.
- Own-team pins in the 741 test + set: granted by me.
