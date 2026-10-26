# REQ-5000: Voucher booking cannot find a child who has a voucher

- Status: CLOSED — no code change (owner via Atom 2026-10-26 18:13: "ปล่อยไว้แบบเดิม จบเคส"); cause = data (TEST-5000), fixed by staff in-app
- Priority: HIGH (a live bug on the customer's system)
- Requested: 2026-10-26 by the owner, relayed by Atom (17:38)
- Deadline: none stated

## The ask, verbatim (owner via Atom, 2026-10-26 17:38)

> "งานที่ฉันจะให้แก้รอบนี้อยู่บน uat ให้ QA ไป read only uat มาทำความเข้าใจปัญหา แล้วแก้ปัญหา จบเคส — การจองแบบ
> voucher มันไม่เห็นเด็กคนหนึ่ง ทั้งๆที่เด็กคนนั้นก็สมัคร voucher ไว้ แต่พอปรับแท็บประเภทการจองเป็นแบบอื่น
> หาเด็กคนนี้เจอตลอด ยกเว้นแค่ voucher"

Restated [PM]: on `uat`, when staff make a booking with the booking-type tab set to **Voucher**, one particular
child does not show up in the child search/list, although that child has a voucher. With any other booking-type
tab the same child is found every time.

## Problem / Goal

Staff cannot book a voucher session for a child who has paid for a voucher, so the customer cannot use what
they sold. Goal: every child who holds a usable voucher is findable on the Voucher tab.

## Plan (owner's order: understand on uat first, then fix)

1. **Tanya — read-only on `uat`:** reproduce, then find why this child is missing on the Voucher tab only.
   Compare what the Voucher tab's list/search returns vs. another tab, and what is different about this child's
   voucher (status, expiry, remaining sessions, price group `bike-skate`, linked student vs. parent, etc.).
   Findings + screenshots go in `tests/TEST-5000-*.md`. **No writes on `uat`** — anything needing one is a
   DATA REQUEST to Porter.
2. Porter turns the findings into ACs below and sets `READY_FOR_SA` → Sober designs the fix on branch `atom`.
3. Tanya tests the fix on `sid` → `TEST_PASSED` → owner's `รวมโค้ด` / deploy.

## Acceptance Criteria (draft — finalised after step 1)

- [ ] AC-1 — **Given** a child holding a usable voucher **When** staff open a booking on the Voucher tab and search
  that child **Then** the child appears and can be selected.
- [ ] AC-2 — the specific child from the owner's report is findable on the Voucher tab (on `sid` with equivalent
  data; on `uat` after deploy, checked read-only).
- [ ] AC-3 — negative: a child with no usable voucher behaves as the product intends today (to be confirmed from
  step 1 — not decided).
- [ ] AC-4 — regression: child search on every other booking-type tab is unchanged.

## Constraints

- `uat` is read-only for QA; engineers get no `uat` access. ⚠️ The original desk recorded that
  `scripts/mint-session.mjs` refuses `frontoffice` (REQ-080 on `../smart-scheduler/`, never shipped as of its board)
  — if that blocks Tanya, she reports it; nobody works around the guard.
- Fixes go on branch `atom`; no migration without the owner's go.

## Out of Scope

- Changing who is eligible for a voucher booking (unless step 1 shows the rule itself is wrong — then it comes
  back to the owner as a decision).

## Questions

- Q1 (Porter → owner, 2026-10-26): which child (name / nickname / parent phone), and how Tanya logs in to `uat`
  read-only (no credentials in `project-docs/`).
  > answer (owner via Atom, 2026-10-26 17:48): child = **"Lewis"** · `uat` login is in the workspace-root
  > `machine.local.md` → section `smart-scheduler-atom QA credentials` (never print or copy the values) ·
  > Tanya may also READ `../smart-scheduler/project-docs/` (read-only). Section heading confirmed present by Porter.
- Q2 (owner via Atom, 2026-10-26 18:09): "มีทางที่ให้ขวัญทำเองมั้ย" — can staff fix Lewis Liu (archived, voucher 11 h left) in the app?
  > answer [PM, code read, not run on uat]: yes. People → switch "แสดงที่เก็บแล้ว" → row "Lewis Liu" (badge "เก็บแล้ว") →
  > "คืนสถานะ" (`POST /students/:id/unarchive`, TASK-392; back `parent.service.ts` `unarchiveStudent`, front
  > `PeopleContent.tsx`). Refused only if the parent is archived or already has 5 active children. Duplicate "Lewis Lui"
  > (0 vouchers) can then be archived the same way if it has no future bookings. Code read on branch `atom`; the uat build
  > is older, but Tanya's probe shows uat already serves `?archived=true` (TEST-5000 [6]). Button not seen on uat screen.
- Q3 (Porter → owner, 2026-10-26 18:11): archive rule for a child with a live voucher — block / warn / keep?
  > answer (owner via Atom, 2026-10-26 18:13): "ปล่อยไว้แบบเดิม จบเคส" — keep as is, no code change; Khwan un-archives Lewis Liu herself. Case closed.
