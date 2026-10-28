# REQ-001: AI for Kids V1 — the owner's requirement (verbatim)

- Status: READY_FOR_SA (2026-10-28, for SPEC-001 only — see § PM hand-off)
- Provenance: **owner (โด่ง)**, handed to the workspace via Atom on 2026-10-28 (MARIE.md ORDER 37). **NOT customer-validated** — this desk has no customer seat (`SEATS.md`), so no `customer-validated` stamp can ever exist here.
- Filed: 2026-10-28 by Marie at desk-open — copied **verbatim**, byte for byte, below the line. Not paraphrased, not analysed.
- Next: the PM (BA hat) analyses it into testable ACs and Out of Scope in this file or follow-up REQs; the SA's first job is `SPEC-001` (stack/architecture proposal) — `DECISIONS.md`.
- 🔴 Children's data: synthetic only — PROTOCOL § Hard boundaries.

## PM hand-off 2026-10-28 — first step: SPEC-001 (stack / architecture proposal)

- Status: READY_FOR_SA — **for SPEC-001 only** (a proposal; no code). Priority: HIGH. Deadline: none. `[PM-decided 2026-10-28]`
- Ask, one sentence: the SA reads this requirement + `buddy-screen-spec` and proposes the stack and architecture for V1, before any code. Owner's words: *"อ่าน requirement V1 + spec repo แล้วให้ SA เสนอ stack/สถาปัตยกรรม (role-sa §4.0) ก่อนเขียนโค้ด"* `[operator 2026-10-28, DECISIONS.md line 15]`
- Feature-level ACs (quota, Sleep, over-quota, rewards, …) are **not** written yet: they come as follow-up REQs once the owner has chosen the stack. `[PM-decided 2026-10-28]`

### Acceptance criteria for SPEC-001 `[PM-decided 2026-10-28]`
- [ ] AC-1 — **Given** the verbatim requirement below **When** the SA delivers SPEC-001 **Then** it names a proposed choice, with reason and cost, for each layer: the TV/large-screen app with the family's camera + mic; real-time voice + vision AI; the backend (API contract only — no BE repo yet); data store; the parent channel via LINE (approve / decline buttons); billing/quota. Where a choice is costly to reverse, at least 2 options are compared. *Check: the PM reads SPEC-001; the owner decides.*
- [ ] AC-2 — **Then** every section of the verbatim requirement (identity recognition · activities · time counting & Sleep · over-quota · goals & reports · rewards · key principles) maps to a component in the architecture, or is marked "not in the V1 architecture" with a reason. *Check: the PM traces each section to SPEC-001.*
- [ ] AC-3 — **Then** SPEC-001 states, for children's faces, voices and names: where each is processed, what is stored and for how long, what is discarded — per *"เก็บเท่าที่จำเป็น"*. Any test data it mentions is synthetic. *Check: the PM reads the section.*
- [ ] AC-4 — **Then** Buddy's memory is designed independently of the TV app, so it can move to a robot/doll later (verbatim: *"รองรับการย้ายไปหุ่นยนต์/ตุ๊กตาในอนาคต"*). *Check: the PM reads the memory section.*
- [ ] AC-5 — **Then** SPEC-001 says where and how "actively doing an activity" and "Sleep" are decided, and how their accuracy will be verified (verbatim: *"ต้องแม่นยำ (ไม่ควรผิดพลาด)"*). *Check: the PM reads the section.*
- [ ] AC-6 — **Then** the choices the owner must make are listed as one decision pack, each with the SA's recommendation. *Check: the PM relays it to the owner.*
- [ ] AC-7 — regression: no file in `buddy-screen-spec` changes; no code is written in `buddy-screen-front`. *Check: the PM asks the SA for `git status` of both repos in SPEC-001.*

**PM check 2026-10-28 16:00:** SPEC-001 read in full (264 lines). AC-1 §3.1–3.6 · AC-2 §8 · AC-3 §7 · AC-4 §6 · AC-5 §5 · AC-6 §9 · AC-7 §12 — all present. §1 arithmetic re-done by the PM: (2,000 − 500×52/24) ÷ (40×52/12) ≈ 5.3 THB/h — matches. Note on Q2: 2,000 ÷ 160 assumes 4-week months; 2,000 ÷ 173 ≈ 11.55 THB/h is the other reading — asked as part of the owner's pack. Owner asked D0 first (one decision at a time).

**D0 input, owner via Atom 2026-10-28 16:04** (SYSTEM-FACTS § Costs): one shared server, 1,200 THB/month for all customers. PM re-computed the full-quota budget per hour left for AI + LINE + payment fees = (916.67 − 1,200/N) ÷ 173.33 h, N = paying customers: N=1 → −1.63 · 2 → 1.83 · 5 → 3.90 · 10 → 4.60 · 20 → 4.94 · 50 → 5.15 · 100 → 5.22 THB/h. The server matters only below ~10 customers; at scale the ceiling stays ≈5.2 THB/h. Payment fees not yet counted (D5, unknown). D0 still open. `[PM-computed, inputs owner's]`

