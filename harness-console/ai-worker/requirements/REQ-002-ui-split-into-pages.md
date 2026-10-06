# REQ-002: Less on one screen — split the console into pages / menus
- Status: DRAFT — waiting on the owner's answer to Q-1 (asked 2026-10-06 03:25)
- Priority: HIGH (the owner's first item: *"อันดับแรก"*)
- Requested: 2026-10-06 by the owner
- Deadline: none

## Problem / Goal

REQ-001 (v1, two read-only screens) was delivered 2026-10-05. Using it, the owner
finds it shows far too much at once to be usable, and asks for the content to be
split across pages / menus and the UI made better.

Owner's words (2026-10-06, verbatim):
> อันดับแรก UI ขยะมาก ข้อมูล มากเกินไปรวดเดียวทำให้ คนใช้ ไม่ไหว แยกหน้า แยกเมนูได้มั้ย ทำ UI ให้ ok กว่านี้

**Restated in one sentence (Porter):** the console shows the same data as today,
but spread over separate pages / menu items so that no single screen dumps
everything at once.

Context (from REQ-001, not new facts): the overview shows 14 project cards; the
project page stacks three sections on one long page — `Gate` (e.g. 23 lines on
smart-scheduler), `File health` (14 rows) and `Ball` (148 rows on smart-scheduler).
REQ-001 §SPEC_DONE report already listed "layout and colour" as UNVERIFIED.

## Requirement — DRAFT, not ready for SA until Q-1 is answered

1. The data shown does not change — only how it is split across screens.
2. No single screen shows everything at once; the owner picks what to look at
   through pages / menu items.
3. *(shape of the split — depends on Q-1)*

## Proposal `[team-proposed]` — put to the owner as Q-1, NOT approved

- A side menu: `Workspace` (the overview) + one item per project.
- The project page split into three menu items / tabs, one shown at a time:
  `Gate` · `File health` · `Ball`.
- Overview cards unchanged.
- Every label above is already owner-approved wording (REQ-001 wording table) —
  this proposal adds no new visible text.

## Acceptance Criteria — DRAFT (written in full once Q-1 is answered)

- [ ] AC-R1 — regression: every value on every screen still matches
  `check-hygiene.mjs --json` exactly as REQ-001 AC-1..AC-4 require.
- [ ] AC-R2 — regression: 60 s auto-refresh, error states (AC-6/AC-7) and
  read-only proof (AC-8/AC-9) of REQ-001 still hold.

## User-facing wording (Porter as UX writer)

No new text proposed. Any new label the final shape needs comes back to Porter
via Sober and goes to the owner for approval before it is built.

## Constraints

- Still v1: READ + RUN, writes nothing, data only from `check-hygiene.mjs --json`,
  no second store (`SYSTEM-FACTS.md`). A layout change does not relax any of these.
- Gate lines and file / role names shown verbatim, as today.
- Stack unchanged: Next.js 16 + React 19 + antd v6 (`SYSTEM-FACTS.md`).

## Out of Scope

- New data or new features (mode on card, FAILURES NEW, click→open file,
  call-Marie button stay out — `[owner-approved 2026-10-05]`); v2 / v3.
- Any change to what the gate reports.

## Questions

- Q-1 (Porter → owner, 2026-10-06 03:25, blocks this REQ): *"ข้อเสนอ: มีเมนูซ้าย
  = Workspace + รายชื่อโปรเจกต์ · หน้าโปรเจกต์แยกเป็น 3 เมนู Gate / File health /
  Ball เปิดดูทีละอัน · หน้ารวมคงเดิม — ตามนี้ได้มั้ย หรือหน้ารวมก็หนักเกินไปด้วย?"*
