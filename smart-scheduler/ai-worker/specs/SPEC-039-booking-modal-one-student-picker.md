# SPEC-039: Booking modal — one student-picker pattern across all four tabs
- Source: REQ-043 (unfinished half of REQ-029 item 3)
- Status: ACTIVE

## Overview
Purely a **frontoffice presentation** change in one file
(`smart-scheduler-front/src/components/partials/Calendar/Modal/BookingModal.tsx`, the `CreateForm`).
Today the "pick the student" job renders two different ways:
- **Trial / Single session** (`usesEligible === false`, ~L902-939): one `<StudentSelect>` — a single
  Mantine `Combobox` that fires a **server-side** search (`useStudentSearch`) as you type, lists
  results in the same field, and offers inline **add-new**.
- **Weekly course / Voucher** (`usesEligible === true`, ~L802-822): **two** stacked controls — a
  `<TextInput>` (server search → `eligibleSearch`/`useEligibleStudents`) **above** a non-searchable
  `<Select>` of eligible entitlements.

The two-box layout exists for real reasons (see REQ-043 Q2 answer), **but the app already owns the
unified pattern** — `StudentSelect`. The fix is to make the Course/Voucher picker one Combobox in the
same shape, firing the server search on type. **No backend change** — `useEligibleStudents(type,
enabled, q)` already accepts a server `q`.

## Why this is safe (the two constraints that shaped the old design, both preserved)
1. **Server-side search (must not regress REQ-024/TASK-088):** the search matches name · nickname ·
   **parent phone**; a phone isn't in the option label, so Mantine's local `searchable`/`filter`
   **cannot** match it. The unified Combobox therefore must drive the **server** query as you type
   (like `StudentSelect` does) — **not** switch the `Select` to client-side `searchable`. Wiring the
   Combobox's typed text (debounced) into `useEligibleStudents`'s `q` keeps parent-phone search working.
2. **Entitlement identity + distinguishable rows (must not regress REQ-029, AC-3):** the option value
   is the **entitlement key** (`entKey` = `courseId`/`voucherId`), not the student id, and a student
   with 2 courses is 2 rows. Keep `entKey` as the option `value` and `eligibleLabel(e)` as the label
   (it already appends subject · used/size · expiry for multi-course students — TASK-121/125). The
   selected value stays `entitlementId`; everything downstream of the picker is untouched.

## Interface / component design
- **Add a sibling component** `src/components/common/EligibleStudentSelect.tsx`, mirroring
  `StudentSelect`'s single-`Combobox` shape, but:
  - props: `{ type: "COURSE_PACKAGE" | "VOUCHER"; value: string | null; onChange: (entKey: string | null) => void; ... }`
    (value = the entitlement key; `label`/`required` like StudentSelect);
  - typing → debounced → `useEligibleStudents(type, enabled, q)` (server search — the parent-phone path);
  - options built from the eligible rows using the **existing** `entKey` + `eligibleLabel` logic
    (move/lift those two helpers so both the component and any context lookup share one definition —
    do not duplicate the label rules);
  - **no add-new option** (out of scope; a student with no entitlement can't be booked here anyway);
  - explicit states: loading, **no-match** (`booking.noMatchStudent`), and **nobody-eligible**
    (`booking.noCourseStudents` / `booking.noVoucherStudents`) — never a silently blank dropdown.
- **In `CreateForm`**, replace the `usesEligible` branch's `<TextInput>` + `<Select>` pair with the
  single `<EligibleStudentSelect type={isCourse ? "COURSE_PACKAGE" : "VOUCHER"} value={entitlementId}
  onChange={setEntitlementId} />`. Delete the now-orphaned `eligibleSearch`/`debouncedEligible` state
  **only** if nothing else reads them (grep first). Everything else in that branch — the voucher
  program `Select`, the `ContextCard`s, the teacher/time row, badges — stays exactly as is.
- **Do not touch** the Trial/Single branch beyond aligning the visible label/placeholder wording so
  the two read as the same control. `StudentSelect` already is the target pattern.
- "Same control" = same interaction/shape, **not** literally one component (one yields a person +
  add-new, the other an entitlement). If a shared Combobox shell falls out cleanly, extract it; do
  **not** force a premature abstraction to make them one instance.

## Data / API
None. No endpoint, hook-signature, payload, or DB change. `useEligibleStudents` already server-searches
via `q`; `useStudentSearch` unchanged.

## Wording (from REQ-043; add keys to `dictionaries.ts`, render via `t(...)` — never hardcode)
- Trial/Single placeholder — TH `พิมพ์ชื่อ ชื่อเล่น หรือเบอร์ผู้ปกครอง / เพิ่มนักเรียนใหม่` · EN
  `Search by name, nickname or parent phone / add new`.
- Course/Voucher placeholder — TH `พิมพ์ชื่อ ชื่อเล่น หรือเบอร์ผู้ปกครอง` · EN
  `Search by name, nickname or parent phone`.
- No match — TH `ไม่พบนักเรียนที่ตรงกัน` · EN `No matching student`.
- Nobody eligible — course TH `ยังไม่มีนักเรียนที่มีคอร์ส` / EN `No student has a course yet`;
  voucher TH `ยังไม่มีนักเรียนที่มีบัตร` / EN `No student has a voucher yet`.
  Reuse existing keys where they already carry this text; any *new* user-facing string beyond these
  goes back to Porter before shipping.

## Flow (unchanged behaviour, one control)
Open modal → tab → **type in the one student field** → (Trial/Single: pick existing or add-new;
Course/Voucher: server-filtered eligible entitlement rows, pick one) → the rest of the form
(voucher program / teacher / time / badges) is unchanged → Save writes the **same** payload as today.

## Non-functional
- FE-only; `bunx tsc --noEmit` = 0; `bun run build` ok; **FRONTEND-STANDARD.md** applies (no inline
  hex, no `transition-all`, one token source, instant focus ring, tabular-nums where relevant).
- Fern self-runs `hallmark audit` on the modal and pastes the verdict before REVIEW (§4).

## Tasks
- **TASK-131 (FE, Fern)** — the whole change above (new `EligibleStudentSelect`, swap the two-box
  branch for it, wording keys, remove orphaned state). One task; no dependency.

## Questions
(Fern asks here; Sober answers as `> answer: ...`.)
