# TASK-536 — `ปฏิทิน` / `calendar` sends a link to the web app; the coach logs in and uses it on their phone — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size S.** 🔨 **Owner's ruling, in his words:** *"ส่งลิ้งไป ให้ครูล็อกอินเอง แล้วเข้าไปใช้เว็บ แบบบนมือถือ แค่นั้น"* — **no new page, no token page, no counting.**

## §0 What this replaces, and why the owner is right
Today the command answers with **the subscribe link** (TASK-519's page). **Khwan: the phone subscription does not update for her coaches** — and 📌 **Tanya's device check confirms it from the other side: on Android the Subscribe button does nothing at all** (LINE and Brave), and only Google Calendar's "From URL" works, re-polling in hours. **No iPhone was tested.**
🔑 **So we were protecting a feature that, on the phones his coaches actually use, never worked.** ⇒ **the command now sends a link to the web app.**

## §1 ✅ The scope — I checked it myself rather than take it from memory
**A logged-in coach sees only their own classes**, and it is the predicate everything else shares: `getCalendar` applies **`scope ? ownScopeWhere(scope)`** (`scheduler.service.ts:531`, and the cancelled tray at `:564`), with `GET /calendar` gated by **`menu:calendar`**. **TASK-487 widened that predicate to co-taught rows**, so a coach also sees the classes they are second teacher on.
🔑 **That is the difference between a schedule page and a leak, and I am not asking you to re-establish it** — **but if anything you touch would change it, stop.**

## §2 Build
- **The `ปฏิทิน` / `calendar` reply sends the web app's link** — **`PUBLIC_ADMIN_BASE_URL`**, the key TASK-530 already introduced and the publish already refuses without. 🔑 **Reuse it; do not add a second key for the same address.**
- **Use `?openExternalBrowser=1`**, for the reason TASK-530 established: **LINE's in-app browser cannot see the phone browser's cookies, so a session the coach already has is useless inside LINE.**
- 📋 **Propose the reply's words to me** (both languages), and **the `ปฏิทิน` line in the teacher help list** — REQ-109 §6's list currently promises *"ลิงก์ปฏิทินสอนทั้งหมด"*, which describes a subscription. 🔑 **It has to describe what the coach now gets: log in on your phone and see your schedule.** ⚠️ **The help list is APPROVED copy — changing a line in it goes to the owner, so give me the words and I will take them up.**
- 🚫 **Stop advertising the subscribe page and the `.ics` feed in the reply — but do NOT remove them.** **Both stay alive for anyone already subscribed** (the owner's instruction, and TASK-519's page and feed both keep working). 🔑 **Pin that the feed and the subscribe route still answer** — a task that stops advertising something is exactly where someone deletes it next week.
- ⚠️ **Say what a coach with no web account sees.** The owner says **not one coach has an account today**, and that creating them is the shop's onboarding — **so the honest first experience is a login page they cannot pass.** 📌 **I am not asking you to solve that; I am asking you to state it**, because it is the first thing Tanya will meet and the owner should not hear it from her.

## §3 What must not move
🚫 The feed · the subscribe page · the teacher schedule replies (`ตารางของฉัน`, the chips, the Monday digest) · any other help-list line · `PUBLIC_ADMIN_BASE_URL`'s publish-time refusal.

## Definition of Done
- [ ] The calendar reply sending the web app's link with `openExternalBrowser=1`, by value in both languages · **the existing key reused**, not a second one · 📋 the reply's words **and the help-list line proposed, not shipped** (approved copy) · the subscribe page and the feed **pinned still answering** while no longer advertised · **what a coach with no account sees, stated** · §3 pinned unchanged · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that advertises the subscribe link again and one that drops `openExternalBrowser` · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): `ปฏิทิน` / `calendar` / the chip send the web app. The reply's words are DRAFT (proposed below), and the help-list line is proposed, NOT shipped · **3471 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 60 = 60 · six mutations bite

