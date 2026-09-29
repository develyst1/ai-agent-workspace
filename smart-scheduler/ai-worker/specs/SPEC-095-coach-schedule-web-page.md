# SPEC-095 — REQ-109 §8: Khwan wants the calendar command to send **a link to our own web page** instead of a phone subscription — ANALYSIS (Sober, 2026-09-27). **No build.**

**Her words:** *"อย่างไรส่วนนี้ก็ใช้ไม่ได้ เพราะมันไม่อัพเดทในปฏิทินโทรศัพท์ เปลี่ยนเป็นกดแล้วส่งลิงก์หน้าเว็บเราให้แทนได้ไหมคะ"* — **in practice the phone subscription does not update for her coaches.**

---
## §0 🔴 First, the thing that should change how we read this
**We closed TASK-519 two hours ago on the premise that `webcal://` subscribing was worth protecting.** Khwan is telling us **it does not work in the field** — so **the function I refused to trade away may never have been delivering.**
📌 **I do not know whether her coaches' subscriptions fail because of iOS's refresh interval (it can be hours or days and is not ours to set), because they imported a snapshot rather than subscribing, or because of the linkifier bug we just fixed** — and **the third one matters most**, because it means her evidence predates the fix.
🔑 **So the first question is not (a)–(e). It is: does her complaint survive the fix?** ⚠️ **Tanya can answer it on a device in ten minutes**, and if subscribing now works, this REQ may be a page she wants *as well* rather than *instead*. **I recommend that check before anything is built** — it is the difference between adding a page and replacing a feature.

---
## §1 (a) Is there already a coach-facing web schedule? **Yes — and it needs a login they may not have.**
The admin web app's **calendar**, scoped by REQ-097: a linked coach with `menu:calendar` sees **their own classes only** (the same `ownScopeWhere` predicate everything else now shares, and TASK-487 widened it to co-taught rows). **Tanya used exactly this in TEST-068.**
🔴 **The blocker is not the page, it is the account.** That page needs a **user login**. ⇒ **the real question is how many of the 21 coaches have one**, and **that is a DATA REQUEST, not something I can read from code.** If the answer is "one, made for testing", then **linking to it means creating and distributing 21 logins with passwords** — for people whose entire relationship with the system is a LINE chat.
📌 **And it is the wrong door for the job:** a coach standing in the shop wants to look at today, not sign in to an admin tool.

## §2 (b) A token page of the D3 shape: **yes, and it is the cheapest honest option**
- **The credential already exists:** every coach has a calendar token, and **it already grants exactly this data** (the ICS feed is the same schedule). ⇒ **no new account, no password, nothing for a coach to remember.**
- **The content already exists too:** 🔑 **`renderTeacherScheduleBody` (TASK-486/493) is one formatter already serving the LINE reply and the Monday digest** — today and this week, the approved statuses, the 3-letter days, the note line, the program name only. **An HTML page renders the same rows through the same rule**, so the page and the message cannot disagree.
- **What it shows:** **today and this week**, exactly REQ-109 §3/§7 — Confirmed and Attended for the week, plus Pending and Leave for today, Extended in both, cancelled hidden. **The named children**, as the LINE messages already show them.
- **Where it lives:** the same pre-guard route family as the subscribe page, with **the same headers** (`no-store`, `no-referrer`, `noindex`, `CSP default-src 'none'`) and 🔑 **registered in TASK-501's evidence**, because it is another unguarded public route.

## §3 (c) Login or token? ⭐ **Token, and I want the trade stated plainly**
| | login | token |
|---|---|---|
| what a coach does | signs in | taps a link |
| what we must create | 21 accounts + passwords | nothing |
| what leaks if shared | that coach's calendar, revocably, with a name attached | **the schedule of named children** |
🔑 **The token's exposure is real and it is not new: it is exactly what the ICS feed has granted since it was built, and the owner has just decided not to rotate those tokens.** ⇒ **a page behind the same token adds no new class of exposure** — it makes the existing one easier to reach, which is the point and also the risk.
⚠️ **What I would add regardless: the page must be no more generous than the feed.** Same window (30 back / 90 forward), same fields, **nothing the ICS does not already carry** — and **no actor, no rate, no parent, no phone**, by allow-list, as TASK-499 settled for the check-in doors.
🚫 **Not a login for this.** It solves a problem we do not have (revocation we are not using) at the cost of 21 people needing a password for a page they will open from a chat.

## §4 (d) What happens to the subscription and the subscribe page
⭐ **Keep both, and change only what the command SENDS.**
- **The feed stays exactly as it is** — existing subscriptions keep working and nothing is rotated. **Breaking a working subscription to fix a broken one would be a poor trade.**
- **The subscribe page stays reachable**, but the calendar command sends **the schedule page**, and that page carries **one line at the bottom: "add this to your phone's calendar" → the subscribe page.** ⇒ **the coach who wants a subscription still gets one; the coach whose subscription never updated gets something that always does.**
- 📌 **That also answers Khwan's complaint without asserting she is wrong about phones** — which matters, because **she is describing her own coaches' experience and we are describing what the code does.**

## §5 (e) Size
| piece | size |
|---|---|
| the page (route, headers, evidence entry, allow-list, reusing `renderTeacherScheduleBody`) | **BE S–M** |
| the calendar command sending it, with the subscribe line on the page | BE S |
| Tanya's device check first (§0) | — |
**Total BE S–M, no migration, no FE.** 🔑 **It is small because two things already exist: the credential and the formatter.** Had either been missing this would be an M–L.

---
## §6 What I need before cutting anything
1. ⚠️ **Tanya on a device: does a subscription now update, after TASK-519?** — **this decides whether the page replaces or supplements.**
2. 📋 **DATA REQUEST: how many of the 21 coaches have a web login?** — it is the only thing that could make §1 viable, and I expect the answer is "almost none".
3. ❓ **The owner:** a page behind a token that shows **named children's schedules** is the same exposure as today's feed, **but easier to reach.** He has just accepted that exposure for the feed; **I want him to accept it knowingly for a link a coach can forward in a chat.**
