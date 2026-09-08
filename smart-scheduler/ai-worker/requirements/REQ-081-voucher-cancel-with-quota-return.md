# REQ-081: ยกเลิกการจอง Voucher แล้วได้สิทธิ์คืน (split out of REQ-076)

- Status: **CAPTURED — not a draft, not queued, not sized.** Nothing here is designed.
- Requested: **2026-09-05**, by the owner, **while answering a REQ-076 question**
- Owner's numbering: **none yet.** ⚠️ **This is NOT on his customer-facing list** — see below.

## Why it exists

Answering *"does pausing a Voucher booking give the session back to the quota?"*, the owner said **no — hold it**,
and gave the reason: he wants pause to be **one simple behaviour**, not a family of them.
*"ฉันพยายามให้มันเป็นอะไรที่มันง่าย ๆ แบบเดียว ๆ กัน ไม่หลากหลายแบบ"*

Then he separated the other thing himself, verbatim:

> *"ส่วนการยกเลิกพิเศษ หรือยกเลิกการจอง voucher แล้วได้สิทธิ์คืน ควรจะเป็นอีกเรื่องนึงต่างหาก แยกไว้"*

📌 **This is the good version of scope control and it is worth naming:** a question about feature A produced a
second feature B, and **he split it rather than letting it grow A.** REQ-076 stays a hold and nothing else.

## What it is, in one line

**Giving a Voucher session back to the family's quota when a booking is cancelled** — the "special cancel" that
REQ-076 deliberately does not do.

## What is NOT known — everything

🔴 **No requirement is written and none should be until it is picked up.** Not scoped here on purpose; the owner
has not ranked it and the customer has not asked for it in these words. The questions it will need, listed only
so the next reader does not start from nothing:

- Which cancellations return the quota, and which do not? *(REQ-009 already has three reasons — do they differ?)*
- Does it apply to anything besides Voucher?
- What stops a family cancelling repeatedly to avoid an expiry?
- Who may do it — any admin, or an owner-level action?
- Does the returned session carry the voucher's **original** expiry, or a fresh one?

## Relationship to what exists

- **REQ-076 (พักการจอง)** — the hold. **Explicitly NOT this.** REQ-076's AC-5 states the quota is held, and
  points here.
- **REQ-009** — cancel a 1HR / Voucher booking with a reason (✅ Completed and in use). **This REQ is about what
  happens to the ENTITLEMENT afterwards**, which REQ-009 never addressed.
- **REQ-BO-006** — cancelling 1HR / Voucher **from the backoffice**, with reasons. Related surface, different
  question, already on the owner's list as ToDo.

⚠️ **For Porter, next time the owner's list is updated:** this is **new scope that is not on his customer-facing
list.** It is not to be silently added — **it is his call whether the customer ever sees it as a line item**, and
it may be that this simply lives inside REQ-BO-006 when that is picked up. **Do not queue it, do not size it, and
do not let it drift into REQ-076.**

---

⚠️ **Renumbered 2026-09-05, same day it was created.** Porter wrote it as `REQ-080` without checking the
directory; **`REQ-080` was already taken** by *QA read-only access to `uat`* (created 2026-09-04 21:23, from the
owner via Marie, `READY_FOR_SA` and on the board). **Two files with one number is how a board row and a
requirement stop pointing at each other.** No board row ever referenced this file, so nothing else needed fixing.
📌 **The cause, and it is the same one as twice earlier today:** *I acted on what I remembered the numbering to
be instead of reading what the repo has.* **Next free board REQ number: `REQ-082`.**
