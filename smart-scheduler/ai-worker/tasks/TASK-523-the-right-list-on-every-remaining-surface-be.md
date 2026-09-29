# TASK-523 — which list does each ROLE get, on every surface that offers one — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** Both findings yours, from TASK-521.

## §0 Why one task and not two
- **A teacher's `เมนู` answers "account linked…" instead of a list.**
- **An admin's `reopen` shows the PARENT's list.**
🔑 **These are one question — *which list does each role get, on every surface that offers a list?* — and we have now answered it one surface at a time three times: TASK-485 (help), TASK-521 (un-mute), and these.** 📌 **Fixing them separately would be the fourth and fifth time.**

## §1 Build
- 🔑 **Enumerate the surfaces that offer a list, from the source** — do not work from the two above. **The derived set is the deliverable**: the pattern that has found something every time this round is *derive the places, then classify each one* (TASK-512's inventory is the model). **If there is a fifth surface nobody has mentioned, I want it in the report.**
- **For each surface × role, say what is shown today and what should be shown.** Then fix the ones that are wrong.
- **Roles include ADMIN.** Lower stakes than a customer — **but an admin reading a parent's command list learns nothing true**, and "staff will cope" is how a system accumulates lies.
- 🔑 **Every advertised word must route for that role**, as in TASK-485 and TASK-521. **A list is a promise about typing.**
- **A teacher's `เมนู`:** decide whether the answer is the teacher list **or** deliberately something else, and **say which and why** — *"account linked…"* may be a deliberate confirmation rather than an oversight. ⚠️ **If it is deliberate, leave it and pin the reason.**
- 🚫 No new copy invented for a role that has an approved list. REQ-109 §6 is the teacher's; the parent's is TASK-477's.

## Definition of Done
- [ ] The list-offering surfaces **derived from the source**, each classified by role, **any unmentioned surface reported** · the wrong ones fixed, by value, per role · `เมนู` for a teacher ruled either way **with the reason pinned** · every advertised word proven to route for its role · no invented copy · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation giving a role the wrong list on each fixed surface · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): the ONE decision now covers EVERY role (teacher · parent · admin · UNLINKED); the table derived, classified and pinned · a 5th case nobody mentioned: the UNLINKED were shown the parent list · 3361 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60

## §1 The surfaces, DERIVED from the source (not from the two findings)
**The scan:** every reply built from a command-list or menu key (`menu_body`, `teacher_menu_body`, `teacher_linked_menu`, `admin_linked_menu`, `welcome`, `teacher_linked`), and every `doMenu` / `commandListKey` / chip builder, in `src/`.
- **A. Language/Help** (the toggle postback): `lang_switched` + the list.
- **B. `reopen` in a MUTED chat** (the un-mute).
- **C. The menu words typed in an UNMUTED chat** (`เมนู` · `menu` · `help` · `ช่วยเหลือ`) and `reopen`, per role branch.
- **D. The parent postback's `default:`** (parent-only branch).
- **E. The add-student wizard's replies** (`add_cancelled`, `added_done`, errors, `skip_done` + the list). These are **parent-only flows** (`pendingRole: customer`), correctly the parent list. **Checked, unchanged.**
- **F. Non-lists named for completeness:**
  - the teacher postback fallback `teacher_linked`;
  - the parent postback's `welcome` for a non-parent (see §4).

## §2 The table: what each role WAS shown, and what it is shown now
| surface | teacher | parent | admin | unlinked |
|---|---|---|---|---|
| **A** Language/Help | teacher list ✓ (485) | parent list ✓ | ~~parent list~~ ⇒ **`admin_linked_menu`** | ~~parent list~~ ⇒ **`welcome`** |
| **B** muted `reopen` | teacher list ✓ (521) | parent list ✓ | ~~parent list + parent chips~~ ⇒ **`admin_linked_menu`, no chips** | ~~parent list + parent chips~~ ⇒ **`welcome`, no chips** |
| **C** `เมนู` / help | ~~"account linked…"~~ ⇒ **teacher list + chips** | parent list ✓ | `admin_linked_menu` ✓ (`help`/`ช่วยเหลือ` now too) | silence ✓ (AC-16, unchanged) |
| **C** `reopen` (unmuted) | teacher list ✓ (521) | parent list ✓ | ~~silence~~ ⇒ **`admin_linked_menu`** | silence ✓ (AC-16) |
| **D / E** | — | parent list ✓ | — | — |
- 🔑 **The 5th case, which nobody had mentioned: an UNLINKED person was shown the PARENT's four commands** on A and B (e.g. someone handed over mid-registration who types `reopen`). **None of those four route for them.** They're now shown `welcome` (*type "สมัคร" to register*), the one word that works before you're linked.
- **Admin:** the parent's four were four lies (an admin tapping one is told to register). They now see their existing `admin_linked_menu` ("admin account linked ✅ — you'll be notified of leave requests") with **no chips**. **No copy invented**: an admin has no approved command list, and this is the line they already had.

