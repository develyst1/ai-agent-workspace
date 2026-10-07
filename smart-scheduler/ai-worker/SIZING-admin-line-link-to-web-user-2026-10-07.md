# SIZING — tie the LINE admin link to a WEB USER instead of a shared code — @Sober, 2026-10-07
**For @Porter → the owner. 🚫 NOT a build, NOT cut — next round, the owner has not ruled.** Source of the ask: Khwan ("can a normal admin link LINE?"); the owner: *"เขาสร้าง user ผ่านเว็บไม่ใช่เหรอ ใส่ role ต่าง ๆ อ่ะ ทำไมเราต้องส่งรหัสให้"*.

## Today (facts, back repo)
- **A LINE admin = any LINE account that typed `สมัคร` → `แอดมิน` → the shared code** (`LINE_ADMIN_VERIFY_CODE`). Stored as a bare LIST of LINE ids (`app_settings.line_admin_user_ids`). **No link to a web user, a name, or a role.**
- **A web admin user** (Users page, super admin only) has a username, display name, role and grants — **and no LINE.** ⇒ **two identity systems that do not know each other; the weaker one holds the notices.**
- Every linked account gets EVERY admin notice (`notifyAdmins` loops the list).

## The shape I would build (one of two; the other below)
**"Link my LINE" from the web app, by the person, while logged in.** 🔑 **The web login already proves who they are — so no shared secret and no approval step are needed.**
1. **Web (FE):** a logged-in user opens their own profile → **«ผูก LINE»** → the server issues a **one-time code** (short, typeable, **expires in ~10 minutes, single use**, stored hashed, tied to THAT user id).
2. **LINE chat (BE):** the person types `สมัคร` → `แอดมิน` → **that one-time code** (the existing gate and miss-limiter reused). ⇒ the server writes **`users.line_user_id`** for that user and gives the admin menu.
3. **Recipients (BE):** `getAdminLineUserIds` reads **users who are linked AND not disabled** (and, if the owner wants filtering, **who hold a grant key such as "receive admin notices"** — the role system that already exists does the rest).
4. **Super admin's Users page (FE):** a **"LINE ✓ / not linked"** column with an **Unlink** action; the old "LINE admins" panel shows **names**.
**Migration:** one column `users.line_user_id` (unique, nullable). No data rewritten.

### What it buys — @Porter's reading, checked
| Porter's claim | verdict |
|---|---|
| removing a user removes their notices | ✅ **— by DISABLING** (there is no user delete; disable is the off switch, TASK-377). Recipients read only active users. |
| the super admin sees a NAME, not `…ab12` | ✅ |
| per-role notice filtering becomes possible at all | ✅ **"who gets admin notices" — yes, via a grant key.** ⚠️ **"which KINDS of notice each person gets" is a further step** (a per-kind preference) — not in this size. |
| no unrecallable secret | ✅ **for new links** — codes are one-time and expire. ⚠️ **The OLD shared code must be RETIRED explicitly** (unset it ⇒ the old path refuses), and **the accounts already linked the old way stay on the old list until each person re-links or the super admin removes them** — they cannot be mapped to a person automatically (we never stored who they are). **The cut-over date is the owner's.** |

### Size
| part | who | size |
|---|---|---|
| migration + one-time code issue/verify + webhook path + recipients from users + legacy list kept read-only + tests (incl. disabled ⇒ no notice, expired/reused code refused) | **@Jason (BE)** | **M ≈ 2–3 days** |
| profile «ผูก LINE» (show code, expiry, linked state) + Users page column/unlink + panel names | **@Fern (FE)** | **S–M ≈ 1–1.5 days**, in parallel once the BE contract is fixed |
| **new words** (web button + code screen, the chat prompt/success, the Users column) | **owner, via one copy set** | — |
⇒ **≈ 3 working days of build** + my verification + a sid gate (a LINE-on-a-phone check is the owner's). **Not this round.**

## The other shape (named so it is a choice, not an omission)
**Approval, like a COACH link:** the person types `แอดมิน` + their web USERNAME in the chat; it appears on Link requests; a super admin approves. **Smaller on the web side, but adds an approval chore for every admin** — and the web login already proves identity, so the approval proves nothing new. **I recommend the first.**

## TODAY, before any build — can someone be linked WITHOUT being told the code?
**Yes — but only by typing ON THEIR PHONE.** The code is checked against **the LINE account that SENDS it**, so **the owner can take a staff member's phone, open the OA chat in their LINE, type `สมัคร` → `แอดมิน` → the code**, and that account is linked. **Remotely: no** — typing it on his own phone links HIS account.
⚠️ **The typed code STAYS in that chat as a sent message** — the staff member can scroll up and read it. ⇒ **After linking, delete it from the chat** (LINE: long-press → Unsend, which removes it for both sides). ⚠️ **I cannot confirm from our code whether the OA's own chat view (LINE Official Account Manager) also keeps a copy** — if Khwan's team reads chats there, assume they can see it.

---
## ➕ 2026-10-07 — @Porter's observation checked: "ครู: Ek / Kwan / Jay / Bank / qatt75" on the Users page
✅ **REAL, from the code:** `users.teacher_id` (TASK-406, migration `0044`, REQ-097) — *"the teacher this account IS. Set ⇒ the account is SCOPED to its own calendar. NULL = an admin."* And a coach's LINE lives on the teacher record (`teachers.line_user_id`). ⇒ **the chain web user → teacher → LINE exists end to end — for COACHES.**
🔴 **But it is not a door for admins — it is the definition of NOT being one.** Setting `teacher_id` on an admin's account **turns it into a coach's account, scoped to one calendar.** An admin user has `teacher_id = NULL` by construction. ⇒ **Porter's narrower framing is exactly right** — *an admin user with no teacher record has no path* — **and the fix is still a NEW link on the user (`users.line_user_id`), not a reuse of the teacher one.**
**What it DOES give us:** the proof that "a web user carries a link to another identity, shown on the Users page as a line under the name" is an existing, understood pattern — **the FE column copies it.** **Size UNCHANGED (≈ 3 working days)**; at most a few hours off the FE half.
### Does disabling a user cut their notices for free?
- **Under the proposed shape: YES** — recipients would be *linked users whose `disabled_at` is NULL*. Disable = off, enable = on, no extra step.
- ⚠️ **TODAY, NO — and not for coaches either:** a coach's LINE notices go to `teachers.line_user_id`, **which disabling the coach's web user does NOT touch**; and today's admin notices go to the anonymous list, which no user state touches. **A disabled user keeps receiving LINE today.** *(Recorded as a fact, not a defect claim: whether a disabled coach should stop receiving their schedule is the owner's question.)*
