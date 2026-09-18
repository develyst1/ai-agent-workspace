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
