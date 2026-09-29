# TASK-473 — `REQ-107 §7` round 2: the Sign-up wording · the publish printing its ids · the Help blank line · Chat-with-Admin (reply + menus published COLLAPSED) · `Teacher <name>` on both picks — BE, S–M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size S–M.** No migration. **One set** — the owner confirms Khwan's list is complete, and the menus change, so this ends in a republish.

## §0 K3's blocking question — ANSWERED, build it as she wrote it
Porter asked whether the mute expires on its own before dropping her "(type: reopen)" hint. **It does: `MUTE_MINUTES = 60` (`lib/line-routing.ts:74`), `muteUntilFrom()` = now + 60 minutes**, and `เปิดเมนู` still reopens early for anyone who knows it. So a parent who taps Chat-with-Admin gets the bot back **within the hour without doing anything**, and her wording can drop the hint safely. 📌 Say in your report that the hint is gone but the escape hatch still works — the words changed, the behaviour did not.

## §1 The items (every byte from `REQ-107 §7` / the customer's sheet — read them there, not here)
- **K0a — the Sign-up reply gets its own wording**, no longer sharing Add-Student's: TH `กรุณากดที่ลิ้งค์ด้านล่างเพื่อสมัครสมาชิกค่ะ` · EN `Please click the link below to sign up.` The link itself is unchanged (still from the env — TASK-469's rule).
- **K0b — `line:publish-menus` must print the ids it stored.** Today it prints `undefined` for the old keys. ⚠️ This is a small thing with a sharp edge: **the operator reads that output to know what happened on a real account.** Print what was actually stored after the merge (all keys, old and new), and pin the shape — a publish whose report says `undefined` is a publish nobody can check.
- **K1 — Language/Help:** a blank line after the first line, both languages. **And the check she noticed:** one of Tanya's screenshots shows the TH toggle sending the line on its own — confirm the TH toggle always sends confirmation **and** the TH command list, in one message, and pin it by value. If it is a real defect, say what it was.
- **K2 — nothing to do.** Dates and the English inside Thai cells stay as they are (Khwan).
- **K3 — Chat with Admin:** reply TH `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ` / EN `Admin will talk to you soon.`; the hint dropped (§0). **And the menus are published `selected: false` — collapsed**, so the panel is out of the way and the keyboard is free. ⚠️ That is a change to all three definitions ⇒ **new ids ⇒ a republish and a sweep** (§3).
- **K4 — `Teacher <name>` on the picks.** Today the check-in pick reads `ครูEk` in TH and a bare `Ek` in EN. Align both to `Teacher <name>`, **and check whether the LEAVE pick has the same shape** — she asked about check-in, but the two should not diverge; if leave already differs, fix it here and say so. 🔑 **LINE caps a quick-reply LABEL at 20 characters** — the label is what fits, the full text goes in `displayText` (the existing TASK-316 split). Pin a long teacher name against the 20-char limit so the next long name does not silently truncate.

## §2 Build notes
- Names come from the ONE rule (`studentNamesOf` / `displayNameOf`) — no hand-built name anywhere, as in TASK-470/471.
- Every string pinned **by value in both languages**, blank lines included.
- 🚫 No change to the cells, the tap areas, the LIFF wiring, the date styles, or anything TASK-470/471 settled.

## §3 The republish, and what it means for the runbook
`selected: false` changes the definitions, so the demo OA needs a **fresh publish ⇒ new ids ⇒ another sweep**. The first run's followers will then be on the ids from run 1, so the dry run will again show **`variant` for everyone — still success**. Say in your report whether anything else about the second run differs from the first; I will update `RUNBOOK-richmenu-v2-demo-publish.md` from what you find. 📌 And the old menus from run 1 join the "delete LAST" list — after the second sweep, not before.

## Definition of Done
- [ ] Every item by value in both languages · K0b's publish report printing real ids (pinned) · K1's TH toggle confirmed or the defect named · K4 aligned across BOTH picks with the 20-char label pinned · §0's note that the hint went but the escape hatch works · what differs on the second publish · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — K0a · K0b · K1 · K3 · K4 by value; 3047 pass / 0 fail; 12/12 mutations bite — ⛔ and a runbook hazard in §6 you need before the next publish

**Numbers:** `bun test` **3047 pass / 0 fail** (+14 over 3033; new `src/services/richmenu-round2-req107.test.ts`) · `tsc` **0** · 🚫 no migration (**56 = 56**) · no change to cells, tap areas, LIFF wiring or date styles.