## §1 What it does now
- **All three doors** (the chip `action=calendar`, typed `ปฏิทิน`, typed `calendar`) reply with **the web app's link: `<PUBLIC_ADMIN_BASE_URL>/?openExternalBrowser=1`**, **alone on its line** (TASK-519's linkifier lesson), once per language. Pinned by value.
  - `/` redirects to `/scheduler/calendar`, and the scope is the web app's `ownScopeWhere`, **untouched** (nothing I changed is near it).
- 🔑 **The key is reused, not a second one.** The new `lib/web-app-link.ts` is **TASK-530's builder (`adminMenuUrl`) over TASK-530's key**, so there's one address and one rule (https, no `?`/`#`, `openExternalBrowser`).
  - **Pinned:** the `PUBLIC_*` names read anywhere in `src` are exactly the three known ones (a second key BITES).
- **Key unset or bad on a box ⇒ the generic-error sentence + a loud log** (`🔴 [TASK-536] PUBLIC_ADMIN_BASE_URL is unset or invalid`). Never a broken link, never the old subscribe link.
  - ⚠️ **A runbook note for you:** until now this key mattered only **at publish**. **Now every box that answers coaches needs it set at runtime** (a sid box without it answers the calendar command with the error line).
- **Asking no longer MINTS a calendar token** (pinned: zero calls). `getCalendarTokenForLineUser` now has **no production caller**; I left it in place (it's harmless, and deleting it is a separate decision).
- **Removed from the copy:** `cal_link` (the subscribe reply) and `cal_not_teacher`, which nothing sends any more. **Both callers of the command sit inside a `linked === "teacher"` branch**, so no second role lookup is needed.

## §2 🚫 Not advertised ≠ removed: pinned still answering
- **`GET /api/calendar/subscribe/<token>` ⇒ 200 HTML** and **`GET /api/calendar/<token>.ics` ⇒ 200 `text/calendar`**, through the ROOT app.
- Both routes are **still mounted before the auth guard** (by source).
- **Deleting the feed route BITES.**
- TASK-519's own page tests are unchanged. Its *reply* test now asserts the reverse: **no subscribe page, no webcal, no token in the reply, and nothing minted**.

## §3 📋 Words: yours to take up
**(a) The reply** (📖 DRAFT, shipped, pinned by FORM until approved; then the pin flips to bytes):
```
📅 ตารางสอนของคุณอยู่ในระบบ SOM SCHEDULE:
<link>

แตะลิงก์ แล้วเข้าสู่ระบบด้วยบัญชีที่แอดมินให้ไว้
```
```
📅 Your teaching schedule is in SOM SCHEDULE:
<link>

Tap the link and log in with the account your admin gave you.
```
- **`SOM SCHEDULE`** is the app's own name, so it matches the admin menu's cell.
- 🔑 **The last line is the honest half.** It says there's a **login**, and that the account **comes from the admin**. With no coach holding an account today, that line is what sends them to the right person instead of a dead end.

**(b) The help-list line** (**APPROVED copy, so NOT shipped**; TASK-485's bytes are pinned unchanged, and changing them silently BITES):
- current: `· ปฏิทิน — ลิงก์ปฏิทินสอนทั้งหมด` / `· Calendar — Link to your full teaching calendar`
- ⭐ proposed: **`· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ`** / **`· Calendar — Link to the web app: your schedule on your phone`**
- It says what the coach now gets, keeps the list's "word — what it gives you" shape, and makes no subscription promise.
- 📌 Until the owner rules, the list still says "ลิงก์ปฏิทินสอนทั้งหมด", which is loosely still true (it *is* a link to their teaching calendar), so nothing is false in the meantime.

## §4 ⚠️ What a coach with NO web account sees (stated for the owner, before Tanya meets it)
1. Tapping the link opens the phone's browser (`openExternalBrowser`) on the **web login page**: **"เข้าสู่ระบบสำหรับทีมงาน" / "Sign in for staff"**, with username and password. **Nothing on it says how to get an account.**
2. Any attempt gets **"ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" / "Incorrect username or password"**.
- ⇒ **With no coach holding an account today, every coach's first experience is a page they can't pass.** The reply's last line is the only thing pointing them to the admin.
- 🔴 **And one onboarding fact the owner must have when the shop creates those accounts:** a coach sees *only their own classes* because **the web account is LINKED to their teacher record** (the users page's teacher field, TASK-406: *"the link, not the role"*).
  - **An account created WITHOUT that link is not scoped**: with the calendar menu it would show **every coach's classes and the families' names**.
  - It's not a code defect. It's the one field the onboarding must never skip.
- ⚠️ `openExternalBrowser` is documented LINE behaviour, **not observed on a device**; Tanya can confirm.

## §5 What did NOT move (pinned)
- The feed and the subscribe page.
- The chip's label (`ปฏิทินของฉัน`) and its action.
- `ตารางของฉัน` still reaches the schedule.
- The Monday digest (untouched).
- **The approved help list (bytes)**.
- `PUBLIC_ADMIN_BASE_URL`'s publish-time refusal (TASK-530's pins, green).
- Existing pins honestly moved:
  - TASK-276's flow list names `cal_web_link` in place of `cal_not_teacher` (still a bilingual `tb`);
  - the help-list tests observe "calendar reached" at the new builder (the command no longer calls the token lookup).

## §6 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=35)
- **S: the subscribe link advertised again:** **BITES**.
- **O: `openExternalBrowser` dropped:** **BITES**.
- **K: a second key for the same address:** BITES.
- **D: the feed route deleted:** BITES.
- **B: a broken link sent when the key is unset:** BITES.
- **H: the approved help line changed without the owner:** BITES.

⛔ Only you mark this DONE. The words in §3 are the owner's to rule.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **3471 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60.

✅ **The feed and the subscribe page are pinned STILL ANSWERING (200) and still mounted, and deleting the feed BITES** — which is the pin I asked for and the reason I asked: *a task that stops advertising something is exactly where someone deletes it next week.*
✅ **Asking mints no token any more**, and the two now-unreachable copy keys are removed rather than left as litter. ✅ **Key unset ⇒ the generic error and a loud log, never a broken link.**
⚠️ **And he caught what my task did not say: the key is now needed at RUNTIME on every box that answers coaches, not only at publish.** 📌 **That is a runbook change and it is mine** — TASK-530 introduced it as a publish-time key, and I would have left the runbooks saying so.

## 🔴 The finding that matters most is in his last two lines, and it is going up now
**A coach sees only their own classes *because the web account is LINKED to their teacher record* (TASK-406). An account made WITHOUT that link is UNSCOPED — every coach's classes and the families' names.**
🔑 **And the owner has just told us he will create the coach accounts himself, by hand, for 21 people.** ⇒ **the one field that must never be skipped is the one nobody has told him about.**
📌 **This is not a defect in our code — the scoping works exactly as designed.** It is that **the safe outcome depends on a step in someone else's process**, and **the failure is silent: the account works, the coach logs in, and sees more than they should.** ⚠️ **Nobody would notice from the inside.** ⇒ **straight to Porter for the owner, before he creates the first account.**

## 📋 The words
✅ **The reply's draft is form-pinned and shipped**, which is right: it is new copy on a surface that had none. 🔑 **And its last line — "sign in with the account the admin gave you" — is currently the ONLY thing pointing a coach at a human**, because the login page itself says nothing about how to get an account. **That line is load-bearing; pin it.**
📋 **The help-list line is NOT shipped** (approved copy, TASK-485). ⭐ His proposal — *"· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ"* / *"· Calendar — Link to the web app: your schedule on your phone"* — **I endorse it: it describes what the coach gets rather than what we send.** Going to the owner.
