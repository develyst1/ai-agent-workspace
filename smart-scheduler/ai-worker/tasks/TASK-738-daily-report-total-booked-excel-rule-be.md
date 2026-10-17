# TASK-738 — REQ-119 ❓ RULED: Total booked = Confirmed + On leave (flip `TOTAL_BOOKED_INCLUDES_PENDING` to false) — BE, XS (≈ ¼ d)
- Source: Khwan, 01:12, *"ที่ต้องการคือ แบบ A … ไม่นับคลาสที่ยังไม่คอนเฟิร์มค่า"* (REQ-119 ❓, RULED) · Porter 2026-10-13 (inbox) · follows TASK-737 (DONE, committed)
- Status: ✅ DONE (Silver, 2026-10-13) · uncommitted: `daily-report.ts` + `daily-report-task737.test.ts` + `.mutations.json`
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-13)
- **Claim:** 737's granted files only: `src/lib/daily-report.ts` + `daily-report-task737.test.ts` + `.mutations.json` (Team B's own: I grant the pins). 🚫 The old `getDailyReport` stays byte-identical. 🔴 SAFE test command only. Nothing committed.

## Build
1. `src/lib/daily-report.ts:16`: `TOTAL_BOOKED_INCLUDES_PENDING = false`. Update its comment: ruled by Khwan (A), 2026-10-13; Pending + Extended are OUT of Total booked.
2. The % follows by itself (`attended / totalBooked`). Nothing else changes.
3. Keep the injectable `includePending` and both-path tests (cheap; documents the rule).

## Definition of Done
- [ ] The default pin (`task737.test.ts:44`) ⇒ `false`. A by-value test on the DEFAULT path (no `includePending` passed): Palm's §8 rows ⇒ totalBooked = confirmed + onLeave, and the % from that.
- [ ] Mutation M8 rewritten: the switch flipped BACK to `true` (bites). The whole set still bites; checksum identical.
- [ ] tsc · full suite (SAFE) with counts (Team A's TASK-803 red, if still there, is not ours: name it).
- 📌 Proof on sid is Tanya's (Porter): 28 Sep, All teachers ⇒ **TB 8, 63%** (was 9, 56%); TEST-101's table ⇒ 8/16/17/11/11.

## Implementation Notes

## Questions

## Review

**Bob, 2026-10-13 — DONE (inside 737's files only).** `lib/daily-report.ts`: `TOTAL_BOOKED_INCLUDES_PENDING = false`, its comment now says Khwan ruled A (2026-10-13), Pending/Extended OUT; the injectable `includePending` and the both-path tests stay (the other path = Palm's earlier choice, documented). Test: the old "stays at Palm's default" pin became "the switch is RULED": the constant is `false`, and the DEFAULT path (no option passed) on Palm §8 gives totalBooked = confirmed + onLeave = 5, attendanceRate 40, pending 1 on its own card. Set `daily-report-task737.mutations.json`: M8 now flips the switch BACK to `true` — all **11 BITES · 0 SURVIVED**, checksum identical (the file was re-serialised by my script, so its git diff looks larger than the change). Old `getDailyReport`: `git diff` = 0 lines. **SAFE: 4700 pass / 0 fail (348 files); tsc 0** (Team A's TASK-803 red is gone from the tree). Proof on sid stays Tanya's (28 Sep, All teachers ⇒ TB 8, 63%).

**Silver, 2026-10-13 — ✅ FINAL: DONE.**
- **Re-run by me (SAFE):** **4700 / 0** (348 files; Team A's 803 red is gone). tsc 0. Set **11/11 BITES**, `CHECKSUM identical`; M8 now flips BACK to `true` and bites.
- The diff covers 737's 3 files only. `daily-report.ts`: the switch → `false` + the comment (Khwan A). The default-path test gives Palm §8 ⇒ 5 / 40%.
- 📌 The mutations JSON diff looks big (+178) because Bob re-serialised it. I compared it parsed against HEAD: `tests` is identical, 11 = 11 mutations, and **only M8 changed**.
- The old `getDailyReport` is untouched (`scheduler.service.ts` is not in the tree's changes; M11 bites).
