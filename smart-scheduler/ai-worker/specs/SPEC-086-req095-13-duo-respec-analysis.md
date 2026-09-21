# SPEC-086 — `REQ-095 §13` DUO re-spec — ANALYSIS for the three-way discussion (Sober, 2026-09-20). No build, no recommendation-as-decision.

**The re-spec (customer, via Porter):** DUO = a Private course in every way EXCEPT an editable coach RATE not tied to the teacher's hourly rate; 2 kids "use the SAME course"; UX = a Private/DUO tab on New course + a rate box; the rate editable on Move-session too; leave/expiry = Private.

## §1 What the CURRENT Stage 2a DUO actually does (from the code, TASK-397/398/399/400)
- **The object:** a DUO is a **GROUP booking row per date** (`booking_type GROUP`, `other_kind DUO`, `head_count = 2`, one `group_key` for the series) that HOLDS the teacher slot. It is created first, on its own (`Create group` on the OTHER form: name, teacher(s), time, dates).
- **The kids:** **each child keeps their OWN course** (the owner's §5 ruling, 2026-09-19: "each bought e.g. 10 Hr"). A course is sold INTO the group (`POST /courses { groupKey }` from the group cell) — the course's sessions become SEATS (`bookings.group_id` → the group row of that date; outside the slot index). **Two children = two courses = two entitlements** (own quota, own expiry, own leave, own make-up, own deduction, own check-in, own LINE). Leave/expiry/quota/deduction behave EXACTLY as Private per child — by construction, because a seat is an ordinary course session row.
- **The price:** the course's sale price follows the GROUP's kind (`balance-duo`: 4/6/10 = 6,800 / 9,360 / 14,200; 1h walk-in 1,900) — Stage 2b.
- **The rate:** lives **per TEACHER per group DATE** on the group row (`teacher_rate_minor` for the primary, `booking_teachers.rate_minor` for extras), stored only, never posted, editable through the group's details editor (the Stage 1 `PATCH /bookings/:id/other`). There is **no "teacher hourly rate" anywhere in smart-scheduler** — the backoffice holds pay; so "not tied to the teacher's hourly rate" is already true: the DUO rate is a free number typed on the schedule.
- **Swap teacher:** on the group row from a date on; seats follow; no rate box on the swap (the rate is edited on the row's details).

## §2 Where it diverges from the re-spec
| re-spec says | Stage 2a does | gap |
|---|---|---|
| Private/DUO tab on New course | a group is created on the OTHER form first, then two courses are sold into it from the group cell | **UX** — two steps instead of one; the entry point is the wrong form |
| 2 kids "use the SAME course" | two courses, one per child | **model** — 2 entitlements vs 1 (see §3) |
| an editable coach rate, a rate box | a per-teacher rate per group date, on the group's details editor | **surface** — it exists but not where the customer looks (New course, Move-session) |
| rate editable on Move-session | the group swap has no rate box; the per-date editor has | **surface** |
| leave/expiry = Private | per child, exactly Private | ✅ no gap |

## §3 One shared entitlement vs two — is "the SAME course" coherent?
A single shared entitlement is coherent **only if the SESSION is the unit, not the child**: one course, two names on it, one deduction per session whichever children came, one expiry, one quota. Then:
- **Leave:** if ONE child is sick, the session either still happens (the other child comes; the course is deducted once — the sick child simply missed it, no make-up) or the shop moves it for both. **There is no per-child make-up in a shared pool** — the pool cannot owe half a session. The earlier "คนละ 10 Hr" (each 10 Hr) is the OPPOSITE reading: each child owns hours, each child's absence earns their own make-up.
- **Attendance / check-in / CRM:** per child stays possible (a check-in marks the child; the deduction is per session) — this part is not the problem.
- **Money:** one sale for the pair (a DUO 10 Hr = 14,200 once) vs two sales — the card's DUO prices (6,800 / 9,360 / 14,200) already read as a PAIR price ("Private × ~1.3"), which fits ONE course with two names better than two.
- **The deciding question for the customer:** *when one of the two children is absent, is the session lost for both (one shared pool, DUO = a pair), or does the absent child get their own make-up (two pools, DUO = two Privates sharing a slot)?* Everything else follows from that answer. Stage 2a built the second; the re-spec's words ("the SAME course") say the first; the price card says the first.

## §4 If reworked to the New-course Private/DUO toggle + rate box
**Option A — the shared pool (the re-spec literally):** `course_packages` gains `co_student_id` (the second child) and `class_rate_minor` (the pair's coach rate, editable); the course's sessions are ordinary rows with `student_id` + `co_student_id` and a per-session `class_rate_minor` copied at planning (editable on move — the "rate box on Move-session"); NO group row, NO seats — the slot is held by the one course row as a Private is. Every reader that names a student (grid cell, modal, reminder, LINE, check-in, history, People) learns the second name; leave = the course's (both), make-up = both; check-in per child for CRM. **BE L · FE M** (one migration; the readers are the cost); the price group `balance-duo` stays (one sale per pair). **Stage 2a's DUO kind is retired** from the group creator (`GROUP_KINDS = [GROUP]`), the GROUP object stays for Group (3–12) untouched; existing DUO groups on `uat` (if staff created any since the cutover) need a hand migration or are left to run out — a DATA REQUEST for the count first.
**Option B — keep two pools, fix the surface:** a Private/DUO tab on New course that, in ONE call, creates the group series AND sells two courses into it (`POST /courses/duo { students[2], … }`), a rate box on that form mapped to the group's per-teacher rate, and a rate box on the swap dialog. The model (two entitlements, per-child leave/make-up) stays as built and as the owner ruled on 09-19. **BE S · FE M.** Nothing on `uat` changes shape.
**Option C — A's model with B's size is not available:** a shared pool is a different object; there is no small path to it.

## §5 What I would want settled before any task
1. The §3 question (absence ⇒ lost for both, or a per-child make-up).
2. Whether a DUO sale is ONE sale for the pair (the card's numbers say so) or one per child at the DUO price.
3. Whether "Group" (3–12) keeps the Stage 2a object regardless (I assume yes — the re-spec speaks of DUO only).
4. A count of DUO groups created on `uat` since the cutover (DATA REQUEST: `SELECT count(*) FROM bookings WHERE booking_type='GROUP' AND other_kind='DUO';` — read-only) before choosing A.
