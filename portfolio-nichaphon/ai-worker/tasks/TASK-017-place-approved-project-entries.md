# TASK-017: Place the approved entries in `projects.ts` + the intro numeral

- Source: SPEC-003
- Status: **BLOCKED (waiting: Human via Porter — the R7 approval record in REQ-003)**
- Owner: **Fern (FE)**
- Depends on: TASK-016 (DONE) **and** an approval record for DRAFT-001 written
  into `requirements/REQ-003-portfolio-content-refresh.md` by Porter

## Do not start until this exists

REQ-003 must contain the **exact approved text and the date he approved it**.
That record *is* acceptance criterion AC-g. **If it is not on disk, this task does
not start** — no partial placement, no "the draft is obviously fine". Sober moves
this task to `TODO` once the record is there.

## What to do

Paste approved strings. **Draft nothing. Improve nothing.**

1. `front/src/constant/content/projects.ts` — add the two approved `Project`
   objects. Place them **first** in the `PROJECTS` array (SPEC-003 SQ16a) unless
   the approval record says otherwise. Match the existing formatting of the file;
   fields are exactly `id`, `title`, `summary`, `highlights`, `techStack`, `link`.
2. `front/src/components/partials/Portfolio/Portfolio.config.ts` —
   `PORTFOLIO_INTRO.title` currently reads
   `'Nine projects, and what each one had to solve'`. **Change the numeral only**,
   to the count the array actually has after step 1, using the exact line recorded
   in the approval record (SQ15). Do not rewrite the sentence.
3. Nothing else. No other file, no CSS, no component, no type change. If you
   believe an approved word is wrong, **ask in §Questions** — an improved word is
   an unapproved word.

## Definition of Done

- [ ] The two entries in `projects.ts` are **byte-identical** to the approved text
      (quote the approval record line you copied each from in §Implementation Notes)
- [ ] `PORTFOLIO_INTRO.title` states the real count; the rest of the sentence is
      unchanged
- [ ] **Exactly two files changed.** `git status` / `git diff --stat` pasted into
      §Implementation Notes proves it (no commit — git is the human's)
- [ ] `cd front && npx tsc --noEmit` exits 0 — output pasted
- [ ] `cd front && npm run build` exits 0 — the tail pasted
- [ ] `/portfolio` loads locally with 11 cards; both new cards open their modal and
      the modal's live link points at the handed-over URL
- [ ] No date, client, employer or metric appears in either entry
- [ ] Status set to `REVIEW`, board updated, log entry written

## Implementation Notes

(Fern fills this in.)

## Questions

(Fern asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW: verdict + reasons.)
