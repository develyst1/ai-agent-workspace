# TASK-004: scheduler-front — baht remaining/budget display, near-cap warning, real-time hide
- Source: SPEC-001
- Status: DONE
- Depends on: TASK-008 (DONE)
- Assignee: @Fern (smart-scheduler-front, port 3000)

## What to do
Update the staff UI for the baht budget model. The auto-hide is **already wired**
(`toTeacherView → bookable=false` on `overLimit`) — do NOT rebuild it; adjust
display + warning + override persistence. Files: `src/components/partials/Teachers/`
(`FreelanceRow`), `src/lib/scheduler/teacher.ts`, `src/services/scheduler.service.ts`,
`src/lib/api/teacher-order-store.ts`.

1. **Display**: change the freelance row from hours ("เหลือโควตา n ชม.") to baht
   **`remaining / budget`** with a progress bar. Source the values from the teacher
   DTO's ops-derived fields (`quotaRemaining` now = remaining satang; budget =
   the item's `monthlyBudgetMinor`, surfaced via the DTO — coordinate with TASK-001/002
   so scheduling exposes `budgetMinor` alongside `quotaRemaining`).
2. **Near-cap warning**: tint/flag the row when remaining ≤ warning threshold
   (surface `reorderLevel` on the DTO). Keep the red "overCap" badge at ≤ 0.
3. **Override persistence**: the current `limitOverride` is localStorage-only
   (`setTeacherLimitOverride` writes local). Persist it server-side so the booking
   path (TASK-002) can read it as `allowNegative`. Coordinate the endpoint with
   @Jason (a small scheduling PATCH, e.g. `/teachers/:id/limit-override`).
4. **Cache freshness**: after a booking/cancel, invalidate the teachers/quota query
   so the column auto-hide reflects the new remaining promptly (the 5-min ops
   quota cache in scheduling otherwise lags — see SPEC-001 Non-functional).

## Definition of Done
- [ ] Freelance rows show baht `remaining/budget` + progress; near-cap warning
      appears before 0; overCap badge at 0.
- [ ] A capped freelance disappears from booking columns; enabling override makes
      them bookable and persists across reload/devices.
- [ ] After booking a freelance, their remaining updates without a manual refresh.
- [ ] Repo build/lint clean.

## Implementation Notes
Repo: `smart-scheduler-front` (Next 16 + Mantine v9 + Tailwind v3, bun). Built against
Jason's TASK-008 contract (confirmed the exact field **units** by reading his backend
`ops-client.ts`/`mappers.ts`: `hourlyRate`=**baht**, `remainingMinor`/`budgetMinor`/`reorderMinor`=**satang**,
`overLimit`=`remainingMinor≤0`, `limitOverride` on the DTO).

**Files changed**
- `src/types/api/contract.ts` — synced `TeacherDTO` to the new backend contract: replaced
  `quotaRemaining` with `remainingMinor` (satang) + added `budgetMinor`, `reorderMinor`, `limitOverride`.
- `src/types/app/scheduler/index.ts` — `Teacher`: same field swap (satang budget fields).
- `src/lib/api/mappers.ts` — `dtoToTeacher` maps the new fields; **`limitOverride` now sourced from
  the DTO** (server-persisted) instead of the old localStorage param.
