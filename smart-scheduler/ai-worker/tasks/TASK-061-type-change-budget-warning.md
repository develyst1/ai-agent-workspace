# TASK-061: scheduler-front (FE) — warn before a type change closes a freelance budget
- Source: SPEC-019 (REQ-009)
- Status: DONE  (reviewed 2026-08-01 by Sober — same `remainingMinor` the budget strip uses, negative case verified, cancel sends nothing, no second call; tsc 0 / build ok)
- Depends on: **TASK-060** for ordering only — **the API shape does not change**, so you can build against
  today's `PATCH /api/teachers/:id`.
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Changing a teacher **FREELANCE → FT/PT** now closes their monthly freelance budget (TASK-060). The stakeholder's
requirement is that this is never a surprise: the admin must see it **before** confirming.

On the teacher edit form, when the type is being changed **away from FREELANCE** and the teacher **has an active
freelance budget**, show a confirmation before saving that:
- names the freelance budget and **the remaining amount in baht**, and
- says plainly that it will be **closed and will not carry over**.

**The number is already in the teacher DTO** — remaining baht = `remainingQty × unitPriceMinor` on the freelance
item (the same numbers the calendar's budget strip uses). **Don't invent a new figure or a new endpoint**, and
don't re-derive the cap rule; you're displaying a value you already have.

- **Cancel must send nothing.** Not a request that gets rolled back — no request at all.
- Confirm → the existing `PATCH` as today. The closure happens server-side as a consequence; **do not add a
  second call** to close the budget.
- No dialog when: the type isn't changing, the teacher was never freelance, or they have no active budget.
- i18n TH+EN.

## Definition of Done
- [ ] FREELANCE → FT/PT **with** an active budget → confirmation naming the budget + remaining baht, stating it
      won't carry over; **cancel sends no request**; confirm saves as today.
- [ ] FREELANCE → FT/PT with **no** budget, FT↔PT, and a name-only edit → **no dialog**, unchanged behaviour.
- [ ] The remaining figure matches what the freelance budget shows elsewhere in the app (same source, so it
      cannot disagree).
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and exercise it in the browser**: open a freelance
      teacher with a budget, switch the type, and say what the dialog said, then cancel and confirm the teacher
      is unchanged. If the environment blocks an interaction, say exactly which.

## Implementation Notes
**Fern — DONE, ready for review (2026-08-01). `smart-scheduler-front` only; no BE/API change.** 2 files
(`TeacherRowActions.tsx` + i18n).

- The change-type modal (`TeacherRowActions`) already has an explicit **Save** + a **Cancel that sends nothing**
  (it just closes — no request), so the requirement was one addition: a **conditional red Alert** shown only when
  `teacher.type === "FREELANCE" && newType !== "FREELANCE" && teacher.remainingMinor != null`, naming the budget
  and the **remaining baht** and stating it won't carry over.
- **The figure is the value I already have:** `remainingBaht = (teacher.remainingMinor ?? 0) / 100` — the **same
  `remainingMinor`** the calendar budget strip uses, so it can't disagree. No new figure, no re-derived cap rule,
  **no new endpoint**, and **no second call** — the closure happens server-side (TASK-060) as a consequence of the
  existing `PATCH /api/teachers/:id { type }`.
- i18n key `teachers.closeBudgetWarn` (TH+EN).

**Verification:**
- `bunx tsc --noEmit` → 0; `bun run build` → success.
- **Browser check (mock, real modal):** opened freelance **เอิร์ธ** (budget `remainingMinor` 1,600,000) → menu →
  **Change type** → set the type to **Full-time** → the modal showed the red warning
  **"This closes เอิร์ธ's freelance budget (remaining ฿16,000) — it will not carry over."** (฿16,000 = the same
  number the budget strip shows). Set the type **back to Freelance** → the warning **disappeared** (only fires when
  changing *away* from FREELANCE). Clicked **Cancel** → modal closed with **zero notifications / no mutation** —
  i.e. no request. (Same hidden-pane rAF/visibility workaround; interactions real.) Confirm→Save is the unchanged
  existing `PATCH` (I didn't re-verify the already-shipped submit path).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- The teacher DTO **does** expose `remainingMinor` on the Teachers page (the budget controls + calendar strip read
  it), so I used it directly — no new field needed, and the amount is guaranteed to match the strip.
- Warning is scoped exactly to FREELANCE→non-FREELANCE **with** an active budget; FT↔PT, name-only edits, and a
  freelance with no budget show **no** extra dialog (unchanged behaviour), verified via the condition + the
  back-to-Freelance browser case.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun run build` → success (my own run).

- **Two files, one conditional Alert, no new endpoint and no second call.** The closure stays a server-side
  consequence of the existing `PATCH`, which is the property I care about — a warning that also *performed* the
  close would put the guarantee in the browser.
- **The figure is the same `remainingMinor` the calendar strip reads**, so the dialog and the budget UI cannot
  disagree. That was the point of "don't invent a new figure", and you found the existing one instead of
  computing from `ceiling − used` or similar.
- **You verified the negative case, not just the happy one** — switching the type back to Freelance made the
  warning disappear. That's the half of "only fires changing *away* from FREELANCE" that a quick check skips.
- **Cancel sends nothing** — confirmed as a property of the existing modal (it just closes), not something
  bolted on. Good that you checked rather than assumed.
- Not re-verifying the already-shipped submit path was the right scope call, and saying so is better than
  implying you did.

**One edge, for information only — no change wanted:** a freelance teacher whose budget is fully spent has
`remainingMinor = 0`, so the warning reads "remaining ฿0". That's correct — the budget still closes, and
"₿0 will not carry over" is a true and unalarming sentence. Mentioning it so nobody later reads it as a bug.

**TASK-061 → DONE. REQ-009's build is complete** (TASK-060 + TASK-061). ⏳ Deploy: FE + BE, **no migration**;
smoke as documented in TASK-060 (change a freelance teacher to FT → gone from the budget list, row `active=false`
with the numbers unchanged → month-reset doesn't re-fill it).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-061 | scheduler-front (FE): confirm before a type change closes a freelance budget — names the **remaining baht**, cancel sends **no request** | SPEC-019 | ✅ **DONE** (Sober 2026-08-01 — uses the **same `remainingMinor` the calendar strip reads** so the dialog can't disagree with the budget UI; negative case verified (back to Freelance → warning disappears); cancel sends nothing; **no second call** — the close stays a server-side consequence; tsc 0 / build ok) | Fern | TASK-060 |
```
