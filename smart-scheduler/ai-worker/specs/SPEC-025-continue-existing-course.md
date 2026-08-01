# SPEC-025: Continue an existing course — bring entitlement across at go-live, not revenue
- Source: REQ-025
- Status: ACTIVE

## Overview
On 20 August the school does not start from zero. Children are mid-course **now** — bought 10 sessions in
Excel, attended 4, **6 remain** — and those courses keep running across the switchover.

**The owner's framing is the right one and it is narrower than a migration project:** *"ให้ frontoffice
สามารถเดินคอร์สต่อจากระบบเดิมได้ โดยง่าย"* — and **โดยง่าย** means an admin at a desk, not an engineer.
**Q3 is answered: ~20–36 families.** At that volume, hand entry is an afternoon and a file importer is three
weeks of the wrong work. **I am taking the small version, and I agree with Porter's reframe.**

**The gap is one sentence:** the system can only create a course by **selling** a new one, which always starts
at **0 sessions used**.

## 🔴 Design decision — import and sale are different VERBS, not one verb with a flag
Since TASK-066, **revenue posts at the point of sale**. So anything that creates entitlement through the sale
path inherits that, and importing 30 families would post a **large, entirely fictional month of revenue** for
money collected months ago in Excel.

A boolean (`skipRevenue: true`) is **one forgotten default away** from double-counting a launch month, in the
week everyone is watching something else. So:

**`POST /api/courses/import`** — a separate endpoint. You cannot import by forgetting a flag, and you cannot
sell by forgetting one either. **Distinguishable by construction**, which is exactly the standard Porter
named: *"entitlement comes across, revenue does not."*

## ⚠️ The interaction that would have bitten us — imports vs the `sales_not_posted` detector
TASK-067's 9th attention check counts **entitlements created in the last 7 days with no matching `SALE`
movement**. An imported course has **no** movement **by design**. So on go-live morning the digest would list
**every imported family as a revenue fault** — around 30 of them, for a week.

That is worse than noise: **it is the detector that guards real revenue, and a detector that cries wolf gets
muted.** We would spend the launch fortnight ignoring the one check that would tell us the sale path had broken
again.

**So imports must be distinguishable in the data**, not just by intent: `course_packages.source`
(`SALE` | `IMPORT`, default `SALE`) and the same on vouchers. The check excludes `IMPORT`. One column, and it
also answers "why does this course have no revenue?" forever after — which someone *will* ask in an audit.

## What import creates
- The course with **`usedSessions` already set**, an **explicit `expiryDate`** (the original purchase's, not
  one computed from today — `courseExpiry` counts from the start date and would be wrong), and `source: IMPORT`.
- Bookings for the **remaining** sessions only (`size − usedSessions`), forward from the chosen date. **Not**
  the sessions already taught in Excel — history we don't have and don't need; the balance is the point.
- **No `bo.movement`. Ever.**
- Same for a **part-used voucher** (`usedHours`, explicit expiry, `source: IMPORT`).

**Everything else is a normal course from that moment on** — booking, quota, leave, extension, expiry, the
freelance ceiling. That is the whole value of the small version: nothing downstream learns a new concept.

## What import does NOT bypass
- **The freelance ceiling** still draws for imported future sessions — the centre really does pay those
  teachers.
- **The suspend gate** still applies. A suspended household shouldn't be imported; refusing loudly is right.
- **Availability and pricing** (SPEC-024) are irrelevant here — nothing is priced, so an off-card size can be
  imported. **Deliberate:** the family already bought it, whatever the card says today.

## Tasks
- **TASK-079** (Jason, BE): `source` migration, the import endpoints, the attention-check exclusion.
- **TASK-080** (Fern, FE): the staff form — **"this course is already part-way through"**. It must be usable by
  an admin working through a list of families, not a developer tool.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **Sizing answer, since you asked for one: the small version is right, and it is ~1 day BE + ~1 day FE.**
   Not weeks. The reframe stands and I'd have reached the same conclusion from the volume alone.
2. **I'm proceeding on "no history".** We import the **balance**, not the sessions already taught — we don't
   have that data, and REQ-025's value is that the remaining sessions work. If คุณฟีน expects past attendance
   visible in the app for these families, that's a different and much larger feature; **say so now rather than
   in week three**, because it changes the shape completely.
3. **Q2 confirmation I'm assuming:** only what is still live — unexpired courses/vouchers, sessions from
   2026-08-20 forward. Non-blocking; it's also the only reading that makes sense.
4. **FYI:** imported courses are excluded from the `sales_not_posted` digest check on purpose (see above).
   If anyone later asks why an imported course shows no revenue, the answer is in `source`.
