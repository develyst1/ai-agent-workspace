# REQ-129: The Daily Report's per-coach "Total (+Group)" doesn't match what the customer expects (24 Oct, uat)
**Intake:** LINE group, 2026-10-25 (the owner's screenshots):
- **Khwan, 1:38 PM:** *"เลข Group Daily ไม่ตรงอีกแล้วค่ะพี่โด่ง"*. Her screenshot: Kid (Part-time) **Attended / Confirmed 3/6, Total (+Group) 9**, next to Kid's calendar column, which shows 6 lesson classes: 3 green 1 HR + 3 blue courses.
- **ฟีน, 1:41 PM:** a screenshot of the Daily Report for **24 Oct 2026, All teachers**, with the **Total (+Group)** number of most coaches struck through or underlined (e.g. Toth 4/4 → 8, Kid 5/5 → 7, Fit 6, Bank 6, Bowy 6, Haris 6; Ji 2, Tarb 0/0 → 2, Ek 0/0 → 1, Jay 0/0 → 1). Her words: *"ไม่ตรงหมดเลยนะคะ"*.
- **The same day's top cards:** Total booked 86 · Attended 52 · Confirmed 52 · Pending 0 · Awaiting 1 · **On leave 34** · Cancelled 21. Others Program all "—".

**Owner:** *"เขาเข้าใจอะไรผิดหรือเราทำผิด หรือเรายังไม่ได้ขึ้น uat"*.

## Facts we have (no cause claimed)
- uat runs the latest Daily Report (back `d9c0cf3` / front `e7ec71d`); TEST-113 + TEST-116 PASS. So the numbers = our code's definition.
- **Silver's definition (10-21), as sent to ฟีน:** Total (+Group) = every class on that coach's timetable that day that is not cancelled or paused: lessons **(pending included)**, each ECA / Other hour, each camp hour, each group class once.
- 24 Oct has **34 on leave**. Whether on-leave classes count in Total (+Group) is not stated in that definition, and could explain coaches with 0/0 and Total 1–2. **For the SA to confirm.**

## Order
1. **Tanya, uat READ-ONLY, 24 Oct:** for **Kid, Toth, Tarb, Ek** (and All teachers), list every row behind **Total (+Group)** (time, type, status: attended / confirmed / on leave / pending / ECA / Other / camp / group), so that each number is explained row by row. Also what Kid's calendar column shows.
2. **Silver (Team B, the Daily Report contract):** from code + Palm's doc §(workload), what exactly Total (+Group) counts (statuses, kinds), and how "(+Group)" was meant (Palm's spec). Then: **does it match what a customer reads from the label?** Propose the definition change(s) as consequences for Khwan to pick, A / B (no money).
3. **Nothing to the customer about a cause before Silver confirms.** Questions go to Khwan only.

## Silver's read (10-25): not a code bug; the LABEL misleads. Total (+Group) counts every non-cancelled / non-paused row incl. **on-leave** lessons (Palm's open Q6, shipped as 'include'), and ECA / camp hours as rows. Prediction: Kid 9 = 6 confirmed + 3 on leave. **Options for Khwan:** A ⭐ confirmed lessons + group work once per class / day (1.1 d) · B the same in hours (0.6 d) · C keep + rename (0 back). **Waiting for TEST-118 to confirm by value.**

## TEST-118 (10-25) CONFIRMS: Total (+Group) = attended / confirmed + on-leave lessons, row by row (24 Oct: Kid 7 = 5 + 2, Toth 8 = 4 + 4, Tarb 2, Ek 1; no group that day). **Khwan's Kid 3/6 → 9 is 25 Oct:** the 6 she sees + 3 on-leave courses hidden under the 1 HR bookings in the same hours. Khwan draft: `COPY-DRAFT-khwan-daily-total-group-2026-10-25.md` (A / B / C).

## Khwan, 2026-10-25 13:54: **B**, verbatim *"B. แบบ A แต่นับงานกลุ่มเป็นชั่วโมง (เช่น ECA 2 ชั่วโมง = 2) ค่ะ"*
- Total (+Group) = **confirmed / attended lessons** + **group work in HOURS** (each ECA / Other hour, each camp hour, each group class's hours). **On leave, pending, cancelled and paused are OUT.**
- **TASK-747 is taken (the % rule) ⇒ Team B's next number = TASK-748.** Back only; the field / shape is unchanged. Then sid → Tanya (24 / 25 Oct by value: Kid 25 Oct = 6) → uat → Khwan.

- ✅ **LIVE on uat 2026-10-26 (TEST-125 smoke PASS); Khwan told 2026-10-27** (`COPY-DRAFT-khwan-uat-release-2026-10-26.md`, sent by the owner).
