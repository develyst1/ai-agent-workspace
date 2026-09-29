# RUNBOOK — the `uat` release on the REAL OA (`@427ybeky`): REQ-107 + REQ-108
**For the owner, via @Porter. Written by @Sober, 2026-09-26. One file, as asked.** Every command below is the owner's; **no agent runs any of them.**

> 📖 **Read the whole file once before step 1.** Three things here are hard or impossible to undo: the LIFF endpoint change (§2), the migration (§4), and the publish (§6). Nothing else writes anything a customer can see.

> 🔁 **This is the same shape as the demo runbook** (`RUNBOOK-richmenu-v2-demo-publish.md`), with the real account's values and two sections the demo did not need (the migration, and the printed QR). **Its two corrections are carried forward** — the sweep reads differently on this account (§6), and **step 7 is struck** (§9).

---
## 0. What is in this release, so you know what to look at
- **REQ-107** — one bilingual rich menu per role, the new wordings, the un-mute reply and the chips, and **`checkin_late_minutes`** (a new setting, **default 0 = today's behaviour exactly** — nothing changes until you raise it).
- **REQ-108** — the **shop-front QR check-in page** Khwan has already postered, and the **Shop QR chip** that makes a wall-QR check-in visible to an admin.
- **One fix that is not new work:** a camp scan could overturn a coach-recorded **ABSENT**. That bug is **already live on `uat` today** — REQ-108 did not introduce it — and this release closes it.

---
## 1. Before you touch anything — the machine's `.env`
The most common failure in this whole procedure is a machine still pointed at the demo. On the box you will run this from:
```
LINE_CHANNEL_ACCESS_TOKEN = <the REAL OA's token>        # @427ybeky, not the demo's
LINE_OA_WRITE_ALLOW       = @427ybeky
LIFF_ID                   = 2011577840-zelD9mEA          # the REAL LIFF
PUBLIC_CHECKIN_BASE_URL   = https://frontoffice.develyst.online
```
⚠️ **`LINE_OA_WRITE_ALLOW` is a safety catch, not a setting** (TASK-448): a write refuses unless `--account` matches it. **A read does not** — `line:inspect-menus` will cheerfully report on whichever account the token belongs to. That is why §3 exists.

**Prerequisite, or the publish refuses before touching LINE:** the three images must exist in the back repo:
```
assets/line/menu-unknown.png     2-cell
assets/line/menu-customer.png    6-cell
assets/line/menu-teacher.png     the existing teacher artwork
```

---
## 2. The LIFF endpoint — do this BEFORE the deploy
In the LINE Developers console, for LIFF **`2011577840-zelD9mEA`**, set the endpoint URL to:
```
https://frontoffice.develyst.online/register
```
🔴 **Why before, and why it is safe:** the Sign Up cell on the new unknown menu opens this LIFF. If the endpoint still points at the old page when the menus go live, **every new parent tapping Sign Up lands somewhere wrong** — the one thing a brand-new follower cannot recover from on their own. Changing it early is harmless: today's menus do not use this LIFF, so nothing breaks in the window between this step and the publish.
✅ **Check:** open the LIFF URL on a phone; it must load the registration page.

---
## 3. Look before you write — read-only, costs nothing
```
bun run line:inspect-menus
```
**Expect the header to name the real OA (`@427ybeky`).** If it names **SOM-Balance-Demo** or any other account, **stop** — the env is wrong. This has happened before; it is why this step is separate.

---
## 4. 🔴 The migration — up to **57**, and read the verify output
```
bun run db:migrate
```
That runs **preflight → drizzle → verify** in one go. **Expect at the end:** `Journal: 57 migration(s)` and `✅ every migration is recorded in the ledger AND witnessed in the schema.`

### If verify comes back RED — the `sid` situation, and what it means here
On `sid` this came back red on 09-25 with *"N migrations in the journal are NOT recorded as applied"* and a `⚠️ drizzle would SKIP this silently` line. What we established, so nobody re-derives it under pressure:
- **A red verify does not mean the schema is wrong.** `Schema witnesses: 57 applied` is a statement about the **database's actual objects**, checked one by one — including `0054`, whose witness is the **index predicate** (the last statement in that file), not merely the index existing. If it says 57, the schema has all 57.
- ⇒ In that state the problem is **missing ledger rows, not missing work.** The repair is `bun run db:seed-ledger` (**dry run first — read every line**), then `--apply`, which writes rows and applies nothing.
- **The `when=…052` in the warning is not a timestamp collision.** `0052`'s own value is `…048`. The line is arithmetic: verify ran after `0056` landed, so the newest ledger row was by definition ≥ the older ones.
- 🚫 **Do NOT restart the app against a schema verify called bad.** Send the output up and stop. That rule has not changed.
- 📌 **`uat` recorded `0053`–`0055` correctly on 09-25**, so it is not in `sid`'s state — but the **cause on `sid` is still unknown** and I will not promise `uat` is immune. If it goes red, follow the paragraph above rather than improvising.

---
## 5. Deploy the code and restart
**Nothing a customer can see changes yet, and that is the safety net:** the new menus are not published, so every chat behaves exactly as it does today. `checkin_late_minutes` defaults to **0**, which is today's behaviour byte for byte.
✅ **Worth checking now, before the menus:** open `https://frontoffice.develyst.online/checkin/shop` in a browser. It should load the phone box. **This is the URL on Khwan's poster and it can never change** — if it does not load, stop here; the poster is the one thing we cannot re-issue.

---
## 6. Publish the menus, then sweep
```
bun run line:publish-menus --account @427ybeky
```
**Expect:** three menus created — `unknown` · `customer` · `teacher` — the `unknown` one set as the account default, and a closing warning that **N followers still hold previous ids**. That warning is correct; it is what 6b is for. Old menus are **kept**, not erased.

**6b. The sweep — dry run FIRST:**
```
bun run line:relink-menus
```
🔑 **On this account expect mostly `unlinked` — around 205 rows — and that is SUCCESS.** The real OA's four old menu ids are already dead, so those followers sit on the **account default** rather than holding a per-user link. (On the demo the same healthy state reads `variant`, or `stale` on a second publish. All three words are fine.)
⚠️ **`BLOCKED` is the only word worth reading twice** — it means the menu that chat should get is not published on that account. If you see any, **do not apply**; send the output to Porter.
Then:
```
bun run line:relink-menus --apply --account @427ybeky
```
It asks you to type `RELINK <n>` with the real count in it — a phrase you cannot type without having read the number.

---
## 7. The printed QR — check it against the poster
Settings ⇒ the QR panel. **The URL shown in text must read exactly `https://frontoffice.develyst.online/checkin/shop`**, and scanning the panel's QR with a phone must open that page. Compare it to Khwan's printed poster before telling her it is live.
📌 **No token, ever, by design** — a sheet of paper on a wall cannot be rotated, re-issued or redirected. The route is frozen in the code with that reason written beside it.

---
## 8. What Tanya checks on the real OA
The menus (unlinked 2-cell, parent 6-cell, the teacher menu); **Sign Up ⇒ the registration page opening**; the language toggle (**the menu must NOT change** — only the bot's language); the new chips (📌 **the third chip now opens My Course instead of listing the children** — a deliberate change, not a fault); the shop QR page end to end on a phone; the **Shop QR chip** appearing on that booking in admin; and a camp day marked ABSENT by staff then scanned — it must stay ABSENT.

---
## 9. 🔴 DO NOT run `line:remove-menus` — STRUCK, and it stays struck
**The step that used to be here was wrong and it was mine.** `line:remove-menus` has **no leftovers-only mode**: it deletes **every menu it recognises as ours, including the ones you have just published**. Running it would take the whole set off the account and leave every follower with nothing.
**Old menus nobody links to are clutter, not a hazard.** No chat can reach them; the account works correctly with them sitting there. If the owner wants the account tidy later, we will build a mode that removes only what is unused — a small job, and not urgent.
⚠️ Found by @Jason in TASK-473 §5 before anyone ran it. Nothing was ever deleted.

---
## If something looks wrong
| what you see | what it means | what to do |
|---|---|---|
| the header names the wrong account | the env is still on the demo | **stop**, fix `.env`, start again at §3 |
| a publish fails on a missing image | **nothing was sent to LINE** | fix the path, re-run |
| a follower reads `BLOCKED` | that chat's menu is not published there | do **not** apply; send the output to Porter |
| verify is RED | see §4 — probably ledger rows, **not** the schema | do **not** restart the app; send the output up |
| the shop QR page does not load | the poster's URL is dead | **stop the release here** and tell Porter at once |
| anything unexpected in a dry run | it wrote nothing | send it up before applying |

**Nothing in this file is irreversible except §2, §4 and §6.** Everything else can be looked at twice.

---
## 🆕 ADDED 2026-09-27 — the FOURTH menu: the admin one-cell menu (TASK-530)
⚠️ **This account now publishes FOUR menus, not three.** The new one is the **admin** menu: a single cell, `SOM SCHEDULE` / `เปิดระบบ · Open the system`, which opens the web app in the phone own browser.
**Prerequisite, in addition to the three images:**
```
assets/line/menu-admin.png     1-cell (2500x843)
```
**And one new environment key, read AT PUBLISH:**
```
PUBLIC_ADMIN_BASE_URL = <the web app own address for this box>
```
🔑 **The publish REFUSES if it is missing or not https** — deliberately. A menu pointing at nothing would otherwise publish silently and be found by an admin.

### 🔴 The ordering trap — read this before you adopt
**On an account that was published BEFORE this change, `line:adopt-menus` will report `missing smart-scheduler-admin`.**
⇒ **RE-PUBLISH FIRST, THEN ADOPT.** Adopting first does not fail safely: it leaves the account holding a set we do not recognise as complete.

### What else changes
- **The sweep now knows the `admin` role**, and an admin reads as **ok on the admin menu, RELINK if they are on the visitor menu or the account default, BLOCKED if the admin menu is not published.** 🔑 **An admin is never "repaired" onto the visitor menu** — that was the whole point.
- **A coach who is also an admin keeps their COACH menu** (admins are resolved last).
- **`line:inspect-menus` needs no new flag:** the admin menu shows `areas: 1 · (0,0 2500x843) action.type=uri`.
- ⚠️ **`openExternalBrowser=1` is asserted from LINE documentation, not observed by us.** **Tanya confirms on the demo OA** that tapping the cell opens the phone browser rather than LINE own.
- 🚫 **The account default stays the UNKNOWN menu.** Do not clear it: with no `follow` handling, a new visitor would see no menu at all and **sign-up would disappear.**

### ⚠️ ADDED 2026-09-28 — `PUBLIC_ADMIN_BASE_URL` is needed at RUNTIME, not only at publish (TASK-536)
TASK-530 introduced this key **for the publish**. Since TASK-536 the **`ปฏิทิน` / `calendar` reply sends the web app's link**, so **the running server reads it too.**
⇒ **Every box that answers coaches needs it set**, not only the machine that publishes menus.
- **If it is unset, the coach gets a generic error and the log shouts** — 🔑 the right failure, **but an invisible one to the coach.**
- ✅ **Check after any restart:** ask `ปฏิทิน` from a linked coach's chat and confirm a link comes back.
