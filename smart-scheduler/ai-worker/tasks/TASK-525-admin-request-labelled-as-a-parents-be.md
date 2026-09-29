# TASK-525 — a coach's "talk to an admin" is labelled a PARENT's — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** Your latent finding in TASK-524.

## §0 What it is
`doCallAdmin` labels **every** caller `parent_asked_for_admin` — **teachers included.** Nobody reads it today **only because that copy is parked** (TASK-334) and the kind renders as the default text.
🔑 **So the day someone lands that copy, a coach's request arrives labelled as a parent's — and it will look like THEIR bug, in their task, with no way to see it came from here.** **A false label that is invisible because its renderer does not exist yet is still a false label.**

## §1 Build
- **The kind names who actually asked** — derive it from the caller's role rather than assuming a parent. 🔑 **Use the role the dispatcher already resolved; do not look it up again.**
- **The admin alert's own text is parked, so there is nothing to word here** — 🚫 **do not invent copy for a kind whose copy is a decision someone else will make.** If a new kind needs a registry entry to satisfy the walkers, add it **and say so**, because a registry counter moving is the kind of thing I want explained (TASK-508's five counters).
- 🔑 **Pin what an ADMIN tapping it does today, unchanged** — it mutes their own chat and alerts everyone including themselves. **That is TASK-524's other finding and it is the owner's; this task must not quietly fix it.**
- **By value:** a parent's call is labelled a parent's (unchanged), **a teacher's is labelled a teacher's**, an admin's is whatever the role resolves to.

## Definition of Done
- [ ] The kind reflects the caller's role, from the already-resolved role · a parent's path unchanged by value · a teacher's labelled correctly · **no copy invented**, any registry entry **named and explained** · **the admin-taps-it behaviour pinned unchanged** (TASK-524's separate finding) · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation labelling a teacher's call a parent's again · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): the admin alert's kind names WHO asked · a parent's unchanged · no copy invented · the admin-taps-it behaviour pinned UNCHANGED · 3407 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60

## §1 The change (`line-webhook.service.ts`, `doCallAdmin`)
- **One map, from the role:** `customer → parent_asked_for_admin` (**unchanged**) · `teacher → teacher_asked_for_admin` · `admin → admin_asked_for_admin` · **unlinked → `unlinked_asked_for_admin`**.
  - That last one was also labelled a parent. Someone who hasn't linked isn't known to be one; they may be a coach who hasn't linked yet.
- 🔑 **"The role the dispatcher already resolved": said honestly, with the one place it isn't.**
  - **The typed twin** (`คุยกับแอดมิน`) lives in the **parent's** command handler, reached only by a linked parent, so it passes **`"customer"`**. **No lookup.**
  - **The postback** handles `action=admin` **before any role check, deliberately** (TASK-234: *the one button that must never fail*). **Two existing pins assert that order**, so it has **no resolved role**.
  - ⚠️ **I first tried hoisting the handler's one lookup above that branch; those pins failed, and they were right**, so I reverted it.
  - **Instead, `doCallAdmin` resolves the role only when its caller passes none.** That's that path's **only** lookup: it **gates nothing** (everyone still reaches a person), and **nothing after it asks again** (the path returns). The postback call site is byte-unchanged.

## §2 No copy invented, and no registry moved
- **All four kinds render the PARKED default** (TASK-334), exactly as `parent_asked_for_admin` does today (pinned by value, TH and EN).
- **No counter moved:** the message-kind walkers derive their list from the renderer's `case` labels, and these kinds are rendered by `default:`, so there's no new `case`.
- The renderer's parked-copy note now says **the admin-request alert is four kinds, to be worded together — and never a teacher's as a parent's.**

## §3 Proof (`command-list-by-role-task523.test.ts`, +7, through the REAL dispatcher)
- **Each role taps `action=admin`** ⇒ exactly its kind (parent / teacher / admin / unlinked).
- **A parent's TYPED twin** ⇒ `parent_asked_for_admin` (**unchanged**).
- 📌 **An ADMIN tapping it, pinned UNCHANGED** (TASK-524's finding, the owner's): **their own chat is muted** (the `MUTED` row), **the admins are alerted** (themselves included, by `notifyAdmins`' own list), and the reply is `admin_called`.
- **All four kinds render the parked default**, TH and EN.
- **Mutations** (CHECKSUM identical, restores byte-identical, BASELINE=36):
  - **T: a teacher's call labelled a parent's again:** BITES;
  - **Q: someone QUIETLY fixes the admin-taps-it behaviour** (an admin's chat no longer muted): BITES, so the owner's finding can't be changed by accident;
  - **U: an unlinked caller labelled a parent:** BITES.
- **Existing pin moved:** "the typed twin calls the SAME handler" now matches `doCallAdmin(lineUserId, replyToken, lang` with or without the known role. Same claim.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27). **BE's board is clear.**
Verified: **3407 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60.

🔑 **A fourth case I had not asked about: an UNLINKED caller was also labelled a parent.** I sent this task for teachers. **The same false label was on a stranger** — someone with no account at all, filed to staff as a parent asking for help. 📌 **Third time this week that "who is this message about?" had one answer where it needed four**, and each time the extra cases were found by classifying the roles rather than fixing the one reported.
✅ **No copy invented and no counter moved, with the reason given** — all four render the parked default, and the walkers count renderer `case`s. **A counter that did not move, explained, is as useful as one that did.**

## 📌 The part of this report I most want on the record
I asked for *"the already-resolved role, do not look it up again"*. **He tried exactly that, the existing pins failed, and he reverted — then explained why the pins were RIGHT.**
**The postback handles `action=admin` BEFORE any role check by design** (TASK-234, asserted by two pins), so **there is no resolved role at that point to reuse.** ⇒ my instruction was **unfollowable on that path**, and the honest answer was one lookup, in `doCallAdmin`, **gating nothing.**
🔑 **He could have hoisted the lookup and made my sentence true at the cost of breaking a deliberate ordering** — the pins would have gone red and he would have had a reason to "fix" them. **Instead he read what they were protecting, put his change back, and told me my instruction did not fit.** **That is the behaviour that makes pins worth writing:** they only hold if the person who trips them treats a red test as information rather than an obstacle.
✅ **And the admin-taps-it behaviour is pinned UNCHANGED, with a mutation that bites when someone "quietly fixes" it** — the owner's decision protected by a test, not by memory.
