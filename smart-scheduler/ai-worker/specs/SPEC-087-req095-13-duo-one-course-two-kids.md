# SPEC-087 — `REQ-095 §13.1/§13.2` DUO = ONE course, TWO kids (locked by the customer, 2026-09-21) — design + sizes (Sober). Supersedes SPEC-081's DUO (the GROUP-row DUO is retired; GROUP 3+ stays).

**Locked:** one course, one entitlement, two kids on it — shared hours, shared leave quota, shared expiry; any kid's leave/attendance deducts the shared pool. Both attend every session (fixed day/time/teacher, Private-style). An editable **ค่าสอน** (coach rate) on the course, not tied to any teacher rate, editable after a swap/move. UX: New-course **Private / DUO** toggle; DUO ⇒ rate box + second-child picker. Canonical: "Duo Inline Skate 10 Hr" — น้องคราม & พราว, 10 Hr shared.

## §0 What this means in the code (the read)
- A DUO course IS a Private course (`course_packages` + weekly `COURSE_PACKAGE` session rows, one slot holder, the reconcile, expiry, leave quota, the day-end deduction) **plus a second child on the same rows**. Nothing about the pool changes: the session is the unit already (one row, one deduction, one leave, one make-up). What changes is **who the row names** and **who gets told**.
- The Stage 2a DUO (a GROUP row + two courses as seats) is the opposite model and is retired for DUO; the GROUP object stays for Group (3–12).

## §1 The design (one migration, `0048_duo_course`)
1. **Schema:** `course_packages.co_student_id uuid NULL FK students RESTRICT` (the second child; NULL = Private) · `course_packages.class_rate_minor int NULL` (the DUO coach rate, VAT-free satang, editable; NULL on a Private) · `bookings.co_student_id uuid NULL FK students RESTRICT` (copied from the course at planning/append/move so every reader of a session row sees both names without a join) + a partial index. Witness = `bookings.co_student_id`'s index. No enum.
2. **Create:** `POST /courses { …, duo?: { coStudentId, classRateMinor } }` — the two children must be different, both active (REQ-093), both bookable (suspension — either household suspended ⇒ refused); the price group = **`balance-duo`** when `duo` is present (the Stage 2b resolver keyed by a `courseKind` = `DUO | PRIVATE` instead of the group kind — one mapping, the DUO branch moves); **ONE sale for the pair** at the DUO card price, attributed to child 1's household (⚠ §3.1). Every planned session carries `co_student_id`.
3. **The rate:** on the COURSE (one number, `class_rate_minor`); `PATCH /courses/:id { classRateMinor }` (course-edit); the Move-session dialog gets a rate box that edits the SAME course field (⚠ §3.2 — course-level, not per session). Stored only, never posted (the backoffice lock).
4. **Readers that must see the second child** (the cost of the task): the grid cell + modal (two names), the reminder rows (both households' devices — `parentLineUserIds` for BOTH student ids; the coach's line names both), the confirm/cancel/deduction/leave notices (both households), the parent LIFF schedule + course view (the co-student's family sees the course too — reads by `student_id` gain `OR co_student_id`), People (the course listed under BOTH children; the co-student's card says "DUO with X"), the eligible-student picker (a DUO course is bookable for either child's name), check-in (the QR marks the SESSION; CRM points to BOTH children ⚠ §3.3), history/deduction records (per course — already shared), the SOM report (one course, two students counted? ⚠ §3.4).
5. **Leave / make-up / expiry / pause / end:** untouched — the course's, therefore both children's, by construction. A sick-leave on the session is the pair's (one make-up row, both names).
6. **Retire the GROUP-row DUO:** `GROUP_KINDS = [GROUP]` for creation (validator + `Create group` UI); `DUO` stays readable in the kind list so existing rows render; `balance-duo` pricing for a course sold INTO a group dies with it. **Existing Stage 2a DUO groups on `uat`:** count first (⚠ §3.5, a read-only DATA REQUEST); recommend NO data migration — they run out as built (two courses, seats), staff create new DUOs the new way.

## §2 Sizes
| | BE | FE |
|---|---|---|
| **DUO course (create, rate, readers, notices to both households, price, retire the group DUO)** | **L** (`0048`; ~12 read/notice sites) | **M–L** (toggle + second-child picker + rate box; both names on cell/modal/People/LIFF; rate box on move; DUO tag; `Create group` loses DUO) |
1 migration (`0048` ⇒ 49); no new key (rides `bookings.course-create` / `course-edit`); no new reason code.

## §3 Decisions for the OWNER (flag; recommendations)
1. **The sale's household:** ONE sale for the pair at the DUO price, attributed to child 1's household (the payer) — or two half-sales? *Recommend one, child 1; the receipt names both children.*
2. **The rate is course-level** (one number for the course, editable from the course and from the move dialog) — not per session. *Recommend course-level.*
3. **CRM points on a DUO check-in:** both children (recommend) or only the scanning family.
4. **Reports:** a DUO course counts as one course, two students (recommend).
5. **Existing Stage 2a DUO groups on `uat`:** leave them to run out (recommend) vs a hand migration; needs the count.
6. **Leave rule reminder:** a single child's absence is NOT a leave (the pool cannot owe half a session) — the session either runs for the other child or the shop moves it for both. Confirm this is understood by the customer (it follows from "1 course = 1 pool").

## §4 Non-goals
No per-child hours; no DUO-specific status; no change to Group (3–12) or the GROUP object; no posting of the rate.