## §3 The fix: the ONE decision, every role (`line-webhook.service.ts`)
- `commandListKey(role)`: teacher → `teacher_menu_body` · customer → `menu_body` · admin → `admin_linked_menu` · anyone else → `welcome`.
- `commandChips(role, lang)`: the teacher's three · the parent's four · **none** otherwise. `doMenu` **omits the quick-reply entirely** when there are none (LINE refuses an empty `items`).
- **The teacher's and admin's branches read the same menu words as a parent** (`CMD_MENU` + `reopen`) through `doMenu`, so one word means one thing (TASK-245).
- **A, B and D needed no edit:** they already read the one decision (521). That's the point of 521's shape.

## §4 A teacher's `เมนู`: ruled = THE LIST, with the reason pinned in the code
- `teacher_linked_menu` ("account linked ✅ you'll be notified when a schedule is confirmed") was written **2026-07-29, when a teacher had NO command list**. It was the only thing there was to say, **not a decision against a list**.
- REQ-109 §6 gave teachers an approved list (09-26), and a parent's `เมนู` shows theirs. So the teacher's `เมนู` shows the teacher list.
- The comment at the branch records this (dates included). `teacher_linked_menu` is now unused by these surfaces, and I left its copy in place.

## §5 Proof (`command-list-by-role-task523.test.ts`, 21 tests, through the REAL dispatcher)
- **The whole table, by value:**
  - 4 roles × A (the exact `lang_switched` + list);
  - 4 roles × B (the list in the chat's language + exact chips, and **no `quickReply` at all** where there are none);
  - 3 linked roles × `เมนู` / `help` / `reopen` (bilingual list + chips);
  - unlinked `เมนู` ⇒ silence.
- **Every advertised word routes for its role:**
  - admin's line advertises **no** command;
  - `welcome` advertises `สมัคร` / `register`, and each, typed by an unlinked person, **starts registration** (`CHOOSE_ROLE` written, one reply);
  - the teacher's words and chips are already proven in TASK-521's file;
  - **no role except a parent is shown the parent list.**
- **Mutations** (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=21), **one per fixed surface**:
  - **A:** admin → parent list: BITES (6);
  - **N:** unlinked → parent list: BITES (3);
  - **T:** teacher `เมนู` → "account linked" again: BITES (2);
  - **R:** admin `reopen` → silence again: BITES;
  - **C:** admin / unlinked get the parent chips: BITES (5).
- **Existing pins moved (same claims):** the 521 ternary (two files), the teacher-keeps-answering pin (`line-silence`), and the bilingual-flows site list (the teacher / admin menu replies now go through `doMenu`).

## ⚠️ Named beside it (not changed)
- **An ADMIN tapping any rich-menu POSTBACK is told `welcome`** ("type สมัคร to register"). The parent postback path answers every non-parent that way (`if (linked !== "customer") … welcome`). It isn't a list surface, but it's a false sentence to an admin. Whether admins even see a tappable menu is a rich-menu question I haven't traced.
- **The rich menus themselves** (the images, one per role at link time) are a list surface too, but they're LINE assets assigned by `linkRoleRichMenu`, not server text, and are outside this scan.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified: **3361 pass / 0 fail normally and unreachable** · tsc 0 · 60 = 60.

🔑 **The fifth case is the one that justifies the whole task: an UNLINKED person was being shown the PARENT's four commands, none of which route for them.** Nobody mentioned it — not Tanya, not me, not the two findings that started this. **It was found because he derived the surfaces instead of working from the two I named**, which is the sixth time this round that deriving a list has found something a list had missed.
📌 **And it is the worst of the set by audience:** a teacher shown parent commands is confused; **a stranger who has just found our OA is shown four things they cannot do, on the one message that was supposed to tell them how to start.** Now `welcome` — *type สมัคร* — **with `สมัคร` / `register` proven to actually begin registration.** A list is a promise about typing, and that one was a promise to a person with no account.
✅ **The teacher `เมนู` question answered from history rather than opinion:** *"account linked…"* was written **07-29, when teachers had no list** — **the only thing there was to say, not a choice** — and he pinned it **with the dates**. 🔑 **That is how to retire an old behaviour: show it was never a decision.**
✅ **One decision now covers every role** — teacher, parent, **admin**, unlinked — with the whole table pinned by value through the dispatcher, and **one mutation per fixed surface.** The question I set (*which list does each ROLE get, on every surface that offers one?*) now has one place that answers it.

## ▶️ His finding ⇒ **TASK-524 (XS)**
**An admin tapping any menu postback is told to register** — `welcome`, *"type สมัคร"* — **to someone who is already staff.** A false sentence, and not a list at all. 📌 **Same family as the fifth case above: the wrong role reading a message written for another.** Small, and worth closing while the one decision is fresh.
📌 **The rich-menu images are outside the scan and he says so** — correct: they are artwork, not copy, and a scan that claimed them would be lying about its reach.
