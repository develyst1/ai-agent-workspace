# TASK-538 — remove admin rights from a LINE account: the list and the removal — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size S.** 🔨 **Owner's ruling.** FE is TASK-539, which needs this first.

## §0 Why he asked for it
**There is no way to remove admin rights from a LINE account.** 🔴 **The demo phone is stuck as an admin and will start receiving admin leave notices the moment pushes resume on 1 Oct** — other families' children, by name.
📌 **And it is the other half of SEC-1.** TASK-534 shut the door; **this is how the room gets emptied.** 🔑 **A credential you cannot revoke per person is not a credential** — that was my own argument for why admin linking should need approval, and it applies here first.

## §1 Build — the backend half
- **A list of the LINE accounts linked as admin**, and **a removal**, both **super admin only.** 🔑 **Not `menu:` gated — an ACTION key**, as every power that changes who can do things has been. **Say which key you used and why**, and if you add one, it is the 61st.
- ⚠️ **Removal is not deletion of a person.** It takes the ADMIN role off that LINE account. 🔑 **After it, the account falls back to its OTHER role's menu — parent or coach — or to the visitor menu**, and **the sweep must agree** (TASK-530 taught the sweep `admin`; it must now read a removed admin as whatever they now are, **and never leave them expecting a menu nobody will give them**).
- **What the list shows:** 📌 **you established in TASK-534 that we store bare ids with no display name and no linked-at** — ⇒ **show what our own data can name** (the coach or parent behind that id where we know them), **and say plainly in the response shape what we cannot.** 🚫 **Do not invent a label that implies we know who someone is.**
- 🔑 **The account being removed must not be told.** No LINE message. **An admin losing a power is staff business, and a message would reach a phone that may be a stranger's** — which is the case that prompted this.
- ⚠️ **What happens if a super admin removes THEMSELVES?** Establish it and say so. **If the answer is "they lose the page they are standing on", that is acceptable but it must be deliberate** — and **if it would leave nobody able to grant admin again, stop and tell me**, because that is a lockout and it is mine to rule.

## §2 What must not move
🚫 SEC-1's gate · teacher and parent linking · TASK-524's actions · the account default (**still the visitor menu — it is what keeps sign-up alive**) · the admin's own one-cell menu for those who remain.

## Definition of Done
- [ ] A list and a removal, **super admin only, by an action key you name** · **the role removed, not the person**, with the menu falling back correctly **and the sweep agreeing** (pinned) · **the list showing only what our data can honestly name**, with the gaps stated in the shape · 🚫 **no LINE message to the removed account**, pinned · **self-removal established and stated** (and **stopped and reported** if it can lock everyone out) · §2 pinned unchanged · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 (or 61 if you add the key — say so) · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation letting a non-super-admin remove, one that messages the removed account, and one that leaves them on the admin menu · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): the list and the removal, super admin only. The role comes off, not the person; the menu falls back; the sweep agrees; no message · **3492 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · **60 = 60** (no key added) · four mutations bite

