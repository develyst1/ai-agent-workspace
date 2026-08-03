# TEST-024: Bookings page — search & filtering on every tab
- Source REQ: REQ-024
- Status: IN_TEST
- Environments: dev-server (`sid` = som.develyst.online) — API level only this round
- Tested: 2026-08-01 by Tanya

## Scope

This round covers REQ-024's **backend-observable** acceptance against `sid`, driven through the
scheduling API (`/api/bookings`). It deliberately does **not** cover the painted FE behaviour
(tab bar, URL-persisted filters, the collapsed-date-input fix TASK-081, sort *controls* in the UI) —
those need a composited browser and are a separate round once the batch is deployed.

**Why API-level and why it still matters:** Porter's own acceptance ([evening-34]) was 4/5 and is
explicitly *not* a QA pass. The two ACs that decide whether the customer's actual complaint is fixed —
search matches nickname + parent phone (AC3), and the list defaults to upcoming with a header that
sorts-not-filters (AC2) — are both answerable from the API without touching the DOM.

## Deploy-state finding (report this first — I believed the server, per Porter's instruction)

**`sid` is running a build where REQ-024 is only HALF present.** This disagrees with the board, which
carries REQ-024 as *"DELIVERED (pending the fix deploy)"* in a **parked** batch. Evidence:

| Probe | Result | Means |
|-------|--------|-------|
| `GET /bookings?q=<nickname "kcik">` | `total:1` | nickname search **is live** |
| `GET /bookings?q=<a parent phone>` | `total:16` | parent-phone search **is live** (old search: name+subject only → would be 0) |
| `GET /bookings?sort=date_asc` vs `sort=date_desc`, limit 200 | **identical order, same ids**, both start 2026-07-01 while data runs to **2026-09-23** | sort param is **ignored** — TASK-073 **not deployed** |
| `GET /bookings?sort=NONSENSE` | `200` (not 400) | the `z.enum(["upcoming","date_asc","date_desc"])` from TASK-073 is **not in the deployed schema** |
| `GET /bookings?from=2026-09-01&to=2026-09-30` | `total:11`, every row in range | arbitrary from/to **is accepted** (always was — the API side of AC4) |

So on `sid` today: **search works, sort does not.** Whether that means "REQ-024 search shipped, sort
didn't" or "search predated REQ-024 and the whole REQ is unshipped" is a **deploy-state question for
Porter** — either way the sort AC cannot pass here yet. This is not a code defect; TASK-073 may be
perfectly correct and simply not on the server.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | AC3 — search matches student **nickname** | happy | `GET /bookings?q=kcik` (student name is "kick", nickname "kcik") | ≥1 booking, found via nickname not name | `total:1` | **PASS** |
| 2 | AC3 — search matches **parent phone** | happy | `GET /bookings?q=<parent phone>` | the child's bookings returned | `total:16`, 0 before REQ-024 | **PASS** |
| 3 | AC2 — sort is a **sort, not a filter** (count unchanged) | happy | compare `total` across `sort=upcoming/date_asc/date_desc` | all equal | all `79` | **PASS** (count invariant holds) |
| 4 | AC2 — header flips order (sort works) | happy | `date_asc` vs `date_desc`, limit 3 | different order; desc starts at the max date | asc→2026-07-01…, **desc→2026-09-23,17,16** — orders differ | **PASS** (re-checked 2026-08-02 after `sid` redeploy) |
| 5 | AC — unknown sort rejected, never silent fallback | negative | `GET /bookings?sort=NONSENSE` | `400` | `400` | **PASS** (2026-08-02) |
| 6 | AC4 — custom date range filters | happy | `GET /bookings?from=2026-09-01&to=2026-09-30` | only Sep rows, total < 79 | `11`, all in range | **PASS** (API side; the FE date-input widget is a separate painted round) |

## Defects

None that are code defects. The sort/enum ACs are **unshipped on `sid`**, not broken — see the
deploy-state finding. If a deploy lands and `sort=date_desc` still returns ascending order, *that*
would be a defect; today there is nothing to file against the engineers.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| (none) | — | ✅ Entire round was read-only GET. No records created, logged in as the shared staff account. |

## Verdict

`IN_TEST` — **API level PASS; the only remaining gate is a painted defect I cannot reach.**
- **PASS (2026-08-02, `sid`):** search by nickname + parent phone (AC3); sort works and rejects unknown
  values (AC2 — orders differ, `NONSENSE`→400); sort-not-filter count invariant; custom date range at the
  API (AC4). **Yesterday's blocker cleared** — `sid` was redeployed during today's recovery, so TASK-073 is
  now live; my "sort not deployed" finding is resolved, not a defect.
- **NOT TESTED — blocked, not failed:** the **collapsed custom-date-input fix (TASK-081)**. It is *painted*
  (input pixel widths), so it needs a composited browser measured at 1600/1280/768/375 per the board standing
  rule. **I cannot drive the authenticated `sid` UI** — the bookings page is behind login and I do not enter
  passwords into a login field. Board also lists the tab bar + URL-persisted filters as painted; same block.
- **Consequence:** REQ-024's closure now hinges **solely** on that one painted item, exactly as Porter said.
  It is the one thing my role structurally can't verify — see the Questions block for how to unblock it.

## Questions

- **@Porter:** the board says this batch is *parked/undeployed*, but `sid` already serves the
  nickname/phone search. Is `sid` ahead of the board, or did that search predate REQ-024? I need the
  real deploy state before I can call REQ-024 anything but partial — my verdict depends on knowing
  whether TASK-073 is "not shipped" (wait) or "shipped and broken" (defect).
