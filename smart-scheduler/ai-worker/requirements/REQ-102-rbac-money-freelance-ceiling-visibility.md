# REQ-102 — RBAC: permission to view money figures + Freelance salary ceiling

**Source:** customer (Khwan) via owner, 2026-09-21. **Status: DISCUSSION — recorded; feasibility read requested from @Sober; owner rulings pending.**

## §1 — the ask (verbatim intent)
"ทำสิทธิ์ ในการมองตัวเลขเงิน เพดานเงินเดือน Freelance" — a **permission (RBAC) that controls who can SEE money figures**, including the **Freelance salary ceiling** (`freelance_budgets` / the freelance ceiling feature, REQ-009 lineage). i.e. money numbers should be hideable from users who lack the permission.

## §2 — for @Sober (feasibility + size, no build yet)
- The system already has option-C RBAC (~55 action keys, per-user matrix, roles). **Is there a money-visibility permission key today?** If money figures render unconditionally, what surfaces show them (SOM dashboard, revenue-by-customer, the freelance ceiling / `freelance_budgets`, sale amounts on bookings/courses, payroll-adjacent views)?
- Design: ONE "view money" action key, or granular (e.g. `finance.revenue`, `finance.freelance-ceiling`)? Recommend, with the fail-closed default (hidden unless granted, matching the option-C scope-is-the-link pattern).
- Which surfaces must gate: list them. The Freelance salary ceiling is explicitly named by the customer — confirm where it shows and how it's gated.
- Size per piece; flag owner decisions (granularity; whether super_admin always sees; whether teacher-linked users are auto-denied).

## §3 — note
Money reporting largely lives in the backoffice per the §4.1 lock (REQ-095) — confirm which money figures are IN smart-scheduler (and thus gateable here) vs backoffice-only.

## §4 — OWNER SCOPE + RULINGS 2026-09-21 — NARROWED to the Freelance ceiling only
Owner: "REQ นี้คุยกันแค่ เพดานเงิน freelance ที่ frontoffice" — the ask is ONLY the **Freelance salary ceiling / remaining** (`freelance_budgets`) on the frontoffice (smart-scheduler). **NOT** a system-wide money mask.
- **In scope:** gate visibility of the freelance ceiling/remaining figure behind a permission (fail-closed, nobody by default); **AND close the `GET /teachers` leak** (it ships every coach's freelance budget to a REQ-097 teacher account — hidden only at the FE today). Teacher role never holds the key.
- **OUT of scope (per owner):** price cards, discount block, posted-sale reads, the coach rate (§13.3), the reports. Do NOT mask those.
- Decisions 5/6/7 resolved by the narrowing: ONE narrow key for the freelance ceiling; prices/sales untouched; Teacher role denied. GO build. BE S–M · FE S · no migration.

## §5 — final owner ruling 2026-09-21
- **A (mask scope):** ACCEPTED as-built — the ONE key `teachers.budget-view` masks the coach's **hourly rate + ceiling + remaining + reorder** (the rate is more sensitive and the ceiling derives from it). Not just ceiling+remaining. Nobody by default; Teacher role never holds it; a linked teacher token reads nulls whatever its role; the two budget-write acts need both keys.

## §6 — ADDITION (customer, 2026-09-22): a SEPARATE key for the coach-rate (ค่าสอน §13.3) — VIEW=EDIT coupled
Customer (Khwan): if there's a menu to EDIT the coach rate (ค่าสอน — the §13.3 teaching rate on courses/DUO/Move-session, NOT the freelance budget), it needs **its OWN permission**, and it must be **"can see AND edit" as one** — there is **no see-only state**: if you can see the ค่าสอน you can edit it; if you're not allowed to see it, you can't edit it either.
- ⚠️ This **revises the §4 exclusion** ("the coach rate (§13.3) — do NOT mask"): the ค่าสอน is now in scope, but as a SEPARATE key from `teachers.budget-view`, and with the view↔edit coupling.
- **⇒ @Sober size:** a new key (e.g. `coach-rate.manage`) gating BOTH visibility and edit of the §13.3 rate on every surface it shows/edits (course card, session/Move-session popup, DUO rate box). Without it: the rate figure is hidden AND the edit control is absent. With it: visible + editable. No view-without-edit. Fail-closed, Teacher role never holds it. Fold into the REQ-102 work if cheap, else a small follow.

## §7 — customer confirm 2026-09-22: the two keys are INDEPENDENT
The **Freelance-ceiling view** key (`teachers.budget-view`) and the **coach-rate (ค่าสอน §13.3)** key are SEPARATE, different concerns, granted independently — holding one says nothing about the other. Two distinct keys, not one combined "money" key.

## §8 — key-59 (coach-rate) final rulings 2026-09-22 (owner: "เอาตามที่นายแนะนำ")
- **Q1 — decouple create from the rate perm:** the coach rate (ค่าสอน) is **OPTIONAL at create** — a user WITHOUT key 59 can still CREATE a DUO/course (the create door is NOT blocked); they just don't see/set the rate; a manager with key 59 fills it later. Rationale: ค่าสอน = coach PAY (expense), separate from the student price (the DUO card, ungated) — creation/selling must not require money-sight.
- **Q2 — key 59 gates the coach rate EVERYWHERE, but ONE key (not many):** the ค่าสอน/per-teacher rate on **course · DUO · Move-session AND ECA/Group (Stage-1 `other.teacherRates`)** all masked+gated by the SAME key 59 (see⇔edit). A coach rate is a coach rate wherever it shows — hiding it on courses but showing it on ECA would leak. NOT separate per-type keys.
- **Two keys total** stay independent (§7): `teachers.budget-view` (freelance ceiling/remaining/hourly rate) and key 59 `bookings.coach-rate` (view+edit the ค่าสอน everywhere). Holding one says nothing about the other.
