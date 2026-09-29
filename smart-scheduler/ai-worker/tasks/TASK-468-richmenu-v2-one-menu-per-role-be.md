# TASK-468 — `REQ-107 §1`: ONE bilingual menu per ROLE (the TH/EN family collapse) + the new cells + the teacher menu re-published as-is — BE, S–M, **CONTRACT FIRST** (it changes the id model)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size S–M.** No migration (`app_settings` only). First of the REQ-107 round; TASK-469/470 build on its ids.

## §0 The owner's rulings (REQ-107 §6, via Porter)
Bilingual artwork (TH + EN on one image): **unlinked = 2 cells** (`สมัครสมาชิก / Sign Up` · `คุยกับแอดมิน / Chat with Admin`), **linked parent = 6 cells** (แจ้งลา · เช็คอิน · คอร์สของฉัน / เพิ่มนักเรียน · ภาษา-ช่วยเหลือ · คุยกับแอดมิน). **Chat bar: `เมนู | Menu`.** The **teacher menu keeps its existing artwork and cells** but must be **re-published** (its ids are dead on the real OA too). ⏸️ **HOLD the "Chat with Admin closes the menu" behaviour** — Porter has asked Khwan what she means; build the cell as it is today (the mute) and leave the collapse question alone until she answers.

## §1 The model change — the reason this is contract-first
Today an id exists per **role × language** (`parentTH/parentEN`, `knownTH`/`knownEN`, `teacherTH/teacherEN`) and the only difference within a pair is the picture. A bilingual image makes the pair redundant ⇒ **one id per ROLE**. Propose the shape and say what it does to: `MenuIds` · `menuIdFor(role, lang, ids)` (the language axis goes) · `linkResolvedRichMenu` · the relink plan's outcomes (**the `variant` outcome should become unreachable — say whether you delete it or keep it as a guard**) · the publish script · the census pins. ⚠️ Keep `getMenuIds`'s MERGE behaviour (TASK-247) — an old box's stale ids must not be silently erased by a partial publish.
📌 Two consequences to state in your report, because they are the point of the change: the **`knownEN` gap disappears** (there is no EN variant to be missing — TASK-446/452's flagged hole closes itself), and **a language toggle stops touching menus at all** (it changes the bot's language only), which retires the drift class TASK-452 fixed.

## §2 Build (after the contract)
- The two new definitions (2-cell and 6-cell) with the owner's cells, `chatBarText: "เมนู | Menu"`, and the postbacks each cell fires — reuse the existing actions; the sign-up cell's target is TASK-469's, so leave it as today's `action=enter` and let 469 move it.
- The teacher definition unchanged, re-published in the same run.
- `publishRichMenus` publishes the new set; its follower-warning (TASK-446) stays.
- 🚫 No artwork in the repo (the images are the owner's, supplied at publish time); 🚫 no publish run from here — the owner runs it with `--account` and the allow-list (TASK-448), demo first.
- ❓ for you: the id model's shape; whether `variant` survives as a guard; what a box that still holds old per-language ids does on the next link (it must not break — say what happens).

## Definition of Done
- [ ] Contract confirmed BEFORE code · the definitions by value (cells, actions, chat bar) · one id per role, the language axis gone · the merge preserved · the relink plan following the new model · the `knownEN` and toggle consequences stated · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log, with the owner's publish order (demo → Tanya → real).

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-25) — one id per ROLE; `variant` does NOT become unreachable (it becomes THE migration path); a legacy fallback for boxes not yet re-published; no code yet

## §0 The cells — read off the customer's own sheet, not guessed
`project-docs/customer-2026-09-25-richmenu/`: **6-cell** = row 1 `แจ้งลา Request Leave · เช็คอิน Check In · คอร์สของฉัน My Course`, row 2 `เพิ่มนักเรียน Add Student · ภาษา/ช่วยเหลือ Language / Help · คุยกับแอดมิน Chat with Admin` — **six separate cells, in exactly today's `KNOWN_RICH_MENU` order** (`leave · checkin · mycourses / register · lang · admin`), so the task's "คอร์สของฉัน / เพิ่มนักเรียน" is two cells, not one. **2-cell** = `สมัครสมาชิก Sign Up · คุยกับแอดมิน Chat with Admin` — today's `UNKNOWN_RICH_MENU` (`enter · admin`). The images' proportions match our two sizes (≈2500×1686 and 2500×843), so **no geometry changes** — only names, chat bar and ids. `คุยกับแอดมิน` stays on both, still the mute (⏸️ the "closes the menu" behaviour is held, as you said).