**Break-even, owner's what-if 2026-10-28 16:13** (AI 1,000 THB/family/month; SYSTEM-FACTS § Costs): margin per family = 2,000 − 1,000 AI − gifts G; break-even N = 1,200 ÷ margin. G = 1,083 (500 × 26 rounds/yr, full budget) → margin −83 → never · G = 1,000 → 0 → never · G = 750 → 250 → 5 · G = 500 → 500 → 3 · G = 250 → 750 → 2. Not counted: payment fees, LINE, overage/rename income. AI 1,000/month at full quota = 5.77 THB/h. `[PM-computed, inputs owner's]`

**D0 answered, owner via Atom 2026-10-28 16:19:** *"500 ต่อเดือน ก็ได้"* — gift budget 500 THB/family/month ⇒ margin 500 ⇒ break-even 3 families. Scope and open points: `DECISIONS.md` 2026-10-28 16:19. Next asked: D1 (TV device).

### Out of Scope (for this step) `[PM-decided 2026-10-28]`
- Writing any product code; any git command.
- Settling business rules (prices, borrowing time from the last day of the week, reward tiers) — ambiguities go to `## Questions` for the PM, not resolved in the design.

### Questions
(the SA and the QA ask here; the PM answers as `> answer: …`)

**From the SA, 2026-10-28.** None of these blocks SPEC-001. They are business rules SPEC-001 deliberately leaves open (Out of Scope). Each one comes with the SA's proposed default; correct only the lines that are wrong. `Checked: DECISIONS.md lines 14–22 · SYSTEM-FACTS.md all sections — none covers these.` Decisions D0–D8 for the owner are in `specs/SPEC-001-v1-stack-architecture.md` § 9.
- **Q1 Sleep and accuracy:** after the child stops responding, how long until the session pauses, and how long until Sleep? How much counting error is acceptable? Default: pause after 10 s, Sleep after 20 s more; at most 1 min of error per counted hour; never count time while Buddy is out of frame.
- **Q2 Overage hourly price:** "หารจากค่าบริการรายเดือน" — divided by what? Default: 2,000 ÷ 160 h (4 weeks × 40 h) = 12.50 THB/h.
- **Q3 Week and borrowing:** the week runs Mon–Sun and "วันสุดท้ายของสัปดาห์" means Sunday's allowance. Daily allowance = what the parent sets (or 40 h ÷ 7 if unset). The 3-hour timer starts when the LINE message is sent. Default: all as stated.
- **Q4 Friends of Buddy consent:** a Friend's face is kept permanently, and that friend is another family's child. Default: before a Friend is enrolled, Buddy's parent confirms in LINE that the friend's parent agreed; only a face template is kept; deletable at any time.
- **Q5 Renaming the AI:** what does it cost, and how often may it happen? Default: a one-off charge, price set by the owner, no frequency limit.
- **Q6 Gift fulfilment:** who buys and ships the real gifts? Default: done by hand by the owner's operations from an order list the system produces. Buying and shipping is not part of the V1 software.
- **Q7 Privacy and legal:** how long are face templates, transcripts and data kept after the subscription ends, and will the owner get a PDPA legal check (under-10s, biometric data)? Default: transcripts 30 days; face templates and memory deleted 30 days after the subscription ends; explicit parental consent in LIFF before any enrolment; legal check before the first real family.
- **Q8 Goal topics:** who writes the goal-topic catalogue that is chosen by gender, age and family story? Default: the owner supplies the first list; the AI suggests from it.

---

# Repos
- https://github.com/develyst1/buddy-screen-spec.git
- https://github.com/develyst1/buddy-screen-back.git
- https://github.com/develyst1/buddy-screen-front.git

# AI for Kids — Version 1 Requirements

## ภาพรวม
แอปที่เปิดบนจอทีวี (หรือจอใหญ่) ใช้คู่กับกล้องที่มีอยู่แล้ว
AI พูดคุยกับเด็กแบบ interactive ชวนทำกิจกรรมร่วมกัน
เพื่อดึงเด็กออกจากการเสพติดมือถือ/สื่อ และให้เวลาหน้าจอที่มีคุณภาพ
- ค่าบริการ: 2,000 บาท/เดือน
- โควต้า: 40 ชั่วโมง/สัปดาห์ (ผู้ปกครองบริหารเวลาได้)
- ฮาร์ดแวร์ (จอ + กล้อง): ลูกค้าจัดหาเอง

