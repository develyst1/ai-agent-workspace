# REQ-026: Tidy the frontoffice navigation — four "statistics" menus is three too many

- Status: READY_FOR_SA
- Priority: **MEDIUM — but the STAGE 1 half is wanted NOW** (stakeholder, 2026-08-01: *"ทำตอนนี้เลย ปิดเมนูที่อ่อนซ่อนไว้ก่อนก็ได้"*)
- Requested: 2026-08-01 by the project owner, on sight of the live nav
- Deadline: Stage 1 before go-live (2026-08-20). Stage 2 is not deadline-bound.
- Source: stakeholder, looking at the deployed sidebar: *"menu เลอะเทอะไปมั้ย · ทำไม dashboard ต้องแยกกัน"*

## Problem / Goal

The frontoffice sidebar now carries **four separate screens that all mean "look at numbers"**, and nothing tells
a staff member which one to open:

| Menu | What it actually shows | Period |
|---|---|---|
| **Dashboard** | booking counts **by badge** and **by teacher** — that's all | user-picked range |
| **SOM dashboard** | customers · sport share · new vs renewing · demographics | snapshot |
| **Daily report** | attendance rate · by type · teacher workload | one day |
| **Needs attention** | what needs doing today | today |

**Why it happened — worth stating, because it is not a design decision anyone made.** These were built at
different times: "Dashboard" existed first, "Daily report" followed, and "SOM dashboard" was added as a new
screen because REQ-013 was specified as a new screen. **Nobody ever stepped back and looked at the four
together.** The stakeholder did, on the deployed build, and said so immediately.

Goal: a staff member can tell **from the menu alone** where to look.

## Requirement

### 🔴 Stage 1 — do now (the stakeholder's explicit ask)
1. **Hide the old "Dashboard" menu entry.** **Hide, do not delete** — the route and its code stay, so nothing
   is lost and it can come back inside Stage 2.

### 🟡 Stage 2 — after go-live, unless the SA finds it's cheap enough to fold in
2. Consolidate the remaining statistics screens along the line of **who is asking and how often**:
   - **"Overview"** — the business question (*how is the school doing?*). SOM dashboard as the base, with the
     old Dashboard's by-teacher / by-badge counts folded in as a section **if** they still earn their place.
   - **"Today"** — the operational question (*what do I need to do?*). Daily report + Needs attention answer
     the same question at the same cadence and are opened by the same person each morning.
3. Re-check the **"Bookings / Students"** label while in there — it names two things and is neither.

## Acceptance Criteria

- [ ] The old "Dashboard" entry is gone from the sidebar; **its route still works if visited directly.**
- [ ] SOM dashboard, Daily report and Needs attention are unaffected.
- [ ] No other navigation or permission behaviour changes.

## Analysis / current state (Porter, read-only 2026-08-01 — verified before proposing removal)

**Hiding the old Dashboard loses almost nothing, and I checked rather than assumed:**
- **"By teacher" is already duplicated, and better, elsewhere.** `ReportsContent` renders a teacher **workload**
  section with sessions *and* attended counts; `DashboardContent` shows a bare count. The Daily report is the
  strictly richer view.
- **"By badge" is the only unique content** — and it stands on the badge system the stakeholder has parked as
  her own provisional tagging (REQ-021), which additionally has a known defect: **the badge report silently
  drops untagged rows.** So the one thing we'd lose is the one thing we already know is unreliable.
- ⇒ The screen contains **what is duplicated** plus **what is not yet trustworthy**. Nothing that hurts to hide.

Files: `components/partials/Dashboard/DashboardContent.tsx` (2 tables), `partials/Reports/ReportsContent.tsx`,
`partials/...` for the SOM sections; the sidebar is where Stage 1 happens. Routes live under `app/**/dashboard`,
`/som`, `/reports`, `/attention`.

## Constraints

- Frontoffice only. **No backend change** — Stage 1 is a navigation change, and the dashboard endpoint keeps its
  caller until Stage 2 decides its fate.
- **Do not delete the screen or its endpoint in Stage 1.** Hiding is reversible in one line; deleting is a
  decision that should be made with the SOM dashboard's merged layout in front of you, not in a hurry.
- HOW (menu grouping, whether to merge or tab) is the SA's design.

## Out of Scope

- Badge system fixes → REQ-021 (parked, lowest priority).
- Any change to what the SOM dashboard or Daily report *compute*.

## Questions

1. **Stage 2 shape** — do "Overview" and "Today" match how คุณฟีน and the admins actually work, or is the split
   Porter's tidiness rather than theirs? *(Porter's reasoning: the two answer different questions — "how is the
   business doing" vs "what do I do today" — at different frequencies, for different people. Owner-level
   screens are opened monthly; the morning screen is opened daily. Worth confirming against real habit before
   building it.)*
2. **Do the by-badge counts deserve to survive** into the merged Overview, or should they wait for REQ-021 to
   make badges trustworthy first? *(Porter's lean: wait. A filter by an imperfect tag is honest; a **count** by
   an imperfect tag is a wrong number that looks right.)*
