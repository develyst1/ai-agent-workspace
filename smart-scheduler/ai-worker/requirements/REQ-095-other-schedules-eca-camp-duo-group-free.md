# REQ-095 — "Other" schedules: ECA · Camp · DUO/Group · Free/KOL (2026-09-18)

**Source:** the customer, via the owner, 2026-09-18, spreadsheet PDF (`Status Update - Other.pdf`, archived). **Status: DISCUSSION — PM understanding + questions; feasibility read requested from @Sober. Nothing dispatched.**

## §0 — the four TYPES, digested
Common: จำนวนครู = ตามจำนวนเด็ก · ค่าสอน = per-teacher, editable (not equal).

### ECA (teachers go OUT to a school)
No course, NOT about money — "จองตารางครู ระบุว่าคลาสอะไร โดยไม่เกี่ยวข้องกับเรื่องเงิน". Students: a COUNT or SCHOOL name, a Note field wanted; "ไม่จำเป็นต้องมีคอร์ส". Several teachers, own editable rate (Ek/80, Bank/90, Haris/100). Program name + schedule title writable. Time: fixed by the school, all sessions up front (e.g. Tue 14:00-16:00 ×12, may skip weeks) but EDITABLE. "ฟิกเหมือน Private แต่ 1 คลาสหลายคน".

### Camp
Each child BUYS a camp package; check-in cuts BY DAY. Teachers rotate freely, NOT locked. Per-teacher editable rate (Jo/50, Mark/30, Mu/50). Kids come and go — add/remove per day. Packages differ per kid: Full Day Full Week · Full Day Half Day · Daily×3 · Daily×2 · Half Day×1 (different date ranges/half-days). Program name writable (Balance Camp 7-11 Sep).

### DUO / Group
DUO: teacher fixed like Private in all EXCEPT the rate (editable, different). Group: kids fixed schedule; teachers added/removed by count; a main teacher but assign several. Program bound to course. Per-teacher editable rate. e.g. DUO คราว&พราว · Inline Skate 10Hr (each buys Balance Group 10Hr) · recurring Sun 13:00 · conditions = Private. Group ซุปซุป/Jorah · Sun 15:00.

### Free / KOL / อื่นๆ
"แบบที่พี่โด่งทำมาเลย" — a FREE schedule: the class + who teaches, WITHOUT cutting a course or counting revenue. No course.

## §1 — the axes that separate them
| type | course/student in system | money | teacher rate | teacher locked | student repr | multi/class |
|---|---|---|---|---|---|---|
| ECA | NO | NO | per-teacher editable | — | count/school/Note | YES |
| Camp | YES (camp package) | YES | per-teacher editable | NO (rotate, cut by day) | each child | YES, per-day flexible |
| DUO/Group | YES (course) | YES | per-teacher editable (≠Private) | Duo fixed / Group main+assignable | named | Duo 2 / Group many |
| Free/KOL | NO | NO | specify who | — | — | — |

## §2 — QUESTIONS to the owner (2026-09-18, pending)
1. Teacher pay rate (ค่าสอน): stored/edited/REPORTED in smart-scheduler, or a label? An EXPENSE for the BACKOFFICE?
2. ECA + Free/KOL: = reserve the teacher's slot + writable label + Note, no student records; does it BLOCK the teacher's slot?
3. Camp: packages (Full/Half/Daily×N) new products or existing courses? how is flexible per-day/per-child attendance done?
4. DUO/Group: each child buys a normal course, then grouped into one recurring slot, regular teacher, only rate differs — right?
5. Order: ECA/Free → DUO/Group → Camp?

## §3 — feasibility read from @Sober
Does a teacher PAY RATE exist today? any NON-REVENUE booking (reserve a slot, no sale)? multi-student-per-slot / camp packages? DUO/Group grouping on the booking model? reuse vs net-new per type + sizes.