## §1 🔑 The guard: `requireSuperAdmin`, NOT an action key, and why
- Every existing power over who-can-do-what (**users · roles · grants**) is super-admin-only by **`requireSuperAdmin`** (`routes/users.ts`, `routes/roles.ts`), **never an action key**.
- 🔑 **An action key is grantable:** `hasAction` is true for a super admin **or anyone granted the key**. So a key would make this power **delegable to non-super-admins**, i.e. not "super admin only".
- ⇒ **The two routes live in the users group, behind its `requireSuperAdmin`.**
  - **No key added: `ACTION_KEYS` stays 60, and migrations 60 = 60** (keys are code constants, so there's no migration either way).
  - Pinned through the ROOT app with real tokens: **a non-super-admin holding `menu:settings` + `action:settings.edit` gets 403** on both the list and the removal, and nothing is moved.
- If you want it delegable later, that's a key, and a decision.

## §2 The endpoints (the shape Fern builds against, TASK-539)
- **`GET /api/users/line-admins`** ⇒ `{ admins: [{ ref, idTail, alsoTeacher, alsoParent, afterRemoval }], notKnown: [ …3 sentences… ] }`
  - `ref`: an **opaque 16-hex handle** (a hash of the id). **The full LINE id never leaves the server** (pinned: no id in the JSON).
  - `idTail`: `…abcd`, enough to tell two rows apart.
  - `alsoTeacher` / `alsoParent`: **our own record** of the coach / parent behind that account (the parent's name, else the row's phone). **`null` means WE don't know, not that nobody is.**
  - `afterRemoval`: `teacher-menu` · `parent-menu` · `visitor-menu` (teacher first, `detectLinkedRole`'s order).
  - 🔑 **`notKnown` is in the response itself:** *display name (never stored) · linked at (no per-link time) · how it was linked (a legitimate admin and one who used the old printed code look identical).* **There's no `displayName` / `linkedAt` field at all**, so no screen can imply we know them (pinned).
- **`DELETE /api/users/line-admins/:ref`** ⇒ `{ removed: { ref, idTail }, afterRemoval, menuSettled }`.
  - An unknown or malformed ref ⇒ **404 `NOT_FOUND` "ไม่พบบัญชี LINE แอดมินนี้"**, and nothing is written.
  - 📌 `:ref` is declared free-form in `FREE_FORM_PARAMS` (TASK-463's rule: every param is a uuid unless its route says otherwise), with the reason. The service accepts only the 16-hex shape. **The existing count pin moved 3 → 4.**

## §3 What removal does (by value)
1. **The id comes off `app_settings.line_admin_user_ids` FIRST.** That's the only thing `notifyAdmins` and `detectLinkedRole` read, so **from that write on, admin notices stop reaching it**, whatever LINE does next.
2. **Then the menu, best-effort:**
   - a coach behind the account ⇒ **the teacher menu**;
   - a parent ⇒ **the parent menu**;
   - nobody we know ⇒ **the per-user link is removed**, so the account default (the visitor menu) applies.
   - **Never left on the admin menu** (pinned for all three, plus a mutation).
   - **If LINE refuses the menu call:** it's still removed, `menuSettled: false`, and a loud log. The account keeps the admin menu's one cell (the web login, which shows no data) until a relink.
3. **The sweep agrees:** a removed pure admin is **no longer listed at all** (`listMenuUsers` reads the same list), so nobody expects a menu for them. A removed coach or parent is listed under that role (pinned by value).
4. 🚫 **No LINE message to the removed account.** It's pinned by behaviour (`enqueueLine` / reply / push spied: zero) and by source (the removal file names no sender).
   - An audit line goes to the **server log** only: *"…abcd removed by <actor> → <menu>"*.

## §4 ⚠️ Self-removal and lockout: established, NOT a lockout
- **A web super admin and a LINE admin are separate identities, and nothing in our data links one to the other.** Removing a LINE admin link **never touches anyone's web rights**. A super admin removing "their own" phone keeps the page they're standing on. **We can't even tell which row is "theirs"**, which is why the list doesn't try.
- **Granting LINE admin isn't a super-admin act. It's the admin CODE, typed in the chat (SEC-1's gate).** So removing even the LAST LINE admin can't remove the ability to grant it again: anyone with the code can re-link.
- ⚠️ **Two consequences, stated for the owner:**
  - **With zero LINE admins,** admin notices go to nobody. Each lands as ONE skipped row, "no admin recipient configured" (TASK-152's loud-not-silent rule). **Still better than a stranger's phone.**
  - **Until the owner sets a new 8+ code (SEC-1), NOBODY can link as an admin.** ⭐ **The safe order:** set the new code → real admins re-link → remove the unknowns.
  - 🔴 **The demo phone can go first, today, whatever the order.** It's the urgent one before 1 Oct.
- ⇒ **Not a lockout of the system.** The owner holds the code. **No stop needed.**

## §5 What did NOT move (pinned)
- SEC-1's gate.
- The admin link still settling the admin menu for those who remain.
- Teacher and parent linking.
- TASK-524's `action=admin`.
- **The account default** (`setDefaultRichMenu(unknown)`).

## §6 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=11)
- **NS: a non-super-admin can list/remove:** **BITES**.
- **MSG: the removed account is messaged:** **BITES**.
- **ADM: left on the admin menu:** **BITES**.
- **L: the list not written** (menu moved, notices continue): BITES.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **3492 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60 · **`ACTION_KEYS` still 60** — so no key was added, and I counted rather than took it.

🔑 **The ORDER of the removal is the part I would have got wrong: the id comes off the list FIRST, then the menu.** ⇒ **the notices stop before anything else can fail.** And **a LINE failure still removes the rights** — `menuSettled: false` and a loud log — **rather than rolling back.** 📌 **That is the right way round for a revocation: the thing that must happen is that they stop receiving other families' children, and the menu is cosmetic beside it.** A transaction that "safely" failed would have left the demo phone receiving notices on 1 Oct.
✅ **No LINE id anywhere in the response** — an opaque `ref` and an `idTail` — and **`notKnown` carries three sentences saying WHY we cannot name someone**, rather than a blank column. 🔑 **That is exactly the honest-label requirement, answered in the shape rather than left to the page**: Fern cannot accidentally invent a name because the payload does not contain one.
✅ **Never the admin menu after removal** — coach ⇒ teacher menu, parent ⇒ parent menu, nobody known ⇒ per-user link removed and the visitor default. **And the sweep agrees: a removed pure admin is not listed at all.**
✅ **No message, pinned by behaviour AND source**, with a server-log audit line only.

## ⚠️ The lockout answer is better than my question
**Not a lockout: web super admins and LINE admins are separate identities** — we cannot even map one to the other — **so the page is never lost, and granting LINE admin is the CODE rather than a super-admin act.**
🔑 **But he did not stop there, and the second half is the operational risk I was actually worried about:** with **zero** LINE admins, **notices go to nobody** (one skipped row), **and until the owner sets a new 8+ character code nobody can re-link.** ⇒ **"remove everyone" is safe for privacy and blind for operations**, and those are different things.
⭐ **His order is the right one and it is going to Porter: new code → real admins re-link → remove the unknowns — and the demo phone can go first, today.** 📌 **That sequencing is worth more than the endpoint: it is the difference between a revocation and an outage nobody notices until a family is not called back.**
