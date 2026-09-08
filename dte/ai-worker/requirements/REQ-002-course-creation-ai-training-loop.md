# REQ-002: Course creation via the teacher-side AI training loop (INTAKE — not yet a requirement)
- Status: DRAFT
- Priority: (not yet set — the owner has not ranked this against REQ-001)
- Requested: 2026-09-06 by the owner (develyst)
- Deadline: none stated

> ⚠️ **This file is INTAKE, not a requirement.** It exists so the owner's words are not lost
> between sessions. It is deliberately **not** `READY_FOR_SA` and Sober must not spec it: too
> much of it is unsettled, and the owner explicitly asked for help thinking it through
> ("ช่วยฉันคิด และ ทำให้ work กว่านี้ได้นะ") — that conversation has not happened yet.
> Nobody may close any question below by inference.

## The owner's own words (2026-09-06, verbatim — evidence of intent)

> "ผู้ใช้งาน เป็นได้ทั้ง ผู้เรียน และ ผู้สอน เหมือนกับ youtube เลย เป็นได้ทั้งคนดู content และคนสร้าง
> คนดู เข้ามา สนใจ คอร์สไหน ก็กด เข้าเรียน มันจะมีทั้งแบบ ที่เขาทำฟรี และ แบบทำคิดตังค์
> พอกด เรียนแล้วก็ ได้เรียนเรื่องนั้นๆ กับเอไอ ถามได้ ขอแบบทดสอบ ได้ ที่มีข้อมูล ของคอร์สอยู่เต็มเปี่ยม
>
> ส่วนผู้ใช้งานที่เป็นผู้สอน ก็จะเป็น สร้างคอร์สของตัวเอง เทรนเอไอ โยนข้อมูลให้มัน เอไอสำหรับผู้สอน จะเป็นพวกช่างถาม
> เราวางชื่อคอร์ส วางdescription course วางเป้าหมาย
> แล้ว เอไอก็จะถามเราจนกว่าจะเข้าใจหากมันคิดว่าเข้าใจแล้ว ก็จะจบการสร้างคอร์สได้ มันต้องสร้างโจทย์ขึ้นมาแล้วตอบเอง
> แล้ว ต้องถูก 100% หากไม่ถูก ก็ให้ ผู้สอน บอกว่าทำไมผิด ไปให้มัน หรือ อาจจะ ให้ ผู้สอน ตั้งคำถามกับมัน ให้มันตอบ
> แล้วถ้าถูก ก็ได้ คะแนนตามที่ผู้ถามให้ คะแนน ตอนตั้งคำถาม
> อะไรพวกนี้ ช่วยฉันคิด และ ทำให้ work กว่านี้ได้นะ
>
> รายได้ เรา จะเอาจาก ค่า เปิด คอร์ส คอร์สฟรี ไม่เก็บ เก็บคอร์ส เสียตังค์ เราเอาแค่2%"

The settled parts of this are also recorded as fact lines in `SYSTEM-FACTS.md`
("Product identity, business model and UI standards", 2026-09-06).

## What is already built vs. what this describes (survey 2026-09-06 — evidence, not proof)

- The **learner side largely exists in the schema**: `ai_teacher_configs` already carries
  `system_prompt`, `knowledge_base`, `provider`, `model`, `temperature` per course, and chat
  loads the last 10 messages before calling the `develyst-ai` gateway.
- `course_access_type` is `free | follow_free | paid` — access can also be granted by
  **following the teacher**. The owner did not mention `follow_free`; whether it is still
  wanted is an open question (Q5).
- **Payments are designed, not built**: `course_payments` and `teacher_payouts` are tables,
  Omise + Stripe keys are in `.env.example`, but **no payment route exists**. So the 2% cut has
  nothing to attach to yet.
- **The teacher-side AI training loop the owner describes does not exist in the code at all** —
  there is no interrogation flow, no self-quiz, no scoring. This is new build, not a tweak.

## Open questions — must be answered before this becomes a requirement

