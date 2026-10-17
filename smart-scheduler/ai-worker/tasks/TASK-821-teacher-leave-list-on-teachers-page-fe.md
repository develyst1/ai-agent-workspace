# TASK-821 — FE: **a "Teacher leave" list (upcoming + past, per teacher, with Cancel for future days)** (P5) (REQ-123 Phase 1) — @Fern (M ≈ 1.1 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

**Needs TASK-819** (the list read with `teacherId`, past window, `rangeId`, `menu:teachers`).
## Build
- **On the Teachers page** (`partials/Teachers/*`, Team A): a **"Teacher leave"** tab or section listing leave by teacher:
  - upcoming first, then past (a date window control);
  - each with its days, affected-class count, reason;
  - **Cancel** on future days (814's approved copy);
  - clicking a leave opens TASK-820's panel.
- **From the calendar:** TASK-820's panel has a **"See all teacher leave →"** link to this list. So no calendar header or nav change is needed for P5.
- **No new route, no new menu entry:** it lives in the Teachers page.
## Claim
front `src/components/partials/Teachers/*` (a new `TeacherLeaveList.tsx` + its mount in `TeachersContent.tsx`) · `hooks/scheduler/useScheduler.ts` · `services/scheduler.service.ts` · `lib/i18n/dictionaries.ts` (DRAFT keys) · tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.
