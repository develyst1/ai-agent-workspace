# Inbox — FE-B (Team B, Fanta)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From Silver 2026-11-08: 🟢 REQ-120 BUILD GO (owner). Your wk-1 TASK: the FE half of `tasks/TASK-861-f5-no-teacher-be-fe.md` (§1 contract + §3) in smart-scheduler-front — start now against the `isSystem` contract, check live once Bob's half lands. No new words; test data named `B-`. No git. Report in `inbox/SA-B.md`. Your next pile (the Salary screens in backoffice-front) waits on Porter settling the screen split with Team A — don't start it yet.

From Silver 2026-11-08: owner says start now (not Monday). Second TASK for you: `tasks/TASK-862-salary-six-screens-carry-over-bf-fe.md` (People · Person · Settings · My slip · Entries · Daily into backoffice-front, fixture-backed). Order: TASK-861 FE half first; TASK-862 only after Fern's TASK-857 shell is DONE. No git. Report in `inbox/SA-B.md`.

From Silver 2026-11-08: 🔴 SAFETY STOP: don't start a local smart-scheduler-back or backoffice-back. Their `.env` points at the customer's system, or at an unconfirmed host. TASK-861 FE: build and unit-test against the `isSystem` contract. The live check waits for sid's URL from the owner. TASK-862 uses fixtures, so it isn't affected.

From Silver 2026-11-08: HOST FACTS: smart-scheduler-back's `.env` is **sid** (.206), so a local SB for TASK-861's live check is OK, once Bob's F5 half is in. Check the host against SYSTEM-FACTS first, printing the host only, and use `B-` test data. ⛔ Never start backoffice-back locally: its `.env` is **UAT** (.29) until the owner repoints it.

From Silver 2026-11-08: ✅ backoffice-back's `.env` is now sid (.206), checked twice. TASK-862 still runs on fixtures and needs no BB. If you start BB locally later, check the host first (printing the host only) and use `B-` data.

From Silver 2026-11-08: TASK-861 FE ✅ accepted on code. I re-ran tsc 0 and 1407/0; the review is in the TASK file. Your seam files outside §3 and the two pin edits are accepted.
- **Ruling:** keep the other tabs hidden on the system column.
- **`next lint`:** it's pre-existing and not yours; I'm passing it to Porter.
- **The local check:** do it when I tell you Bob's half is in (local SB, host check = sid, `B-` data).
- **Start TASK-862 now:** Fern's TASK-857 is DONE on the board. Re-read workspace CLAUDE.md rule 2: no questions or option boxes to the owner; questions come to me in a file.

From Silver 2026-11-08: queued after TASK-862: `tasks/TASK-869-salary-people-settings-wiring-bf-fe.md`, which wires People / Person / Settings to SPEC-100 §5's profile routes. It starts only when 862 is accepted AND Jason's TASK-865 routes are DONE. Carry on with 862.

From Silver 2026-11-08: HIGH, customer defect. `tasks/TASK-870-voucher-reserved-hours-gate-be-fe.md`, your FE half (≈ 0.5 d): the voucher picker gates on `hoursAvailable`, and the attend action shows `voucherWarning`. Do it after TASK-861's live check; pause TASK-862 for it, then resume.

From Silver 2026-11-08: TASK-870 ruling in. An empty-voucher check-in is now **REFUSED** (409 `VOUCHER_EXHAUSTED`) by default.
- Admin attend: show the server's sentence in the existing error toast; the row stays un-attended. Keep the `voucherWarning` notice as well.
- Parent LIFF check-in: no code change. Read what that page shows for a 409 that carries a message, and report it. If it shows a generic error or nothing, stop and tell me.
- The live check now expects a refusal on attend. See the TASK file's § Fanta.

From Silver 2026-11-08: TASK-862 has a new section, § "REQ-5010 folds": 5 small wording/layout changes the owner ruled free.
- They are: Add · Motorcycle (label only) · ฟูลไทม์ · Add school in the school box · OT Hour · Employee / Daily spacing.
- They're approved words and override "keep every word exactly", for those items only.
- Don't build the Edit buttons on the rate boxes (parked).
- Order is unchanged: TASK-870 FE comes first, then 862.
