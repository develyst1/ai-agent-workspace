# RUNBOOK — publishing the rich menu v2 on the DEMO OA (`@125vuzsj`)
**For the owner, via @Porter. Written by @Sober, 2026-09-25.** Every command below is the owner's; no agent runs any of them. Read the whole thing once before step 1 — two steps are hard to undo.

⚠️ **Prerequisite, or nothing else works:** the three images must exist in the back repo at exactly these paths (the publish refuses the whole run before touching LINE if one is missing):
```
assets/line/menu-unknown.png     2-cell   (≈2500×843)
assets/line/menu-customer.png    6-cell   (≈2500×1686)
assets/line/menu-teacher.png     the EXISTING teacher artwork
```
And on that machine: `LINE_CHANNEL_ACCESS_TOKEN` for the **demo** OA, `LIFF_ID` = the **demo** LIFF (`2011571495-uCrah47D`), and `LINE_OA_WRITE_ALLOW=@125vuzsj`.

---
## 1. Deploy the code and restart
Nothing visible changes yet. **This is deliberate and it is the safety net:** with the new menus not yet published, a Thai chat behaves exactly as today and an English chat gets what it already had. You can stop here for a day if you want to.

## 2. Look before you write — read-only
```
bun run line:inspect-menus
```
**Expect:** the header names **SOM-Balance-Demo (@125vuzsj)**. If it names any other account, **stop** — the machine is pointed at the wrong OA, which has happened before. The list shows whatever menus are on the demo account today.

## 3. Publish the three menus
```
bun run line:publish-menus --account @125vuzsj
```
**Expect:** three menus created and uploaded — `unknown` · `customer` · `teacher` — the `unknown` one set as the account default, and a closing line warning that **N followers still hold the ids of the previous publish**. That warning is correct and is the reason step 4 exists.
📌 The old menu ids are **kept**, not erased. Nothing is linked to the new ones yet.

## 4. The sweep — dry run FIRST
```
bun run line:relink-menus
```
**Expect: nearly every follower listed as `variant` — or, on the SECOND publish, as `stale`.** 🔑 **Both are SUCCESS, not a fault.** `variant` means "this chat holds one of our menus, but not the one it should have now" — which is exactly true of everybody until they are moved. 🔁 **Why the second publish differs:** publishing again overwrites the stored ids, so the ids run 1's followers hold are no longer in our settings and the sweep calls them `stale` rather than `variant`. Both are relinked by `--apply`. **Only `BLOCKED` is worth reading twice** — it means the menu that chat should get is not published on that account.
Read the list. Then:
```
bun run line:relink-menus --apply --account @125vuzsj
```
It will ask you to type `RELINK <n>` with the count in it — that phrase cannot be typed without having read the number.

## 5. Tanya checks on the demo phone
Screenshots of: the unlinked menu (2 cells, bilingual, chat bar `เมนู | Menu`); the linked parent menu (6 cells); **Sign Up ⇒ the registration link**, and the page opening; **Add Student ⇒ the link message** in both languages; the four new message formats; and 🔑 **the language toggle — the menu must NOT change** (only the bot's language). A coach's phone: the teacher menu, unchanged artwork, still working.

## 6. Only after Tanya passes — the real OA
The same steps 2–5 with the **real** account: `LINE_OA_WRITE_ALLOW=@427ybeky`, `--account @427ybeky`, the **real** `LIFF_ID`, and the real OA's token. Its four old ids are already dead, so step 4 will read differently there — mostly `unlinked`, which is also correct: those 205 followers are on the account default today.

## 7. 🔴 DO NOT run `line:remove-menus` — STRUCK 2026-09-25
**The instruction that used to be here was wrong and it was mine.** `line:remove-menus` has **no leftovers-only mode**: it deletes **every menu it recognises as ours, including the ones you have just published**. Running it after step 4 would take the whole set off the account and leave every follower with nothing.
**So: do not run it.** Old menus that nobody links to are clutter, not a hazard — they cost nothing, no chat can reach them, and the account works exactly as it should with them sitting there. If the owner later wants the account tidy, say so and we will build a mode that removes only what is unused; it is a small job and it is not urgent.
⚠️ Found by @Jason in TASK-473 §5, before anyone ran it. Nothing was deleted.

---
## If something looks wrong
- **The header names the wrong account** ⇒ stop, fix the machine's env. Since TASK-448 a write refuses without `--account` and the allow-list, but a *read* will still happily report on the wrong OA.
- **A publish fails on a missing image** ⇒ nothing was sent to LINE; fix the path and re-run.
- **A follower reads `BLOCKED`** ⇒ the menu they should get is not published on that account. Do not apply; tell Porter.
- **Anything unexpected in the dry run** ⇒ it wrote nothing. Send the output up before applying.

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
