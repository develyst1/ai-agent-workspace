# TASK-524 — an ADMIN tapping a menu button is told to register — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** Your finding in TASK-523.

## §0 What it is
**An admin tapping any menu postback gets `welcome` — *"type สมัคร"* — an instruction to register, sent to someone who is already staff.** It is not a list, and it is **not true of the person reading it.**
📌 **The same family as TASK-523's fifth case:** a role reading a message written for another. That one was a stranger being shown four commands they could not use; **this one is staff being told to sign up.**

## §1 Build
- **An admin's menu postback is answered as an admin** — their own line, the one TASK-523 gave their `reopen`, **reusing that decision rather than adding a branch.** 🔑 **If the one place that decides the list can decide this too, use it**; if it genuinely cannot, **say why before adding anything.**
- **Every other role's postback path is unchanged** — pin it. Unlinked still gets `welcome`, which is **correct for them and the reason the string exists.**
- 🔑 **Check whether the postback path has other role-blind answers.** You derived the *list* surfaces in TASK-523; **the postback default was outside that set.** ⇒ **derive the postback answers the same way and say whether `welcome` is the only one that lands on the wrong role.** 📌 That is the sixth time this round the same method has been worth running — **if it finds nothing, that is a result and I want it stated.**
- 🚫 No new copy where an approved line exists.

## Definition of Done
- [ ] An admin's postback answered as an admin, **through the one decision** (or a stated reason it cannot be) · every other role's postback pinned unchanged, **unlinked still `welcome`** · the postback answers **derived and classified**, with any other wrong-role answer reported (**or "none", stated**) · no invented copy · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation telling an admin to register again and one that stops an unlinked person getting `welcome` · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): an admin's postback is answered as an admin, THROUGH THE ONE DECISION (one line changed) · unlinked still `welcome`, byte-identical · the postback answers DERIVED: **`welcome` is NOT the only wrong-role answer — two more, both on the admin's own menu** · 3369 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60

## §1 The fix: one line, through the one decision
- The parent postback's guard for every non-parent was `textReply(tb("welcome"), lang)`. It is now **`textReply(tb(commandListKey(linked)), lang)`**, TASK-523's decision.
  - An **admin** gets `admin_linked_menu` (the line their `reopen` / `เมนู` already give).
  - An **unlinked** person gets `welcome`, **byte-identical**: the same string, through the same `textReply`, with the same "back to menu" chip.
  - A teacher never reaches this line (their branch returns first).
- **No branch was added and no copy invented.** The guard's position (between the teacher branch and the customer switch, TASK-346) is unchanged and still pinned.

## §2 The postback answers, DERIVED (`handlePostback`, every `return`) and classified by role
| postback | who can tap it | answer | right for the tapper? |
|---|---|---|---|
| `admin` (คุยกับแอดมิน) | **everyone** (both menus + the unknown menu) | mutes the tapper's chat, alerts admins with `kind: "parent_asked_for_admin"`, replies `admin_called` | ⚠️ **an ADMIN tapping it mutes their own chat and "calls" themselves**; for a teacher the alert is labelled a parent (see §3) |
| `role` / `enter` | everyone | the registration flow (`enter` ⇒ the `/register` LIFF sign-up link, or "send your phone") | ⚠️ **for an ADMIN (or any linked person) it offers PARENT sign-up** (see §3) |
| `lang` | everyone | `lang_switched` + `commandListKey(role)`'s list | ✅ by role (TASK-523) |
| teacher: `schedule` / `calendar` / anything else | linked teacher | schedule · calendar · `teacher_linked` | ✅ |
| **any non-parent reaching the customer switch** | admin · unlinked | ~~`welcome` for both~~ ⇒ **admin → `admin_linked_menu`**, unlinked → `welcome` | ✅ **fixed** |
| customer: suspended / `checkin` · `leave` · `qr` · `children` · `mycourses` · `register` · `default` | linked parent | `suspended_notice` · the actions · `doMenu("customer")` | ✅ |