## กลุ่มเป้าหมาย
อายุประมาณต่ำกว่า 4 ปี ถึง 12 ปี
AI จะปรับเนื้อหาและวิธีโต้ตอบตามความสามารถจริง เรื่องราวครอบครัว และตัวเด็ก (ไม่ยึดช่วงอายุตายตัว)

## ลักษณะของ AI
- ไม่มีหน้าตา/ตัวละครชัดเจน
- มีแค่เสียง + กล้อง (ใช้เป็น "ตา")
- เด็กสามารถตั้งชื่อให้ AI ได้ (มีชื่อตัวอย่าง)
- เปลี่ยนชื่อได้ แต่มีค่าใช้จ่าย
- ใช้ชื่อตอนที่จำเป็น

## การรู้จักตัวตน
- จดจำใบหน้าเด็กที่ลงทะเบียน = My Buddy (1 คนต่อ 1 Subscription)
- มีท่าเฉพาะที่สอนกันตอนเริ่มใช้งานครั้งแรก
- เรียกชื่อ → เปิดไมค์ถามยืนยัน "เรียกฉันรึเปล่า" (รองรับสำเนียงเด็ก)
- Friend of Buddy: ลงทะเบียนเมื่อมาร่วมกิจกรรม/เกม และเก็บถาวร เพื่อให้ AI รู้เรื่องตอนคุยกับ Buddy
- นับโควต้าเฉพาะ Buddy หลัก (เด็กคนอื่นมาช่วยทำให้กิจกรรมสมบูรณ์)
- ออกแบบโครงสร้างความทรงจำของ Buddy ไว้รองรับการย้ายไปหุ่นยนต์/ตุ๊กตาในอนาคต

## กิจกรรมหลัก
- ออกกำลังกาย
- ออกกำลังสมอง
- พูดคุยเรื่องต่างๆ
- ฝึกวิธีคิด

AI จะชวนทำกิจกรรม
ถ้าเด็กเอาด้วยและทำต่อ = นับเวลา
ถ้าเด็กทำอย่างอื่นออกนอกกิจกรรม = AI ถามว่ากำลังทำอะไร
ใช้กล้อง + ไมค์ + AI วิเคราะห์สถานการณ์แบบ real-time

## การนับเวลาและ Downtime
- นับเฉพาะช่วงที่กำลังทำกิจกรรมจริง
- ถ้าเริ่มกิจกรรมแล้วเด็กไม่ตอบหรือไม่ทำต่อแบบกระทันหัน → Sleep ทันที
- คืนโควต้าให้ผู้ปกครองแบบ Real-time เมื่อไม่ได้ทำกิจกรรม
- การนับเวลาและการตัดสิน Sleep ต้องแม่นยำ (ไม่ควรผิดพลาด)

## ระบบเกินโควต้า
- แจ้งผ่านไลน์ผู้ปกครอง พร้อมปุ่ม อนุมัติ / ไม่อนุมัติ
- จ่ายเพิ่มคิดเป็นรายชั่วโมง (หารจากค่าบริการรายเดือน)
- ตาม setting:
  - ถ้าตั้งไม่ให้เกินเวลาต่อวัน → จบเลย
  - ถ้าอนุญาตให้เกิน และผู้ปกครองไม่ตอบภายใน 3 ชั่วโมง → ยืมเวลาจากวันสุดท้ายของสัปดาห์มาก่อน
  - ยืมได้จนกว่าจะหมดวันท้ายสัปดาห์ จากนั้นต้องรออนุมัติและจ่ายเพิ่มเท่านั้น
- ผู้ปกครองสามารถซื้อคืนเวลาที่ยืมไปได้

## เป้าหมายและรายงาน
- ผู้ปกครองตั้งและปรับเป้าหมายได้
- มีหัวข้อให้เลือกตามเพศ อายุ และเรื่องราวของครอบครัว/เด็ก
- AI ประเมินและวิเคราะห์ความคืบหน้า
- ผู้ปกครองเลือกได้ว่าจะรับรายงานแบบรายวันหรือรายสัปดาห์

## ระบบรางวัล
- ส่งของขวัญจริงทุก 2 สัปดาห์
- AI เตรียมรายการให้ผู้ปกครองเลือก
- รวมอยู่ในค่าบริการ
- งบไม่เกิน 500 บาทต่อครั้ง
- ถึงเป้า = ของใหญ่
- เกือบถึง = ของเล็ก
- ต่ำกว่านั้น = ไม่ได้ของ
- ถ้างบรอบนั้นไม่ได้ใช้ → นำไปกองให้รอบถัดไป

## หลักการสำคัญ
- ไม่บังคับเด็ก ชวนและให้รางวัลแทน
- ผู้ปกครองควบคุมโควต้าและการอนุญาตเกินเวลาได้
- ลดความเสี่ยงด้านข้อมูลเด็กด้วยการออกแบบให้แม่นยำและเก็บเท่าที่จำเป็น
