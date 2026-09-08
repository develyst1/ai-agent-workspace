# SPEC-076 — REQ-082: edit a course's expiry, and the audit record it needs

**Status:** ACTIVE · **From:** @Sober (2026-09-06) · **Source:** `REQ-082` AC-1…AC-5 (`READY_FOR_SA`)
**In the batch by the owner's reversal** — *"เอาทั้งหมดที่มีเนี่ยหมดเลย"*. **First deploy is `sid`, then `uat`.**
📌 **Pairs with REQ-084's feature half by design:** the resume warning says *"ขยับวันหมดอายุก่อน"*, so **the
control it points at must exist or the warning is a dead end.**

---

## §1 🔴 AC-2 needs a table, and there is nothing to put it in

`grep` for `auditLog` / `audit_log` / `courseAudit` in `db/schema.ts`: **nothing.** `SYSTEM-FACTS.md` already says
so — *"NO audit table exists anywhere: clearing a family's LINE link is a **log line only**."*

⇒ **AC-2 — *who · when · from what · to what* — is a new table and therefore the batch's SECOND schema change**,
after `0032`/`0033`. @Porter predicted this; it is confirmed.

### The call: a SPECIFIC table, not a general audit log
🚫 **Do not build "an audit system."** Nobody has specified one, and *"log everything"* is a design that grows
until it is switched off.
⚠️ **But this is the SECOND demand of its class in two weeks** — TASK-244 wants a durable trail for the family
LINE unlink, for the same reason (*a log line is not a record*). **Name the shape so the third demand can reuse it
rather than inventing a third answer**, and say in the table's own comment that TASK-244 is its likely second
tenant.

📌 **What the record is FOR decides its columns:** *"ทำไมคอร์สนี้หมดอายุวันนี้"* must have an answer **six weeks
later**. ⇒ **actor · timestamp · from · to · courseId.** 🚫 **No free-text reason** — nobody asked for one, and a
reason field on an audit row is a prompt somebody has to fill in and will not.

## §2 AC-3 is the whole point, and it is an ABSENCE
> *"the sessions already on the calendar are not moved, added or removed. **This changes one date and nothing
> else.**"*

⚠️ **This is the AC most likely to be violated by helpfulness.** The course plan reconciles sessions against
`size`, `maxWeek` and the expiry in several places (`reconcileCoursePlan`, `applyPlanChange`, `courseOwedTarget`).
⇒ **Assert that this path calls none of them**, with the reason. **An expiry edit that quietly regenerates a
plan is a worse defect than the missing feature.**

## §3 AC-4 — warn, and still allow. One rule across two REQs
The owner's rule, 2026-09-06: **warn, do not act.** ⇒ the response tells the admin **which sessions fall outside**
the new expiry and **saves anyway.**
🚫 **Not a refusal, not a confirmation dialog that blocks.** ⚠️ **And the warning's INPUTS come from the server** —
which sessions, how many — **not derived on the screen.** A second derivation on the FE is how the warning and the
truth come apart.
📌 **REQ-084's resume warning wants the same inputs.** **Build one warning shape and let both use it** — that is
what makes *"one rule across both REQs, not two"* true in the code rather than in the REQ text.

## §4 AC-5 — no money, no entitlement
An expiry is a **boundary**, not a purchase. ⇒ assert this path touches no `bo.movement`, no `usedSessions`, no
`usedHours` — **the same absence-with-a-reason shape TASK-260 used for `expiryDate`, inverted.**

## §5 (ข) — `EXPIRY_REQUIRED` becomes conditional
The owner's answer, and it is **his own rule applied to itself**: an expiry is required on resume **only when the
warning fires** (expired, or close to it), **never on a resume where nothing is wrong.**
⚠️ **So `resumeCourse` must be able to answer "is anything wrong?" before it demands anything** — the same
computation §3 asks for. ⇒ **one function, three callers:** the expiry edit's warning, the resume's warning, and
the resume's validation gate. 🚫 **Three copies of "is this expiry a problem?" is exactly this project's most
frequent defect.**

## §6 Build order and split
1. **BE** — the table + migration, the edit endpoint, the shared warning computation, `EXPIRY_REQUIRED` made
   conditional.
2. **FE** — the expiry control, the warning display, and **REQ-084's resume button**, which is now small: the
   endpoint has always existed and `TASK-263` fixed the payload that hid it.
⚠️ **DEPLOY RULE 3 applies again:** an editable expiry with no control is a server-side gate with no screen.
**They ship together.**
