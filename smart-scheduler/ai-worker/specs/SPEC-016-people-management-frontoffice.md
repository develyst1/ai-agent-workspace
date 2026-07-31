# SPEC-016: People management on the frontoffice — parents & students (+ demographics, suspend)
- Source: REQ-019
- Status: ACTIVE — **Q1/Q2 answered 2026-07-31; tasks cut (TASK-048 BE, TASK-049 FE)**

## Overview
Give staff a **People** area on the frontoffice web, beside Teachers: browse/search **parents with their
students underneath**, create/edit both from the web, capture the **demographics** the dashboard needs, and
**suspend** an account without deleting history.

**As-built verified (all of Porter's analysis confirmed):**
- Backend has **`GET /students?q=`** and **`POST /students`** and **nothing else for people** — there is **no
  parent endpoint at all** (no list/get/update), and no student update.
- `parent.service.ts` already has the building blocks: `findParentByPhone`, `findParentByLineUserId`,
  `findOrCreateParentByPhone`, `listStudentsOfParent`, `createStudentForParent`, `createStudent`,
  `searchStudents` (name/nickname/parent-phone, fixed in TASK-033).
- FE nav is calendar · teachers · bookings · badges · dashboard · reports — **no people screen**.
- `parents` = {phone, name, lineUserId, lineLang, note…}; `students` = {name, nickname, parentId, lineUserId,
  crmPoints, crmLevel, note…}. **gender / DOB / province / nationality do not exist on either table**, and
  there is **no suspend concept**.

## Why this one is NOT staged (unlike REQ-020)
I split REQ-020 because its Stage 1 closed a live leak with no UI. Here the opposite holds: the obvious split
(screens now, demographics+suspend later) would **not** unblock anything — REQ-020 Stage 2 is independently
blocked on its own dual-role question — and it would mean **building the same parent/student forms twice**. So
this ships as one piece, once Q1/Q2 are answered.

## CONFIRMED design (Q1/Q2 answered by Porter 2026-07-31)
**Data model** — one additive migration, hand-authored + journal-registered (per `drizzle/README.md`; **no
`db:generate`**), applied by the human via `db:migrate`:
- **`students`:** `gender`, `birth_date` (date — **store DOB, derive age**, never store age), `nationality`.
- **`parents`:** `province` — **the household address** (Porter's refinement, accepted: putting it on the
  student duplicates it across siblings and lets the copies drift).
- **`parents.suspended_at`** (timestamp, null = active).
- All **nullable** (Q3: optional, so LINE self-registration and quick staff entry are never blocked).

> ⚠️ **Gap I must call out with the province-on-parent split — and it changes how REQ-013 must query.**
> `students.parentId` is **nullable by design**: the schema comment says *"Nullable for walk-in/trial students
> created before a parent is known; the LINE flow always sets it."* So a **walk-in / First-Trial student can
> have no parent at all** — and that is exactly the acquisition cohort the dashboard cares about.
> ⇒ **"students by province" MUST be a LEFT join with an explicit "ไม่ระบุ / unknown" bucket**, never an inner
> join. This is the same failure mode Porter just found in the badge report (untagged bookings silently
> vanishing from the totals) — wrong numbers presented confidently. If the unknown bucket turns out large, the
> business fix is **capturing a parent at trial time** (its own REQ), **not** moving the column back.

> ⚠️ **`จังหวัด` name collision (Porter's flag).** The frontoffice already has a **badge type named `จังหวัด`**
> selectable **per booking**. After this REQ there are two, with different meanings. Therefore: **REQ-013's
> demographics read `parents.province` ONLY — never the badge** (stated here so the dashboard can't silently
> pick one), and the UI must label the person-level field unmistakably (e.g. "จังหวัดของผู้ปกครอง (ที่อยู่)")
> while the badge stays an ops tag. Whether that badge is a duplicate to retire is **pending คุณฟีน's answer**
> to Porter and would be a separate small REQ — do not fold it in here.
- **Suspend:** `parents.suspended_at` (timestamp, null = active) — a nullable timestamp rather than a boolean
  gives us "when/whether" for free and reads naturally in history.

**API** (scheduling API, authenticated staff — mirrors the teacher endpoints' shape):
- `GET /parents?q=&limit=&offset=` → parents with their students embedded (search over parent name/phone and
  student name/nickname, reusing `studentSearchConditions`' spirit).
- `GET /parents/:id` · `POST /parents` · `PATCH /parents/:id`
- `POST /parents/:id/students` · `PATCH /students/:id`
- `POST /parents/:id/suspend` · `POST /parents/:id/unsuspend` (effect defined by Q1).
- Nothing is deleted, ever — suspend is the only "off" switch.

**Frontend** (`smart-scheduler-front`, new `/scheduler/people` + a nav entry): a parent list with search;
expanding a parent shows their students; modals to create/edit a parent and a student (with the demographic
fields); a suspend/un-suspend action with a confirm + a visible "suspended" state. Follows the existing
Teachers-screen patterns (Mantine, TanStack hooks, `notify`, i18n keys TH/EN — no hardcoded copy).

**Suspend enforcement (my rec = Porter's lean (a)+(b)):** a suspended parent (1) **cannot use the LINE bot**
(their commands get a short "account suspended, contact staff" reply) and (2) **cannot have new bookings created
for their students**; existing bookings, history and the dashboard are untouched, and the parent stays visible
to staff. This is the reading that makes "stop a bad or unwanted account" true without erasing anything.

## Non-functional
- Backend is source of truth; suspension must be enforced **server-side**, not only hidden in the UI.
- Demographics are **personal data**: they appear on staff screens and in aggregate on the dashboard, but must
  **never** be echoed by the LINE bot to an unauthenticated party (the TASK-047 rule).
- ⚠️ **Delivery standard (carried from the REQ-017 miss):** anything user-facing gets a **real check on the
  actual surface** before it is called done — for this REQ that means the screens exercised in a browser, not
  only `tsc` + `bun run build`.

## Tasks
- **TASK-048** (Jason, BE): migration (student demographics + `parents.province` + `suspended_at`) + the people
  endpoints + **server-side suspend enforcement** (LINE bot + new bookings). (depends on: —)
- **TASK-049** (Fern, FE): the `/scheduler/people` screen — parents with their students underneath, search,
  create/edit modals with the demographic fields, suspend/un-suspend. (depends on: TASK-048's contract)
- **TASK-056** (Jason, BE) + **TASK-057** (Fern, FE): hide suspended households from the **booking** pickers
  (acceptance fix). Both DONE.
- **TASK-058** (Jason, BE) + **TASK-059** (Fern, FE): the **sell-side** block — see below.

## Addendum 2026-08-01 — the FULL definition of "suspended", and what it changes
คุณฟีน closed the last open half: **a suspended household may NOT purchase** ("ไม่ควรซื้อได้"). So the rule is
now complete, and it is one sentence:

> A suspended household cannot use the LINE bot, cannot have **new bookings** made, and **cannot buy** a course
> or voucher. Existing bookings and entitlements are untouched, nothing is deleted, and the family stays
> **fully visible** to staff on the People screen.

**Two consequences, both server-side first:**
1. **Purchase must be blocked at the sale**, not as a side effect. `createVoucher` has **no gate at all** today,
   and `createCoursePackage` only fails incidentally because the sessions it creates hit `insertBooking`'s
   booking gate. Incidental enforcement is not enforcement — it breaks the moment someone reorders the code.
2. **⚠️ My `bookable` opt-in flag is now obsolete, and I'm retiring it.** I introduced it (TASK-056) precisely
   *because* the sell-side answer was open, and blanket-filtering a shared endpoint would have silently changed
   screens nobody had decided about. That reasoning was right with the information available. With the answer
   in, **every** consumer of `GET /students?q=` — the booking picker and both sale modals — wants suspended
   households gone, so an opt-in flag now means *"remember to ask for the policy"*, and a caller who forgets it
   opens a silent hole. **Defaults must be the safe answer.** So: exclusion becomes the default and the flag
   goes. No `includeSuspended` escape hatch is being built — nothing needs one (the People screen reads
   `/parents`), and I won't add a lever on speculation.

**Out of scope, stated so nobody assumes it:** top-ups / extensions of an *existing* entitlement are not
"buying" for this purpose and are unchanged. If คุณฟีน wants those blocked too, that's a separate small REQ.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
> **ANSWERED 2026-07-31 (Porter, his call — operational + reversible):** **Q1 = (a)+(b)** — suspend stops LINE
> bot access **and** new bookings for their students; history/bookings/students untouched and still visible;
> reversible; **enforced server-side**. **Q2 = a refinement of my answer, which I accept:** gender · DOB ·
> nationality on the **student**; **province on the parent** (household address — avoids sibling duplication and
> drift). **Q3/Q4** — proceed as I proposed.
>
> **My technical response to the Q2 refinement (he asked me to reject it knowingly if it cost too much — I
> don't reject it, but it comes with one condition):** the split is the right model, **and** `students.parentId`
> is **nullable by design** for walk-in/First-Trial students, so province-by-student **must LEFT-join with an
> explicit "unknown" bucket** or the trial cohort silently disappears from the dashboard — the identical failure
> he just found in the badge report. That condition is now written into the design above and into TASK-048, so
> REQ-013 inherits it rather than rediscovering it.

- **Q1 — what does "suspend a parent" actually stop?** I recommend Porter's **(a)+(b)**: block LINE bot use
  **and** new bookings for their students; keep everything visible to staff and keep all history. **This is
  load-bearing** — it decides what the booking API and the bot must enforce, so I'd rather have it confirmed
  than infer it. (If คุณฟีน means only "stop the LINE account", that's a much smaller change.)
- **Q2 — whose demographics: student, parent, or both?** I recommend Porter's lean: **the student** (the person
  who trains, which is what the dashboard counts), with the parent keeping name/phone. **Load-bearing** — it
  decides which table the four columns land on, and a migration is expensive to redo. If คุณฟีน wants the parent
  too, say so now and I'll put them on both in the same migration.
- **Q3 (required vs optional) — proceeding on the lean: optional.** Making them mandatory would break LINE
  self-registration, which is a confirmed constraint. Flag only if she disagrees.
- **Q4 (province dropdown + Thai/foreign nationality flag) — proceeding on the lean.** Cheap to change later;
  I'll use a Thai-province list and a Thai/foreign flag, with "foreign" allowing a free-text country.
