# TASK-528 — admins get NO rich menu — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** 🔨 **Owner ruling: admins get no rich menu.**

## §0 Why
Today an admin who links is given **no role menu**, so they keep the **unknown-visitor** menu — whose two cells **invite staff to register as a family** and **mute their own chat while alerting every admin, themselves included** (TASK-524).
🔨 **The owner's answer: none at all.** 🔑 **No menu is honest where a wrong menu is not** — an admin's tools are the web app.

## §1 Build
- **On linking as an admin, the account's rich menu is UNLINKED** — no role menu, and **not the unknown one either.**
- 🔑 **The distinction that matters: "no menu" must mean the account has no per-user link, NOT that it falls back to the account default.** The unknown menu **is** the account default, so leaving it unlinked would give them exactly the menu we are removing. **Say how you established which one you achieved** — from the LINE API's behaviour and our own relink sweep, not from the naming.
- **The sweep must agree:** `line:relink-menus` should read an admin as **correct**, not as `unlinked` needing repair. ⚠️ **If the sweep would "fix" an admin back onto a menu, that is the real work here** — and it is exactly the kind of thing that would undo this quietly on the next publish.
- **Nothing else changes:** teacher and parent linking untouched, and 🚫 **TASK-524's two behaviours stay as they are** (the buttons still do what they do for anyone who reaches them) — **this removes the menu, not the actions.**
- 📌 **Say what an admin sees in LINE with no menu** — presumably the plain chat bar. **If LINE shows something odd (a stale menu until the app restarts, say), say so**, because that is what Tanya will photograph.

## Definition of Done
- [ ] An admin ends with **no per-user menu link and not the account default**, with the mechanism established and stated · **the relink sweep reads an admin as correct**, not as needing repair (and if it would repair them, that is fixed) · teacher/parent linking pinned unchanged · TASK-524's actions pinned unchanged · what an admin actually sees, stated for Tanya · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation giving an admin the unknown menu again and one that makes the sweep repair them · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED — @Jason (2026-09-27): "no menu" for ONE user is NOT something LINE can do while the account has a default menu, and ours does. Unlinking an admin gives them exactly the unknown menu. Nothing built.

## §1 What I established (your §1 distinction, answered)
- **LINE shows a follower, in order:** their **per-user** menu → else the **account default** set by API → else the default set in the **LINE Official Account Manager** console (if any) → else nothing.
- 🔑 **There is no per-user "show nothing" setting.** Unlinking only removes the per-user layer, **which drops the user to the account default.**
- **Our account's default is the UNKNOWN menu, by design:** `publishRichMenus` ends with `setDefaultRichMenu(unknown)` (`line-rich-menu.ts:512`), commented *"the state a chat lands in with no code running."*
- **Our own code already records both halves of this:**
  - the relink plan: *"LINE serves the channel default only to a follower with no per-user link"*;
  - TASK-250's `clearDefaultRichMenu`: *"after this, a follower with no per-user link sees NO menu at all."*
- ⇒ **"Unlink the admin" = the unknown menu = the thing the ruling removes.** Building it would *look* done (an unlink call, a green test on the call) and change nothing on an admin's phone. **That's exactly the "from the naming, not the behaviour" trap you named, so I stopped.**
- ⚠️ **Labelled, not tested:** the layer order is LINE's documented behaviour plus our own notes above. I haven't run it against the OA (agents never touch the real OA, and the demo OA's push quota is exhausted). **Tanya can confirm on the demo OA** by unlinking her own admin account and photographing what's shown.

## §2 The sweep: the second half of your question
- `line:relink-menus` enumerates **parents and teachers only** (`MenuRole = "customer" | "teacher"`). **Admins aren't in it**, so it will **never "repair" an admin onto a menu**, and a publish won't move them.
- It also **won't protect** them: an admin's state is whatever linking left, which today is **no per-user link, so the default, so the unknown menu.**

## §3 The options (the owner's decision: menus carry artwork and his words)
- ⭐ **(a) A per-user ADMIN menu:** the smallest honest menu, **one cell** that opens the admin web app ("ผู้ดูแลระบบ — จัดการผ่านเว็บ" / "Admin — use the web app").
  - Linked on admin link, and the sweep extended with an `admin` role so a publish keeps it.
  - It isn't "no menu", but it's **the only per-user state that isn't the unknown menu**, and it says the one true thing: *your tools are the web app*.
  - It needs **one image and the owner's words**; then it's an S for me.
- **(b) Clear the account default** (`clearDefaultRichMenu`) and link the unknown menu **per user** to every unknown follower.
  - Then an unlinked admin really sees no menu. ❌ **But a NEW visitor would also see NO menu**: we don't handle `follow` (the owner's `baa6015` removed that dispatch), so nothing would link them.
  - **The sign-up entry would disappear for every new customer.** Not recommended.
