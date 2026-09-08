# REQ-082: ขยับวันหมดอายุได้ด้วยทุกคอร์ส (owner's **REQ-017**)

- Status: **DRAFT — captured 2026-09-05.** Three questions below; none is large.
- Requested: **2026-09-05**, by the owner, in his customer-facing list. **Never captured here before today.**
- Priority: not ranked. **Porter's read: it belongs with the other small items, not in the main queue.**

## Problem / Goal

The owner's line, in full: **"ขยับวันหมดอายุได้ด้วยทุกคอร์ส"**.

**Moving an expiry is already something admins do — it is how a paused course comes back.** REQ-071 resumes a
`DROPPED` course *"by an admin editing the expiry"*, and `REQ-076` (พักการจอง) leans on the same habit: the clock
keeps running and the admin extends it if it matters. ⇒ **This REQ is not new capability so much as making an
existing act available everywhere and on purpose.**

⚠️ **What "ทุกคอร์ส" is contrasted against is not stated**, and that is the whole question. Read literally it
implies **some courses cannot be moved today.** Nobody has said which, or why.

## Why this is worth writing down rather than treating as trivial

- **`courseExpiry` has been wrong before.** `FIX-007` (✅ Completed) fixed an expiry that was off by one week for
  **every** course however created, and `C-07` in `SYSTEM-FACTS-CONTRADICTIONS.md` is still `_(unanswered)_`
  about **which write-up of that fix is current.** A REQ that edits expiries should not be built on top of an
  unsettled account of how they are calculated.
- **An expiry is the boundary of something a family paid for.** Moving it is giving or taking away sessions'
  worth of time. **It is a money-adjacent act performed by a staff click**, which is the category the owner has
  guarded most consistently.

## Questions — @Porter to the owner

1. **Which courses cannot be moved today?** *(expired ones · dropped ones · imported ones · ones with a posted
   sale?)* **"ทุกคอร์ส" is an answer to something; I do not know what.**
2. **Is there any limit** — a maximum extension, a rule against moving it into the past, a cap on how many times?
   ⚠️ Asked because **no limit is also a valid answer**, and it should be a decision rather than an omission.
3. **Is the change recorded?** Who moved it, when, from what to what. **Not a feature request** — without it,
   *"ทำไมคอร์สนี้หมดอายุวันนี้"* has no answer six weeks later.

📌 **Porter's read, to overrule:** this is small **and it pairs naturally with `REQ-084` (FIX-009)** — both finish
things REQ-071 started, both are admin-side, and doing them together costs less than doing either alone.

---

## ✅ ANSWERED 2026-09-06 — there is no hidden restriction. It is simply not editable.

> *"ลูกค้าอยากให้เขาสามารถแก้วันหมดอายุได้เองเฉย ๆ"*

🔻 **My question was built on a misreading and I am recording that rather than quietly dropping it.** I read
*"ขยับวันหมดอายุได้**ด้วยทุกคอร์ส**"* as implying **some courses are blocked today**, and asked which. **They are
not. The customer simply wants admins able to edit the expiry themselves.** *"ทุกคอร์ส"* was scope, not contrast.
📌 **Same error shape as three others today** — reading a phrase closely and then building on the reading instead
of checking it. **This one cost only a question.**

## What it is

**Let an admin change a course's expiry date.** That is the whole requirement.

## Acceptance Criteria

- [ ] **AC-1** — **Given** any course, **When** an admin opens it, **Then** the expiry date can be edited.
- [ ] **AC-2** — **Then** the change is recorded: **who · when · from what · to what.** ⚠️ **Not decoration** —
      an expiry is the boundary of something a family paid for, and *"ทำไมคอร์สนี้หมดอายุวันนี้"* must have an
      answer six weeks later.
- [ ] **AC-3** — **Then** the sessions already on the calendar are **not** moved, added or removed. **This changes
      one date and nothing else.**
- [ ] **AC-4** — **Given** a new expiry **earlier** than a session already scheduled, **When** the admin saves it,
      **Then** they are warned and told which sessions fall outside — **and it is still allowed.** *(Owner's rule
      on `REQ-084`, 2026-09-06: **warn, do not act.** One rule across both REQs, not two.)*
- [ ] **AC-5** — **Then** no money moves and no entitlement changes. Extending a course does not sell sessions.

📌 **`REQ-084` depends on this existing:** its resume warning tells an admin *"ขยับวันหมดอายุก่อน"* — **so the
control it points at has to be there.** **They ship together or the warning is a dead end.**
**Status: `READY_FOR_SA`.**
