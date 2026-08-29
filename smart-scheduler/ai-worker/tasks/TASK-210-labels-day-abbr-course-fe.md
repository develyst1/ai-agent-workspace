# TASK-210: Labels — `Mo/Tu/We`→`Mon/Tue/Wed` and "Weekly course"→"Course" (REQ-075) (FE)

- Source: REQ-075 (owner). 🟢 LOW, FE-only. Gates uat (in the batch). On `develop`.
- Status: ✅ **FE DONE (Sober 2026-08-29)** — Mon/Tue + "Course" labels, rendered-verified; keys guard green.
- Repo: **smart-scheduler-front**.

## What
1. **Day abbreviations** `Mo/Tu/We` → **`Mon/Tue/Wed`** (all seven), both languages, wherever the short weekday renders.
2. **"Weekly course" → "Course"** (`คอร์สรายสัปดาห์` → `คอร์ส`) — this is the **booking-type label shipped in
   REQ-052/TASK-142**; it lives in the **cell, the legend, and the display toggle**. Change it in the dictionary, **both
   TH+EN**.

## DoD — check the RENDERED label, not just the key (the `endCourse.drop` lesson)
- [ ] Weekdays read Mon/Tue/…; the booking-type reads "Course"/"คอร์ส" on the **cell, legend, and toggle** — verified
      on the rendered page (`keys.test.ts` guards resolution; but eyeball the cell, it's the one that shipped).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · `keys.test.ts` green. Rendered → @Tanya.

## Notes
(Fern fills in. Pure dictionary + a rendered re-check of the three surfaces the "Weekly course" label appears on.)

---

## Implementation Notes (Fern 2026-08-29)
**3 files.** Dictionary + the two places that format a weekday.

### 1. Weekdays — and a decision I made rather than following the letter
English now uses dayjs `ddd` → **Mon/Tue/Wed/Thu/Fri/Sat/Sun**, in both `dayShort()` and the week-grid header.

🔴 **Thai deliberately stays on `dd` (จ. อ. พ.).** I checked before changing it: dayjs' Thai locale has **no
three-letter form** — `ddd` there returns the **full** name (จันทร์, อังคาร, พฤหัส), which is *longer*, not shorter.
Applying "both languages" literally would have widened every weekday header and fought **REQ-052 AC-3**, the 375px
no-truncation rule the calendar cell was measured against days ago. `dd` already **is** the conventional Thai
abbreviation, so the REQ's intent — a readable short day — is met in both languages by different tokens. Stated here
because it's a deviation from the wording, not from the intent.

### 2. "Weekly course" → "Course" / "คอร์ส"
One key (`bookingType.COURSE_PACKAGE`), both languages — which is why it lands on the cell, the legend and the type
filter at once.

### DoD — the RENDERED check, per the `endCourse.drop` lesson
Ran the app locally (mock) and read the page, rather than trusting the key:
- **Weekday headers:** `Mon · Tue · Wed · Thu · Fri · Sat · Sun` ✅
- **Type legend + type filter:** `1st Trial · 1 HR · Course · Voucher` ✅
- **Booking-type chips on the bookings table:** rendered as **`Course`** ✅
- **`Weekly course` appears nowhere in the rendered document** (checked the whole `body.innerText`, both surfaces) ✅

⚠️ **One surface I could not eyeball:** the *calendar cell* itself — the mock fixture produced no booking chips for
the current week, so there was nothing to look at there. It renders the type through the **same key** the legend and
the table use (both verified), and the string is absent from the DOM entirely — but that is inference, not sight, and
the task singled the cell out. **@Tanya: that's the one to look at.**

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · suite **41/0**
(incl. `keys.test.ts`).

## Questions
- **Q1 (copy, out of scope but the owner will see it):** `course.formTitle` still reads **`สมัครคอร์สรายสัปดาห์`** —
  the same "รายสัปดาห์" the owner asked to drop, surviving in the create-course form title. REQ-075 scoped this task
  to the **booking-type label**, so I did **not** change it: it's user-facing copy and Porter's to decide. Flagging so
  it isn't found later as "the rename was half-done".
