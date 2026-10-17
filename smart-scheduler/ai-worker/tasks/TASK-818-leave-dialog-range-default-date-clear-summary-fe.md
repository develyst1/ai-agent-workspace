# TASK-818 — FE: **the leave dialog: a date range, a sensible default date, and a clear "what this will do" before saving** (P2 + P6 + P7) (REQ-123 Phase 1) — @Fern (M ≈ 1.5 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

One file family, `Calendar/Modal/ReportLeaveDialog.tsx`, so these three ship as one task. **Needs TASK-817** for the range body.
## Build
- **P2:** the admin door gets **From–To** (one reason). The result shows per day: its classes, new or already recorded.
- **P6:**
  - from the Teachers ⋮ menu the date starts **empty**;
  - from the calendar it starts at **the day being viewed**;
  - **never "tomorrow" by default.**
  - The calendar entry: a **"Record teacher leave"** button in `Calendar/CalendarHeader.tsx` (admin, `action:calendar.status`) that opens this dialog with the header's `date`. ⚠️ **That file needs Porter's claim** (see the claims list).
- **P7:** before saving, the dialog states plainly what will happen:
  - **future** → "only blocks the day(s); N class(es) stay for you to handle";
  - **today (teacher's own door)** → "cancels N class(es) and tells N famil(ies)".
  - The counts come from what the dialog already holds (the session list / ticks). No new BE call unless one is truly needed; tell me first.
## Claim
front `Calendar/Modal/ReportLeaveDialog.tsx` · `Teachers/TeacherRowActions.tsx` (default date) · `Calendar/CalendarHeader.tsx` (one button, **pending Porter**) · `hooks/scheduler/useScheduler.ts` + `services/scheduler.service.ts` (the range body) · `types/api/contract.ts` · `lib/i18n/dictionaries.ts` (DRAFT keys) · tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.
