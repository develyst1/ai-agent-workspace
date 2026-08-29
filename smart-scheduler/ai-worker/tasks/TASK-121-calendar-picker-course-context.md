# TASK-121: scheduler-front (FE) — course context in the calendar eligible-student picker label

- Source: REQ-038 #2 (owner: calendar insert, mode=course+student, student with >1 active course)
- Status: DONE ✅ (SA-reviewed 2026-08-04 — tsc 0 reproduced; `value=entKey` untouched, voucher unchanged, label narrows via `"courseId" in context`)
- Depends on: — (backend already returns one entry per course; no API change)
- Assignee: @Fern (smart-scheduler-front)

## The gap (SA-verified in code)
The backend `getEligibleStudents` COURSE_PACKAGE branch already returns **one eligible entry per course**, each with
`context = { courseId, subject, size, usedSessions, remainingSessions, leaveUsed, leaveQuota, expiryDate }`, keyed by
`entKey(e) = context.courseId`. So a 2-course student = 2 distinct, valid entries — the draw target is unambiguous
**after** a pick.

BUT the calendar picker renders **name only**:
`BookingModal.tsx:780` → `data={eligible.map(e => ({ value: entKey(e), label: e.nickname || e.name }))}`.
Two courses for one student → **two identical rows** in the dropdown; the course context only appears in the
`ContextCard` (BookingModal.tsx:808-819) **after** selecting — staff pick blind. That's the owner's "หากมีสองอันล่ะ".

## What to build
Make the two rows distinguishable **in the dropdown itself** for **course** entries (voucher entries unchanged —
a voucher is per-student, name-only is fine):
- Simplest: enrich the label for course entries, e.g. `${nickname||name} · ${subject} (${used}/${size})`.
- Nicer (optional): a Mantine `renderOption` two-liner (name on top, a dimmed `subject · used/size · expiry` line
  below) — mirror the existing `TeacherOption` renderOption pattern already in this file.
- **Keep `value = entKey(e)` (courseId)** — selection, `selectedEligible`, and the payload stay unchanged.

## Definition of Done
- [ ] In the calendar insert flow (mode=course), a student with 2+ active courses shows **distinguishable rows**
      (course subject + used/size) in the eligible-student dropdown — pickable without guessing.
- [ ] Voucher entries unchanged; `value` still the entitlement key (no payload/API change).
- [x] `bunx tsc --noEmit` clean; build ok. Measure the picker/option at 1600/1280/768/375 (board STANDING RULE).

## Implementation Notes (@Fern)
- Chose the **simplest** enrichment (task option 1), not `renderOption` — a `Select` label is a plain string, so it
  never introduces a new shared-row control to measure (the STANDING RULE width concern doesn't arise; the option row
  just holds more text and wraps inside Mantine's own dropdown).
- `BookingModal.tsx:590` new helper `eligibleLabel(e)`: for a **course** entry (`isCourse && "courseId" in e.context`)
  → `${nickname||name}${subject ? " · "+subject : ""} (${usedSessions}/${size})`; **voucher/other** entries fall
  through to `nickname||name` unchanged.
- `:791` the eligible `<Select>` `data=` map now uses `label: eligibleLabel(e)`; **`value: entKey(e)` is untouched**
  (courseId for a course, voucherId for a voucher) — selection, `selectedEligible`, and the insert payload are all
  identical to before. No API/contract change.
- Verified: `bunx tsc --noEmit` → 0; `bun run build` → ok.

## Questions / flags
- None. Pure label-display change, value/payload unchanged as the task pinned.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-121 | scheduler-front (FE): course context in the calendar eligible-student picker label (REQ-038 #2) | SPEC-035 | ✅ **DONE** (SA-reviewed 2026-08-04 — tsc 0 reproduced; `value=entKey` untouched, voucher unchanged) · (Fern 2026-08-04 — tsc 0 · build ok. `BookingModal.tsx:590` new `eligibleLabel(e)`: course entries → `${nickname||name} · ${subject} (${used}/${size})`, voucher/other unchanged; `:791` Select `data=` uses it. **`value=entKey(e)` untouched** — selection/payload identical, no API change. Plain string label, no new shared-row control → STANDING RULE n/a) | Fern | — |
```