- **(c) Leave it as it is:** admins see the unknown menu, and TASK-524's two findings stand. It's honest to name, but it isn't the ruling.
- 🚫 **In every option TASK-524's two actions stay as they are** (this is about the menu, not the buttons' behaviour).

## §4 What an admin sees, for Tanya's photograph
- **Today and after any "unlink":** the **unknown menu** (the two cells: Sign Up + คุยกับแอดมิน).
- **Under (a):** the one-cell admin menu.
- LINE can **hold the previous menu on screen until the chat is re-opened** (the app caches the menu per chat); on some phones it needs the chat closed and reopened. **She should photograph after reopening the chat**, not immediately after the change.

⛔ Nothing built. **Your ruling (a) / (b) / (c)** — and for (a), the owner's words and an image.

## §2a Sweep claim verified in code (`src/lib/line-menu-users.ts` `listMenuUsers`)
- It reads `teachers` + `parents` + `family_line_links` only. **No admin table**, so a pure admin is never listed, never repaired, never protected.
- ⚠️ **Nuance:** an admin whose LINE id is ALSO a teacher or a parent **is** swept, onto the teacher/parent menu (teacher wins, `dedupeMenuUsers`). Under any option, that dual-role account keeps its role menu; that's the owner's call if he wants admin to win.

---

# ⏸️ HELD by @Sober (2026-09-27) — **the owner's words cannot be built as written, and that is worth knowing rather than approximating.** Back to him with options.

**Stopping was right, and this is exactly the case my §1 was fishing for.** I wrote *"'no menu' must mean no per-user link AND not the account default"* **without knowing whether LINE can express that.** ✅ **It cannot.** LINE resolves **per-user → account default → OA Manager default → nothing**, and **there is no per-user "none"** — so with our publish ending in `setDefaultRichMenu(unknown)`, **unlinking an admin gives them the unknown menu, which is the thing the ruling removes.**
📌 **Our own code already said so** (the relink plan's "default only to a follower with no per-user link"; TASK-250's "clear the default ⇒ no menu") — **he read the constraint out of our own documentation rather than testing against the OA**, and **labelled it as not OA-tested.** That is the right combination: **the strongest evidence available without touching the customer's account, and honest about which kind it is.**

## 🔴 Why (b) is not merely worse, it is dangerous
**Clearing the account default would leave NEW VISITORS with no menu at all** — and **since `baa6015` there is no `follow` handling**, so **a stranger arriving at the OA would see nothing and sign-up would disappear.** 🔑 **That is the sign-up funnel, closed to fix a staff annoyance.** ⇒ 🚫 **not an option, and I want the reason recorded so nobody reaches for it later as "the simple fix".**

## ▶️ What goes to the owner: **(a), and I will argue for it as HIS intent rather than as a compromise**
**He said "none" because both cells an admin had were wrong for them** — one invited staff to register as a family, the other muted their own chat. 🔑 **Per-user "none" does not exist, so the honest way to deliver what he wanted is one cell that IS right: open the web app.** ⇒ **an admin stops being shown things that are wrong for them, which is the whole of his objection.**
**It costs one image and his words**, then S for the build, **plus an `admin` role in the relink sweep** — 📌 **and that last part is a finding in itself: the sweep enumerates parents and teachers only, so an admin is neither repaired nor protected by it today.**
**(c) leave it** stays on the table and is not absurd: **the two wrong cells are wrong every day, but they are wrong for staff, who can be told.** ⚠️ **If he picks (c), I want it recorded as a decision rather than a backlog item**, because the next person to see that menu will re-raise it.
