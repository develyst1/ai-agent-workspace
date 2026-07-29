# REQ-012: Registration / profile form (opened from LINE) capturing customer demographics
- Status: READY_FOR_SA  (⚠️ RE-SCOPED 2026-07-29 — form-based, opened from LINE; not "add fields to the staff form")
- Priority: MEDIUM
- Requested: 2026-07-25 meeting (คุณกุ้ง) → re-scoped by stakeholder 2026-07-29
- Deadline: none — **after REQ-015 (LINE UX); prerequisite for REQ-013 demographics**
- Source: `20260725-{meeting,todo}.md` (§4) + stakeholder direction 2026-07-29 (registration lives on LINE).

## Problem / Goal
The dashboard (REQ-013) needs **gender, age, province, nationality** — currently captured nowhere. Registration
happens on **LINE**, but the LINE flow is a raw text bot that captures only the child's **name**. The stakeholder
wants demographic capture done through a **nice, simple web form opened from LINE** (a page in the frontoffice,
tapped open from the LINE bot — like a Google Form, but simpler and prettier).

## Requirement
1. A **registration / student-profile form** — a **frontoffice web page opened from LINE** (LIFF-style) — that a
   parent taps to fill, capturing the student's **name + gender + date of birth + province + nationality
   (Thai / foreign)**.
2. The form is **clean and easy** (nicer/simpler than a Google Form).
3. Submitted data is saved to the student record and is available to the dashboard/analytics.
4. The same form should also be usable from the **staff web** (an alternative entry).
5. Existing students without the data are "unknown" for those fields (no forced backfill).

## Acceptance Criteria
- [ ] A parent can open the form from LINE, fill name + gender + DOB + province + nationality, and submit; the
      student is created/updated with the data.
- [ ] Staff can open the same form from the web.
- [ ] The student API returns the new fields; the dashboard can read them; unknowns handled gracefully.

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- `public.students` / `parents` have **none** of gender / DOB / province / nationality (all 4 missing);
  `createStudentForParent` (LINE) + `createStudent` (web) store name/nickname only.
- Registration on LINE today = text commands (no LIFF/form). So this needs **new columns + a form (web/LIFF)
  reachable from LINE + wiring**. **Depends on REQ-015** for the LINE entry point (rich-menu/LIFF).

## Constraints
- Data from the form (per the meeting) — don't infer gender/nationality from names.
- Reuse `students`/`createStudentForParent`; add the 4 fields. HOW (LIFF vs a plain mobile web page linked from
  LINE; column shapes) is the SA's design.

## Out of Scope
- The dashboard charts (REQ-013); the general LINE UX overhaul (REQ-015).

## Questions
(SA + stakeholder. Porter answers `> answer: ...`; business calls → `@Porter`.)
- **Required or optional** fields? (Recommend optional so signup stays quick; coverage grows over time.)
- **Nationality** = Thai / foreign flag (matches the meeting) or full country?
- **Province** = a Thai-province dropdown (cleaner analytics) or free text?
- Store **date of birth** (derive age) — confirm.
- Should the form also let the parent **enroll a course/voucher/trial**, or just the student profile for now?
  (Enrollment-via-LINE doesn't exist today — flag if wanted, likely a separate REQ.)
