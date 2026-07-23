# TASK-023: backoffice-front — admin UI on the universal item model
- Source: SPEC-006
- Status: TODO
- Depends on: TASK-022
- Assignee: @Fern (smart-scheduler-backoffice-front, port 3018)

## What to do
Rebuild the backoffice admin UI on the new `bo` API (TASK-022). Reuse the existing app shell + the REQ-002
login/guard; retire the old ops-based screens (Freelance Budgets / FT-PT Salary / old Items) — they map to
the new universal Items screen.

1. **Items screen**: list (filter by direction/cadence/tag) + create/edit modal — name, unit (free-text now),
   direction (INCOME/EXPENSE), cadence (VARIABLE/FIXED_*), unit price (baht→satang), ceiling (optional),
   owner_ref (optional). Show `remaining / ceiling` for stock items.
2. **Movement action** per item: an in/out modal (`qty` signed, reason) → `POST /items/:id/movements`; shows
   the resulting remaining + the baht value.
3. **Tags**: a small manager for tag groups/values + assigning tags to items (mirror the frontoffice badge UI).
4. **P&L dashboard**: `GET /reports/pl` → revenue/expense/profit tiles + by-direction/by-cadence + by-item
   (reuse the existing Dashboard layout).
5. Service/hooks: one `bo` service module (items/movements/tags/report) via the existing axios client;
   TanStack Query with a `["bo", …]` key namespace.

## Definition of Done
- [ ] Admin can create/edit an item (all fields), see `remaining/ceiling`, and post an in/out movement.
- [ ] Tags can be created and assigned; the P&L dashboard shows revenue − expense = profit from movements.
- [ ] Old ops screens removed/replaced; nav updated; `bunx tsc --noEmit` + `bun run build` clean.

## Implementation Notes
(Fern fills in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills at REVIEW.)
