# TASK-061: scheduler-front (FE) — warn before a type change closes a freelance budget
- Source: SPEC-019 (REQ-009)
- Status: TODO — after TASK-059 (the critical-path one). Not urgent; no money leak exists.
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
(Fern fills in — include what you exercised in the browser.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- If the teacher DTO doesn't actually expose `remainingQty`/`unitPriceMinor` where you need them, **flag it
  here** and I'll have the backend surface it — don't compute the amount from anything else.

## Review
(Sober fills at REVIEW.)
