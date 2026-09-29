# TASK-530 — the admin's one-cell menu: artwork, the sweep's new role, and the cell's words — BE, S. **Words proposed FIRST.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size S.** 🔨 **Owner ruling: option (a).** ⏭️ **Next deploy, not the sid one.** Supersedes TASK-528, which is closed as not-buildable-as-written.

## §0 What was decided and why
Per-user "no menu" does not exist, so **an admin gets ONE cell that is right for them: open the web app.** 🔑 **That delivers what he actually objected to** — an admin being shown two things that are wrong for them — **without clearing the account default, which would close the sign-up funnel for new visitors.**

## §1 📋 First, propose the cell's words to me — before any artwork
**One cell, bilingual, in the orange house style.** Say what you would put on it and **why that phrase** rather than a near neighbour. 🔑 **A one-cell menu is the whole of an admin's LINE surface, so the cell has to say what the thing IS, not what tapping it does to the app** — *"เปิดระบบ / Open the system"* means something to staff; *"ไปที่หน้าเว็บ / Go to the web page"* names a mechanism.
📌 **And say what the cell OPENS** — the web app's login, or a specific page. **If an admin's session is already live on that phone, does it land somewhere useful?** If tapping it usually means logging in again, **that is worth knowing before we promise "open the web app" on a button.**

## §2 The artwork
- **2500×843, ≤ 1 MB**, the same constraints TASK-472/484 settled, **the orange bilingual style** of the teacher menu.
- 🔑 **It is ONE cell, so the whole image is the tap target** — say what areas file you use and **pin the area to the full image**, because a one-cell menu with a half-width hit-box is the exact "looks right, taps wrong" failure TASK-484 taught us to check.
- 🚫 **Do not publish.** The owner runs every publish, by runbook — **and both runbooks need the new menu added, which I will do once the artwork lands.**
- ⚠️ **The generator: TASK-484's lesson applies directly.** If anything generates into `assets/line/`, **make sure this file cannot be overwritten by a regeneration** — and **say which mechanism you relied on.**

## §3 The sweep learns the role
**`line:relink-menus` enumerates parents and teachers only**, so an admin is today **neither repaired nor protected** — your own finding.
- **Add the admin role**, so an admin with no link or the wrong one reads as needing repair, and **an admin correctly on the admin menu reads as `ok`.**
- 🔑 **The failure I care about: the sweep must not read an admin as `unlinked` and "fix" them onto the unknown menu.** That is how this ruling would be undone on a publish, silently, months from now.
- **Say what `line:inspect-menus` shows** for the new set, since that is what the owner reads before a publish.

## §4 What must not move
🚫 TASK-524's actions (the buttons still do what they do for whoever reaches them) · the teacher and parent menus, byte-identical · `menuIdFor`'s existing roles · the account default (**it stays the unknown menu — that is what keeps sign-up alive**).

## Definition of Done
- [ ] 📋 **The cell's words proposed and ruled BEFORE the artwork** · the image at 2500×843 ≤ 1 MB with **the area pinned to the full image** · protected from regeneration, mechanism stated · the sweep knowing `admin`, with **an admin never read as needing the unknown menu** (pinned) · `inspect-menus` output stated · 🚫 nothing published · teacher/parent menus and the account default pinned unchanged · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation making the sweep repair an admin onto the unknown menu and one shrinking the cell's area · report here + `inbox/SA.md` + log.

---

# 📋 §1 PROPOSAL — @Jason (2026-09-27): the cell's words, and what it actually opens. **Nothing built; no artwork until you rule.**

## §1a The words: 📖 DRAFT, MINE
```
SOM SCHEDULE
เปิดระบบ · Open the system
```
- **The big line, `SOM SCHEDULE`:** the app's own name, **the owner's spelling** (TASK-357, "the customer's name for the app, everywhere a human reads it").
  - It's what staff already see on the login page and the browser tab.
  - 🔑 **It names what the thing IS**, and it reads the same in both languages, so it needs no translation.
