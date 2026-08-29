# TASK-017: scheduler-front — teacher add/edit/change-type/archive UI + setup-incomplete gate
- Source: SPEC-004
- Status: DONE
- Depends on: TASK-016 (DONE)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Add teacher lifecycle UI to the Teachers screen + wire the money-setup gate. Files:
`src/components/partials/Teachers/TeachersContent.tsx`, `src/lib/scheduler/teacher.ts`,
`src/types/app/scheduler/index.ts`, `src/types/api/contract.ts`, `src/lib/api/mappers.ts`,
`src/services/scheduler.service.ts`, `src/hooks/scheduler/useScheduler.ts`.

1. **`setupIncomplete` gate (do this first — small + high value):** add `setupIncomplete` to
   `Teacher` + `TeacherDTO` + `dtoToTeacher`; fold into `toTeacherView`:
   `bookable = active && !overLimit && !setupIncomplete`. This single change auto-suppresses the teacher
   from calendar columns / booking modal / course modal. Render a badge ("ตั้งเงินก่อนจึงจะจองได้") +
   disable the active switch on such rows (mirror the existing `overLimit` badge pattern).
2. **Service + hooks** (mirror the existing mutation pattern → invalidate `TEACHERS_KEY` + `CALENDAR_KEY`):
   `createTeacher`, `updateTeacher`, `archiveTeacher`, `reactivateTeacher`, and a `getTeachers({archived})`
   variant. Add matching `useMutation` hooks.
3. **Add teacher**: a header "เพิ่มครู" button → modal (name, nickname, type Select, work-days, subjects).
   On success the new teacher appears flagged `setupIncomplete` (not bookable until money set in backoffice).
4. **Per-row actions** (kebab menu in the row's right cluster): **Edit** (name/nickname/subjects),
   **Change type** (Select of the 3 types — warn "เปลี่ยนประเภท = สลับโหมดการจ่ายเงิน มีผลเดือนนี้เป็นต้นไป"),
   **Archive/Offboard** (confirm dialog; on the **409 "has future bookings"** show the clear
   "เคลียร์/ย้ายคาบก่อน" warning — do not archive).
5. **Archived list**: a section/tab below the type cards listing archived teachers with a **Re-activate** button.

## Definition of Done
- [ ] A `setupIncomplete` teacher shows the badge, is not bookable (absent from calendar columns + booking/
      course teacher dropdowns), still appears on the Teachers management screen for editing.
- [ ] Add teacher works; edit name/subjects works; change type re-groups the row + shows the money-switch warning.
- [ ] Archiving a teacher with future bookings shows the block warning; with none, moves them to the
      Archived list (gone from active roster + calendar); Re-activate restores them.
- [ ] `bunx tsc --noEmit` + `bun run build` clean.

## Implementation Notes
Repo: `smart-scheduler-front` (port 3016). Built against TASK-016's DONE contract (`setupIncomplete`
+ `archived` on the DTO; `POST /teachers`, `PATCH /teachers/:id`, `POST /teachers/:id/{archive,reactivate}`,
`GET /teachers?archived=true`; 409 `HAS_FUTURE_BOOKINGS`, 502 `OPS_SYNC_FAILED`).

**Foundational (the gate — done first)**
- `types/api/contract.ts` (`TeacherDTO`) + `types/app/scheduler/index.ts` (`Teacher`): added `setupIncomplete`
  + `archived`. `lib/api/mappers.ts` maps them. **`lib/scheduler/teacher.ts` (`toTeacherView`):
  `bookable = active && !overLimit && !setupIncomplete`** — the single choke point, so a not-set-up teacher
  auto-drops from calendar columns + booking/course modals with no per-consumer change.

**Service / hooks / mock**
- `services/scheduler.service.ts`: `createTeacher`, `updateTeacher`, `archiveTeacher`, `reactivateTeacher`,
  `getArchivedTeachers` (+`CreateTeacherInput`/`UpdateTeacherInput`).
- `hooks/scheduler/useScheduler.ts`: `useCreateTeacher/useUpdateTeacher/useArchiveTeacher/useReactivateTeacher`
  (all invalidate `TEACHERS_KEY`+`CALENDAR_KEY`+`ARCHIVED_TEACHERS_KEY`) + `useArchivedTeachers`.
- `services/scheduler.mock.service.ts`: matching in-memory stubs (create/update/archive/reactivate/archived);
  `getTeachers` now excludes archived (mirrors real).
- `lib/scheduler/teacher-errors.ts` (new): `syncErrorMessage` maps `HAS_FUTURE_BOOKINGS`→"clear bookings first",
  `OPS_SYNC_FAILED`→"backoffice sync failed, retry".

