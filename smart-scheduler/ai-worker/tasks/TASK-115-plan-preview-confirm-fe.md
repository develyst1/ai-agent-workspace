# TASK-115: scheduler-front (FE) — disable Insert when not insertable + plan-diff confirm (OBS-3 = A)
- Source: SPEC-028 §12 (REQ-030, owner ruling 2026-08-04)
- Status: **DONE (SA-reviewed Sober 2026-08-04; top label flipped 2026-08-22).** The `## Review` verdict below was
  written 2026-08-04 — only this status line lagged. Re-confirmed 2026-08-22: front `tsc` 0 and the feature
  (`previewPlanChange` / `PlanDiffConfirm`) is still present in the tree.
- Depends on: TASK-114 (`insertable` flag + `/plan/preview`), TASK-099 (the plan modal)
- Assignee: @Fern (smart-scheduler-front)

## What to build
1. **Disable the Insert action when `!plan.insertable`** (from the DTO), with the reason "no session to reschedule".
   Do **not** gate on `owedCount == 0` (that would block the valid post-absence insert).
2. **Plan-diff confirm** — on Insert / mark-absence / move, call **`POST /courses/:id/plan/preview`** first and show
   the resulting **plan diff** in the confirm ("session on the 14th moves to week 5; inserting the 15th removes the
   appended make-up; your plan becomes wk1·wk2·wk3·15·wk5"), then on confirm call the real `/plan`. Owner's ask:
   *"บอกว่าแผนจะเป็นแบบนี้นะ"* — a preview, not a silent apply.
   - Show the preview's `resultingSessions` + new `liveEndDate`, and which sessions move/cancel/append.
   - If the preview returns a refusal reason, show it (don't offer confirm).
3. **OBS-4 tidy (fold in):** render session times as `HH:mm`, not raw `13:00:00`.

## Definition of Done
- [ ] Insert is disabled (with reason) only when `!insertable`; the post-absence insert stays enabled.
- [ ] A plan change shows the diff (moves/cancels/appends + new end date) before commit; confirm applies it.
- [ ] A would-be-refused change shows the reason and no confirm.
- [ ] Times render `HH:mm`. tsc clean; build ok; measure new shared-row controls at 1600/1280/768/375.

## Implementation Notes — DONE → REVIEW (Fern 2026-08-04)
Repo: `smart-scheduler-front`. Built on TASK-114's DONE `insertable` + `/plan/preview`.
1. **Insert disabled when `!plan.insertable`** (from the DTO) with a tooltip reason "no session to reschedule". NOT
   gated on `owedCount==0` (that would block the valid post-absence insert). Voucher/create → `insertable` undefined →
   allowed (their surfaces don't show Insert anyway).
2. **Plan-diff confirm** — every course **move / insert / mark-absence** now dry-runs first:
   `previewPlanChange` (`POST /courses/:id/plan/preview`) → a **`PlanDiffConfirm`** panel shows the **resulting plan**
   (`resultingSessions` as a mini-table), the **new `liveEndDate`**, and **{appended} added · {cancelled} removed** →
   only on **"ใช้แผนนี้"** does the real `/plan` apply. A would-be-refused change surfaces the **same typed reason**
   (the preview throws it) and offers **no confirm**. (`services`: `previewPlanChange` + `usePreviewPlanChange`; the
   apply/preview both live in `PlanModal` now — `SessionEditor` became a form that routes course changes via
   `onPreviewApply`, voucher move stays direct, create stays local.)
3. **OBS-4** — session times render `HH:mm` (`.slice(0,5)`) in the plan table AND the diff table.
- Verified: `bunx tsc --noEmit` 0 · `bun run build` 0. ⚠️ Live render sid-gated; the diff panel + editor rows are
  reflow-safe (`Table.ScrollContainer`, `Group wrap`). **@Sober: ready for review.**

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (code-verified, tsc 0 run by me).
- **`insertable` disable done right** — `insertable = plan?.insertable !== false` (`:123`): undefined (voucher/create)
  → allow, **explicit `false` → disable** the Insert button + a "no session to reschedule" tooltip. So Insert is
  blocked ONLY on a genuinely-full course, never at every `owedCount==0` — REQ-030's post-absence insert stays
  enabled. Exactly OBS-3=(A).
- **Plan-diff preview before commit** — `previewPlanChange` → `POST /courses/:id/plan/preview`; the confirm renders
  the diff (moves: N appended / N cancelled · the resulting sessions · the derived end date), then commits the real
  `/plan`. The FE never re-derives — it shows the BE dry-run's result (preview == apply). Voucher move stays direct;
  create stays local (both correct — no course reconcile).
- **OBS-4** folded: `startTime.slice(0,5)` → `HH:mm` in both the plan table and the diff table (no raw `13:00:00`).
- **DONE — OBS-3=(A) complete (BE+FE). This is the last build item.**
