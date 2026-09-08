# TASK-250 — `line:remove-menus`: take our rich menus OFF an account, reviewably
**Status:** ✅ **DONE — code** (Sober 09-05, reviewed) — tsc 0 · bun test **1339/0** · 🚫 never run against any OA. **Running it is the owner's step.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-05)
**Ordered by the owner via @Porter**, and the reason matters more than the feature:
> *"สั่งทีมทำเครื่องมือ แบบนี้เสี่ยงไป"* — he was offered the raw API calls and **refused them.**
> **He is not asking for a delete. He is asking for a delete he can review before it fires.**

🔴 **This runs against a CUSTOMER'S LIVE OA.** The bot is on their account as of today.
🚫 **You never run it.** Not with `--apply`, not dry. The owner runs it, on his box, when he decides to.

---

## §1 What it must do

1. **Cancel the channel default** — `DELETE /v2/bot/user/all/richmenu`.
2. **Delete the menus this repo created** — `DELETE /v2/bot/richmenu/{id}`, one per stored id.
3. **Clear the stored ids**, so `getMenuIds()` stops pointing at things that no longer exist.

## §2 The four constraints — each is here because this project has already been bitten

1. 🔴 **OURS ONLY.** Delete **by our stored ids**, never *"everything the channel lists"*. `inspect` says the
   channel holds six and all are ours — **that is true today and is not a guarantee**; the customer may add one
   tomorrow. ⚠️ If a listed menu is **not** one of ours, **report it and leave it**; that is information, not an
   obstacle.
2. 🔴 **Dry-run by default, `--apply` to act** (the `seed-ledger` pattern). And **the dry-run is the deliverable,
   not a courtesy** — see §3.
3. 🔴 **Idempotent, and correct on a partial state.** A menu already gone (404) is **success, not failure** — the
   end state is what matters, and a half-removal that refuses to finish is worse than either end.
4. 🔴 **The output must state what a user will see afterwards: NOTHING.** No default menu means a follower has
   **no menu at all** and is back to typing keywords. **That is a product state, not a clean slate**, and the
   person running this at 11pm must not have to infer it. 📌 `line-inspect-menus.ts` already prints exactly this
   sentence for the no-default case — **reuse its wording**, do not invent a second one.

## §3 The dry-run is the point — it must show what `--apply` will do

The owner rejected a hand-typed delete **because it cannot be reviewed before it fires.** A tool that deletes
silently does not answer him.

⇒ **The dry-run prints, for each menu: our label (`unknownTH`…), the id, the `name` LINE holds for it, and
whether it is the current default** — then a line saying **exactly how many will be deleted and that the default
will be cancelled.** ⚠️ `--apply` **must require a confirmation** and must print the same list first.
📌 **Reversal is `line:publish-menus` — but it creates NEW ids**, so anything holding an old id is stale
afterwards. **Say that in the output**, both runs.

## §4 🔴 The trap I have already built for you — `storeMenuIds` cannot clear

TASK-247 made `storeMenuIds` **merge** (`mergeMenuIds` omits absent keys). **So `storeMenuIds({})` is a no-op**,
and every obvious way to "clear the ids" silently leaves them exactly as they were — a removal that reports
success and changes nothing in the DB.

⇒ **Write a distinct `clearMenuIds()`** that deletes the `line_rich_menu_ids` row (or writes `{}` unmerged), and
**say in a comment why it cannot go through `storeMenuIds`.** ✅ Test that after it, `getMenuIds()` is empty.
⚠️ **Clear only the ids you actually deleted.** If a menu was left alone (not ours), its id must survive.

## §5 Order, and it is not arbitrary
**Cancel the default FIRST, then delete the menus.** Deleting a menu that is still the account default leaves the
channel pointing at a dead id for however long the run takes. Cancel first and every intermediate state is a
state the product already understands: *no menu.*
✅ Clear the stored ids **last**, after the deletes — if the run dies midway, the ids still name what is left, and
re-running finishes the job. **Ids cleared first would strand the survivors with nothing pointing at them.**

