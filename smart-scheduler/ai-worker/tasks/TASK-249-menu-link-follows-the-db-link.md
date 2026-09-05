# TASK-249 — the per-user menu link must follow the DB link state (C-13, answered)
**Status:** ✅ **DONE — code** (Sober 09-05, reviewed) — tsc 0 · bun test **1316/0** · no migration · nothing sent to LINE.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-05)
**Answers @Porter's C-13 question:** *does clearing a family's link put that chat back on the unknown menu?*
**No. It does not.** This task makes it true.

---

## §1 What I found — every link call is a LINK; nothing ever links back

Every call site of the rich-menu link helpers in the whole repo:

| Where | When |
|---|---|
| `line-webhook.service.ts:1110` `linkRoleRichMenu` | at account-link |
| `line-webhook.service.ts:1113` `linkKnownRichMenu` | at account-link, customers only |
| `line-webhook.service.ts:1179` `linkRoleRichMenu` | language toggle |
| `teacher-link.service.ts:152` `linkRoleRichMenu` | teacher link |

**There is no unlink, and nothing links a chat to the unknown menu — ever.** `line-rich-menu.ts` says so
deliberately: *"There is no matching unlink call, on purpose: ยังไม่รู้จัก is the DEFAULT menu, so a chat whose
per-user link is ever removed falls back to it."*

🔴 **That sentence is true and its premise never happens.** A per-user link falls back **when removed** — and
**nothing removes it.** So after TASK-243's admin clear-link, the family is unlinked in our DB and the parent's
phone still shows **menu B**: `แจ้งลา · เช็คอิน · คอร์สของฉัน`. **The buttons of an account they no longer have.**
📌 Third time this week: **a documented fallback with no caller.** Same shape as `UNKNOWN_RICH_MENU` before
TASK-247 and `menuHasAdminButton` before its test.

## §2 The fix

1. **Add `unlinkRichMenuFromUser(userId)`** — `DELETE /v2/bot/user/{userId}/richmenu`. Best-effort like its
   siblings: a failure must never fail the admin's clear-link.
2. **Call it wherever the DB link is cleared** — `clearFamilyLine` (TASK-243) is the one I know; **grep for
   others and name what you find.** After it, the chat has no per-user link ⇒ it falls to the account default,
   which is the unknown menu. **That is the mechanism the comment already describes; give it its caller.**
3. ✅ **Assert the pairing**: clearing the DB link and clearing the menu link happen together, or the same class
   of drift comes back the moment someone adds a second clear-link path.

⚠️ **Ordering, at `:1110`–`:1113`:** a customer gets `linkRoleRichMenu` (old parent menu) and **then**
`linkKnownRichMenu` — the second wins **only because it is second.** Swap them and every new parent lands on the
old menu. **Pin the order with an assertion** — exactly what you did for `สมัคร` in TASK-246.

## §3 Not in this task — the backfill is the owner's

Families linked **before** the 09-05 publish never had `linkKnownRichMenu` run for the new menus. Two populations,
both wrong today: a chat with an **old** per-user link still resolves to the **old parent menu** (those menus still
exist on the channel), and a chat with **no** link now shows **unknown**. Neither shows menu B.
⇒ **A one-off re-link over real users is a deploy action on live customer chats — the owner's, not ours.** I have
put it in `board.md` PENDING DEPLOY. **If he asks for a script, that is a separate task; do not write it here.**

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1316 pass / 0 fail**
- [x] `unlinkRichMenuFromUser` exists (`DELETE /v2/bot/user/{userId}/richmenu`), every caller treats it as
      best-effort, and it is called on **both** DB link-clears I found — see the grep below
- [x] A test pins the `linkRoleRichMenu` → `linkKnownRichMenu` order
- [x] 🚫 **No migration** (32 `drizzle/*.sql` = 32 journal tags) · no SQL · **nothing sent to LINE**: no publish,
      no adopt, no link, no unlink — every assertion is pure or reads source. `line:adopt-menus` was **not run**.

## Implementation Notes — Jason, 2026-09-05

Repo **`smart-scheduler-back`**, HEAD **`864ef9c`**. `src/lib/line-rich-menu.ts` · `src/lib/family-link.ts` ·
`src/services/teacher-link.service.ts` · `scripts/line-adopt-menus.ts` · **new**
`src/lib/line-menu-link-follows-db.test.ts` · updated `src/lib/line-adopt-select.test.ts`.

### The grep you asked for — THREE clear paths, two fixed and one deliberately not

| Site | What it is | Action |
|---|---|---|
| `family-link.ts` `clearFamilyLine` | TASK-243's admin clear-link | ✅ **unlinks the menu for every account** in `result.cleared` — a family can hold several since TASK-230, and clearing one phone while another keeps menu B is the same half-state the transaction exists to prevent |
| `teacher-link.service.ts` `unlinkTeacherLine` | a departed teacher's link | ✅ **fixed — same defect, other role.** They kept `ตารางของฉัน` on their phone |
| `roster-link.ts` `moveRosterLink` | role change (parent ⇄ teacher) | 🚫 **deliberately untouched.** It is a **move**: the caller links the new role's menu immediately after, so unlinking would blank the phone and re-link it — churn, plus a window with the wrong menu. Asserted as an absence so nobody "completes the set" later |

⚠️ **A trap inside the teacher fix, worth naming:** `.returning()` hands back the row **as it now is**, where
`lineUserId` is already `null`. Reading it there would have unlinked nothing and looked like it worked. The
account is read **before** the write, and the test pins that order.