## §1 The id model
- **`MenuIds` gains three role keys: `unknown` · `customer` · `teacher`.** The eight old per-language keys STAY in the type as optional legacy keys — not because anything should choose them, but because **`mergeMenuIds` must keep them** (TASK-247: a partial publish must never erase an id it did not create) and because the relink sweep needs them to recognise what a follower is still holding (§3).
- **`menuIdFor(role, ids)` — the language axis goes.** `customer` ⇒ `ids.customer`, `teacher` ⇒ `ids.teacher`. `expectedMenuKey` loses its `lang` parameter the same way. 🔑 **One legacy fallback, and it is the answer to your ❓3:** if the role key is not stored yet (a box that has deployed the code but not yet published the new set), `customer` falls back to `knownTH`, then `parentTH`, and `teacher` to `teacherTH` — TH only, because the EN variants are exactly the gap this change closes. ⇒ **On a box still holding only old ids, the next link does what it did before for a TH chat** (nothing breaks, nothing goes blank); an EN chat is linked to the TH-picture menu of the old family, which is what an EN customer already got (the `knownEN` hole). The fallback is one pure function, pinned both ways (role key present ⇒ it wins; absent ⇒ the legacy chain).
- **`linkResolvedRichMenu` / `linkRoleRichMenu(userId, role)`** — `lang` dropped. `linkKnownRichMenu` goes (it was the second call of a two-step rule that is now one step); `settleLinkedRole` calls the linker once.
- **The language toggle stops touching menus** (`line-webhook.service.ts:1501–1510` loses its relink): it flips the bot's language and nothing else. That **retires the TASK-452 drift class at the root** — there is no longer a per-language menu for a toggle to pick wrongly.
- **Publish**: `publishRichMenus` creates three — `unknown` (2-cell, the account DEFAULT, as today), `customer` (6-cell), `teacher` (the teacher definition unchanged, re-published so its id is live on the real OA) — three images, `chatBarText: "เมนู | Menu"` on all three, stored by MERGE. TASK-446's follower warning stays. New names `smart-scheduler-unknown` · `smart-scheduler-customer` · `smart-scheduler-teacher`; the eight old names stay in `ALL_MENU_DEFS`/`OUR_MENU_NAMES` for provenance ("did WE name this?" — TASK-252), while `NAME_TO_KEY` (what publish creates) lists only the three.

## §2 📌 The two consequences, which are the point
- **The `knownEN` gap closes itself** — there is no EN variant to be missing. TASK-446/452's flagged hole (an EN customer stuck on the old blue menu) has nothing left to be.
- **A language toggle no longer re-links anything** — the class of defect TASK-452 fixed (toggle and link choosing different families) cannot recur, because there is only one menu per role to choose.

## §3 ❓2 `variant` — 🔴 correction: it does NOT become unreachable
It becomes **the main outcome of the first sweep after the publish.** Every existing follower is linked to an OLD per-language id; the merge keeps those ids stored; so `labelOf` recognises them as ours-but-not-expected ⇒ `variant` ⇒ `--apply` moves them to the per-role menu. That is exactly the migration, and deleting `variant` would reclassify every current follower as `stale` (same action, worse label — "stale" says "not ours", which is false). After the owner deletes the old menus and clears their keys it narrows to a real case: a chat linked to the OTHER role's menu (a coach on the customer menu). ⇒ **Kept, and re-documented as the migration path**, with its comment corrected ("a language toggle leaves a customer on `parentTH`" stops being possible).

## §4 What I will pin
The three definitions by value (cells, actions, sizes, chat bar `เมนู | Menu`) · `คุยกับแอดมิน` on every menu (`menuHasAdminButton`, unchanged rule) · `menuIdFor`/`expectedMenuKey` have no language parameter · the legacy fallback both ways · the merge preserving the old keys through a publish of the new three · the toggle performs no link (by value: no `linkRichMenuToUser` call) · `settleLinkedRole` links once · the relink plan: an old-family follower ⇒ `variant`, a new-family one ⇒ `ok` · the census pins moved with reasons · break-and-watch incl. a mutation that brings the language axis back. 🚫 No artwork in the repo, no publish from here.

## §5 📦 The owner's publish order (demo → Tanya → real), for the report
1. Deploy. 2. `line:publish-menus --account <demo>` with the three images ⇒ the new ids are stored beside the old. 3. `line:relink-menus --account <demo>` DRY RUN — expect every existing follower as `variant` — then `--apply`. 4. Tanya checks on the demo OA. 5. The same three steps on the real OA with `--account` + the allow-list (TASK-448). 6. Only after the sweep, delete the old menus (`line:remove-menus`), never before — until then the legacy fallback keeps every chat working.

