# SPEC-007: Remove the dead `/forgot-password` link from `/login`
- Source: REQ-007
- Status: DONE (2026-09-13, Sober — TASK-022 reviewed `DONE`; AC 3 with Porter)

## Overview

`/login` offers a link to `/forgot-password`; no such route exists in `front/src/app/`. The owner
chose removal over building (`SYSTEM-FACTS.md` A45). This SPEC is **subtractive only**: one JSX
element leaves one file, nothing is added, no route, no backend, no copy.

**Where it lives (code read on `develop`, 2026-09-13):** the only occurrence in all of `front/` is
`front/src/components/partials/Login/LoginContent.tsx:154-156` — a `<Link href="/forgot-password">`
with the label `ลืมรหัสผ่าน?`, the right-hand child of the `flex items-center justify-between`
row whose left-hand child is the `จดจำฉัน` `BaseCheckbox` (line 152-157). REQ-007 cites
`login/page.tsx:151`; that was true before TASK-004 moved the form into `partials/Login/`. The
page file itself no longer contains the string. `next.config.ts` and `src/` hold no redirect or
other reference to `/forgot-password`.

## Sequencing decision — its own TASK now, not folded into Phase 3

`/login`'s **look** belongs to SPEC-006 Phase 3 (TASK-007…010), which is gated on the owner's eyes
on Phase 1 + Phase 2 — and Phase 2 just FAILED (A48), so that gate is not opening soon. REQ-007 is
gated on **nothing**: the owner has already ruled, the change is one element, and it touches no
control's classes. Folding it into a gated TASK would hold a ruled, one-line removal hostage to an
unrelated gate. So: **TASK-022, FE, standalone, now.** When Phase 3's `/login` TASK is eventually
written it inherits the link-less screen and this SPEC says nothing about its look.

## API / Interface Design

None. No HTTP contract changes; `back/` is untouched.

## Data Model

None.

## Flow (the change, exactly)

1. Delete the `<Link href="/forgot-password" …>ลืมรหัสผ่าน?</Link>` element (lines 154-156).
2. Keep the wrapper `<div className="flex items-center justify-between text-sm">` and the
   `BaseCheckbox` inside it. With one child, `justify-between` places it flush-left — the checkbox
   does not move. This keeps the diff to a pure deletion; nobody restyles the row.
3. Keep `import Link from 'next/link'` — it is still used by the `สมัครฟรีเลย` link (line 174).
4. Nothing else: the two fields, the submit path, the error banner, the resend block, the
   demo-credentials line, every class string and every Thai string stay byte-identical.

**What happens to the look (SPEC-006 rule, per control touched):** no control is touched. The
checkbox keeps its TASK-004 interim rendering (SPEC-001 §Decision 9 §2); the row loses its
right-hand text and nothing else. **Hypothesis, to be measured, not asserted:** the row's height
and the checkbox's and submit button's bounding boxes are unchanged before/after, because the
checkbox (not the link) was the row's taller child. TASK-022 DoD 6 settles it.

## Non-functional

- Emoji harness stays at **110** — this adds and removes no emoji. Not re-baselined.
- No new dependency, no `themes.css` change, no shared-component change (the shared-component rule
  of SPEC-006 is not engaged — `partials/Login/` renders on `/login` only).

## Tasks

- TASK-022: Remove the `/forgot-password` link from `LoginContent.tsx` — owner: FE (Fern)
  (depends on: none)

## Acceptance mapping (REQ-007)

- AC 1 (no affordance anywhere in `front/`) — TASK-022 DoD 3 (repo-wide grep = 0) + DoD 5 (DOM has
  no anchor to `/forgot-password`).
- AC 2 (still renders, still logs in, subtractive only) — DoD 1, 2, 4, 7 + the diff is deletion-only
  (DoD 8).
- AC 3 (**the owner's own eyes**) — not closable here. When TASK-022 is `DONE`, REQ-007 goes
  `SPEC_DONE` and Porter carries AC 3 to him: "does `/login` still read right with `ลืมรหัสผ่าน?`
  gone from the right of `จดจำฉัน`?"

## Questions

(Engineers ask here; Sober answers as `> answer: ...`)
