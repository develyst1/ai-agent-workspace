# REQ-033: Captured from the 2026-08-01 customer presentation — not yet scoped

- Status: **CAPTURED — not READY_FOR_SA.** Nothing here is scoped, sized or approved for build.
- Priority: **BACKLOG** — the owner's instruction was *"ไม่ด่วน จดไว้ ทำทีหลัง"*
- Requested: 2026-08-01, at the customer presentation (คุณปุ้ม)
- Deadline: none. **Explicitly not on the 2026-08-20 go-live path** unless the owner moves an item up.
- Source: `smart-scheduler-requirement/20260801-meeting.md` + the owner's follow-ups the same day

## Why this file exists

The owner presented the system to the customer and came back with a list. She said **note it, do it later** —
and I noted it **in a log entry only.** Log entries scroll away and nobody selects work from them; **the same
mistake that left REQ-027…031 invisible to the SA while both engineers sat idle.** So this is the capture, in a
file, on the board, where it survives.

⚠️ **Nothing here has been analysed.** No current-state check, no sizing, no questions answered. Each item below
becomes its own REQ when the owner prioritises it — **do not build from this file.**

---

## The items

### A. Calendar defaults and filtering
1. **Weekly view as the default**, with **Monday as the first day of the week.**
2. **Filter by branch and by province**, with **multiple branches selectable at once.** *(Note: today the
   nearest thing is the badge system, which the owner has said is her own provisional tagging — REQ-021 —
   so this likely depends on what "branch" becomes.)*
3. **Availability filter — find the teachers who are free at the time the customer wants.** The meeting notes
   this as a suggestion, to cut the manual hunt for a free teacher and prevent double-booking at source.
   *(Porter's note: of everything here, this is the one that removes daily work rather than adding a screen.)*

### B. Teacher performance
4. 🔴 **Conversion rate per teacher — how many trial students went on to buy a course.** The meeting document
   calls this a **key feature**, to be used for **teacher incentives** and for judging teaching quality.
   *(Porter's note: this is the only item here the customer described as important, and it is measurable from
   data we already hold — trials and subsequent purchases. It should probably be first when this list is
   reopened.)*
5. **Per-teacher KPI report.**

### C. New products
6. **ECA (special classes) and Summer Camp** as class types. *(Note: the price card already lists ECA-shaped
   pricing in the teacher payroll doc — so this touches pricing, REQ-027 and the product catalogue.)*

### D. Notifications
7. **Teacher schedule push in the morning, ~07:00.** *(Note: the admin digest already runs at 08:00 via a
   registered Windows task; the mechanism exists.)*

### E. Access control — ⚠️ blocked, not deferred
8. **Adding budget (top-up) for a freelance teacher must require executive approval; ordinary admins may not.**
   🔴 **This cannot be built today**, and the reason is not effort: **the backoffice has one shared credential
   and one user, and the frontoffice login does not distinguish people either.** A rule about *who* may act has
   nothing to distinguish. **Separate logins are the prerequisite** — the same conclusion reached on REQ-031's
   "who may change settings" question. Recorded here so it is not mistaken for a small task.

---

## Already handled — recorded so nobody re-opens them

- **Freelance budget colour thresholds.** The meeting doc lists <40 green / 40–79 yellow / 80–90 orange /
  100 red. ⚠️ **These are NOT a requirement.** The owner: *"ในเอกสารนั่นแค่สรุปจากประชุม ซึ่งเป็นการพูดแบบ
  สมมุติ เพราะพบว่าระบบสีไม่ทำงานขณะโชว์ลูกค้า"* — the numbers were spoken as an example **because the strip
  wasn't rendering to point at.** **The delivered 30/70/100 rule stands. Do not "reconcile" the two.**
- **Booking type chosen first** — delivered (REQ-022).
- **Parent self-registration, check-in, leave via LINE** — delivered (REQ-015/016), with defects being fixed.
- **Voucher must choose its program · student search · two-courses ambiguity** → **REQ-029.**
- **Course purchase should allow planned absences before the recurring dates are generated** → **REQ-030.**

## ⚠️ A standing caution about the source document

`20260801-meeting.md` is **transcribed from an audio recording by AI**, and it has already been wrong once in a
way that propagated: it named the customer **"พี่กุ้ง"**, which is **คุณปุ้ม** — the wrong name reached three
REQs and six other files before anyone noticed. **Treat specific numbers and names in it as claims to confirm,
not as specification.** The colour thresholds above are the second instance of the same thing.

## Questions

1. **Which of these, if any, should move onto the go-live path?** *(Porter's lean: none — but **#4 (conversion
   rate)** is the one the customer called important, and **#3 (availability filter)** is the one that saves
   staff time every day rather than adding a screen. If anything is promoted, those two.)*
2. **What does "branch" (สาขา) actually mean commercially** — a second physical location? Today it exists only
   as a badge the owner created provisionally. Item 2 cannot be scoped without this.
