# TASK-964 — FE: REQ-5014 Team C revenue pieces (BF) — @Flash (Team C) — ⏸ until the back office resumes

**From @Sector, 2026-11-13.**
- **Design:** `specs/SPEC-107-req5014-team-c-revenue-pieces.md` §2–§3.
- **Repo:** `smart-scheduler-backoffice-front`, base `68a9409`. No git.
- **Size:** ≈ 0.5 d.
- **Start only when I ring you.** Brew's TASK-963 builds the API; build against SPEC-107 §2–3's shapes with the repo's fake (`RevenueLedger/fake.ts`) first.

## Files (closed list)
- `src/components/partials/RevenueLedger/RevenueDetail.tsx`: «X → Y» in the row, and the expandable history note.
- `src/components/partials/RevenueLedger/fake.ts`: one line with `activityChange`.
- `src/app/(admin)/revenue/manual/page.tsx`, plus its form component if the form lives elsewhere:
  - read `?courseId=&amountMinor=&reason=activity-change` once;
  - the course chip with a remove button, the amount, and the remark preset «ส่วนต่างเปลี่ยนกิจกรรม»;
  - send `courseId` with the POST.
- The API types file for revenue lines; the repo's i18n file if the words go there.
- Tests next to each.

## Done =
- tsc 0 · the BF suite N/0 (paste).
- Dom tests:
  - «X → Y» shows only when `activityChange` is present;
  - the note lines;
  - the link pre-fills the form and nothing is posted on load;
  - removing the chip drops `courseId` from the POST.
- One screenshot of each screen after the real run.

## Questions / Implementation Notes / Review
_(—)_
