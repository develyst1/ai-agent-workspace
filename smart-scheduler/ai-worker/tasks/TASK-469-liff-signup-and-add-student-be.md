# TASK-469 — `REQ-107 §2`: the sign-up cell and the Add-Student reply point at the EXISTING `/register` LIFF — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size S.** No migration. After TASK-468 (it owns the cells).

## §0 What this is, and what it is NOT
`/register` already does the whole job — `lookup` (find the family by phone) · `link` (bind this account) · `create` (**add a child to my family**, the one writer, with the per-parent cap) — all behind `verifyLiffIdToken`, and both LIFF ids are already in the env files (**demo on `.env.sid`, real on `.env.uat`**). ⇒ **This task is wiring, not building a page.** 🚫 Do not touch `/register` itself.

## §1 Build
- The unlinked menu's **Sign Up** cell opens the LIFF link instead of starting the typed-phone flow (a URI action, or a postback whose reply is the link — say which and why; the cell's shape is TASK-468's).
- **Add Student:** the bot replies with the customer's exact words + the link (EN *"Please click the link below to add a student."* / TH *"กรุณากดที่ลิ้งค์ด้านล่างเพื่อเพิ่มนักเรียนค่ะ"*) — the bytes come from the sheet in `project-docs/customer-2026-09-25-richmenu/`, not from memory.
- **The LIFF id comes from the environment, never a literal** — `.env.sid` must send the demo one and `.env.uat` the real one, or a parent on the demo OA lands on the customer's real page. Pin that no LIFF id is hard-coded in `src`.
- 🔑 **The typed-phone path stays WORKING** (the owner's ruling): the menu stops advertising it, `สมัคร` and a phone typed unprompted (TASK-447) still link a family exactly as today. **Pinned by value** — this is the fallback for a parent whose LIFF page will not open, and it is the door we re-opened last week.
- 🚫 No change to `/register`, to the link rules, or to what the reply says beyond the sheet's words.

## Definition of Done
- [ ] The cell's target and the Add-Student reply by value (both languages, the sheet's bytes) · the id read from the env, none hard-coded (pinned) · **the typed-phone fallback still links a family, by value** · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that hard-codes the real LIFF id (a demo parent would reach the customer's page) · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — both cells answer with the `/register` LIFF link from `LIFF_ID`; typed paths intact; 3021 pass / 0 fail; 9/9 mutations bite

**Numbers:** `bun test` **3021 pass / 0 fail** (+10; new `src/services/liff-link-req107.test.ts`, through the REAL dispatcher with the TASK-447 harness) · `tsc` **0** · 🚫 no migration (**56 = 56**) · 🚫 `/register` untouched · no existing pin moved.

## §1 The choice you asked for: a POSTBACK whose reply is the link (not a URI cell). Why:
1. **The id is read at reply time by the server attached to that OA.** Its env file carries both that OA's token and that OA's LIFF id (`.env.sid` = demo, `.env.uat` = real). A URI cell would bake the id into a menu **published** to the OA. A publish run from a box whose env doesn't match would then leave the other OA's id on a live menu until someone republishes, which is exactly the "demo parent lands on the customer's page" failure.
2. **Nothing needs publishing for it to work.** The cells are still `action=enter` / `action=register`, so today's live menus answer with the link the moment this deploys, and TASK-468's cells stay reused by reference.
3. **The fallback is free.** No `LIFF_ID` on a box ⇒ each tap keeps today's typed flow (pinned by value), so a missing env line cannot close the door.
- **Cost:** one extra tap (the reply, then the link). If the owner wants one tap straight to the page, it becomes a URI action at publish time; I would then guard the publish so it refuses to run when `LIFF_ID` is unset.

## §2 What was built
- **NEW `src/lib/liff-link.ts`:** `liffId()` (trimmed `process.env.LIFF_ID`, blank = unset), `liffUrl()` = `https://liff.line.me/<LIFF_ID>` (the sheet's link shape, id masked when I read it), `liffLinkBody()` = the customer's sentence **in both languages** then the link **once** (your ruling f: words bilingual, data once). No id ⇒ `null`.
- **i18n `liff_add_student`:** her rows 41–42 byte for byte: TH `กรุณากดที่ลิ้งค์ด้านล่างเพื่อเพิ่มนักเรียนค่ะ` · EN `Please click the link below to add a student.`
- **`action=enter` (Sign Up):** link reply, **no step set** (the page links the family). No id ⇒ `AWAIT_CODE` + the phone question, exactly as before.
- **`action=register` (Add Student):** link reply, no step. No id ⇒ `AWAIT_STUDENT_NAME`, exactly as before.
- **`.env.example` comment corrected:** it said "the page reads it; the server does not", which is now false. No value added.

## §3 The typed-phone fallback, by value (the owner's ruling)
With `LIFF_ID` set: an unlinked chat typing `0924912848` still reaches `linkFamilyByPhone` and gets the `found` reply, with no link in it. `สมัคร` still opens `CHOOSE_ROLE` and is not rerouted to the link. Typed `เพิ่มนักเรียน` is unchanged (still the in-chat flow).

## §4 🔴 No LIFF id in the code (pinned)
A scan of `src/` + `scripts/` for the id's shape (10 digits - 8 characters) and for any `liff.line.me/<literal>` finds **nothing** except the three labelled test fakes. The tests use FAKE ids of the right shape (`0000000000-FAKEfake`, …), and "demo box ⇒ demo id, real box ⇒ real id" is pinned as two different env values giving two different links.

## Break-and-watch: `mut469.mjs`, 9 mutations, **9 bite**
`finally` + sha-256 restore, byte-identical each time. `git diff` CHECKSUM `ab709e80…` identical before and after. `BASELINE=63` read off the run on 4 suites.
- A 🔴 **the LIFF id hard-coded**, using a stand-in with the real id's exact shape: the scan is shape-based, so the real id is caught the same way. ⚠️ I did not write the real id into the repo even for a mutation run, because that is the literal this task forbids. This is a deviation from the DoD's wording; the pin is the same.
- B Sign Up sets `AWAIT_CODE` before the link
- C 🔴 Sign Up never sends the link
- D 🔴 Add Student never sends the link
- E 🔴 no id ⇒ the tap answers nothing
- F her EN sentence reworded
- G the link printed twice
- H 🔴 `สมัคร` rerouted to the link
- I a blank `LIFF_ID` treated as set

## §5 For the deploy (owner)
The bot reads `LIFF_ID` from the **running server's** env. Each box's live env must carry its own OA's id (Porter saw `.env.sid` = demo and `.env.uat` = real; I only listed variable names, never values). A box without it simply keeps the typed flow. ⚠️ Per REQ-107 §6, the real LIFF's endpoint must move to `https://frontoffice.develyst.online/register` at go-live. That is a LINE console setting, not code.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me: **3021 pass / 0 fail** (three consecutive clean runs) · tsc 0 · 56 = 56 · no LIFF id anywhere in `src`/`scripts` (the only occurrence is the builder in `lib/liff-link.ts`, which reads the env) · `/register` untouched.
**His choice — a postback whose reply carries the link, rather than a URI cell — is better than what I specified, for a reason I had not weighed:** a URI cell bakes the id into the PUBLISHED MENU, so a menu published from the wrong box would carry the other OA's LIFF for ever, on a real account, invisibly. Reading the id at reply time means the link always belongs to the server that answered — **the same class of protection as TASK-448's account guard, one layer down.** It also means today's live menus keep working on deploy with no republish. The cost is one extra tap, stated rather than hidden.
Also right:
- **No `LIFF_ID` ⇒ every tap falls back to today's typed flow.** The feature degrades to the thing it replaces, which is the only acceptable failure mode for a sign-up door.
- **The typed fallback proven through the real dispatcher** with the link on offer — a typed phone still links, `สมัคร` still opens the flow. That was the owner's condition and it is pinned, not assumed.
- ⚠️ **He would not write the real LIFF id into the repo even for a mutation run**, and used a same-shape stand-in with a shape-based scan. Correct: a secret-shaped value in a mutation is still a secret-shaped value in the git history.
📦 The deploy note goes to the owner: each server's env carries **its own** OA's `LIFF_ID`, and the real LIFF's endpoint moves to the frontoffice `/register` at go-live — console, not code.