## §4 — customer (Khwan) answers, 2026-09-18
1. **Money ALL to the backoffice** ("เรื่องเงินเข้าหลังบ้านหมด"). Khwan bounced back to the owner: which part does he mean — the schedule view or course creation? **PM's proposed lock (owner to confirm): the teacher RATE is entered/shown/EDITABLE on the Other SCHEDULE (per teacher per class — the customer needs it editable), STORED here, and PASSED to the backoffice as the expense; smart-scheduler does NOT do payroll/expense reporting.** ⇒ "on the schedule, not course-create; the money surfaces in the backoffice."
2. ✅ **ECA + Free/KOL confirmed:** reserve the teacher's time, NO class, NO students (just a head COUNT). (Blocks the teacher slot.)
3. **Camp = a NEW course "Balance camp"** with a package pick: **Full day/Full week · Full day/Daily · Half day/Full week · Half day/Daily**; choose which days to attend; **cuts BY DAY; unused days CARRY OVER to another (open) week, or PAUSE** — e.g. buy 5 days, sick 1 this week ⇒ 1 left, keep it for a future open week or pause. ⇒ a DAY-BASED entitlement with a carry-over/credit + pause.
4. **DUO/Group:** teachers mostly the SAME but swap sometimes (not locked); rate abnormal, EDITABLE. **DUO = TWO kids in the SAME course.** **DUO/Group also exist as PER-SESSION (รายครั้ง), not only courses.**
5. ✅ **Order: ECA/Free → DUO/Group → Camp.**

## §4.1 — OWNER confirms Q1, 2026-09-18: **teacher RATE on the Other SCHEDULE (entered/editable there), stored, PASSED to backoffice as the expense; smart-scheduler does NO money reporting.** ("ok lets go"). LOCKED.