- `src/services/scheduler.service.ts` — `teachersToViews`/`parseCalendarTeachers` no longer read the
  localStorage override (it's on the DTO now). **`setTeacherLimitOverride` now calls
  `PATCH /teachers/:id/limit-override {override}`** (was localStorage-only); the `useSetLimitOverride`
  hook already invalidates `TEACHERS_KEY`, so the refetched DTO reflects it.
- `src/lib/api/teacher-order-store.ts` — removed the now-orphaned `readLimitOverrides`/`writeLimitOverride`
  + `OVERRIDE_KEY` (override is server-side; type-order localStorage untouched).
- `src/components/partials/Teachers/TeachersContent.tsx` (`FreelanceRow`) — display now shows baht
  **`฿remaining / ฿budget`** + a `Progress` bar (value = `remaining/budget`), near-cap **warning tint**
  when `remainingMinor ≤ reorderMinor`, red **over-budget** state at `≤ 0`. Replaced the hardcoded
  Thai `เหลือโควต้า n ชม.` (also fixes a pre-existing no-hardcoded-copy violation) with i18n.
  **Override switch now shows whenever the teacher is raw-over-budget** (`remainingMinor≤0`), so it stays
  visible/toggleable even while override is ON (the old code hid it once effective-overLimit flipped false).
- `src/lib/i18n/dictionaries.ts` — added `teachers.budgetRemaining` (en/th); reworded `overCap` to
  "over budget".
- `src/lib/mock/data.ts` — updated the two FREELANCE mock teachers to the new satang fields (so mock
  mode + typecheck stay consistent).

**Auto-hide (already wired) — NOT rebuilt.** `toTeacherView` still computes
`overLimit = FREELANCE && dto.overLimit && !limitOverride` → `bookable=false`; the calendar drop + the
disabled active-switch (`overLimit && !limitOverride`) are unchanged, exactly as the task instructed.

**Cache freshness (DoD #3) — already satisfied.** `invalidateAll` (used by confirm/sick-leave/attend/
create/move mutations) already invalidates `TEACHERS_KEY`, so a freelance's remaining refreshes after a
booking without a manual reload. No change needed. (The SPEC's 5-min *server* quota cache is backend-side,
out of FE scope.)

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0** (clean) — this is the real check that the DTO rename propagated
  correctly across mappers/service/component/mock.
- `bun run build` → **exit 0**; `/scheduler/teachers` prerendered. (Next 16 runs TS inside build.)
- No unit-test suite in this repo (`package.json` has only dev/build/start/lint); `lint` is the same
  repo-wide-broken `next lint` (Next 16) already logged for maintenance — `build` is the authoritative gate.
- **Render smoke-test blocked (not by my code):** the app is NextAuth-gated and `/scheduler/teachers`
  redirects to the **production** login (`frontoffice.develyst.online`), and the configured API is the
  **live frontoffice env** — both barred by the brownfield rule / "no real-environment login". I did NOT
  authenticate. So the visual render + the PATCH round-trip were **verified by inspection + typecheck only**,
  not executed live — same posture Jason/Sober accepted on TASK-001/002/008 DB-runtime items. Display logic
  is pure and fully type-checked against the frozen contract; mock data was updated but the mock page is
  behind the same auth redirect.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **Heads-up (non-blocking): I built against TASK-008 while it is still in REVIEW** (not yet DONE). I did
  so because you'd already frozen the FE contract in your [20:00] entry and Jason delivered exactly those
  field names/endpoint — so the review risk to my FE code is low. **If your TASK-008 review changes any
  DTO field name or the override endpoint, ping me and I'll adjust** (small rename). Recommend reviewing
  TASK-008 before TASK-004.
  > answer (Sober): **Reviewed TASK-008 first — it's DONE with the exact contract you built against**
  > (`budgetMinor`/`remainingMinor`/`reorderMinor`/`overLimit`/`limitOverride`, override via
  > `PATCH /teachers/:id/limit-override`). No field-name changes → **no adjustment needed on your side.**
  > Building against the frozen [20:00] contract while 008 was in REVIEW was a reasonable parallelization.
- **Minor UX decision (flag if you disagree):** I made the override switch visible whenever a freelance is
  **raw over budget** (`remainingMinor≤0`), not only when *effective* `overLimit` is true — otherwise the
  switch vanished the moment override was enabled, leaving no way to turn it back off. This makes the
  persisted override visible + reversible across reloads (DoD #2).
  > answer (Sober): **Correct call — keep it.** An override you can't turn off is a trap; binding switch
  > visibility to the raw `remainingMinor≤0` (not effective `overLimit`) is exactly right for a
  > reversible, persisted toggle. Good catch on the old hide-on-enable bug.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `smart-scheduler-front`: `bunx tsc --noEmit` → exit 0
(the meaningful gate — it proves the `quotaRemaining`→`remainingMinor` (satang) rename propagated across
contract/mappers/service/component/mock). Verified `FreelanceRow`: baht `฿remaining / ฿budget` + progress,
near-cap tint at `remainingMinor ≤ reorderMinor`, over-budget at `≤0`; auto-hide untouched
(`toTeacherView` unchanged); `setTeacherLimitOverride` now PATCHes the server (localStorage override
removed); cache invalidation via existing `invalidateAll` (DoD #3 already satisfied). Live render/PATCH
round-trip is behind the production NextAuth login — correctly **not** exercised (brownfield / no
real-env login); display logic is pure and fully typechecked against the now-DONE TASK-008 contract.
Accepted on the same basis as prior DB/env-runtime items. No rework.

Repo `lint` is the pre-existing broken `next lint` (Next 16) — logged for Porter, not a task defect.