**UI (`components/partials/Teachers/`)**
- `TeachersContent.tsx`: header **"เพิ่มครู"** button; every row now shows a **`setupIncomplete` badge**
  ("ตั้งเงินก่อนจึงจะจองได้") + a **disabled active switch** when incomplete (mirrors the `overLimit` badge
  pattern); each row has a **kebab** (`TeacherRowActions`) + an **`ArchivedTeachers`** section at the bottom.
- `TeacherFormModal.tsx` (new): add (name/nickname/type/work-days/subjects) + edit (name/nickname/subjects).
- `TeacherRowActions.tsx` (new): kebab → **Edit** (opens the form), **Change type** (Select + "switches pay
  model, effective this month" warning → `PATCH {type}`), **Archive** (confirm; on 409 keeps the dialog open
  and shows the "clear/reassign bookings first" message).
- `ArchivedTeachers.tsx` (new): archived list + per-row **Re-activate**.
- i18n: added `teachers.*` keys (en + th) — no hardcoded copy.

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0**; `bun run build` → **exit 0**, `/scheduler/teachers` prerendered (SSG
  executes the new component tree → no render crash). `bookable` change only *adds* the setupIncomplete
  suppression; existing teachers default `setupIncomplete=false` → no regression.
- ⚠️ **Live render not driven** — `/scheduler/teachers` is NextAuth-gated (redirects to the **production**
  login) and the API is the live frontoffice env; both barred (brownfield / no real-env login). I did NOT
  authenticate. Same accepted posture as TASK-004. Verified by inspection + typecheck + build; modals/mutations
  reuse the proven existing patterns and TASK-016's DONE contract.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **No subjects catalog on the FE.** TASK-017 asks the Add/Edit modal to set subjects, but scheduler-front has
  **no subjects-list endpoint/hook** — subjects only ride on each teacher's `subjectOptions`. So I built the
  subjects `MultiSelect` from the **union of subjects already assigned across the roster** (dedup by id). This
  satisfies "edit subjects" for existing subjects, but a **brand-new subject can't be created here** (a new
  teacher with a never-seen subject can't get it until a subjects-management surface exists). Options:
  **(a)** accept union-of-existing for launch (current); **(b)** cut a small task for a `GET /subjects` +
  subjects admin; **(c)** allow free-text create if `POST /teachers` can accept subject *names*. Which do you
  want? Non-blocking for the lifecycle core.
  > answer (Sober): **(a) union-of-existing for launch — keep it.** Subjects/programs are a fixed, seeded set
  > and adding a brand-new program is a rare, bigger event that's **out of REQ-003's scope** (teacher
  > lifecycle + sync). Not cutting a task now (no requirement). I'll **flag it to @Porter** as a known
  > limitation — if คุณฟีน needs to add brand-new programs via the UI, that's a future small REQ (`GET /subjects`
  > + a subjects-admin surface), not this one.
- **Built on TASK-016 (DONE) — no risk this time.** Also assumed the 502 `OPS_SYNC_FAILED` code from your
  TASK-016 Q&A (Jason's fast-follow); if the final code string differs I'll tweak `teacher-errors.ts`.
  > answer (Sober): The final code **is** `OPS_SYNC_FAILED` (Jason's fast-follow landed exactly that) — your
  > `teacher-errors.ts` mapping is correct, no tweak needed. Good that you built on the DONE contract this time.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `scheduler-front` `bunx tsc --noEmit` → exit 0 (build 0 per
notes). Verified the gate + contract:
- **`bookable = active && !overLimit && !setupIncomplete`** in `toTeacherView` — the single choke point, so a
  not-set-up teacher auto-drops from calendar columns + booking/course dropdowns with no per-consumer change
  (existing teachers default `setupIncomplete=false` → no regression). ✓
- `teacher-errors.ts` maps `HAS_FUTURE_BOOKINGS` → "clear bookings first" and `OPS_SYNC_FAILED` → "sync failed,
  retry" (matches Jason's exact codes). ✓
- Service/hooks/mock for create/update/archive/reactivate/archived (invalidate `TEACHERS_KEY`+`CALENDAR_KEY`+
  `ARCHIVED_TEACHERS_KEY`); UI = Add button + per-row kebab (Edit / Change-type w/ money-switch warning /
  Archive w/ 409 handling) + Archived list + Re-activate + `setupIncomplete` badge (mirrors `overLimit`). ✓
- Subjects: union-of-existing accepted for launch (see Q&A). Live render behind prod NextAuth — accepted under
  brownfield (same posture as TASK-004); logic reuses proven patterns + the DONE TASK-016 contract. No rework.
**REQ-003 is fully built (015/016/017/018).**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-017 | scheduler-front: teacher add/edit/change-type/archive UI + setup-incomplete gate | SPEC-004 | DONE | Fern | TASK-016 |
```
