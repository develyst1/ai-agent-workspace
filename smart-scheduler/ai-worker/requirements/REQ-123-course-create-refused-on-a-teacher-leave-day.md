# REQ-123: A weekly course cannot be CREATED when one of its weeks falls on the teacher's leave day (LIVE, uat)
**Intake:** Khwan, LINE, 2026-10-16 18:14–18:16 (owner's screenshot, 10-17). Verbatim:
> *"@Dong_08 วันที่ครูลาไว้ ทำให้ลงคอร์สไม่ได้ค่ะตอนนี้ · ทำยังไงคะ"*
> *"เช่นครูต้าบ ลาวันเสาร์ 7/11 ไว้ แล้วเราจะลงคอร์สทุกวันเสาร์ กดลาล่วงหน้า ก็ไม่ให้ลงค่ะ หรือถ้าจะให้ย้ายวันนั้นๆไปต่อครั้งสุดท้าย มันก็ต้องผ่านการ create คอร์สก่อนซึ่งตอนนี้มันไม่ให้ create ด้วยซ้ำค่ะ"*

**Owner:** *"ระบบหน้าบ้านมีปัญหาเหรอ"*.

## What she says happens (her words, not yet reproduced)
- Teacher **Tarb (ต้าบ) has leave on Saturday 7 Nov**.
- She creates a **weekly Saturday course** whose weeks include 7/11 → **the create is refused**.
- She **marks that week as a planned absence at creation** ("กดลาล่วงหน้า", the REQ-045 / SPEC-049 feature, TASK-148/149) → **still refused**.
- Moving that session to the end afterwards needs the course to exist, and it can't be created.

## Checked first (the screenshot-is-not-an-intake rule)
- **REQ-045** ("planned absences at course creation", TASK-148/149 DONE) is the feature she used. It says a planned-absence week *"is not scheduled, one is appended at the end"*.
- **Not found:** a requirement saying a teacher's leave day must block a course whose week there is a planned absence.

## Order (standing rule: reproduce her situation first)
1. **Tanya, sid:**
   - a QA teacher on leave on a Saturday;
   - New course, weekly Saturdays, spanning that date → the refusal (**exact text**);
   - then mark that week as a planned absence → still refused?
   - then try changing that session's date / teacher in the preview → what happens?
   - Screenshots, by value.
2. **SA (Team A, the leave and teacher machinery):** confirms the mechanism from her recipe. **No cause goes to the customer before that.**
3. The fix, the same recipe on the new build, uat, then Khwan.

**Customer self-serve:** if Tanya finds a way that works today (e.g. editing that session in the preview), it goes to Khwan first, while the fix is built.

## 2. Scope widened by the owner (2026-10-17): the teacher's ADVANCE-LEAVE booking is hard to use, so understand it and make it easy
**Owner, verbatim:** *"จริงฉันก็มองว่า การจองวันลาล่วงหน้า ของครู แอบใช้งานยากด้วยนะ ฝาก ดูและเข้าใจมันดีๆ แล้ว implement หน่อย"*.
**Plan:**
1. **Tanya walks the whole teacher advance-leave flow on sid as an admin would**, from where it starts to what happens to the teacher's classes after. Every click, every confusing word, every dead end, with screenshots.
2. **Sober maps the flow in the code**:
   - entry points;
   - the per-type rules (UC-029: leave notice by teacher type);
   - what happens to affected bookings, and the create-course interaction (§1).
3. **Porter turns both into ONE short proposal for the owner**: what is hard, and what we change, with before/after. **The owner OKs it, then it's built.** Wording changes still go through copy approval.
4. ~~§1 fixed first~~. **SUPERSEDED by §3** (owner 10-17): no short-term fix; one long-term release.

## 3. Owner ruling (2026-10-17): NO short-term fix, ONE long-term fix. Khwan waits
**Verbatim:** *"ไม่ส่งข้อความนี่ให้ ขวัญนะ ไม่แก้ short term แก้ long term เลยทีเดียวให้ขวัญรอไป"*.
- **No holding message and no workaround go to Khwan.** `COPY-DRAFT-khwan-teacher-leave-create-2026-10-17.md` is **NOT SENT**.
- **§1 (the create refusal) and §2 (making advance leave easy) ship together**, as one designed change, after the owner OKs the proposal.
- Tanya's TEST-107 still runs. It is the reproduction (the old-build proof), and its friction list feeds the proposal.

## 4. The owner talked with Khwan (2026-10-17): a fix TONIGHT. This supersedes §3's "no short-term"
**The owner's call summary (AI notes, his screenshot):** she can't create the course because a date clashes with the teacher's leave. Unleave didn't help, and moving the date needs the course to exist first. **"ดำเนินการแก้ไขระบบให้ในคืนนี้ เนื่องจากขวัญแจ้งว่ามีเด็กเตรียมจะเรียนแล้ว"**.
**Owner ruling, verbatim:** *"Aแหละ แต่ว่าครูลาล้วงหน้า ควรมีหน้ายกเลิกได้ ด้วยมั้ย"*.
- **TONIGHT = A:** at course create, a week marked **planned absence** (REQ-045) **is not refused** because the teacher is on leave that day. It is pushed to the end as designed, and the teacher's leave stays. Back only. Proof = TEST-107's recipe (Tarb-like: leave on Sat; a weekly Saturday course; tick that week; it creates).
- **Cancelling an advance leave (the MAP's gap 1).** Porter's answer to the owner: **yes, it should exist.**
  - **A FUTURE leave** only blocks the day; no class was touched. Undoing it is simple and safe, so it is a candidate for tonight if Sober sizes it small. Its button label needs the owner's copy approval.
  - **Undoing a today/past leave** (classes already cancelled, families told) is NOT simple, so it goes to the long-term redesign.
- The rest of §2 (making leave easy) stays long-term, with the proposal → owner OK flow.

## 5. Owner, 2026-10-17: *"อนุมัติข้อความ และ OK เฟส 1 ทั้งหมด"*
- **TASK-814's copy is APPROVED** (recorded in `COPY-REVIEW-2026-09-29.md`, 10-17).
- **Phase 1 of `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` is approved in full (P1–P7).** Size it and cut it. **Every new wording in Phase 1 comes back for copy approval before it ships.** Phase 2 waits.

## 6. Owner, 2026-10-17: ONE release for everything
**Verbatim:** *"ไม่ ทำให้เสร็จหมดเลย จะขึ้นทีเดียว"* (in answer to "uat with 813 now").
- **No uat deploy of 813 alone.** TASK-813 (back `c1d90d8`, sid PASS) waits.
- **ONE uat release = 813 + 814 + Phase 1 (P1–P7)**, after the full sid gate.
- Khwan is not messaged until that release is live.