## §1 The items
- **K0a — Sign Up's own words:** new key `liff_signup`: `กรุณากดที่ลิ้งค์ด้านล่างเพื่อสมัครสมาชิกค่ะ` / `Please click the link below to sign up.` The link is unchanged (`LIFF_ID`). `liffLinkBody(key)` now takes the key, so each cell names its own sentence. The dispatcher test proves Sign Up now sends these words.
- **K0b — the publish prints what it STORED.** 📌 **The `undefined` was mine:** TASK-468 moved the publish to three per-role menus and I left the report printing the six legacy keys, which a publish never sets now. New pure `formatStoredIds(stored, created)` is printed from **`getMenuIds()` read back after the merge**:
  - the three role ids come first, each tagged `NEW`, `kept from an earlier publish` or `⚠️ NOT STORED`;
  - the account default is named;
  - then every legacy id still stored.
  - It is pinned by value, with a case showing it never prints `undefined`, and a source pin that it prints the read-back rather than the created ids.
- **K1 — the toggle:** a blank line after the confirmation in both languages, **through the real dispatcher in BOTH directions** (TH→EN and EN→TH), with the whole message by value. ✅ **Not a defect:** there is one toggle call and one `lang_switched` in the service (pinned by count), and the EN→TH tap sends confirmation + TH list in one message. The only language screenshot in `qa-2026-09-25/` is TH→EN and correct. I found no TH-only shot among the 17 files. If Tanya has it, its timestamp would tell whether it predates the TASK-470 deploy. Mutation E (EN→TH sends the line alone) bites, so that defect cannot come back unseen.
  - ⚠️ **One byte for you to rule:** her §7 block shows NO blank line between `Available Commands:` and the first item, but today's list has one (her TASK-470 sheet had an empty row there). Her instruction was to *add* a blank line after the first line, so I added it and removed nothing. If the §7 block is the exact wanted text, deleting `\n` from both `menu_body` strings is a one-character change.
- **K3 — Chat with Admin:** `admin_called` = `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ` / `Admin will talk to you soon.`
  - 📌 **The hint is gone; the way back still works.** `MUTE_MINUTES` = 60, so the mute ends by itself (pinned: a mute set 61 minutes ago no longer mutes), and `เปิดเมนู` still reopens early. AC-24's "names the word" pin now covers `handover_to_admin` only, which still names it. Mutation L (a mute that never expires) bites.
  - **Collapsed menus:** `selected: false` is now stated on all three per-role definitions. 📌 In fact only `UNKNOWN_MENU` was `true`; customer and teacher already inherited `false`. I made all three explicit so no legacy default can reopen one. The unlinked menu is still the account default (pinned).
- **K4 — `Teacher <name>`:** `session_row` is `{time} · Teacher {teacher} · {program}` in BOTH languages.
  - **Check-in** (dispatcher, both languages): the chat shows the full row; each button is ≤ 20 characters. This is pinned with a 20-character teacher name (`Maximiliana-Rosalind`) and a DUO row reading `Feen & Pun`.
  - 🔴 **LEAVE had diverged, and it's fixed:** a tapped leave pick sent only its 11-character button (`24/10 15:00`, visible in Tanya's leave shot) with no teacher at all. `bookingPicker` now takes a separate `text` for `displayText`. Leave sends its full dated row (`ศุกร์ 25/09 · 10:00 · Teacher … · …`); the button stays `25/09 10:00`.
  - The label is clamped and the `displayText` never is (mutation J bites).
  - 📌 **Also fixed in passing:** the pick's child name was hand-built (`nickname || name`). It now uses `studentNamesOf`, the ONE rule (mutation K bites).

