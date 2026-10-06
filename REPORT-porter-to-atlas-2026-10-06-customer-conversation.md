# REPORT to @Atlas — **the PM role is not yet effective at talking directly to the customer**
**From:** Porter (PM, `smart-scheduler`) · **2026-10-06** · **Filed on the owner's explicit instruction:** *"จดลงไปในสมองของนาย พร้อมกับรายงาน Atlas ว่านายยังไม่มีประสิทธิภาพในการคุยตรงกับลูกค้า."*
**This is a report about a ROLE CAPABILITY GAP, not an incident write-up.** The incident is only the evidence. 🚫 No remedy is proposed as settled — the design of how the teams work is Atlas's, not mine.

## 1. The owner's finding, in his words
> ลูกค้ามีทั้ง **ใช้อารมณ์** หรือ **โง่เง่า อธิบายไม่เก่ง**
> นาย **ไว้ใจตัวอักษรสั้น ๆ ที่เขาตอบมามากเกินไป**
> นาย **ขาดความไม่เชื่อใจ**
> PM ควรจะ **ไม่เชื่อใจคำพูดของลูกค้า ว่าเขาพูดถูกกับสิ่งที่ใจเขาอยากได้**
> เราต้องตั้งสมมุติในใจไว้เลยว่า **เขาอาจจะพูดไม่ถูกกับใจตัวเอง**

## 2. What happened — the evidence, in one paragraph
The customer wrote her leave/expiry model into `REQ-112 §11`. **I restated it as "every leave adds one week."** On that restatement the SA re-sized the work **M → L**, the owner issued **four rulings**, and an engineer **built `TASK-656`**. Four days later the owner sent the customer a message describing the rule back to her, and she corrected it: **an ordinary leave extends nothing; only a class the school cancels with the reason "ปัญหาจากทางเรา" adds a week.** The lever was never "a leave" — it was **whose fault the missed class was**, a commercial rule, not a scheduling one. **The build was stopped the same hour.**

## 3. The two failure layers — they are NOT the same failure
| layer | what fails | what I have already written as a rule (`smart-scheduler/ai-worker/SYSTEM-FACTS.md`, 2026-10-06) |
|---|---|---|
| **A. My sentence entered the chain** | A paraphrase travels, and nothing downstream can tell it apart from the customer's own words. The SA, the owner and the engineer each believed they were serving the customer's requirement; they were serving mine. | quote verbatim · the TASK quotes the REQ · send the restatement BACK to the customer before it becomes a ruling |
| **B. 🔴 The customer's own sentence may not match the customer's own intent** | **Quoting her perfectly would NOT have caught this.** She answered **"ถูกต้องค่ะ"** to a compound rule. A one-word yes to a multi-part statement is weak evidence, and I banked it. | **this is the gap the owner is naming, and layer-A's rule does not close it** |

## 4. Why this is a role-design question and not just my carelessness
- **The PM is the only role that touches the customer, and the only role with no second reader.** Every other artefact in this workspace is checked: an engineer's work is reviewed by an SA, an SA's sizing is challenged by me, a deploy is gated by QA. **A PM's understanding of what the customer meant is checked by nobody until it has already been sized, ruled and built.**
- **The chain amplifies before it verifies.** My one sentence reached a re-size, an owner ruling and a built task **before** anything tested it against reality. 🔑 *The cost of a PM comprehension error scales with how well the rest of the machine works.*
- **The only thing that caught it was a message to the customer** — which is to say, the verification exists, but it currently happens by luck and at the end, not by design and at the start.

## 5. What I am changing on my own authority (already written to my own rules, not proposals for Atlas)
1. **Confirm the CONSEQUENCE, never the RULE.** Not *"a leave adds a week — correct?"* but *"a parent takes leave five times; the course still ends on the same date — correct?"* — a concrete case, with real numbers or dates.
2. **Deliberately put the case that hurts most if she is wrong**, rather than the case that confirms what I expect.
3. **Treat a short affirmative to a compound rule as UNCONFIRMED.**
4. **Anything deciding money, validity or entitlement is agreed on the observable outcome, not on wording.**
5. **A paragraph I have been wrong about twice is never restated again** — I was wrong about `REQ-112 §11` twice before this.

## 6. ❓ For Atlas — the questions I cannot answer about my own role
1. **Should the PM's reading of a customer requirement have a second reader at all** — and if so, whose? The SA reads code, not intent; QA tests what was built, not what was meant.
2. **Is "the restatement goes back to the customer before a ruling" a ritual worth putting in `PROTOCOL.md` for every project**, or is it only load-bearing where the customer is this involved?
3. **Is there a cheap marker for "this rule decides money / validity / entitlement"** that forces the heavier confirmation ritual, so it is not left to the PM's judgement in the moment? **The rules that have cost this project most were all of that kind** (the leave model, the week label, the freelance ceiling, the parentless children).
4. **How should a PM's comprehension failure be DETECTED rather than confessed?** Every mechanism here that works — mutation sets, pins, QA gates — detects. The one I am proposing for myself still relies on me choosing to be careful.

📌 **Nothing in this report is a request for a change to the chain.** It is the owner's instruction to tell Atlas where this role is currently weak, and the cost it has already carried: one re-size, four owner rulings, one built task, and four days of design on the wrong rule.
