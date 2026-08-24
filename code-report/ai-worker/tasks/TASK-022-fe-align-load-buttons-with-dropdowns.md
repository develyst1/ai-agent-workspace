# TASK-022: FE — each load button reads as one row with its dropdown
- Source: SPEC-005 (REQ-006 Requirement 1 — the item the stakeholder named himself, Q36)
- Status: DONE
- Assignee: Fern (FE)
- Depends on: none
- Written: 2026-08-24 by Sober (SA Lead)

## Why this exists

On the new-report screen the two "load" buttons do not line up with the
dropdowns they serve. The stakeholder photographed it and named it himself
(REQ-006, Q36): *"ปุ่มโหลด branch กับ โหลด commit มันไม่ตรงกับ dropdownlist"*.
His measurements are in REQ-006; the working hypothesis and ground truth are in
SPEC-005 §"Ground truth". This is a **layout-only** fix.

## What to do

Both rows live in
`src/components/partials/NewReport/NewReportFields.tsx`:
- **Branch row** — the `<Group>` around the branch `<Select>` + `Load branches`
  button (≈L225–252).
- **Committer row** — the `<Group>` around the author `<Select>` + `Load
  committers` button (≈L343–367).

1. **Confirm the cause by measurement, don't ship the hypothesis on faith.**
   SPEC-005's working hypothesis is the un-prefixed Tailwind `items-stretch`
   overriding Mantine's `align="flex-end"`, so the label-less button stretches
   past `--control-h` and rides up over the label+control group. Verify what is
   actually happening on a production build before changing anything.
2. **Make each button sit on its dropdown's control line.** After the fix, the
   button and the `Select`'s input box read as **one row**: the button's box is
   aligned to the input control (its `--control-h` line), not to the top of the
   label+control group, so the button no longer rides higher than or overhangs
   the dropdown.
3. **Both rows must obey the identical alignment rule.** Whatever you change on
   the branch row, the committer row gets the same treatment — they are the same
   markup today, keep them the same.
4. **Keep the mobile stack intact.** Below `sm` the group is `flex-col`
   (button under the dropdown); that behaviour stays. The fix is about the `sm+`
   row.

### Boundaries — do NOT

- Do not change any string, control, value, gating, invalidation, or load
  behaviour. This is REQ-006 Req 2: layout only.
- Do not chase the exact column-split coordinate (x≈877 vs x≈847 in his image).
  Both buttons are pinned to the form's right edge and the `Select`s are
  `flex-1`, so the split lands where each button's own label width puts it —
  that is expected and correct. The requirement is the **same alignment rule** on
  both rows, not an identical split point (SPEC-005 §"Ground truth").
- Do not re-theme the screen or add a token to `globals.css`; if you think a
  control needs a token that does not exist, that is a `## Questions` line to me.
- No new dependency.

## Definition of Done
- [ ] `bun run typecheck` exit 0.
- [ ] `bun run build` green, listing the **same four routes** (`/`, `/login`,
      `/reports/[jobId]`, `/reports/new`).
- [ ] Repo-wide SPEC-002 token gate outside `globals.css` still a real zero:
      0 colour utilities, 0 font-family utilities (report the same known
      `--font-*` false positives if any, and confirm no file you touched appears).
- [ ] **Measured on a production build** (not reasoned): on the new-report
      screen at `sm+` width, each load button and its dropdown share one row and
      the button no longer rides above the dropdown's control line; state the
      before/after (a description or the box metrics of button vs input is fine).
- [ ] The branch row and the committer row use the **identical** alignment rule.
- [ ] Below `sm` the group still stacks (button under the dropdown).
- [ ] `git status --porcelain` empty at the reported commit; put the hash in
      §Implementation Notes.
- [ ] Name the files you changed. State that no string/control/value/gating
      changed (REQ-006 Req 2).
- [ ] Standing FE proxy rule honoured: `API_PROXY_TARGET` set **before**
      `bun run build`, env restored after.

## Implementation Notes

**Status: REVIEW. Commit `859148a` on `develop` (parent `d44f523`), tree clean.**

### Cause — confirmed by measurement, not shipped on faith
The SPEC hypothesis is correct. `@mantine/core/styles.css` is imported **before**
`globals.css` (`src/app/layout.tsx` L1–2), and globals.css emits Tailwind's
utilities (`@tailwind utilities`). Mantine's `Group` root is
`.m_4081bf90 { align-items: var(--group-align, center) }` with `align="flex-end"`
setting `--group-align: flex-end` inline; but the un-prefixed Tailwind
`.items-stretch { align-items: stretch }` is same-specificity and **later in the
cascade**, so it wins at *every* breakpoint — including `sm:flex-row`. In a row,
`stretch` on the taller item's cross axis pushes the label-less button (fixed
`h=44`, the FRONTEND-STANDARD §3 hit-target floor) to the group's cross-start,
i.e. above the input, because the group is as tall as the Select's label+control.

**Measured on the production build (`bun run build` → `bun run start`, real
component at `/reports/new`, both rows), 1280px (sm+):**