⛔ Waiting on your confirm — the three role keys + kept legacy keys · the TH-only legacy fallback · `linkKnownRichMenu` removed · the toggle's relink removed · **`variant` kept as the migration path** — before code.

---

# ✅ CONFIRMED — @Sober → @Jason (2026-09-25) — build it; five answers, and your §3 correction is taken
1. **Three role keys + the old per-language keys KEPT as legacy — yes.** The merge must never erase an id it did not create (TASK-247), and the sweep needs them to recognise what a follower holds. 
2. **The TH-only legacy fallback — yes, and the reasoning is the part I want in the file:** on a box that has the code but not the new publish, a TH chat gets exactly what it got before, and an EN chat gets the TH-picture menu — **which is what an EN customer already had**, because `knownEN` never existed. The fallback cannot make anything worse than today, and it stops being reachable the moment the publish runs.
3. **`linkKnownRichMenu` removed and `settleLinkedRole` linking once — yes.** The two-step rule existed only to express "role menu, then the customer's known menu"; with one menu per role there is one step, and a second call would be a second place for the rule to live.
4. **The toggle's relink removed — yes**, and say in the file what it means: the language toggle now changes the bot's language and **nothing else**. That is TASK-452's defect class retired at the root rather than guarded against.
5. 🔴 **§3 — your correction is right and I was wrong.** I said `variant` becomes unreachable; it becomes **the main outcome of the first sweep**, because every existing follower is on an old per-language id that the merge still recognises as ours. Deleting it would have relabelled every current follower `stale` — *"not ours"*, which is false — and a wrong label on 205 real chats is exactly the kind of thing that gets read as an emergency. **Keep it, re-document it as the migration path**, and correct its comment.
**On the cells:** thank you for reading the customer's sheet rather than my summary — six separate cells in today's order, and the images matching our existing geometry, means no area maths and no new sizes. ⏸️ "Closes the menu" stays held.
**§5's publish order goes to the owner as written** — and its last line is the one that matters: **delete the old menus only after the sweep**, because until then the legacy fallback is what keeps every chat working.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — one menu per role, built as confirmed; 2990 pass / 0 fail; 9/9 mutations bite

**Numbers:** `bun test` **2990 pass / 0 fail** (+7, new file `src/lib/rich-menu-per-role-req107.test.ts`) · `tsc` **0** · 🚫 no migration (56 = 56) · **pins moved in 9 suites** (below — the most this model change touches, and every move is named).

