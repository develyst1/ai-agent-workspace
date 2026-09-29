# TASK-521 — `reopen` shows a TEACHER the parent's command list — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** Tanya, TEST-075 D2. Last of the three.

## §0 What it is
TASK-485 gave a teacher the right list in the **Language/Help** reply. **`reopen` (the un-mute) still shows them the PARENT's list** — Add Student · My Course · Check-in · Request Leave — **none of which a coach can use** (REQ-109 §6 has the approved teacher list).
📌 **The same defect as TASK-485, on a surface that task did not touch** — because TASK-477 made the un-mute reply share `menu_body`, and 485 fixed the help reply only. 🔑 **Two surfaces, one vocabulary, fixed once each: which is exactly the shape we have spent the week replacing with "fix it where it is decided".**

## §1 Build
- The un-mute reply gives a **linked teacher** REQ-109 §6's approved list, and **a parent the parent's list**, unchanged.
- 🔑 **Find out why 485 did not reach here and say so** — and 🔑 **if the two lists can be chosen in ONE place that both surfaces read, do that instead of adding a second branch.** *A vocabulary decided in two places is the bug, not the symptom.*
- **The chips** follow the same rule: a teacher's chips must be commands a teacher has (TASK-477 built them from one list — **check whether that list is role-aware, and say so**).
- 🔑 **The list must be TRUE, as in TASK-485:** every word advertised must route **for that role**. Read the advertised words out of the copy and follow each one, as you did there.

## Definition of Done
- [ ] A teacher's un-mute reply carries REQ-109 §6's list, a parent's unchanged, both by value · **one place decides which list, if that is possible — said either way** · the chips role-correct · 🔑 every advertised word proven to route for that role · why TASK-485 did not reach this surface, stated · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation giving a teacher the parent list again and one advertising a word that does not route for a teacher · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): ONE place decides the list and the chips; every surface reads it · a teacher's `reopen` shows REQ-109 §6's list + a teacher's chips; a parent's is unchanged · 3324 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60

## §1 Why TASK-485 didn't reach this surface
- **The list was chosen at each call site, not in one place.**
  - TASK-485 added its role check **at the Language/Help postback alone** (its own ruling: "no restructuring").
  - TASK-477 had made the un-mute (`reopen` in a muted chat) call `doMenu(replyToken, lang, t("menu_body", lang))`, **with `menu_body` hard-coded at that call**.
  - And `doMenu` itself **always attached `parentActionItems`**.
- **So the fix landed on one of three surfaces and the other two kept deciding for themselves.**

## §2 The fix: ONE decision, read by every surface (`line-webhook.service.ts`)
- **`commandListKey(role)`** ⇒ `teacher_menu_body` for a linked teacher, else `menu_body`. **`commandChips(role, lang)`** ⇒ the teacher's chips, else the parent's.
- `doMenu(replyToken, lang, role, body = tb(commandListKey(role)))` attaches `commandChips(role, lang)`.
- **The surfaces that now read it:**
  1. Language/Help (the postback): `const listKey = commandListKey(await detectLinkedRole(lineUserId));`, same result as TASK-485;
  2. **the muted `reopen`**: `doMenu(replyToken, lang, linked, t(commandListKey(linked), lang))`, **the bug**;
  3. a parent's typed `เมนู` / `reopen` and the parent postback's `default:`, now `doMenu(…, "customer")`, unchanged for a parent;
  4. **an UNMUTED teacher typing `reopen`.** That was **silence**, while a parent got the list. `reopen` is the word the hand-off message advertises to everyone, so under TASK-245's rule (one word, one meaning) it now shows the teacher's list.
- **The chips (you asked whether TASK-477's list was role-aware): it was NOT.** `PARENT_CHIPS` went under every `doMenu`, for everyone.
  - The teacher's chips are now `teacherChips(lang)`: **today · this week · my calendar**, **extracted byte-identical from the schedule reply** (TASK-486's pair + TASK-044's calendar button).
  - The schedule reply now reads the same function, so **a coach meets the same three chips under the list and under their schedule.**
- **Copy untouched:** `teacher_menu_body` (owner-approved, byte for byte) and `menu_body` are unchanged.

## §3 Proof, by value through the real dispatcher (`teacher-help-list-req109.test.ts`, a new TASK-521 block of 6)
- **A MUTED teacher types `reopen`, TH and EN:** the reply **is** `teacher_menu_body` in the chat's language, with chips `[วันนี้ → action=schedule] [สัปดาห์นี้ → …&range=week] [ปฏิทินของฉัน → action=calendar]`.
- **A MUTED parent types `reopen`:** `menu_body` + `register · mycourses · checkin · leave`, **unchanged**.
- **An UNMUTED teacher types `reopen`:** their list and chips (it was silence).
- 🔑 **Every word the un-mute reply ADVERTISES routes for a teacher.** The words are read **out of the reply that was actually sent** (`ตารางของฉัน`, `ปฏิทิน`), then each is typed by a teacher and reaches `schedule` / `calendar`.
- 🔑 **Every chip under it, tapped by a teacher, answers.** The `data` is read off the sent chips, each tapped, and each reaches its answer; **no chip is a parent's action.**
- TASK-485's own tests are unchanged and green.

## §4 Break-and-watch (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=15)
- **T1: a teacher gets the parent list again** (the one decision reverted): BITES (6, **including TASK-485's Language/Help**, since both surfaces now read it).
- **T2: the un-mute decides its own list again:** BITES (4).
- **W: the teacher list advertises a word that doesn't route for a teacher** (`· เช็คอิน`): BITES (4).
- **C: a parent action among the teacher's chips:** BITES (4).
- **Existing source pins moved (same claims):** six lines that quoted `doMenu(replyToken, lang)` / `t("menu_body", lang)` / the inline `listKey` ternary now quote the role-carrying call (`line-mute-exit`, `line-stuck-exit`, `line-silence`, `bilingual-flows`, `line-v2-messages`).

## ⚠️ Named beside it (not changed)
- **A teacher typing `เมนู`** still gets `teacher_linked_menu` ("account linked ✅ you'll be notified…"), **not the command list**. A parent's `เมนู` shows the list. It's the same shape as this task on a third word, and it's its own copy decision (the owner's words), so I left it.
- **An ADMIN's `reopen`** shows the parent list, as before (admins have no list of their own). That's unchanged and probably harmless, but it isn't true.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified in the same tree: **3332 / 0 normally and unreachable** · tsc 0 · 60 = 60.

🔑 **He took the "one place decides" option rather than adding a second branch** — which is what I asked for and the harder of the two. ⇒ **the un-mute no longer decides which list to show; it asks the thing that knows.** 📌 **A vocabulary decided in two places is the bug, not the symptom** — and after TASK-485 fixed one surface and left this one, that is now demonstrated twice on the same lists.
✅ **Every chip under the reply was tapped and answers**, and **every advertised word proven to route FOR THAT ROLE** — the TASK-485 standard applied without being restated. ✅ **The parent's reply pinned unchanged.**

## ▶️ His two side-findings ⇒ **TASK-523 (XS), both together**
1. **A teacher's `เมนู` still answers "account linked…" rather than the list.** 📌 That is the third surface of the same vocabulary, found because he looked past the one the task named.
2. **An admin's `reopen` shows the parent list.** Lower stakes — staff, not a customer — but it is the same fault and it is a line of copy.
🔑 **They go together because they are one question: which list does each ROLE get, on every surface that offers a list?** Fixing them separately would be the third and fourth time we fix this vocabulary one surface at a time.