## §5 — Stage-2 decisions confirmed, 2026-09-18 (owner "เดิน Stage 2 ต่อเลย")
- **§3.3 DUO/Group = each child keeps their OWN course** (Khwan's example: each bought 10 Hr) — they are GROUPED into one shared recurring slot; each child's attendance deducts THEIR OWN course entitlement. A per-SESSION (รายครั้ง) variant also exists. Teacher mostly fixed but swappable; per-teacher editable rate.
- **§3.1 teacher rate = STORED ONLY for now** (`ratePostedAt` null); NOT posted to the backoffice yet — the backoffice expense pass is a separate later piece. Matches the money-in-backoffice lock (§4.1).
- Deploy: TASK-396 (start-based) + Stage 1 (ECA/Free) + Stage 2 (DUO/Group) go to `sid` in ONE deploy once Stage 2 lands.

## §6 — Stage 2b + Stage 3 answers (customer, 2026-09-19)
### DUO / Group pricing (§4.4)
- **DUO:** 1hr **1,900** (per-session) · 4hr **6,800** (1,700/hr) · 6hr **9,360** (1,560/hr) · 10hr **14,200** (1,420/hr).
- **GROUP (Balance Play, 4+):** 1hr **1,090** · 6hr **5,290** (882/hr) · 10hr **7,790** (779/hr).
- Payment: normally book + prepay (a course); **per-session (รายครั้ง) = the 1hr price (DUO 1,900 / Group 1,090), WALK-IN pay at the shop.**
- 🔑 Teacher ค่าสอน (expense) = backoffice (§4.1 lock). STUDENT revenue (these prices) — DUO/Group are "conditions = Private in all" ⇒ posts in smart-scheduler like Private; @Sober confirms the products/prices exist or are net-new (e.g. a DUO product).
### Camp credit model (§3.4)
- The **admin creates/opens each camp WEEK** themselves; the next open week may NOT be adjacent.
- Unused days ⇒ **a day CREDIT held in the system, like a PAUSED course; NO expiry.**
- A child with leftover days enrolls them into ANY future OPEN camp week (admin-opened).
- ⇒ Camp = a DAY-BASED package; cut by day; leftover = paused credit (no expiry); credit applied to a future admin-opened camp week.

## §7 — Camp prices (customer flyer, 2026-09-19)
Balance Camp, ages 5-15, Mon-Fri 10:00-15:00, SOM BALANCE SCHOOL fl.4 BRAVO BKK.
| package | price | half-day units |
|---|---|---|
| Full day / Full week | 11,500 (Early bird 10,500, sign up 1 month ahead) | 10 |
| Half day / Full week | 5,900 | 5 |
| Full day / Daily | 2,600/day | 2/day |
| Half day / Daily | 1,300/day | 1/day |
Half-day = 1 unit; full day = 2 units; week packages carry a small package discount. ⇒ 4 camp bo.item products. Early bird (10,500) pending: a DISCOUNT at sale vs admin enters price. Confirms SPEC-082 half-day-unit accounting.

## §8 — OWNER decisions, 2026-09-19 ("เอาตามแนะนำ") — all as recommended
1. ✅ **DUO/Group price follows the GROUP the course is sold into, not the subject** (`resolvePriceGroup` takes the group kind; solo = subject as today).
2. ✅ Camp accounting = HALF-DAY units (half = 1, full = 2).
3. ✅ A camp is INFORMATIONAL on the teachers' hourly slots in 3a (does not hard-block).
4. ✅ Camp no-show = CONSUMED, same as a session.
5. ✅ Early bird (10,500 ← 11,500) = a DISCOUNT at sale via the existing discount mechanism (admin applies it for 1-month-advance signup), NOT a separate product.
Camp prices (§7) locked. GO Stage 2b + Stage 3a.

## §9 — Stage 3b scope, owner 2026-09-19: items 1,2,3 (NOT 4)
1. **Camp LINE reminder** — the day's camp notified to PARENT + TEACHER (like the daily reminder); house format; COPY GATED to owner before the send path.
2. **Undo an attended camp day** — admin reverses an accidentally-marked-attended day, RETURNS the day credit; NO money change (sale posted once at purchase).
3. **Camp check-in QR** — same pattern as the session QR.
🚫 (4) per-day revenue NOT wanted — revenue stays once-at-purchase.

## §10 — Stage 3b copy + decisions, owner 2026-09-19
- 🔑 **Label is `Students`, NEVER `Kids`** — a customer may be a teen/adult; use the app's existing term. Teacher: `Students : 8 (Full 5 · AM 2 · PM 1)` + names beneath (≤12, +n, like the group Seats block). Parent keeps `Student :`.
- **Timing: 08:15** (same run). Sober's other rulings stand (QR dies 23:59, scan-other-day refused, no CRM points, undo needs 3-200 char reason).

## §11 — CORRECTION 2026-09-20: Camp MUST appear on the teacher schedule grid (not just a banner)
Owner sent me back to the source. The requirement is explicit: Camp is a SCHEDULE that BOOKS teachers — teachers ROTATE ("มีการสลับครูตลอด สามารถย้ายไปมาได้"), cut by day, "ตารางจะอยู่ในสัปดาห์นั้นๆ"; and the ECA/Camp intent "จองตารางครู... ฟิกตารางเหมือนคอร์สไพรเวท แต่ 1 คลาสเรียนได้หลายคน". Stage 3a built Camp as a top DAY BANNER + `§8.3 informational on teacher slots` — that is TOO WEAK and does not match: the customer ("ลง camp ขึ้นตาราง schedule กดตรงไหน") expects the camp ON the teacher grid. **Fix: a camp day renders as a BLOCK in the assigned teacher's column at the camp time (e.g. 10:00-15:00), with a teacher assigned per day, SWAPPABLE day-to-day; cut by day.** (Whether it hard-blocks the slot or overlays is the §8.3 nuance — but it must be VISIBLE on the grid, not a banner only.) §8.3 is superseded. PM's §8.3 recommendation was the miss.

## §12 — OWNER decisions on camp-on-grid (SPEC-085), 2026-09-20 — all as recommended
1. ✅ Camp HARD-BLOCKS the teacher's slot (real `OTHER`/`CAMP` rows, no double-book).
2. ✅ One camp block per day = the camp window, default **10:00–15:00**, EDITABLE when opening the week; the kids' AM/PM is the package's, not the teacher block's.
3. ✅ Default teachers = the week's teacher list; a day with no teacher ⇒ no block.
4. ✅ A lesson already inside the window when assigning the camp ⇒ REFUSED, naming the clash (camp does not overwrite).
GO: build camp-on-grid (SPEC-085 A + B).

## §13 — DUO RE-SPEC by the customer, 2026-09-20 (analyze before any rework — owner: don't decide solo)
Customer (Khwan): DUO being bundled with Group confused everyone. DUO restated: **exactly like a Private course in EVERY way, except the ค่าสอน (coach rate) is EDITABLE and NOT tied to each teacher's hourly rate. Two kids use the SAME course.** Proposed UX: on New course, a **Private / DUO** tab; DUO ⇒ a rate box appears; the class's rate = the entered value; on Move-session to another teacher, the DUO rate is still editable (for a full-time coach with no hourly rate). Fix day/time/teacher; leave + expiry = Private.
⚠️ **Contradiction to resolve:** "2 คนใช้คอร์สเดียวกัน" (ONE shared entitlement) vs the earlier example "ซื้อ Balance Group คนละ 10 Hr" (TWO entitlements). Attendance/quota/deduction are per-student today.
What we BUILT (Stage 2a): a group-session OBJECT — TWO separate courses grouped, seat cap 2, teal cell, sell-course-into-group, per-teacher rate stored for backoffice. Differs from the re-spec in UX (group flow vs New-course toggle), entitlement (2 courses vs "same"), and the rate surface. **@Sober analyses + @Tanya tests before a rework decision; discuss 3-way.** GROUP (many kids) not re-specced — presumably stays the group object.

### §13.1 — CONTRADICTION RESOLVED by the customer, 2026-09-20 (owner asked her directly)
Owner forwarded my A/B question. Customer answered **"B ค่ะ ต้องมาเรียนพร้อมกัน ทุกคาบค่ะ"** then, when owner pinned it down, confirmed **"1 คอร์ส 2 คน"** and apologised for the earlier "คนละคอร์ส" confusion. ⇒ **DUO = ONE shared course/entitlement for two kids** (shared hours/leave/expiry pool), fixed day/time/teacher, editable ค่าสอน. This CONTRADICTS the current build (TWO linked courses) — it is a **rework**, not a tweak. Sober+Tanya's converged finding was that the current model is 2-linked-courses; that model is now superseded by the customer's B ruling. **FINAL CONFIRM 2026-09-21:** owner asked her the concrete consequence verbatim ("1 คอร์ส 2 คน = ชั่วโมง/โควตาลา/วันหมดอายุ ก้อนเดียวร่วมกัน, คนนึงลา = ตัดจากก้อนรวมของทั้งคู่ ใช่ไหม") → customer **"ใช่ค่ะ"**. Locked. Dispatched to @Sober to spec the DUO-as-one-course rework.
### §13.2 — LOCKED SPEC for Sober (DUO rework)
1. **Entitlement = ONE course/one row for two kids** (not two linked courses). Shared hours pool, shared leave quota, shared expiry. Any kid's leave/attendance deducts the shared pool.
2. **Two children attached to the one DUO course** (both names on it); both must attend the same class every session (fixed day/time/teacher — like Private). Customer's own "easy way" (2026-09-21): create it as **ONE Private course carrying both kids' names inline** — e.g. course = "คราม & พราว", Private inline — one record, two students on it.
3. **Coach rate (ค่าสอน) editable** — a rate box on the course; not tied to the teacher's hourly rate; stays editable after a Move-session/teacher swap (for full-time coaches with no hourly rate).
4. **Creation UX:** New-course page gets a **Private / DUO** toggle; DUO ⇒ reveal the rate box + second-child picker.
5. Migrate/replace the current Stage-2a "group of 2 linked courses" DUO. GROUP (3+ kids) is out of scope of this ruling — leave as the group object unless the customer re-specs.
7. **SHARED-POOL LEAVE RULE — customer confirmed 2026-09-21:** either family's leave cancels that session for BOTH kids; one shared make-up carries both; cannot let one attend alone (one course/one session). Green-lit build + deploy.
6. **Customer's concrete examples (2026-09-21):** (a) course "Duo Inline Skate 10 Hr" — students "น้องคราม & พราว"; (b) course "Duo Surfskate 10 Hr" — students "น้องอัยลี่ & นลิน". ONE course, 10 Hr SHARED pool, TWO kids on it. Use as canonical acceptance examples. Customer restated: *"ถ้าการแยกคนจะทำให้ระบบงง แต่จริงๆคือเป็น 1 คอร์สที่มีน้อง 2 คน ถ้าออกแบบให้เป็น 2 คนได้จะดี"* — i.e. the DESIGN goal is exactly "one course record holding two students," and she's fine however the internal model achieves that as long as it presents as one course.

### §13.3 — RATE MODEL CORRECTION (customer, 2026-09-21) — per-session override, NOT course-wide
Customer (Khwan): ค่าสอน is edited **per class/session**, not for the whole course at once. Example verbatim: *"ทั้งคอร์ส ครู A ค่าสอน 7 บาท; ถ้าสัปดาห์นี้ครู A ลา ครู B สอนแทน ค่าสอนจะกลายเป็น 3 บาท แค่ 1 สัปดาห์"*.
- **Wanted model:** a COURSE DEFAULT rate (e.g. 7) that applies to all sessions, PLUS a per-SESSION override (e.g. 3 for the one substitute week) that does NOT change the course default.
- **Current build (SPEC-087):** the Move-session rate box is labelled "changes the **course's** rate" and `PATCH /bookings/:id {classRateMinor}` rewrites the course-level `classRateMinor` — i.e. it changes EVERY session, not just that week. **This DIVERGES from the customer's intent.**
- Applies to the DUO coach-rate box AND the Move-session (substitute) rate box on any course carrying a coach rate.
- **⇒ Sober to analyse + size:** store a per-session rate on the booking (override) distinct from the course default; the session popup edits the SESSION only (that week); the course card edits the DEFAULT. Freelance/sale/report reads take the effective rate = session override ?? course default. Decide whether this HOLDS the `uat` deploy or ships as a fast-follow.
