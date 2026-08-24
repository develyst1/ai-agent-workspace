# SPEC-005: New-report screen inconsistencies — load-button alignment + date-format parity
- Source: REQ-006
- Status: DONE — 2026-08-24. Both tasks reviewed DONE (TASK-022 at `859148a`,
  TASK-023 at `68a1475`); Req 1 (load-button alignment) + Req 3 (`DD/MMM/YY`
  period inputs) built and SA-verified. REQ-006 → `SPEC_DONE` (Porter's acceptance).

## Overview

Two fixes on the **one** screen the stakeholder photographed
(`code-report-front`, the new-report form), both scoped to that screen and
neither touching the wire, the gating, or any copy:

1. **Req 1 (the item he named, Q36) — layout.** Each "load" button
   (`โหลดรายการ branch`, `โหลดรายชื่อผู้เขียนคอมมิต`) must read as part of the
   same row as the dropdown it serves; the branch row and the committer row must
   follow the **same** alignment rule as each other.
2. **Req 3 (the team's finding, Q38 = "ทำให้หมดอ่ะ" → GO) — date-format parity.**
   The two period inputs and the summary-card readout must show the chosen dates
   in **one** format, `DD/MMM/YY`, without changing what goes on the wire.

Both are read against the real repo at `code-report-front` HEAD `d44f523`
(clean tree). The relevant files are all in
`src/components/partials/NewReport/` plus the shared `src/lib/format.ts`.

This SPEC changes **no backend**, adds **no dependency**, and adds/removes/rewords
**no user-facing string** (Q14 copy bundle stays closed; Q37 keeps `Branch`).

## Ground truth read from the code (not assumed)

- **The two rows are already structurally identical.** In `NewReportFields.tsx`
  both the branch row (≈L225–252) and the committer row (≈L343–367) are a
  Mantine `<Group align="flex-end" gap="var(--space-3)"
  className="flex-col items-stretch sm:flex-row">` holding a `flex-1` `Box`
  around a `<Select>` (which carries its **label above** the control via
  Mantine's `Input.Wrapper`) and, beside it, a **label-less** `<Button>`.
- **Why the button rides high (working hypothesis, to be confirmed by
  measurement, not shipped on faith):** the Tailwind utility `items-stretch` is
  **un-prefixed**, so it sets `align-items: stretch` at *every* breakpoint,
  including `sm:flex-row`, and overrides the Mantine `align="flex-end"`. In a
  row, `stretch` makes the button as tall as the tallest item — the `Select`,
  whose height includes its label — so the button grows past `--control-h`
  (`2.75rem`) and its box spans the label+input group instead of sitting on the
  input's line. That matches the REQ's measured facts (button taller, rides
  higher, its bottom edge above the dropdown's bottom edge).
- **The differing column split (x≈877 vs x≈847 in his image) is NOT a defect to
  chase to the pixel.** Both buttons are pinned to the form's right edge (x≈1080)
  and the `Select`s are `flex-1`, so the split lands wherever each button's own
  label width puts it — and `โหลดรายชื่อผู้เขียนคอมมิต` is a longer string than
  `โหลดรายการ branch`. The requirement is that the two rows obey the **same
  alignment rule**, not that they share an identical split coordinate.
- **The date mismatch is a native-control fact.** The period inputs are
  `<TextInput type="date">` (`NewReportFields.tsx` ≈L281 and ≈L300); a native
  `type="date"` renders its **displayed** text in the browser/OS locale
  (`24/08/2026` on his machine) and **that display cannot be reformatted by CSS,
  HTML attributes, or JS** — it is not page-controllable. The summary readout in
  the run panel (`NewReportContent.tsx` ≈L452, L526–530) uses
  `formatIsoDate()` from `src/lib/format.ts`, which yields `24/Aug/26`
  (`DD/MMM/YY`, REQ-001 Req 15). Both sides hold the same underlying
  `YYYY-MM-DD` string in state and send it verbatim on the wire.

## Design ruling — Req 3 (mine per Porter's Q38/Q36 delegation)

Porter lifted the hold and delegated **how** to me. I rule:

1. **Direction is fixed by REQ-001 Req 15 + the REQ-006 constraint:** the summary
   card (`DD/MMM/YY`) is the standard and is correct; the **inputs** are the ones
   that must be brought into line. We do **not** change the summary card's format.
2. **REQ-004 Requirement 7d covers this change**, and I am recording the reason
   here so the TASK can cite it: 7d permits changing REQ-001-named behaviour —
   and it names `DD/MMM/YY` explicitly — **when it demonstrably improves
   usability**. Showing the user's chosen period in the same format he is shown it
   back in, on one screen, removes a real visible inconsistency (the whole point
   of REQ-006). The frozen behaviour being changed is precisely the one Q-SA-10
   accepted (the date **input** rendering in the OS locale); 7d is what unfreezes
   it, with this paragraph as the "why it is easier now".
3. **Hard constraints on the mechanism** (all from existing rules, not new):
   - **No new dependency.** `@mantine/dates` / `dayjs` was declined (Q-SA-12), so
     the control is hand-rolled from `@mantine/core` + the existing helpers.
   - **The wire and the timezone handling do not move.** `dateFrom`/`dateTo` stay
     bare `YYYY-MM-DD` in state and on the wire; nothing is parsed into a `Date`
     and passed through the browser timezone (the same trap `formatIsoDate` and
     `todayIso` already avoid — see TASK-018 Q-FE-25). Reuse `formatIsoDate` for
     the display; do not write a second formatter.
   - **No new user-facing string.** The period is pre-filled today→today the
     moment the screen mounts and the inputs are disabled until the form unlocks,
     so there is always a value to format — no empty-state placeholder copy is
     needed. Labels (`ตั้งแต่วันที่` / `ถึงวันที่`) and the existing hint stay.
   - **Date picking must survive.** The user must still be able to pick a date
     with the same ease he has today (keyboard entry and the OS calendar), and
     the ≤366-day rule, the three presets, the committer-list invalidation on a
     date change, and the gate stay byte-for-byte in behaviour.
4. **The exact control shape is Fern's** (TASK-018 §5 precedent: I name the
   binding outcome and the constraints, not the widget). A feasible reference
   path that meets all of the above with no dependency: keep a real native
   `type="date"` for the **picker/keyboard** interaction and its `YYYY-MM-DD`
   value, and present that value as `DD/MMM/YY` on top of it (e.g. a formatted
   overlay/read-face driven by `formatIsoDate(value)`), so the visible text and
   the summary card agree while the native picker still opens. Fern may choose a
   different shape that satisfies the outcome; if she finds the outcome cannot be
   met without a **new dependency** or a **new visible string**, that is a
   `## Questions` line to me (I route the string question to Porter), **not** an
   assumption she ships.

## Flow / behaviour after the change

- **Branch row & committer row:** button and dropdown sit on one visual row; the
  button's box aligns to the **input control** (its `--control-h` line), not to
  the top of the label+control group. Both rows use the identical rule. Nothing
  about load, gating, invalidation, values, or copy changes.
- **Period:** each field shows the selected date as `DD/MMM/YY`; the run-panel
  readout is unchanged and now matches the fields. Editing a date, using a preset,
  the 366/367 boundary, and coming back from a report page all behave exactly as
  built — only the *rendering* of the field changes.

## Non-functional

- `bun run typecheck` clean; `bun run build` green with the **same four routes**
  (`/`, `/login`, `/reports/[jobId]`, `/reports/new`).
- Repo-wide SPEC-002 token gate still a real zero outside `globals.css`
  (0 colour utilities, 0 font-family utilities); if a control needs a token that
  does not exist, ask first — no raw colour/font.
- FRONTEND-STANDARD §3 hit-target floor (44px) preserved on the load buttons and
  on whatever the date field becomes; the date value stays announced/labelled
  (no a11y regression versus the native input).
- Standing FE proxy rule honoured: set `API_PROXY_TARGET` **before**
  `bun run build`, and restore the env afterwards.

## Tasks

- TASK-022: FE — align each load button with its dropdown (Req 1). (depends on: —)
- TASK-023: FE — period inputs render `DD/MMM/YY` to match the summary (Req 3).
  (depends on: — ; **same file as TASK-022 — land TASK-022 first**, see the TASK.)

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`)
