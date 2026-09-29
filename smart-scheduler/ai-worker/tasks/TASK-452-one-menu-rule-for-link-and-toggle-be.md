# TASK-452 — 🔴 `REQ-105 §6b` REPRODUCED on the deployed build: the LANGUAGE TOGGLE links the OLD BLUE menus (both languages) while the initial link gives the orange ones — **the toggle uses a different menu FAMILY, not a stale id source**. ONE rule for link and toggle — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-23) · **Size S.** No migration. Demo OA for the owner's re-test.

## §0 Tanya's steps (Porter, on the build carrying 446–451)
unblock ⇒ orange TH unlinked ✅ · `เข้าใช้ระบบ` + `0900000092` ⇒ orange TH linked ✅ · **first Language tap TH→EN ⇒ OLD BLUE EN** · EN→TH ⇒ **OLD BLUE TH** · blue from then on.

## §1 The cause — read, and it is not a second id store
There is ONE store (`app_settings.line_rich_menu_ids`, `getMenuIds()`), but it holds **two families of menus** because `storeMenuIds` deliberately MERGES (TASK-247 — so a partial publish cannot erase ids it did not create): the REQ-015 **`parentTH`/`parentEN`/`teacherTH`/`teacherEN`** family (the old blue ones) and the REQ-079 **`knownTH`** family (the orange one). Both are current entries; neither is stale.
- **The link path calls TWO functions in order** — `linkRoleRichMenu(role, lang)` then, for a customer, `linkKnownRichMenu(lang)` — so the LAST write wins: `knownTH`, the orange menu. ✅ what Tanya saw.
- **The toggle calls ONE** — `line-webhook.service.ts:1506`, `linkRoleRichMenu(lineUserId, linked, next)` and nothing else — so it lands on `parentEN`, then `parentTH`: **the blue family, every time, and it stays blue because nothing calls the known link again.** 🔴 This is exactly the `variant` drift Jason described in TASK-446 ("the language toggle re-links only the ROLE menu") — the sweep was built to REPAIR it; the cause itself was never fixed. My miss: I kept the finding as a sweep outcome instead of raising it as its own defect.
- **The rule already exists, in the right shape, in the wrong place:** `expectedMenuKey(role, lang, ids)` (`lib/line-relink-plan.ts:49`) — the role menu, overridden by the customer's known menu when that id is published. The sweep knows what a chat should have; the two live paths do not ask it.

## §2 Build — one decision, three callers
- **Promote the rule:** `expectedMenuKey` (or a thin `menuIdFor(role, lang, ids)` beside it) becomes THE answer to *"which menu does this chat get"*. `linkKnownRichMenu` / `linkRoleRichMenu` keep their names but both resolve through it; the toggle calls the same one function; the relink sweep keeps calling it. **One rule, three callers, no second spelling** (pinned by source: no caller outside this helper reads `ids.parentTH`-style keys to decide a link).
- **By value:** a linked customer toggling TH→EN gets the id `expectedMenuKey("customer","EN",ids)` returns, and EN→TH returns to the SAME id the initial link set (the orange one) — *the toggle-linked id ≡ the publish-written id ≡ what the sweep would set*, which is Porter's pin, asserted on all three paths; a teacher toggling gets the teacher family; an unlinked chat's toggle is unchanged.
- **The `knownEN` hole is now visible here too:** an EN customer has no known menu published (TASK-446 §1.2), so the rule correctly falls back to `parentEN` — the blue one — and **an EN customer will keep seeing blue until the owner supplies EN artwork.** Say this plainly in your report; it is the same owner decision I flagged, now with a second consequence.
- 🚫 No new publish, no artwork, no deletion, no change to the merge.

## §3 The old blue menus on the demo OA — answer, do not act
Say whether they still exist on the channel (`line:inspect-menus`, read-only, prints the account) and which ids nothing would point at once this ships. **Deleting them is the owner's, through the guarded `line:remove-menus --apply --account …`, and only after the relink sweep** — a menu deleted while a chat is still linked to it leaves that chat with no menu at all. Recommend the order; do not run either.