- **Q1 — the 2% and "ค่าเปิดคอร์ส".** Is 2% the whole fee, or is there also a separate
  course-opening fee? 2% of what — gross sale price, per transaction? Who absorbs the payment
  gateway's own fee? (⚠️ recorded as CONTESTED in `SYSTEM-FACTS.md`.)
  > 2026-09-07 — the owner replied **"yes"**. ⚠️ **STILL OPEN: "yes" cannot answer an either/or,
  > and the wording actually put to him was never written down, so there is nothing to bind the
  > "yes" to.** A price is a fact only when he states it — nobody may pick a reading.
  > **Re-asked 2026-09-07, verbatim, so his next answer binds to this exact text:**
  > "เรื่องรายได้ ขอเลือกข้อเดียวครับ — (ก) เก็บ 2% จากยอดขายคอร์สที่เก็บเงิน แค่นั้น ไม่มีค่าอื่น
  > หรือ (ข) มีค่าเปิดคอร์สแยกต่างหาก + เก็บ 2% ด้วย ตอบว่า ก หรือ ข ครับ"
  > (Sub-questions "2% ของอะไร" and "ใครจ่ายค่าธรรมเนียม payment gateway" stay open regardless
  > of ก/ข and are asked only after he picks one.)
  > **2026-09-07 — ANSWERED: the owner replied "ก".** It binds to the verbatim text above, so it
  > holds: **the platform takes 2% of paid-course sales and nothing else — there is NO separate
  > "ค่าเปิดคอร์ส" (course-opening) fee.** Reading (ข) is superseded and must not be built.
  > Recorded in `SYSTEM-FACTS.md` A9; the ⚠️ CONTESTED line under "Product identity" is resolved.
  > **2026-09-07 — the two sub-questions are ANSWERED; Q1 is now CLOSED in full.**
  > - *"2% นี่คิดจากอะไรครับ — ราคาขายเต็ม, ต่อ transaction, หรือหลังหักค่าธรรมเนียม gateway แล้ว?"*
  >   → **"ราคาขายเต็ม"** (owner, 2026-09-07): the 2% is taken on the course's **full/gross sale
  >   price**, not on what is left after the gateway's fee. `SYSTEM-FACTS.md` A13.
  > - *"ค่าธรรมเนียม payment gateway ใครเป็นคนจ่ายครับ — แพลตฟอร์ม, ผู้สอน, หรือผู้เรียน?"*
  >   → **"platform"** (owner, 2026-09-07): **the platform absorbs the gateway fee** — it is not
  >   deducted from the teacher and not added on top of the learner's price. `SYSTEM-FACTS.md` A14.
  > **Settled model:** learner pays the listed price · platform keeps 2% of that gross price ·
  > platform pays the gateway fee out of its own side · no course-opening fee · free courses cost
  > nothing. ⚠️ Not stated and not to be invented: rounding/currency handling, refunds, and what
  > happens when the gateway fee exceeds the 2% on a small sale.
- **Q2 — "ต้องถูก 100%".** What is the pass rule exactly: how many self-written questions, and
  what happens when the AI cannot reach it — is the course blocked from publishing forever, or
  is there an override?
- **Q3 — the teacher's points.** The teacher awards points when posing a question. What are
  points *for*? Do they gate publishing, rank a course, or feed something else? What scale?
- **Q4 — who judges.** When the AI answers the teacher's question, who decides it is correct —
  the teacher, or the AI itself? (The owner's sentence allows both readings.)
- **Q5 — `follow_free`.** The schema grants course access by following the teacher. Keep it?
- **Q6 — money flow.** Payout to teachers is a table with no route. Is teacher payout in scope
  for the first version, or is v1 free-courses-only?
- **Q7 — priority.** Does this come before, after, or alongside REQ-001?

## Next step

Porter walks the owner through Q1–Q7 **in Thai**, then splits this intake into properly
scoped REQs (likely: teacher course-creation loop · learner AI classroom · payments + the 2%).
No handoff to Sober until then.
