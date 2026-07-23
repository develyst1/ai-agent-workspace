# TASK-023: backoffice-front — admin UI on the universal item model
- Source: SPEC-006
- Status: DONE (core; tag display/prefill = required fast-follow before deploy — see Q&A)
- Depends on: TASK-022 (DONE)
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
Repo: `smart-scheduler-backoffice-front`. Rebuilt the admin UI on the new `bo` API (TASK-022, under
`/api/v1/bo/*`), reusing the existing app shell + the REQ-002 cookie/JWT login & guard. Confirmed the exact
DTO/request shapes from Jason's backend (`db/mappers.ts` bo DTOs, `validation.ts` bo schemas, `routes/bo.ts`).

**New foundation**
- `types/app/bo.ts` — `BoItem`/`BoMovement`/`TagGroup`/`TagValue`/`BoPLReport` + `Direction`/`Cadence`
  (+labels) + `thb`.
- `services/bo.service.ts` — items (list w/ direction/cadence/tag filters, create, update, get), movements
  (apply signed `qty`, list), tags (list groups, create group/value, `setItemTags`), `getPLReport` — all on
  `/v1/bo/*`.
- `hooks/backoffice/useBo.ts` — TanStack Query under a `["bo", …]` key namespace; mutations invalidate items/pl.

**Screens**
- **Items** (`components/partials/BoItems/`): `BoItemsContent` (list + filters by direction / cadence / tag),
  `BoItemModal` (create: name/unit/direction/cadence/price/ceiling/ownerRef; edit: name/price/ceiling/cadence/
  active + tag assignment — **direction & unit locked after create** per the contract), `BoMovementModal`
  (signed in/out: OUT books +value, IN −value; shows resulting remaining). Shows `remaining / ceiling` for
  stock items. Now the `/items` route.
- **Tags** (`components/partials/BoTags/BoTagsContent.tsx`): create tag groups + values; assignment happens in
  the item edit modal. New `/tags` route (added to the `proxy.ts` guard matcher — it was NOT auto-guarded).
- **Dashboard** reworked to the new P&L shape (`incomeMinor`/`expenseMinor`/`profitMinor` + `byItem` with
  `direction`), pointing at `GET /v1/bo/reports/pl` (was the old ops `/reports/pl`).
- **Nav retired the old ops screens** — `AdminLayout.config.ts` now = Dashboard · Items · Tags (Freelance
  Budgets / FT-PT Salary removed; their route files remain dormant/unlinked — part of the ops-retirement
  cleanup Sober is tracking, mirroring the dormant ops backend routes).

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0**; `bun run build` → **exit 0** (new `/items`, `/tags`, reworked `/dashboard`
  all prerender).
- **Live smoke test** (dev, dummy cookie to pass the presence-guard — real verify is at the bo API): loaded
  `/items` → nav renders exactly **`/dashboard`, `/items`, `/tags`** (old ops screens gone), the bo Items screen
  mounts with the direction filter, no React error; `/tags` mounts too. The item/PL data queries hit the bo API
  (:4010, not running here) → error/empty state, as expected — the render + nav + guard are confirmed.
- ⚠️ **CRUD round-trips not driven** — create/edit/movement/tags/P&L write to / read from the bo DB via the
  :4010 API (not running locally; brownfield). Verified by inspection + typecheck + build; modals reuse the exact
  proven Create/Movement patterns from the old Items screen, against Jason's DONE TASK-022 contract.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **Item DTO carries no tags** (`toBoItemDTO` has no tag field, and `listItems` doesn't join them). So the Items
  list can't display an item's current tags, and the edit modal's tag MultiSelect **can't prefill** existing
  tags (it sets tags via `PUT /items/:id/tags`, replace-all, starting empty). Filtering by tag works
  (server-side `tagValueId`). Options: **(a)** accept for launch (assign works, just no display/prefill);
  **(b)** Jason adds tags to the item DTO (small) so I can show + prefill them. Which? Non-blocking for the core.
  > answer (Sober): **(b) — required fast-follow.** Not just for display: without prefill, an edit that saves
  > tags via the replace-all `PUT /items/:id/tags` would **wipe existing tags** (starts empty) — a footgun.
  > **@Jason: add `tagValueIds` (+ maybe `tags` labels) to the bo item DTO** (join `item_tag` in
  > `listItems`/`getItem`) — small amendment under TASK-022. **@Fern:** then prefill the tag MultiSelect AND
  > only `PUT` tags when they actually changed (don't send an empty set on a name-only edit). Needed **before
  > REQ-006 deploy**; doesn't block accepting the core here.
- **Old ops routes retired by unlinking, not deleting** — I removed `/freelance-budgets` & `/ftpt-salary` from
  nav but left the route/partial files (they still compile against the dormant ops services). Flag if you'd
  rather I delete them now vs. as part of the ops-retirement step after TASK-024/025 land.
  > answer (Sober): **Unlink now, delete later — correct.** Keep the dormant files until the **ops-retirement
  > step** (after TASK-024/025 land and nothing live uses ops) so we delete the ops backend routes + these
  > screens together in one clean pass. Don't delete piecemeal now.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20) — core accepted; **tag display/prefill is a required fast-follow**
(Jason DTO + Fern prefill, above) before deploy. Re-ran `backoffice-front` `bunx tsc --noEmit` → exit 0
(build 0 per notes). `bo.service` hits exactly TASK-022's `/v1/bo/*` routes (items GET/POST/PATCH, movements,
reports/pl, tag-groups/values); Items screen (filters + create/edit with **direction & unit locked after
create**), Movement modal (signed in/out), Tags screen, and the reworked P&L Dashboard
(`incomeMinor`/`expenseMinor`/`profitMinor`) all built; nav retired the old ops screens (unlinked, dormant —
approved). Live CRUD is behind the bo API (brownfield) — accepted; render/nav/guard confirmed. No rework on
the delivered scope. **Backoffice core (021/022/023) is DONE.**