## Definition of Done
- [ ] One rule, three callers (pinned by source and by value) · the toggle round-trip returns to the linked id · the `knownEN` consequence stated · the demo-OA menu inventory reported (read-only) with the recommended order · suite **count** · tsc 0 · 53 = 53 · 🔑 Break-and-watch with `BASELINE=` (the TASK-450 rule), `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-23) — one rule, three callers; the toggle round-trip lands back on the orange id; 2839 pass / 0 fail; 9/9 mutations bite

**Numbers:** `bun test` **2839 pass / 0 fail**, 220 files (+1: `src/lib/one-menu-rule-req105.test.ts`, 6 tests) · `tsc --noEmit` **0** · 53 = 53 (no migration) · 2 pins re-aimed (the two that asserted a linker spelling the rule out for itself — they now assert the ONE resolver and the rule's new home).

## §1 Your read confirmed — and the fix is the promotion, not a new rule
`menuIdFor(role, lang, ids)` now sits beside `expectedMenuKey` in `lib/line-relink-plan.ts` and is **the** answer to *"which menu does this chat get"*. `linkRoleRichMenu` and `linkKnownRichMenu` keep their names and their best-effort behaviour but both resolve through one private `linkResolvedRichMenu`, which asks `menuIdFor`. The toggle therefore needed **no change at all** — it already calls `linkRoleRichMenu`, and that call now returns the same answer the account-link gets. Three callers, one expression:
- the account-link (`settleLinkedRole`: role, then known for a customer — now two calls that agree, the second a re-link to the SAME id);
- the language toggle (`line-webhook.service.ts`, unchanged line);
- the relink sweep (`planRelink` uses the identical `menuIdFor(user.role, user.lang, ids)`).
🚫 **No second spelling** (pinned): outside the rule's own file nothing reads `ids.parentTH`-shaped keys to choose a link — asserted on `line-rich-menu.ts`, `line-webhook.service.ts` and `line-register.service.ts`.
📌 On the cycle: `line-rich-menu.ts` now imports a VALUE from `line-relink-plan.ts`, which imports only a TYPE back (erased at build) — no runtime cycle, and tsc is clean.

## §2 By value — Tanya's exact steps
A TH customer: link ⇒ `knownTH` (orange) · toggle TH→EN ⇒ `parentEN` · toggle EN→TH ⇒ **`knownTH` again — the same id the link set**. On the old build that last step gave `parentTH`, the blue one, and stayed there. Porter's pin is asserted as one chain: the toggle-linked id ≡ the account-link's id ≡ `planRelink`'s `expectedId`, and the sweep calls that chat `ok`. A teacher's toggle stays in the teacher family both ways; with nothing published, nothing is linked (best-effort, unchanged — a chat keeps the account default, which is the correct menu for it).

## §3 🔴 The `knownEN` consequence, plainly
**`parentEN` — the OLD BLUE English menu — is the correct answer today for an EN customer, and will stay correct until the owner supplies EN artwork.** `publishRichMenus` creates six menus and `knownEN` is deliberately not among them (TASK-247 §4: a stored id with no uploaded image renders BLANK on a phone, which is worse than the old menu). So: a TH customer sees orange; **the moment that customer switches to English she sees blue, and no sweep can fix it** — there is nothing to link her to. The rule already follows an EN known menu the day one exists (pinned by value), so this costs artwork + one publish and no code. It is the same owner decision I flagged in TASK-446 §1.2, now with its second consequence visible.

## §4 The demo OA's menu inventory — what I can honestly say
**I did not read the channel**, and could not: agents touch no real OA (and since TASK-448 a write would refuse without `--account`). What the RULE says, after this ships, is the part I can state:
- **Still pointed at:** `unknownTH` (the account default) · `knownTH` (every bound TH customer) · `parentEN` (every bound EN customer, until §3 is answered) · `teacherTH` / `teacherEN` (coaches, both languages).
- **Pointed at by nothing:** **`parentTH`** — the old blue Thai customer menu. It is the only one this change orphans, and only once every chat still linked to it has been swept.
📋 **The read is the human's:** `bun run line:inspect-menus` (read-only, prints the account and every menu on the channel, ours and foreign).
📌 **The order, recommended and not run:** ① deploy this ⇒ ② `bun run line:relink-menus --dry-run` ⇒ read it ⇒ ③ `--apply --account @<demo>` ⇒ ④ only then, if he wants the channel tidy, `line:remove-menus --apply --account @<demo>` — **never before the sweep**: a menu deleted while a chat is still linked to it leaves that chat with no menu at all, which is worse than an old one.

## Break-and-watch — `mut452.mjs`, 9 mutations, **9 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=64`)
A the role linker spells the rule out again (the defect restored) · B the known linker does · C the resolver links when nothing is published · D it ignores the language · E it treats every chat as a teacher · F `menuIdFor` prefers the role menu (blue wins again) · G it returns the key instead of the id · H the sweep stops using the same expression · I the toggle links nothing at all.

⛔ Only you mark this DONE. 📌 For the owner: §3 (EN artwork — his call) and §4's order.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-23)
Re-run by me: **2839 pass / 0 fail** · tsc 0 · 53 = 53 · `menuIdFor` is the one resolver, imported by `line-rich-menu.ts` (value in, type back — no runtime cycle). The shape of the fix is right: **the toggle line did not change at all** — the linker it already called now returns the right answer, which is what "one rule" should mean; a fix that edited the toggle would have left the next caller free to be wrong. §3 and §4 are honest: he did not read the channel (he cannot), so he reported what the RULE implies and named `parentTH` as the only menu this orphans, with the order and its reason. Both go to the owner.