**Both calls run AFTER the commit and are `.catch`-wrapped.** A Messaging-API hiccup must not roll back an
admin's database act, and a clear the database *refused* must never reach a phone — the same rule as TASK-243's
log line, for the same reason.

### §4 — `NAME_TO_KEY` now has all six, and the guard is derived
The map covers the two REQ-079 names, and the new test **reads `publishRichMenus` itself** to enumerate what is
created, so the next menu added cannot forget the adopt map. Its sibling test states the reason the extension had
to wait: an OA that predates the publish now gets a **correct report of the two missing names** (and stores
nothing), which is exactly what would have broken every un-republished OA had this landed in TASK-247.

⚠️ **One of my own TASK-234 tests asserted `not.toContain("unlinkRichMenu")` and now fails — corrected, not
loosened.** 📌 **That assertion WAS the defect**, written down and passing: I had pinned the absence of the very
call the design's own fallback sentence depends on. It now asserts the enduring half — nothing **links** a chat
*to* unknown (that would be a second definition of the state) — while the **removal** exists. *Two different
acts; only one of them was ever meant to be impossible.*

---

## §4 Folded in — `NAME_TO_KEY`, now that its trigger has fired

PENDING DEPLOY item 4 was held for exactly one condition: **the menus existing on the OA.** The owner published
them on 2026-09-05 and both rendered on a phone, so the condition is met.

⇒ **Add `smart-scheduler-unknown-th` and `smart-scheduler-known-th` to `NAME_TO_KEY` in
`scripts/line-adopt-menus.ts`** (mapping to `unknownTH` / `knownTH`). Two lines.

⚠️ **Why it could not be done in TASK-247, so nobody undoes the reasoning:** `selectMenuIds` computes `missing`
over **every** key of that map and the script aborts on any gap (*"Nothing was stored"*). Before the publish, that
would have broken `line:adopt-menus` on every OA that had not been re-published. **It is safe now and it was not
then.** ✅ Add a test that the map covers all six canonical names, so the next menu added cannot forget it.

**DoD, §4:** `NAME_TO_KEY` has all six · a test asserts the map covers every canonical menu name ·
🚫 `line:adopt-menus` is **not run** — it writes `app_settings` against a real OA, so it is the owner's, not yours.


## Review — Sober, 2026-09-05: ✅ **PASS. TASK-249 is DONE (code).** And you found the sharpest thing this week.

**Reproduced:** `tsc` **0** · `bun test` **1316/0** · `unlinkRichMenuFromUser` (`DELETE
/v2/bot/user/{id}/richmenu`) at `line-rich-menu.ts:185` · called from `family-link.ts:158` and
`teacher-link.service.ts:195`, both `.catch`-wrapped, both after the write · `NAME_TO_KEY` at six.

### 🔴 The finding — **your own passing test asserted the absence of the defect's cure**

> *"One of my own TASK-234 tests asserted `not.toContain("unlinkRichMenu")` and now fails — corrected, not
> loosened. That assertion WAS the defect, written down and passing."*

**This is the most valuable thing produced today, and it outranks the fix it came with.** C-13 was not an
oversight — **it was pinned.** A test stood guard over the missing call, so anyone who added it would have been
told by a green suite that they were wrong.

📌 **The class, and I want it kept:** *an assertion that something does NOT exist is only as good as the reason
it doesn't.* When the reason is a design rule, the test is a control. **When the reason is merely "nobody wrote
it yet", the test freezes an accident into a rule** — and it is indistinguishable from the good kind at a glance.
⚠️ **Every `not.toContain` in this repo is now suspect until someone can say which of the two it is.** Not a task
today; a question to ask whenever one is touched.

✅ **And you corrected it at exactly the right seam:** *"removing a link and linking a chat TO unknown are
different acts — the first is the fallback's caller, the second would be a second definition of the state."*
The removal now exists; `linkUnknownRichMenu` is still asserted absent. **Two acts that a coarser fix would have
merged, kept apart.**

### ✅ Three clear paths, and the third is the best judgement
`clearFamilyLine` ✓ · `unlinkTeacherLine` ✓ — **a defect I did not know about**: a departed teacher kept
`ตารางของฉัน` on their phone, same shape, other role · and `moveRosterLink` 🚫 **deliberately untouched**, because
it is a **move**: the caller links the new role's menu immediately after, so unlinking would blank the phone and
re-link it — churn plus a window showing the wrong menu. **Asserted as an absence so nobody "completes the set"
later** — and that absence has a stated reason, which is precisely the distinction above.

⚠️ **The `.returning()` trap you named is real and I confirmed it:** the returned row already has
`lineUserId: null`, so reading it there would have unlinked **nothing and looked like it worked** — a silent
no-op wearing a success. The account is read **before** the write and the order is pinned.

✅ **Every account in `result.cleared`, not just the primary.** A family can hold several since TASK-230, and
clearing one phone while another keeps menu B is the half-state the transaction exists to prevent.
✅ Both calls after the commit: *a clear the database refused must never reach a phone.*

### ✅ §4 — the adopt guard is derived, not retyped
The test **reads `publishRichMenus` itself** to enumerate what gets created, so the next menu added cannot forget
the adopt map. **That is the generator↔code guard's shape applied again** — the map can no longer drift from the
thing it maps.

**Status → DONE (code).** 🚫 Nothing sent to LINE; `line:adopt-menus` not run — the owner's.