## §3 ⚠️ The answer to your question: `welcome` was NOT the only wrong-role answer. Two more, NOT fixed (named)
**Both are on the ADMIN's own menu.** `verifyAndLink` gives an admin **no role rich menu** (`if (role !== "admin") settleLinkedRole(…)`), so an admin keeps the **unknown** menu, whose two cells are exactly **`action=enter`** and **`action=admin`**.
- **So those two buttons are what an admin actually meets**, before `welcome` could ever be reached (that one needed the "back to menu" chip or a stale button).
1. **`enter` (เข้าใช้ระบบ / Sign Up) ⇒ a PARENT sign-up link** (`liff_signup`), or "send your phone" when no LIFF id is set. **Staff are invited to register as a family.** The same applies to any linked person tapping it, but only an admin has that button on their menu.
2. **`admin` (คุยกับแอดมิน) from an admin ⇒ mutes the ADMIN's own chat for an hour** and sends every admin (themselves included) a "someone asked for an admin" alert. The bot then goes silent **in a staff member's chat**.
- 📌 **Latent, not live:** `doCallAdmin` labels every caller `parent_asked_for_admin`, **teachers included**. Today that kind renders as the default text (its copy is parked, TASK-334), so nobody reads "parent". **When that copy lands it must not say "parent" for a teacher.**
- **Why not fixed here:** both change what a **menu button does** for a role, not which words a list shows. The honest fix is probably **giving admins a menu of their own** (or none), and that's a rich-menu decision (assets + the owner's words), not a reply-string swap. **Yours to cut.**

## §4 Proof (`command-list-by-role-task523.test.ts`, +8 tests, through the REAL dispatcher)
- **Admin taps `menu` / `checkin` / `mycourses`** ⇒ exactly `{ text: tb("admin_linked_menu"), quickReply: [back to menu] }`, and **never a word containing "สมัคร"**.
- **Unlinked taps the same three** ⇒ exactly `{ text: tb("welcome"), quickReply: [back to menu] }`, **byte-identical to before**.
- **Teacher unchanged** (an unknown action and `menu` ⇒ `teacher_linked`). **Parent unchanged** (`menu` ⇒ their list + four chips).
- **Mutations** (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=29):
  - **A: an admin is told to register again:** BITES (3);
  - **U: an unlinked person no longer gets `welcome`:** BITES (3).
- **Existing pins moved (same claims):**
  - TASK-346's guard pins now quote the new line: still **live**, still **between the teacher branch and the switch**, and **`welcome` for the unlinked** now asserted where the decision says so;
  - its "the record is in the code" window widened, because my 3-line note sits between the `baa6015` record and the guard;
  - TASK-275's live-site list now quotes the new guard.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified in the current tree: **3400 / 0 normally and unreachable** · tsc 0 · 60 = 60.
✅ **One line, through the one decision, no branch and no invented copy** — and **`welcome` for the unlinked is byte-identical**, asserted where the decision says so. That is what "use the one place" was for.

🔴 **And the answer to my question is NO, `welcome` was not the only wrong-role answer — which is why I asked.** The two you found are worse than the one I sent you for, because **they are the buttons an admin actually meets:**
- **`verifyAndLink` gives an admin no role menu at all**, so an admin keeps the **unknown** menu — whose two cells are **Sign Up** and **Talk to an admin**.
- ⇒ **an admin's own menu invites them to register as a family**, and **the other cell mutes their own chat for an hour and sends every admin an alert that someone asked for an admin — including themselves.**
🔑 **So the defect I gave you was the one an admin could reach by accident; the ones you found are the ones they meet by design.** And you were right not to fix them: **both change what a menu BUTTON does for a role, which is a rich-menu decision — artwork and the owner's words — not a reply-string swap.** ⇒ **going to the owner with a recommendation.**
📌 **The latent one is the sharpest note in the report:** `doCallAdmin` labels every caller **`parent_asked_for_admin`, teachers included**, and nobody reads it **only because that copy is parked.** ⇒ **the day the copy lands, a coach's request arrives labelled as a parent's.** 🔑 **A false label that is invisible because its renderer does not exist yet is still a false label, and it will become visible on someone else's task.** ⇒ **TASK-525 (XS).**
✅ **And three existing pins moved with their claims intact**, including widening TASK-346's "the record is in the code" window because your own note sits inside it — **noticed rather than tripped over.**
