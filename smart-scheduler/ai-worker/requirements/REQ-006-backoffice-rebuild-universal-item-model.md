# REQ-006: Backoffice rebuild — universal "item" model on the shared database (DESIGN-FIRST)
- Status: DESIGN APPROVED → IN_SPEC (build) · 2026-07-20
- Design: `ai-worker/db-design-REQ-006.md` — universal item/movement model on the shared DB (schema
  `bo`) APPROVED by คุณฟีน.
- **UPDATE 2026-07-20 — NO approval system.** คุณฟีน reversed the earlier decision: **remove the
  OWNER/STAFF maker-checker approval flow entirely — every action is direct, no approval.** Drop
  `approval_request` + the role-gating. A single backoffice admin login remains (REQ-002-style JWT);
  no OWNER/STAFF distinction unless asked later. → Sober to update the design to rev.3, then cut build SPECs.
- Priority: HIGH
- Requested: 2026-07-20 by คุณฟีน (stakeholder)
- Deadline: none

## Problem / Goal
The current backoffice is **over-complex and got the model wrong** (per stakeholder review).
Rebuild it around **one simple idea**: everything is an **item** with a **unit** whose
quantity **goes in and out** via API commands.

**⛔ DESIGN-FIRST — do NOT build yet.** The first (and only, for now) deliverable is a
**database design** for stakeholder review: show the **current single-DB schema as it
really is (as-built)** and the **proposed new model**, plus an honest **gap analysis of what
the current backoffice got wrong**. Stakeholder approves the design **before** any code.

## The model (stakeholder's vision — to be captured in the design)
- **Everything is an `item`** with a **unit**: บาท / ชั่วโมง / ขวด / ชิ้น / แก้ว / … (extensible).
- Each item has **movements** — quantity **in / out (เพิ่ม/ลด)** — driven by **API commands**.
- Each item is classified on **two axes**:
  1. **Direction:** `INCOME` or `EXPENSE`.
  2. **Cadence:** **fixed cost** (`per month` / `per day` / `per quarter`) **or not-fixed**
     (variable in/out that may differ each cycle).
- An item can carry a **ceiling / remaining** that behaves like **stock**.
  - Example: a freelance's income ceiling, unit = baht, `12,000 / 12,000`. When the
    frontoffice books a job it **calls the API to decrement** → `10,000 / 12,000`.
- The frontoffice (and future clients) drive item movements **through the API**.

## Key constraints (stakeholder-mandated)
- **Shared database:** the new backoffice uses the **same PostgreSQL database as the
  frontoffice** — not a separate DB. (SA to propose how: shared schema vs a schema in the
  same DB; and how the frontoffice reaches it — same-DB access and/or an API.)
- **Simplicity over the old design** — far fewer tables than the current `ops` (14 tables);
  the universal item + movement + type model should be the backbone.
- Supersedes the **current backoffice** (old `ops` app + item-centric P&L build). The old
  code may stay dormant/reference during the rebuild.

## Deliverable for THIS requirement (the review gate)
A **DB design document** (Sober) containing:
1. **Current as-built** — the real single-DB schema today: frontoffice `public.*` +
   backoffice `ops.*`, tables and their purpose, **as they actually are**.
2. **Gap analysis** — concretely **what the current backoffice got wrong / is over-built**
   vs the universal-item vision (so the stakeholder sees why a rebuild).
3. **Proposed new model** — the universal `item` + `movement` + type(direction, cadence) +
   ceiling/remaining design, in the **shared DB**, with an ERD/diagram and 2–3 worked
   examples (freelance ceiling; a product like water bottles; a fixed monthly cost).
4. How the **frontoffice interacts** (API surface for item movements; how REQ-004's local
   freelance budget reconciles with — or migrates back into — this model).
Kept concise and reviewable. **No implementation tasks until the stakeholder approves.**

## Acceptance Criteria (for the design gate)
- [ ] Stakeholder can see the **current single-DB design (as-built)** clearly.
- [ ] The **gap analysis** names the concrete mistakes/over-engineering in the current backoffice.
- [ ] The **proposed universal-item model** is shown with an ERD + worked examples, on the shared DB.
- [ ] The freelance-ceiling-as-stock example maps cleanly onto the proposed model.
- [ ] Stakeholder reviews and **approves / requests changes** before any build REQ is cut.

## Out of Scope (for now)
- Any implementation / migration (comes after design approval, as follow-up REQs).
- FT/PT salary specifics, POS UI, reports — captured only insofar as they fit the item model in the design.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
- SA: "Same database" — confirm the intended shape: one PostgreSQL, new backoffice tables
  in the **same DB** (a schema alongside `public`), frontoffice reaching items via API and/or
  direct same-DB access? Porter will route specifics to คุณฟีน as the design takes shape.
  > SA (Sober): **Proposing — one PostgreSQL, new backoffice tables in a dedicated schema (e.g. `bo`)
  > alongside `public`, and the frontoffice reaches items TWO ways**: (a) **direct same-DB access** for the
  > hot/atomic path (e.g. decrement a freelance ceiling **in the booking DB transaction** — no HTTP, atomic),
  > and (b) the **backoffice API** for admin CRUD + reporting. The shared-DB constraint is exactly what makes
  > "universal item model owned by backoffice" **and** "atomic frontoffice enforcement" compatible — the old
  > separate-service HTTP model couldn't do both (that's what REQ-004 had to escape). Details in the design doc;
  > route to คุณฟีน as it firms up.
- SA: Should the **freelance ceiling** (just moved local by REQ-004) be **re-absorbed** into
  this universal model (backoffice owns items in the shared DB, frontoffice calls the API) —
  i.e. REQ-004 was the interim standalone step, and this rebuild brings it back as an "item"?
  > SA (Sober): **Yes — REQ-004 was the interim standalone step; the rebuild re-absorbs the freelance
  > ceiling as a universal "item"** (unit=baht, direction=EXPENSE, cadence=FIXED_MONTHLY, ceiling/remaining =
  > stock). **But** because it's the SAME DB, we keep REQ-004's atomic decrement: the frontoffice writes the
  > item movement in the booking's own transaction (direct same-DB), rather than reverting to a cross-service
  > API call. So `freelance_budgets` maps 1:1 onto the new `item`/`movement` tables — a clean migration, no
  > loss of atomicity. The design doc shows this as worked-example #1.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-006 | Backoffice rebuild — universal "item" model on the shared DB | HIGH | ✅ **DELIVERED** | **Deployed + acceptance PASSED 2026-07-28** (stakeholder ran, Porter verified). Code DONE & Sober-verified: TASK-027 (shared `smart_scheduler` DB + retire ops) · TASK-028 (freelance money leak fixed — ATTENDED↔SICK_LEAVE toggle no longer inflates) · TASK-029 · TASK-030 (drift-safe `migrate:bo`). Re-deploy done: `migrate:bo` skipped the drifted `ops`, migrated freelance budgets; both backends restarted on `smart_scheduler`. **Non-blocking follow-ups:** verify the FULL freelance roster's budgets in FE (migrate carried only `freelance=1`); re-home TRIAL/SINGLE revenue → `bo`; tag-prefill; `bo.movement` unique-index; **REQ-009** (type-change budget close). |
```