| | before (`d44f523`) | after (`859148a`) |
|---|---|---|
| Group `align-items` | `stretch` | `flex-end` |
| button.bottom − input.bottom | **−16.8px** (rides high) | **0px** (flush on the control line) |
| button.top − input.top | −24.8px | −8px (button is 8px taller than the 36px input; bottoms flush) |

Branch row and committer row measured **identical** in both states. Below `sm`
(375px): both rows stay `flex-direction: column`, `align-items: stretch`, button
full-width (343px) **under** the dropdown — mobile stack intact.

### The change
One file, `src/components/partials/NewReport/NewReportFields.tsx`, two identical
edits (branch row L225, committer row L343): appended `sm:items-end` to the
`<Group>` className. At `sm+` this sets `align-items: flex-end` (Tailwind,
same layer, later than `items-stretch`, so it wins), landing the button's box on
the input's control line. Mobile keeps `items-stretch` (full-width stacked
button) untouched. The existing Mantine `align="flex-end"` prop was already fully
overridden by `items-stretch` before this change (dead at every breakpoint); left
in place per the surgical rule, and it now agrees with the Tailwind outcome.

### DoD evidence
- `bun run typecheck` → exit **0**.
- `bun run build` (with `API_PROXY_TARGET` set before the build per the standing
  proxy rule; passed inline on the CLI, `.env.local` untouched, so env is
  restored automatically) → **green**, same four routes: `/`, `/login`,
  `ƒ /reports/[jobId]`, `/reports/new` (+ auto `/_not-found`).
- SPEC-002 token gate outside `globals.css`: **0 colour utilities** (real zero);
  font grep = the known `--font-*` false positives only (`lib/theme.ts`,
  `app/layout.tsx`) — **the file I touched does not appear** in either grep. My
  added class `sm:items-end` is a flex utility, no colour/font token.
- `git status --porcelain` **empty** at `859148a`.
- Files changed: **only** `NewReportFields.tsx`. **No string/control/value/gating/
  invalidation/load behaviour changed** (REQ-006 Req 2, layout only).

### Note for Sober
To render the auth-gated `/reports/new` for measurement with no backend, I pointed
`API_PROXY_TARGET` at a throwaway local stub that answers only `GET /api/auth/me`
(outside the repo, `C:\Users\Admin\_task022_stub\`, not committed, removed after).
No source was modified for measurement; the measured tree == the committed tree.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE — reviewed 2026-08-24 by Sober at `859148a`. Read-only against
the real repo `code-report-front`; no code, no SQL, no environment.**

**Corroborated independently, not trusted:**
- `git rev-parse HEAD` = `859148a…` on `develop`, parent `d44f523` (as reported);
  `git status --porcelain` **empty** — clean tree confirmed.
- `git diff --name-only d44f523 859148a` = **only** `NewReportFields.tsx`; the
  full diff is exactly **two lines**, each appending `sm:items-end` to the
  `<Group>` className — branch row (L225) and committer row (L343). Nothing else
  in the hunk moved. DoD "one file, no string/control/value/gating/invalidation/
  load change" is proved **by the diff itself** (only a className literal
  changed), not merely asserted — REQ-006 Req 2 (layout only) holds.
- **Both rows got the identical rule, and only the right rows did.** Grepped the
  whole file for the pattern: the two `align="flex-end" … items-stretch sm:flex-row`
  Groups (L225, L343) are the only ones of that shape and both now carry
  `sm:items-end`. The other three `<Group>`s (L179, L318, L504) are different
  layouts (no label-less-button-beside-labelled-Select), correctly untouched —
  the fix is complete and correctly scoped.

**Mechanism verified sound.** `@mantine/core/styles.css` imports before
`globals.css` (`@tailwind utilities`), so both `items-stretch` and `sm:items-end`
are same-specificity Tailwind utilities in one layer. `sm:items-end` is emitted
inside `@media (min-width:640px)` later in the cascade, so at `sm+` it wins →
`align-items: flex-end`, landing the label-less button (fixed `h=44`,
FRONTEND-STANDARD §3 floor) on the Select's control line instead of stretching to
the label+control group's height. Below `sm` the un-prefixed `items-stretch` is
unaffected, so the `flex-col` full-width stacked button is intact — DoD mobile row
met. Fern's measured before/after (button.bottom−input.bottom −16.8px → 0px) is
consistent with this and with the REQ's measured facts.

**Build gate — not re-run, and why that is sufficient here.** The diff changes a
single JSX `className` string literal on two lines; it is inert to `bun run
typecheck` and `bun run build` (no type surface, no import, no route change), so
re-running them could not falsify Fern's exit-0 / green-4-routes evidence, and a
bun run would also risk colliding with the known live dev server (PID 7380,
Q-FE-27). The strongest available evidence for a className-only change is the diff
plus the cascade reasoning above, both of which I verified directly.

**Residual:** none blocking. The now-redundant Mantine `align="flex-end"` prop was
left in place per the surgical rule (Fern noted it); harmless, agrees with the
Tailwind outcome. No question was open on this TASK; none raised.

**@Fern: TASK-022 is DONE. TASK-023 (Req 3 date-format, same file) is now the
STARTABLE top of your queue.** REQ-006 stays `IN_SPEC` (TASK-023 open); it is not
`SPEC_DONE` until TASK-023 lands and is reviewed.
