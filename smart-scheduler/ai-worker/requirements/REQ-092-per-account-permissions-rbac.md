# REQ-092 — Per-account permissions (menu + action) — the customer wants RBAC (2026-09-17, DISCUSSION)

**Source:** the customer, via the owner, 2026-09-17. **Status: DISCUSSION with the owner — PM shaping a 3-tier priced option. NOT a spec, nothing dispatched.**

## §0 — what the customer asked
> feature permission menu per account + permission action. e.g. this login = admin, all menus EXCEPT dashboard/overview · a "board" login = only the dashboard/overview menus · this admin only handles parents & students (view / support only) · this admin only handles bookings.

## §1 — 🔴 THE PREREQUISITE that changes everything (must be said first)
- **Today there is ONE SHARED staff login; the product has NO RBAC by an explicit past ruling** (owner, 2026-07-29, SYSTEM-FACTS: *"Access is separated BY SYSTEM, not roles — no RBAC"*) and **every action already records `actor = null`** because it cannot tell people apart (SPEC-035 §1).
- ⇒ **"this admin sees only X" is impossible until each admin has their OWN login.** Individual accounts are the FOUNDATION of every tier below — and likely the largest single piece. This request REVERSES the 07-29 stance; that is the owner's to make, in writing.
- The old ruling is not "wrong" — the customer's staff grew; the need is real now. But the price/effort conversation must start from "we are building the login model that was deliberately not built."

## §2 — PM's proposed 3-tier priced OPTION (capability grows; price grows). Actual baht = the owner's.
**Foundation, in ALL tiers:** individual admin accounts + login (replaces the shared login); actions start carrying a real `actor` (a side benefit — an audit trail the product never had).

| Tier | Name | What it does | Maps to the customer's example |
|---|---|---|---|
| **1 — Roles (menu-level)** | preset roles, each = a fixed set of MENUS | A few named roles (e.g. `Full admin`, `Board/overview`, `Front-desk`). An account gets one role ⇒ sees only that role's menus. No per-action control. | "board login sees only dashboard/overview" · "admin sees all except dashboard" |
| **2 — Roles + View/Edit (action-level)** | tier 1 + per-area VIEW-ONLY vs EDIT | On top of menus, a role can be read-only in an area — sit and watch / support only, cannot change data. | "this admin handles parents & students, VIEW / support only" |
| **3 — Custom per-account (full RBAC)** | tier 2 + build ANY role, toggle each menu AND each action per account, unlimited roles | Fully custom: assign exactly booking-only, or any mix, per person; new roles without a developer. | "this admin does ONLY bookings" · anything future |

**Pricing logic to hand the customer (relative, not absolute):** Tier 1 is the foundation + presets; Tier 2 adds an edit/view dimension across every screen (real per-screen work); Tier 3 adds a role BUILDER and per-account matrices (the largest surface, and the one big multi-staff schools actually need). Each tier is a superset of the one below, so it can be sold as an upgrade path — buy Tier 1 now, upgrade later — which itself is a selling point.

