# TASK-124: scheduler-front (FE) — student search on the timetable/calendar page (REQ-038 #3)

- Source: REQ-038 #3 ("Search Bar หน้าตาราง") — Tanya's sid verify found it genuinely unbuilt (DEF-2); Porter folded
  it into the essential set. NOT the same as REQ-011 (that's the student picker inside the New Booking modal).
- Status: DONE ✅ (SA-reviewed 2026-08-10 — tsc 0 reproduced; `byStudent(byBadge(...))` composed into both memos w/ correct deps, header TextInput + clear + i18n EN+TH, `Search` icon imported. **#3 build-complete → essential set 1–5 build-complete.** Live 4-width pixel measure routed to @Tanya's acceptance pass — code degrades by wrapping, not clipping.)
- Depends on: — (client-side filter over already-loaded calendar bookings; no BE, no endpoint, no migration)
- Assignee: @Fern (smart-scheduler-front)

## What to build
A **student search on `/scheduler/calendar`** that filters the visible schedule to a chosen student's sessions,
alongside the existing Teacher / Type / Badge filters. Same shape as the badge filter that already exists — a
**client-side predicate over the loaded bookings**, no server round-trip.

### The two edits (mirrors the badge-filter pattern already in place)
1. **`CalendarContent.tsx`** — add `const [studentQuery, setStudentQuery] = useState("")`. Compose a `byStudent`
   filter into the existing `dayBookings` / `weekBookings` memos (add `studentQuery` to their deps), next to `byBadge`:
   ```
   const byStudent = (list: Booking[]) => {
     const q = studentQuery.trim().toLowerCase();
     return q ? list.filter((b) => b.studentName.toLowerCase().includes(q)) : list;
   };
   ```
   Compose as `byStudent(byBadge(...))`. `Booking.studentName` already exists (types :118). Leave the teacher columns
   as-is — the matching student's sessions simply appear under their teachers; empty columns are the expected "here's
   where this student is" view. (If a match-only column collapse reads better at a glance, that's a follow-up — don't
   scope-creep here.)
2. **`CalendarHeader.tsx`** — add `studentQuery` + `onChangeStudentQuery` props; render a `TextInput` (clearable,
   `UserSearch`/`Search` left icon, `calendar.studentSearch` label + placeholder) in the existing filter row
   (`teachers.length > 0` block), beside the three MultiSelects.

- New i18n `calendar.studentSearch` (+ placeholder) EN+TH.
- Case-insensitive substring on `studentName`. (Nickname isn't on `Booking` today — name is enough; don't add a BE
  field for it.)

## Definition of Done
- [x] On `/scheduler/calendar`, typing a student's name filters the day AND week grids to that student's sessions;
      clearing restores all. Works with the Teacher/Type/Badge filters active (composes, doesn't replace).
- [x] No BE/API/migration change — pure client-side filter over the loaded calendar.
- [x] `bunx tsc --noEmit` clean; build ok. **Measure the filter row at 1600/1280/768/375** → routed to QA (below).

## Implementation Notes (@Fern)
Built to the spec's two edits exactly.
- **`CalendarContent.tsx`** — `const [studentQuery, setStudentQuery] = useState("")`. New `byStudent(list)` =
  case-insensitive substring on `b.studentName` (empty query → pass-through), composed **inside** the existing memos as
  `byStudent(byBadge(...))` for both `dayBookings` and `weekBookings`; `studentQuery` added to both dep arrays. Passed
  `studentQuery`/`onChangeStudentQuery` to the header. Teacher columns left as-is (a matched student's sessions appear
  under their teachers; empty columns are the intended "where is this student" view — no match-only collapse,
  per the task's no-scope-creep note).
- **`CalendarHeader.tsx`** — new optional `studentQuery`/`onChangeStudentQuery` props; a `TextInput` (Search icon,
  `CloseButton` right-section shown only when non-empty → one-click clear) placed **first** in the existing
  `teachers.length > 0` filter row. `calendar.studentSearch` + `calendar.studentSearchPlaceholder` i18n EN+TH.
- **STANDING RULE:** the row is `flex flex-wrap items-end gap-3`; each control carries a `min-w-*` + `basis-0 grow`.
  Adding a 4th control (TextInput `min-w-52 basis-0 grow-[3]`) keeps the **same proven pattern** — at wide widths the
  four share the row via `grow`; when the sum of `min-w` exceeds the container (≤~768) `flex-wrap` drops controls to the
  next line rather than overflowing. No new fixed-width or table control. **Live 4-width pixel measurement (1600/1280/
  768/375) → @Tanya** — the page is NextAuth-gated (same routing used for TASK-099's width pass); I can't drive the
  authenticated calendar here. Structurally it degrades by wrapping, not clipping.
- Verified: `bunx tsc --noEmit` → 0; `bun run build` → ok (`/scheduler/calendar` generated).

## Questions / flags
- None. Pure client-side, matches the badge-filter pattern the task pointed to.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-124 | scheduler-front (FE): **student search on `/scheduler/calendar`** (REQ-038 #3) — client-side `byStudent` filter on `studentName` beside Teacher/Type/Badge; day+week grids; no BE/endpoint/migration | REQ-038 #3 | ✅ **DONE** (SA-reviewed 2026-08-10 — tsc 0 reproduced; `byStudent(byBadge(...))` both memos, header TextInput+clear+i18n EN+TH, Search imported. **#3 build-complete → essential set 1–5 build-complete.** 4-width pixel measure → @Tanya (wraps not clips). Needs `sid` deploy.) · (Fern 2026-08-04 — tsc 0 · build ok. Two-edit spec exactly: `CalendarContent` `byStudent(byBadge(...))` case-insensitive substring on `studentName`, composed into both day+week memos (+dep); `CalendarHeader` gets a clearable `TextInput` (Search icon + CloseButton) first in the existing flex-wrap filter row. `calendar.studentSearch`(+placeholder) i18n EN+TH. STANDING RULE: same `flex-wrap`+`min-w`+`basis-0 grow` pattern as the 3 existing controls → wraps, never clips; **live 4-width measure → @Tanya** (auth-gated, per 099 precedent). **Last essential-set build.**) | Fern | — |
```
