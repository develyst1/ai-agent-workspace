# TASK-820 — FE: **the calendar leave strip opens the leave: its days, its affected classes (child · program · open), and Cancel leave** (P3 + P4) (REQ-123 Phase 1) — @Fern (M ≈ 1.75 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

**Needs TASK-819** (the class detail) and builds on **TASK-814** (the approved Cancel leave button + confirm, which first ship on the chip tonight).
## Build
- Each "{name} is away" chip in `Calendar/LeaveDayBanner.tsx` becomes **clickable** and opens a **leave panel** (drawer or modal) showing:
  - the leave's days (the whole range, if any);
  - per day, the affected classes with **child · program · time · status**, each with **"Open"**, which opens the existing booking modal (`Calendar/Modal/BookingModal.tsx`). There the admin moves / changes teacher / cancels as today;
  - **Cancel leave** (future days only, 814's approved copy). For a range: per day and "cancel all future days".
- Update the banner's header comment: it IS now a control, for the leave, by the owner's 10-17 approval. **The classes are still handled in the booking modal**, never bulk-changed from here.
- The panel is mounted **inside our own files** (`LeaveDayBanner.tsx` or a new `Calendar/LeaveDayPanel.tsx`), so `CalendarContent.tsx` is not touched.
## Claim
front `Calendar/LeaveDayBanner.tsx` (**pending Porter**: unclaimed since TASK-589) · new `Calendar/LeaveDayPanel.tsx` · `hooks/scheduler/useScheduler.ts` · `services/scheduler.service.ts` · `types/api/contract.ts` · `lib/i18n/dictionaries.ts` (DRAFT keys) · tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.