- **The small line, `เปิดระบบ · Open the system`:** your example, kept because it stays **true in every case below**. The login page *is* the system's front door.
- **Near neighbours, and why not:**
  - ❌ `ไปที่หน้าเว็บ / Go to the web page`: a mechanism, as you said.
  - ❌ `ผู้ดูแลระบบ / Admin`: names the **person**, not the thing, and they already know what they are.
  - ❌ `เข้าสู่ระบบ / Log in`: in Thai UI that is **the login button's word**, and it would be **false** whenever their session is still live (see §1b).
  - ❌ `จัดการตาราง / Manage schedule`: names **one** part of the app, and the admin app is more than the calendar.

## §1b What it OPENS: the part that may change the words (established from the code; the LINE-browser half is labelled)
- **The target:** the web root `/`, which **redirects to `/scheduler/calendar`** (`app/page.tsx`). With no session, NextAuth sends them to **`/login`** (`pages.signIn`).
- 🔑 **Will a live session land somewhere useful? Usually NOT, and for two separate reasons:**
  1. **The session is short.** The backend token lives **12 hours** by default (`jwt.ts`: `JWT_TTL_SECONDS ?? 12*3600`; I did **not** read the server's value).
     - Any 401 **signs out to `/login`** (`lib/api/client.ts`).
     - ⇒ **An admin who logged in yesterday taps the cell, sees the calendar flash, then gets the login page.**
  2. **LINE opens a link in its OWN in-app browser**, which does **not share cookies** with Chrome/Safari.
     - ⇒ **Even an admin logged in on the same phone's browser a minute ago meets the login page inside LINE.**
     - ⚠️ **Labelled, not tested:** this is LINE's documented behaviour, not tested on a device.
     - **The fix is one query parameter:** LINE's documented `?openExternalBrowser=1` opens the phone's **default browser** instead, where their session (if still under 12 h) already lives.
     - ⭐ **I recommend it.** Tanya can confirm on the demo OA.
- 📌 **So "open the web app" on a button would over-promise; "เปิดระบบ" doesn't.** It says where you're going, not that you're already in.

## §1c A build fact you should know before ruling (it's the task's real size)
- **No menu cell today opens a URL.** Every cell is a **postback** (`RichMenuArea.action` is typed `postback` only).
- **Two ways to open the app:**
  - ⭐ **(i) a URI action**, the cell opening the link directly. It's a small, typed widening of `RichMenuArea` for this one menu, and **the teacher/parent/unknown areas stay byte-identical** (pinned).
  - **(ii) a postback whose reply is a link.** That's an extra tap *and* **a new message whose words the owner would also need.** Not recommended.
- **The base URL:** the backend has no web-app URL setting yet (only `PUBLIC_CHECKIN_BASE_URL` / `PUBLIC_CALENDAR_BASE_URL`).
  - I'd add **`PUBLIC_ADMIN_BASE_URL`**, read at publish.
  - If it's missing, **the publish refuses** rather than baking a wrong link into an image-backed menu.
  - That's a new env key for the owner's runbook, which you said you'd update.

## After your ruling (the rest of the TASK, unchanged)
- Artwork: 2500×843 ≤ 1 MB, **one area = the full image** (pinned).
- Protected from regeneration, with the mechanism stated.
- The sweep learns `admin`: **an admin is never read as needing the unknown menu** (pinned and mutated).
- The `inspect-menus` output stated.
- Nothing published.

⛔ **Your ruling:** (1) the words; (2) URI (i) vs postback (ii); (3) `openExternalBrowser=1` yes/no.

---

# 🔨 RULING — @Sober (2026-09-27) on all three. ▶️ **Build. The words also go to the owner, as he asked.**

## 1. The words: ✅ **approved as my recommendation, and sent up**
**Big `SOM SCHEDULE` · small `เปิดระบบ · Open the system`.** 🔑 **Your rejections are the argument:** `ไปที่หน้าเว็บ` names a mechanism · `ผู้ดูแลระบบ` names the person rather than the thing · **`เข้าสู่ระบบ` is FALSE while a session is live** · `จัดการตาราง` describes one part of the app. **`SOM SCHEDULE` says what the thing IS, identically in both languages.**
🔴 **But the finding behind the words is worth more than the words.** *"Open the web app"* — **my phrase, in my own task** — **would have over-promised**: the backend token lasts **12 hours**, and **LINE's in-app browser does not share cookies with the phone's browser**, so **tapping it will usually land on the login page.** 📌 **You established that BEFORE drawing anything.** Had the artwork come first, we would have printed a promise onto an image and then discovered it.

## 2. (i) **the URI action.** Not (ii)
**A URI action is one tap and a small widening of the area type, with the other menus' areas byte-identical.** **(ii) is an extra tap AND a new message that would need its own approved words** — ⇒ **it turns a one-cell menu into a two-step flow and adds copy to the owner's queue.** 🔑 **Between "widen a type we own" and "invent a message a customer reads", widen the type.**
⚠️ **But pin the widening narrowly:** only this menu's area is a URI; **every other menu's areas stay postback, asserted.** A permissive area type is the kind of thing that quietly spreads.

## 3. ✅ **`?openExternalBrowser=1` — yes**
**Because of your own finding:** LINE's in-app browser cannot see the phone browser's cookies, so **a session the admin already has is useless inside LINE.** Opening the phone's own browser is the only version where **"tap, and you are in"** is ever true. ⚠️ **Labelled as untested — Tanya confirms on a device**, and **say in the report that this is the one behaviour we are asserting from documentation rather than observation.**

## 4. `PUBLIC_ADMIN_BASE_URL`, and the publish refusing without it
✅ **Correct, and the refusal is the important half** — a menu that points at `undefined` would be published silently and discovered by an admin. 🔑 **Pin the refusal**, not just the read.
📌 **I will add the key and the new menu to both runbooks once the artwork lands** — that is mine, not yours, and it is written down here so it does not get lost between us.

---

# ✅ REPORT — @Jason (2026-09-27): built as ruled. The one-cell admin menu, a link that REFUSES when unset, and a sweep that knows `admin` · 🚫 nothing published · **3433 / 0 normally AND unreachable, 0 failed queries** · tsc 0 · 60 = 60 · nine mutations bite

## §1 The artwork: `assets/line/menu-admin.png`
- **2500×843, 57,231 bytes, PNG.**
- The orange house style of the teacher menu: an off-white ground and an orange line icon (a browser window) in a pale disc with three rays each side.
- **`SOM SCHEDULE`** is large and dark; below it, **`เปิดระบบ`** in orange **· `Open the system`** in dark.
- **No divider and no second "button"**, so the picture never suggests a hit-box the menu doesn't have.
- 📌 The words sit in one constant at the top of the generator (`WORDS`). They are **your recommendation, going to the owner**. If he changes them: edit, re-run, and the pins below still hold.
- 🔑 **Protected from regeneration, and the mechanism relied on:**
  - it is drawn by its **own** script, `generate-admin-menu.mjs`, which writes **only** that file (one `.toFile`, pinned);
  - a test reads **every script in `assets/line/`** and asserts **only that one names `menu-admin.png`**;
  - so `generate-rich-menus.mjs` / `resize-customer-menus.mjs` can never overwrite it without failing the suite (mutation G).
  - The README's file table has the row.

## §2 The menu: `line-rich-menu.ts`
- **`adminMenuFor(link)`: ONE area, whose bounds ARE the image** (`{0,0,2500,843}`, pinned against the size).
- **A narrow widening:** `RichMenuArea` **stays postback-only**. The link area is **its own type** (`UriMenuArea` → `AdminMenuDef`), so the compiler refuses a link anywhere else.
  - Pinned by value too: **every other menu we define has postback areas only**, and the admin menu is the one link.
- **The link:** `PUBLIC_ADMIN_BASE_URL` + **`/?openExternalBrowser=1`**.
  - ⚠️ **This is the one behaviour asserted from LINE's DOCUMENTATION rather than observation**: that parameter opens the phone's own browser, where a live session can exist. Not seen on a device. **Tanya can confirm on the demo OA.**
- 🔴 **The refusal, pinned in three places:**
  1. `adminMenuUrl` **throws** on missing / empty / not-a-URL / not https / carrying `?` or `#`.
  2. **The publish SCRIPT** adds it to its preflight, so the run **refuses before any LINE call** (the same contract as a missing image).
  3. **`publishRichMenus` itself resolves the link FIRST**. A behavioural test with `fetch` spied: **no base ⇒ it throws and NOTHING reaches LINE**.
  - Belt and braces: **`createRichMenu` refuses any link area without an https link**, before `fetch`. So the `ADMIN_MENU` constant (link deliberately empty) can **never** be created as-is.
- **Publish creates four menus now** (`ids.admin`). **The account default is still `setDefaultRichMenu(unknown)`, exactly once** (pinned). Sign-up stays alive.
- **`inspect-menus`: no code change needed.** It already prints any area's link. For the new set it shows:
  `admin [<id>] … areas: 1 · #0 (0,0 2500x843) action.type=uri data=https://<base>/?openExternalBrowser=1` (pinned by value).
  The owner reads **one area, full size, and the exact link**, before and after a publish.

## §3 The sweep learns `admin`: the failure you care about
- **`MenuRole` gains `admin`, and its fallback list is EMPTY.**
  - 🔑 **For any stored ids, an admin's expected menu is the admin menu or NOTHING, never `unknown` and never a legacy id** (pinned over four id-shapes).
  - **Mutation U** (a fallback to `unknown`) **BITES**.
- **By outcome:**
  - on the admin menu ⇒ **ok**;
  - on the default ⇒ **RELINK → admin**;
  - on the unknown menu ⇒ **RELINK → admin** (the repair);
  - no admin menu published ⇒ **BLOCKED and left alone** (not "fixed" to anything).
- **The census** (`listMenuUsers`) now reads `line_admin_user_ids`, **LAST**: `detectLinkedRole` reads teacher → parent → admin, and the first occurrence wins.
  - ⇒ **A coach or parent who is also an admin keeps their role menu, in the sweep and at link alike** (the same order, pinned).
  - An admin shows as `(admin …1234)` (no name exists in the DB; the id's tail lets two be told apart).

## §4 The link door
- **At verify**, the admin branch now links the admin menu, **only when admin IS the account's role** (mutation D bites).
- 🔑 **RULE 1 caught my first placement:** I'd put the `linkRoleRichMenu` call in the chat, and the REQ-088 pin refused it. **The link lives in the register door** as `settleAdminLink`, beside `settleLinkedRole`.
  - It's best-effort (a LINE failure never breaks the verify; pinned by behaviour).
- **`if (role !== "admin") await settleLinkedRole(...)` is byte-unchanged**, and the teacher/parent linking is untouched.
- 📌 **Existing admins** (linked before this) sit on the default today. **After the owner publishes, the relink sweep lists them as RELINK → admin.** That's the step that moves them; nothing moves on its own.

## §5 What did NOT move (pinned)
- **The unknown, customer and teacher menus: byte-identical definitions** (JSON-pinned).
- The account default.
- **TASK-524's two actions:** the unknown menu still offers `enter` / `admin`, and the chat still handles `admin` before any role check.
- 📌 **No `คุยกับแอดมิน` on the admin menu, deliberately.** TASK-234's invariant promises that *a person* is reachable, and an admin *is* that person. It stays asserted for the family/visitor menus.

## §6 Existing pins honestly moved (counts only, each commented `🔻 TASK-530`)
- `NAME_TO_KEY` 3→**4**, `OUR_MENU_NAMES` 11→**12**, and publish creates/uploads **4**.
- `ids` `{…, admin}`; `ROLE_KEYS` + admin (the stored-ids report prints an `admin` line); the image-size pairing + admin; the census + admins.
- `expectedMenuKey`'s role-to-key line is now `const roleKey: keyof MenuIds = role;`.
- 🔑 **One pin was *strengthened*, not just counted:** adopt's "the map covers every menu publish creates, derived" test matched `createRichMenu\(([A-Z_]+)\)`, which **could not see** `createRichMenu(adminMenuFor(...))`. **It would have passed while missing the fourth menu.** It now matches `\w+`, and expects 4.
- ⚠️ **A consequence, reported:** `line:adopt-menus` on an OA **published before TASK-530** now reports `missing smart-scheduler-admin` and stores nothing (its existing all-or-nothing rule). **Re-publish first, then adopt** (pinned).

## §7 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=29)
- **U:** the sweep repairs an admin onto the unknown menu: **BITES**.
- **A:** the cell shrunk to half width: **BITES**.
- **R:** the refusal removed (a missing base becomes an empty link): **BITES**.
- **X:** `openExternalBrowser` dropped: BITES.
- **D:** a coach/parent-admin gets the admin menu: BITES.
- **C:** the census forgets admins: BITES.
- **W:** the widening spreads to `RichMenuArea`: BITES.
- **G:** another generator names the admin art: BITES.
- **V:** the https guard removed: BITES.

## §8 For you, as you said (written down so it doesn't fall between us)
- **The runbooks:** the new image path, and **`PUBLIC_ADMIN_BASE_URL`** (https, the web app's base, no `?`/`#`). **Without it the publish refuses.**
- **After publish:** run the relink sweep so existing admins move.
- 🚫 **Nothing published; no OA touched.**

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified: **3433 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60 · `assets/line/menu-admin.png` is **2500 × 843, 57,231 bytes** (read from the PNG header).

🔑 **The sweep's `admin` role has an EMPTY fallback, so an admin expects the admin menu or NOTHING — never `unknown`.** That is the exact failure I said I cared about, closed **by the shape of the role rather than by a condition somewhere in the sweep**: there is no value the fallback could return that would put an admin back on the visitor menu.
✅ **Admins are listed LAST, so a coach-who-is-also-an-admin keeps their coach menu** — at link time too. 📌 **That case would have been found by a real person on the demo OA and blamed on the new menu**; it is handled because he read `detectLinkedRole`'s order rather than appending a role to a list.
🔑 **And the pin he strengthened is the best thing in the report: adopt's "covers every menu publish creates" regex could not see `createRichMenu(adminMenuFor(...))`** — ⇒ **it would have PASSED while missing the fourth menu.** 📌 **Second time in two days that a derived check was blind to a new shape of call** (Fern's constant-vs-literal was the first). **A check that enumerates by pattern is only as good as the patterns it has met** — and both times the fix was to make the code legible to the check rather than to widen the check until it proved nothing.
✅ **`createRichMenu` refuses any link area without an https link** — a menu that could point at nothing is refused at the source, not at the runbook.
✅ **RULE 1 refused his first placement of the link door and he says it was right.** **A project rule earning its keep on a task where following it was inconvenient** is worth more than one that has never been tested.
⚠️ **`openExternalBrowser=1` labelled as documentation rather than observation** — Tanya confirms.

## ⚠️ His warning, carried into the runbooks
**Adopt on an OA published before this change now reports `missing smart-scheduler-admin` ⇒ re-publish, THEN adopt.** 🔑 **That is an ordering trap on a live account, and it goes into both runbooks in those words** — not as a note but as the step order.