## §1 What was built (as the contract)
- **`UNKNOWN_MENU` · `CUSTOMER_MENU` · `TEACHER_MENU`** — names `smart-scheduler-unknown / -customer / -teacher`, chat bar **`เมนู | Menu`** (11 characters, inside LINE's 14), and the cells **REUSED by reference** from today's definitions, not restated: the customer's sheet shows today's cells in today's order at today's sizes, and a second spelling of a layout is how two menus that "should match" drift (pinned by identity; mutation I makes a copy and bites). Unlinked = `enter · admin` (Sign Up stays `enter` for TASK-469 to move); linked parent = `leave · checkin · mycourses / register · lang · admin`; teacher = the existing two cells. `คุยกับแอดมิน` on both parent-facing menus (the REQ-079 rule, re-asserted). ⏸️ The "closes the menu" behaviour is untouched — held for Khwan.
- **`MenuIds`: `unknown · customer · teacher`**, the eight old keys kept as documented LEGACY keys.
- **`menuIdFor(role, ids)` / `expectedMenuKey(role, ids)` — no language parameter left** (pinned by arity). The per-role key wins; the **TH-only legacy fallback** (customer → `knownTH` → `parentTH`, teacher → `teacherTH`) covers a box between deploy and publish, pinned both ways; nothing stored ⇒ `null` ⇒ best-effort no-op as before.
- **`linkKnownRichMenu` removed**; `settleLinkedRole` makes ONE call; **a third caller the contract did not list** — `teacher-link.service.ts` (the approval of a teacher link) passed a language too — also moved to the one-argument call. 🔴 **The language toggle links no menu at all** (pinned by absence in its branch; mutation E puts a relink back and bites).
- **Publish creates three**, uploads three images (`assets/line/menu-unknown.png` · `menu-customer.png` · `menu-teacher.png`), stores `{ unknown, customer, teacher }` **by merge** (the old ids survive — pinned by value), sets `unknown` as the account default, and keeps TASK-446's follower warning. `NAME_TO_KEY` = the three (what publish creates); `OUR_MENU_NAMES` = eleven (everything we ever named — old menus stay ours until removed).

## §2 📌 The two consequences, stated
- **The `knownEN` gap closes itself:** the rule has no language to be missing a menu in.
- **The TASK-452 drift class is retired at the root, not guarded:** the toggle no longer touches menus, and there is only one menu per role to choose.

## §3 `variant` — kept, re-documented as THE MIGRATION PATH (your ruling)
By value: right after the per-role publish, followers on `knownTH`, `parentEN` and `teacherTH` all read `variant` with the per-role menu as their target; a follower already on the role menu is `ok`; and on an OLD box (no per-role ids yet) the sweep expects exactly what the legacy fallback links — **no churn before the publish**. Mutation D deletes `variant` and bites.

## §4 The pins that moved — every one named, because nine suites is a lot
- **adopt** (`line-adopt-select`): same claims, three names instead of six — including "an OA still holding only the old menus reports all three and stores NOTHING".
- **ownership**: `NAME_TO_KEY` 3 / `OUR_MENU_NAMES` 11. One visible change: an OLD menu name found on a channel with no stored ids now reads with the readable label `known-th` (TASK-252's label for any defined-but-unpublished name) instead of the key `knownTH` — it is still OURS, which is the claim.
- **flows · register · link-follows-db**: the "role menu, THEN known menu on top" ORDER pins are **retired, not relaxed** — with one call there is nothing to misorder; what they now pin is that exactly one call is made and that a teacher still never gets the family menu.
- **TASK-452's suite** (`one-menu-rule`) rewritten around its surviving principle (ONE rule, every caller asks it) in the new shape; **TASK-446's suite** (`rich-menu-relink`): the five outcomes by value in the new model (Khwan's stale EN link now expects the CUSTOMER menu — her language no longer picks one).
- **artwork**: publish = three, stores the three, default `unknown`, the three image paths.

## Break-and-watch — `mut468.mjs`, 9 mutations, **9 bite** (`finally`, sha-256 restore, `BASELINE=122` read off the run)
A 🔴 the old family wins over the per-role id · B the legacy fallback removed · C the fallback reaches for an EN variant · D 🔴 `variant` deleted · E 🔴 the toggle re-links again · F the chat bar reverts to TH only · G the default becomes the customer menu · H publish forgets the teacher · I the customer menu restates its cells.

## §5 📦 The owner's publish order (demo → Tanya → real)
1. Deploy (no migration). **Until step 2, every chat keeps working through the legacy fallback** — nothing goes blank.
2. Put the three bilingual images at `assets/line/menu-unknown.png` · `menu-customer.png` · `menu-teacher.png` (the teacher one is the existing teacher artwork), then `bun run line:publish-menus` with `--account <demo>` (TASK-448's guard).
3. `bun run line:relink-menus --account <demo>` DRY RUN — **expect every existing follower as `variant`**, read the plan, then `--apply`.
4. Tanya checks on the demo OA: a linked parent sees the 6-cell bilingual menu, a stranger the 2-cell, a coach the teacher menu; tapping ภาษา changes the bot's language and **the menu stays**.
5. Steps 2–3 on the real OA with `--account` + the allow-list.
6. Only after the sweep: `line:remove-menus` for the old menus — never before.
⛔ Only you mark this DONE. ▶️ Starting TASK-470 alongside (your yes); TASK-469 next in order.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me: **3021 pass / 0 fail** (three consecutive clean runs) · tsc 0 · 56 = 56 · `menuIdFor(role, ids)` — no language parameter — and the relink plan calling the same expression.
⚠️ **My own measurement error, recorded because the record should show it:** my first run read 3008/13 and I said so before checking. It was a torn read of a tree still being written while the next task landed; three clean runs since. **A number I measure once is a number I have not measured** — the same rule I hold the engineers to.
Four things from this build I am keeping:
1. **The cells are reused BY REFERENCE and pinned by identity** — her sheet is today's cells, order and sizes, so the layouts cannot drift while the ids change. That is the cheapest possible way to say "nothing about the buttons moved".
2. 🔴 **He found a third caller the contract did not list** — `teacher-link.service.ts`, the teacher-link approval, also passed a language. A contract that misses a caller is how half a rename ships; he found it by looking rather than by trusting my list.
3. **The order pins are RETIRED, not relaxed** — with one call there is nothing to misorder, so a pin asserting the order of two calls would now be asserting a fiction. Deleting a pin that has lost its subject is right; weakening it would have been wrong.
4. **`variant` kept as the migration path**, exactly as he corrected me, with the old comment ("a toggle leaves a customer on `parentTH`") fixed rather than left to mislead.
📦 §5's publish order goes to the owner unchanged, and its last line is the load-bearing one: **remove the old menus LAST**, after the sweep, because until then the legacy fallback is what keeps every existing chat working.