## §6 Preflight, same as publish
No token → **refuse with a clear message and exit non-zero.** ⚠️ **Print WHICH account it is about to touch** —
as much identity as the API gives you (the bot's own profile / channel info) — because the token now decides
whether this is the demo OA or the **customer's**. **A tool whose whole purpose is review must not hide the one
fact that makes the review meaningful.**

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1339 pass / 0 fail** (23 new)
- [x] `scripts/line-remove-menus.ts` + the `line:remove-menus` package script
- [x] `deleteRichMenu(id)` and `clearDefaultRichMenu()` in `src/lib/line-rich-menu.ts`, beside their siblings
      (plus `getBotAccountLabel()` for §6)
- [x] `clearMenuIds()` exists and does **not** go through `storeMenuIds` — ⚠️ **one half of this line I could not
      do as written**: *"tested to leave `getMenuIds()` empty"* is a DB round-trip and this suite has no database.
      What is tested instead is **the property that makes the function necessary** — `mergeMenuIds(ids, {})`
      returns the ids unchanged, i.e. `storeMenuIds({})` provably clears nothing — plus a source assertion that
      the clear deletes the row and never reaches the merge. Stronger than a mock; **not the round-trip you
      asked for**, so I am naming it rather than ticking it silently.
- [x] A **404 on delete counts as success** — `deleteRichMenu` returns `"already-gone"`, asserted; and the plan
      marks stored-but-absent menus so the dry run says so before the run
- [x] The planning half is pure — `src/lib/line-menu-removal-plan.ts` (`planMenuRemoval` · `idsToKeep` ·
      `formatRemovalPlan`), the shape `db-reset-plan` already set. Every behavioural assertion runs the real
      planner on handed-in data; the script is fetch → print → (with `--apply`) act
- [x] Dry-run output tested: label · id · LINE's `name` per menu, which one is the default, the counts, the
      *"no menu at all"* sentence (**reused verbatim from `line-inspect-menus.ts`**, asserted to be the same
      string in both files), and the *"republishing creates NEW ids"* note
- [x] `--apply` requires a typed confirmation that **names the count** (`REMOVE 6`), so it cannot be typed
      without reading the list; a non-interactive stdin returns `null` ⇒ cancels
- [x] 🚫 **Nothing run against any OA.** No delete, no publish, no adopt, no inspect, no `--apply`, no dry run,
      no SQL, no migration (32 = 32). The only execution was `bun test` and `tsc`.

## Implementation Notes — Jason, 2026-09-05

Repo **`smart-scheduler-back`**, HEAD **`4c3535c`**. New: `src/lib/line-menu-removal-plan.ts` ·
`scripts/line-remove-menus.ts` · `src/lib/line-menu-removal-plan.test.ts`. Touched: `src/lib/line-rich-menu.ts`
(three new API helpers + `clearMenuIds`), `package.json`.

**§4 — the trap did not catch me, and the test now states why.** `mergeMenuIds(STORED, {})` returning `STORED`
**is** the proof that `storeMenuIds({})` clears nothing, so it is asserted directly rather than described.
`clearMenuIds(keep)` deletes the `app_settings` row when nothing survives, and writes the survivors **unmerged**
when something does.

**🔴 One decision inside your §1, and it is the thing to look at.** §1 says *"cancel the channel default"*, and
§2.1 says *"ours only"*. **When the default is NOT one of ours those two instructions disagree** — a customer
who sets their own default menu would have it silently cancelled by a tool run to remove *our* menus, on their
live account. ⇒ **the default is cancelled only when it is one of our stored ids**; a foreign default is
reported and left, in the same voice as a foreign menu. Cancelling ours is part of removing ours; cancelling
theirs is not. Say the word if you want it unconditional.

**§5 order is asserted, not just followed**: default → menus → ids, with the reasoning at each site.

**One thing I added to the "afterwards" text beyond §4's requirement.** Cancelling the default is only half of
what the operator sees: deleting a menu **also drops every per-user link to it**, so a *linked* parent is left
with no menu either — not just followers who never linked. `inspect`'s sentence only covers the second group,
so the tool prints it verbatim (as instructed) **and then the half it does not cover.**

## Answers to your two questions

**1 — I could not confirm it without calling, so both are handled and neither is guessed.** LINE's documented
response for `DELETE /v2/bot/richmenu/{id}` on an unknown id is `404`, but I have no way to verify that from
here without hitting a live OA, and a malformed id may well be `400`. ⇒ `deleteRichMenu` treats **`404` as
`"already-gone"` (success)**, any other non-2xx **throws with its status and body**, and the script keeps going
so one bad id cannot abandon the rest. The distinction is printed per menu (`deleted` vs `already-gone`), so the
operator sees which happened rather than a uniform ✓.

**2 — Every reader of `line_rich_menu_ids` tolerates an empty row. I checked all five:**
- `getMenuIds()` returns `{}` for a missing row (it already did) — so an absent row and an empty one are the
  same thing to every caller.
- `linkKnownRichMenu` / `linkRoleRichMenu` — `if (target)`, and **that is the design**: a menu that has not been
  published leaves the chat on the account default. ✅ Both call sites (`line-webhook.service.ts:1110/1113/1196`
  and `teacher-link.service.ts:152`) are additionally wrapped in `try/catch` with a loud `console.error`.
- `line-inspect-menus.ts` prints *"(none stored — has `line:publish-menus` been run against this DB?)"*.
- `storeMenuIds` merges onto `{}` — a later publish simply writes fresh ids.
- 🔴 **The one that is NOT tolerant, and it is by design: `line:adopt-menus`.** It aborts when any canonical name
  is missing from the OA. After a removal that is exactly right — adopt has nothing to adopt and says so instead
  of storing a half map — but it means **`adopt` is not the way back; `publish` is.** The tool's output says so.

## Questions I want answered
1. **What does LINE return for deleting an id that does not exist** — 404, or something else? If you cannot
   confirm it from the docs without calling, **say so and handle both**; do not guess in silence.
2. **Is there anything else in the repo that reads `line_rich_menu_ids`** and would break on an empty row?
   `linkKnownRichMenu` / `linkRoleRichMenu` are best-effort by design — **confirm that, and name anything that is not.**


## Review — Sober, 2026-09-05: ✅ **PASS. TASK-250 is DONE (code).** You corrected my requirement, and you were right to.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1339 pass / 0 fail** (111 files) · order in
`scripts/line-remove-menus.ts` is `clearDefaultRichMenu` (`:67`) → `deleteRichMenu` loop (`:75`) →
`clearMenuIds(idsToKeep(stored, deleted))` (`:87`) · `getBotAccountLabel()` in the preflight · the reversal note
at `line-menu-removal-plan.ts:160`.

### 🔴 The catch — my §1 and my §2.1 contradicted each other, on a customer's live account

> *"§1 says 'cancel the channel default' and §2.1 says 'ours only'. When the default is NOT one of ours those two
> instructions disagree."*

**They do, and I did not see it.** Taken literally, my own task would have had a tool run *to remove our menus*
**silently cancel a default the customer set for a menu we never made** — a configuration change to their account,
made by a tool whose entire justification is that it can be reviewed first. **The most dangerous line in the task
was one nobody would have read twice.**

✅ **Your resolution is the correct seam and I am keeping it unconditional:** *cancelling ours is part of removing
ours; cancelling theirs is not.* A foreign default is **reported and left**, in the same voice as a foreign menu.
📌 Note it needed no new principle — **it is §2.1 applied to the one object I had forgotten was also a thing on
their account.**

### ✅ The purity split, and the sentence test
`planMenuRemoval` / `idsToKeep` / `formatRemovalPlan` take stored ids + the channel list + the default and return
the whole decision. **Every behavioural assertion runs the real planner**; the script is fetch → print → act.

📌 **And `NO_DEFAULT_SENTENCE` is asserted to appear in `line-inspect-menus.ts`'s own source** — *"one wording,
not a second"* enforced by a test rather than by asking. **Same shape as the generator↔code bounds guard**, and it
is becoming this repo's habit: when two files must agree, make the agreement fail.

✅ **The half you added that I did not ask for is the half that matters most:** deleting a menu **also drops every
per-user link to it**, so a *linked* parent is left with no menu either — not only never-linked followers.
`inspect`'s sentence covers one group; you print it verbatim **and then the group it does not cover.** **That is
the operator at 11pm actually being told what they did.**

### ✅ The DoD line you could not tick, and named instead
*"tested to leave `getMenuIds()` empty"* is a DB round-trip and this suite has no database. **You said so rather
than ticking it**, and substituted something I would rather have: `mergeMenuIds(STORED, {})` returning `STORED`
**is the proof that `storeMenuIds({})` clears nothing** — the property that makes `clearMenuIds` necessary, rather
than a mock of the call. ⚠️ **The round-trip is still untested and that is a real remaining gap**, not a closed
one — it belongs to whoever next runs this against a database. **Recorded, not waved away.**

### ✅ Both questions answered without a guess
**404** is documented but unverifiable from here, so `deleteRichMenu` treats 404 as `"already-gone"`, **throws with
status and body on anything else**, and the run continues so one bad id cannot abandon the rest — **and the
per-menu outcome is printed (`deleted` vs `already-gone`) rather than a uniform ✓.** *"Say so and handle both"* is
exactly what happened.
📌 **And the fifth reader is the one worth having:** `line:adopt-menus` is **not** tolerant of an empty row **by
design**, so after a removal **`adopt` is not the way back — `publish` is**, and the tool's output says so. A
question I asked about breakage returned a **routing fact for the operator.**

**Status → DONE (code).** 🚫 Nothing run against any OA — no dry run, no `--apply`, no inspect. Running it is the
owner's, on his box, when he decides.
