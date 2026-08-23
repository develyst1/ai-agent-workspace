# TASK-167: Align the "Already in progress" modal helper-text row (REQ-064 AC-8) (FE)

- Source: SPEC-060 (REQ-064) AC-8 — the misalignment the owner actually pointed at.
- Status: TODO → @Fern (FE)
- Assignee: @Fern (FE)
- Repo: **smart-scheduler-front**. Small, visual.

## What to build
On the "Already in progress" (import) modal, `Remaining sessions start` and `Time` share a two-column row, but their
inputs aren't on the same line: the left field has a **two-line helper** ("The first session from here on — not the
original start"), the right has none, so the left input is pushed down.

🔴 **Fix the ROW, not one box** (Porter): either the row aligns its **inputs** (not their tops), or **every field in
the row reserves the same helper slot** — so the next field whose helper wraps doesn't re-open this. Nudging one box
re-breaks the moment another helper wraps, and this form is full of helper text.

## Definition of Done
- [ ] `Remaining sessions start` and `Time` inputs sit on the same line, **and stay aligned when a helper text
      wraps** — checked at **1440 / 768 / 375** (REQ-041).
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · rendered verdict pasted (rides @Tanya
      if the modal won't composite headless).

## Notes / Questions
(Fern fills in. This is AC-8 only — the data defects in REQ-064 are BE, TASK-165/166. Do not touch the import logic.)