## §3 — what PM still needs before real numbers
- 🔧 **@Sober's read of the CURRENT auth**: is the frontoffice admin truly one shared login, or does a login model already exist to build on? How many admin MENUS are there (Tier 1's unit of work) and how many EDIT actions across them (Tier 2's)? That read turns these tiers into hours.
- ⚠️ **`actor = null` everywhere today** — introducing accounts means every write path learns to stamp the actor; whether old history stays `null` (yes, by the REQ-088 §9.1 precedent) is a one-line ruling.
- ❓ The owner: is this sold to THIS customer as one of the three, or built as a product option he offers to many? That changes whether Tier 3 (the builder) is worth front-loading.

## §4 — OWNER, 2026-09-17: single customer (THIS project), but PM produces a 3-OPTION PROPOSAL for the customer to choose; owner attaches BUDGET
> *"เจ้าเดียวแหละ แต่ให้นายทำ option เพื่อไปเสนอลูกค้าให้เขาเลือกว่าจะเอาอันไหน โปรเจคนี้แหละ… เขาขอเพิ่ม ฉันเลยจะคิด budget"*
- **Deliverable = a customer-facing sheet: the 3 options (§2), in plain language, what each gives them, so they pick one.** No developer jargon. The owner fills in the price per option.
- Build only the option the customer picks (single tenant) — but the PROPOSAL shows all three so the customer sees the upgrade path.
- ⇒ PM: (1) get @Sober's effort read so the owner can budget each; (2) write the plain-language option sheet.

## §5 — @Sober's sizing read (2026-09-17) + the customer-facing proposal
**Current auth:** frontoffice = ONE shared credential pair (`ADMIN_USERNAME/PASSWORD` in env), JWT `{sub:username, role:"admin"}`; no user table. Scaffolding that exists: a `role` in the token, an UNUSED `requireRole` middleware, a `role` in the FE session, ONE nav config array (12 entries), the `/api/*` JWT guard. Missing: users, passwords, per-menu/per-action mapping.
**Counts:** 12 menus (Tier 1 unit) · 59 admin mutate routes in ~10 area-groups (Tier 2 unit) · Tier 3 = a user×59-key matrix.
**Sizes (each assumes the one below):** Foundation (individual accounts, BE M + FE S–M ≈ **L**) · Tier 1 per-menu **S–M** · Tier 2 per-action **M–L** (59 FE sites is the bulk) · Tier 3 matrix **M** on top of T2. Migrations: foundation +1, Tier 3 +1.
🔑 **Bonus in ALL options:** the foundation makes the audit trail carry REAL names (today every actor = `admin`) — the delete-student log, expiry edits, resume actor, all become "who".

### The customer-facing sheet (plain language; owner fills the price)
**All three options include individual staff logins (each person their own username) — so the timetable finally records WHO did what.**
| Option | You get | Good for |
|---|---|---|
| **A — Menu access** | Each staff login sees only the menus for their job (a front-desk login sees the calendar & bookings; a "board" login sees only the dashboard/overview; a full admin sees everything). | teams where the split is simply "who sees which pages" |
| **B — Menu access + View-only** | Everything in A, plus: a login can be set to LOOK but not CHANGE in an area — e.g. a support person watches parents & students without editing. | a support/observer role that must not change data |
| **C — Full custom per person** | Everything in B, plus: build any role yourself and switch each menu and each action on or off per person (e.g. "this login does ONLY bookings"). Unlimited custom roles, no developer needed. | many staff with different, changing duties |
**Upgrade path:** A → B → C; buy A now, upgrade later — nothing is thrown away.

## §6 — OWNER: GO, build the FULL system (option C), 2026-09-17
> *"ทำไปเลย full system 1.super admin can register and manage menu permission and action permission 2.create role permission and assign to user and etc ทำไปเลย ไม่ยากหรอก"*
**Confirmed GO — build Tier 3 (full RBAC), budget locked at 2,900.** Core requirements:
1. A **super admin** who can register users and manage **menu permissions AND action permissions**.
2. Create **roles** (a role = a set of menu + action permissions) and **assign roles to users**.
3. "and etc" — the full matrix: per-user overrides, enable/disable a user, reset password.
🔑 **Roles/menus/permissions are configured AT RUNTIME by the super admin** — not defined up-front by the customer (that is the point of the custom tier). The only bootstrap need: the FIRST super admin account (@Sober picks env-seed or a one-time bootstrap). Old history stays `actor` = the shared name for pre-cutover rows (the REQ-088 §9.1 "leave the past" precedent); new actions carry the real user.
**Delivery = STAGED (Porter): Stage 1 foundation (users + auth + super-admin + user CRUD) → Stage 2 menu-level guard → Stage 3 action-level guard → Stage 4 role builder + per-user matrix.** Each stage its own sid→QA→uat, so value lands and risk stays small. Migrations: foundation +1, matrix +1.
