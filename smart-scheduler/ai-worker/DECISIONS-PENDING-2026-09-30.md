# DECISIONS WAITING ON THE OWNER — 2026-09-30
**Compiled by @Sober for @Porter.** 🔴 **Both engineers are now idle. Every REQ-110 item we are allowed to build is built. These five are the only thing left.**
⚠️ **@Porter: the wording below is mine, in English. You own the Thai.**
🔑 **Each one has a recommendation, so he can answer "as recommended" and be done.** 📌 **He can clear all five in one sitting; none needs the others.**

---

## 1. 🔴 The sid deploy — **ready three mornings ago**
**What it contains:** bulk confirm accepting Extended · the camp notice in his customer's format · the camp rate box · one-session teacher cover · the voucher extension · the course start-date change — **plus the leave-block and camp-delete work, which are inert until decisions 2 and 3.**
⚠️ **Why it needs him: it changes what Khwan is testing right now.**
⭐ **Recommendation: deploy it, and tell Khwan what changed on the screens she is using.** **Migrations 65 — `db:migrate` BEFORE the code.**
**Cost of waiting:** **Khwan is testing a build that is six items behind**, and everything she reports has to be checked against a version we have already moved past.

## 2. 🔴 What "Close a camp" should do — **holds a screen**
**He ruled: Close stops NEW bookings only; existing ones stay; Open re-allows.**
🔴 **What the system's existing close actually does:** removes the week from coaches' calendars **including days already past** · stops **coach AND parent reminders** · refuses per-day changes — **while still charging the children each day and still sending them the balance message.** ⚠️ **And it cannot be undone: reopening restores only FUTURE days.**
⭐ **Recommendation: make Close do exactly what he said — stop new bookings, nothing else.**
🚫 **Until he answers, we are not putting the button on screen:** 🔑 **"ปิดรับ" would promise far less than the switch behind it does.**

## 3. 🔴 Who records an advance leave — **holds a screen**
**He ruled: a teacher's advance leave blocks the whole day for new bookings, and existing classes are LISTED for the admin, nothing cancelled automatically.**
🔴 **Today's leave act CANCELS that day's classes** — **and a leave on an empty day records nothing at all**, which is the exact case Khwan asked for.
**The question: who records an advance leave — the admin, the teacher, or both — and when a TEACHER marks a future day off, should it still auto-cancel?**
⭐ **Recommendation: the new act replaces the old one for FUTURE dates, so "leave" means one thing.** ⚠️ **Otherwise we ship two acts with the same name doing opposite things.**

## 4. 🔴 The chat can still skip everything — **makes decision-10 optional**
**He ruled every field required, and the form cannot proceed until they are filled.** ✅ **True on the page.**
🔴 **A parent registering through the LINE CHAT can still type ข้าม and skip** — **and the chat has its own separate wording for the duplicate-name warning.**
⭐ **Recommendation: bring the chat in line with the page.**
⚠️ **Otherwise the honest thing to tell Khwan is: "required on the page — some children will still arrive with no birthday."**

## 5. ⛔ Can an ENDED voucher be extended?
**Today we refuse it.** 🔑 **"Ended" means the HOURS are gone, so extending a DATE cannot revive it.**
⭐ **Recommendation: keep refusing.** ⇒ **If he wants such a voucher usable again, the thing he actually wants is a TOP-UP — a different button, and a separate decision.**

---

# Also waiting, and not a decision — **a one-command report**
📋 **The backfill DRY RUN on sid and then uat.** 🚫 **It writes nothing.** **We need three numbers and a list of reasons back.**
🔑 **It tells us whether a final cleanup of old records is worth doing at all** — **and "a lot of them cannot be repaired" is a perfectly good answer**, because the live path is already fixed and every new record is written correctly.

---

# 📌 What is NOT waiting on him
**Nothing about the product is broken or half-done on screen.** **Items 8 and 2 are built on the server and deliberately invisible until he rules** — 🔑 **so a decision can be made calmly; nothing degrades while he thinks.**

---
# ✅ OWNER RULED, 2026-09-30: "1-5 ตามแนะนำ"
1. **Deploy sid now.** Tell Khwan what changed on her screens.
2. **Close a camp = stop NEW bookings only.** Nothing else changes; Open re-allows.
3. **Advance leave:** for FUTURE dates, the new act (block new bookings and list the existing classes) REPLACES the old auto-cancel. "Leave" means one thing.
4. **The LINE chat registration** gets the same required fields as the page: no ข้าม, and the same duplicate-name wording.
5. **An ENDED voucher cannot be extended** (keep refusing). A top-up would be a separate decision.