## §2 Pins moved (each names TASK-473)
`line-leave` (sessionLabel × 3) · `leave-window-req085` + `leave-notice-req085-16d` (the pick body) · `rich-menu-per-role-req107` (unknown `selected: false`) · `line-mute-exit` (AC-24 → handover only; K3 by value + expiry added) · `liff-link-req107` (Sign Up's words) · `line-v2-messages-req107` (toggle blank line).

## §3 Break-and-watch: `mut473.mjs`, 12 mutations, **12 bite**
`finally` + sha-256 restore, byte-identical each time. `git diff` CHECKSUM `fe7472a0…` identical before and after. `BASELINE=105` read off the run on 7 suites. (F's first anchor was wrong: comment lines sat between; re-anchored and run → bites.)
- A K0a words
- B 🔴 the report prints the created ids, not the read-back
- C 🔴 `undefined` again
- D the blank line removed
- E 🔴 EN→TH sends the line alone
- F 🔴 unknown EXPANDED
- G the hint back
- H 🔴 EN loses `Teacher`
- I 🔴 leave sends only its button again
- J 🔴 the chat shows the clamped label
- K the name hand-built
- L 🔴 a mute that never expires

## §4 What differs on the SECOND publish (for the runbook). Two things; both are pinned as fact in the new test file.
1. 🔴 **The dry run will NOT show `variant` for everyone.** The merge OVERWRITES `unknown` / `customer` / `teacher` with run 2's ids, so **run 1's ids are no longer stored anywhere**, and `planRelink` labels by what is stored. By value:
   - a follower on a **run-1** menu reads `stale` (linked `unknown-id`);
   - a follower still on a legacy menu (`knownTH` …) reads `variant`;
   - one already on run 2 reads `ok`.
   - ✅ **Both `stale` and `variant` are RELINKED**, so the sweep still succeeds. The runbook should say "expect `stale` for anyone on the round-1 menus; that is NOT 'not ours' here, it is 'ours, from the publish before'".
2. The publish now prints the stored-ids block from K0b (three `NEW` + the legacy list), not the old six lines.
Everything else is the same: images, the `--account` guard, default = unknown, and the relink warning.

## §5 (continued) — ⛔ READ BEFORE ANY "delete the old menus" STEP
**`line:remove-menus` has no "old menus only" mode.** `planMenuRemoval` plans **every stored id plus every menu carrying one of our names**, and that is **the live set too**. Pinned by value: with run 2 stored and run 1 on the channel, the plan deletes all five, the three live ones included. Its order is: cancel the default, delete everything, clear the ids.
- ⚠️ **My TASK-468 report (§5, step 6) said "Only after the sweep: `line:remove-menus` for the old menus". That instruction was WRONG:** run as written, it takes every menu off the account.
- The dry run and the typed confirmation would show the count, so an operator *could* catch it, but the runbook must not send them there.
- Nothing is broken today. No one has run it.
- ❓ **For you:** cut a "leftovers only" mode (keep the stored per-role ids and the current default), or strike that step from the runbook and leave the old menus in place. They are harmless: no follower is linked to them after the sweep, and the default is the new unknown menu. **Not built here; it is outside this task.**

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25) — and §5 is the most important thing in this report
Re-run by me, twice: **3047 pass / 0 fail** both times · tsc 0 · 56 = 56.
⛔ **§5 first: `line:remove-menus` deletes the LIVE set too — and the step that told the owner to run it was MINE.** I read the plan myself after his report: `toDelete = ours.map(...)` — everything it recognises as ours, which after a publish is the menus we have just put up. **His TASK-468 §5 step 6 went into my runbook as step 7, and I approved it twice** — once in his contract, once when I wrote the file. As written it would have stripped every menu off the account and left every follower with nothing. **Nobody ran it.**
**My ruling: strike the step, do not build a mode now.** The runbook is already corrected — step 7 now says, in the owner's words rather than ours, *do not run this*, why, and that dead menus nobody links to are clutter and not a hazard. A leftovers-only mode is a small job if the owner ever wants the account tidy; it is not urgent, and **an unused menu costs nothing while a wrong instruction costs everything**.
📌 **The runbook is also corrected on `stale` vs `variant`:** he found that the second publish overwrites the stored ids, so run-1 followers read **`stale`**, not `variant`. Both are success and both are relinked — but an owner told to expect one word and shown another will stop, and rightly. Only `BLOCKED` is worth stopping for.
Three more things:
1. 🔴 **K4 found a real defect because the task looked past what was asked.** Khwan reported the check-in pick; the **leave pick had diverged** and was sending only `24/10 15:00`. It now sends the full dated row, and its child name goes through `studentNamesOf` like everything else. That is why I asked him to check the sibling — two picks that drift is how the next inconsistency arrives.
2. **K0b's `undefined` was his own miss in 468, and he says so.** The publish now prints what it read back **after** the merge, tagged NEW / kept / ⚠️ NOT STORED — which is the shape an operator can actually check a real account against.
3. **K1 is not a defect, and he proved it rather than assuming:** one toggle path, pinned by count, EN→TH by value through the real dispatcher, and **no TH-only screenshot exists in the QA folder** — so the thing Khwan thought she saw is not in the evidence. He also flagged that her §7 block has no blank line after `Available Commands:` while today's list does, changed nothing, and left it as a one-character decision. Correct: when the sheet and the code disagree by a whisker, say so and wait.
