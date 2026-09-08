**Status:** DONE — code (Sober 09-06, reviewed) — tsc 0 / bun test 1505 pass 0 fail / no OA touched.

# TASK-252 — a menu is OURS by its NAME, not by a row in our database

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Answers @Porter's 09-05 report** — *"the ours-only rule inverts once stored ids are cleared… the gap is that
identity currently lives ONLY in a mutable DB row. What replaces or supplements that is your call."*
**My call is below. Nothing about `ours-only` relaxes; it gets a source of truth that survives.**

---

## §1 The gap, exactly

`line-remove-menus` protects anything not in `getMenuIds()`. **`line-remove-menus` also clears `getMenuIds()`.**
⇒ **after one run, our own menus on that account become indistinguishable from the customer's**, and the rule
written to protect *their* menus would then protect **our litter** and refuse to clean it.

`line-inspect-menus.ts:66` has the same inference and Porter has already seen it misfire:

```ts
const known = entries.some(([, id]) => id === m.richMenuId) ? "" : "  ⚠️  created outside our publish (OA Manager?)";
```

On the demo OA with no stored ids that labelled **20 menus we created ourselves** as foreign.

📌 **The real problem is not the clearing. It is that provenance was inferred from a row we own and mutate,
instead of read from a mark that travels with the object.**

## §2 The answer already exists in the repo — `NAME_TO_KEY`

Every menu we create carries a `name` **we chose**, stored **on LINE**, on their account, beyond our database:
`smart-scheduler-parent-th` · `-parent-en` · `-teacher-th` · `-teacher-en` · `-unknown-th` · `-known-th`.

`scripts/line-adopt-menus.ts` already holds the registry, and it is **derived from the definitions**
(`[UNKNOWN_RICH_MENU.name]: "unknownTH"`, …), so it cannot drift from what we publish — and TASK-249 §4 added the
test that derives its completeness from `publishRichMenus` itself.

⇒ **Move `NAME_TO_KEY` (or a `isOurMenuName` built from it) into `src/lib/line-rich-menu.ts`** beside the
definitions, and make **one** exported predicate the single answer to *"is this menu ours?"*.

**The test becomes: `id ∈ stored ids` OR `name ∈ our registry`.** Stored ids keep saying **which** menu is
current — that is what they are good for. They stop being asked a question they cannot answer after they are
cleared.

## §3 Both readers use the same predicate — that is the point

1. **`line-remove-menus`** — an unstored menu whose name is ours is **ours**, and appears in the plan.
   ⚠️ A name we do not know stays **reported and left**, exactly as @Jason built it. **`ours-only` is unchanged;
   it is now able to recognise its own.**
2. **`line-inspect-menus:66`** — the *"created outside our publish"* label uses the same predicate, so it stops
   accusing our own menus. ✅ **One definition, two readers** — the habit this repo has been building all week.

## §4 The litter is real and this is what cleans it

Porter's inspect: **20 menus on the demo OA, every one ours.** `publishRichMenus` creates its set and **deletes
nothing**, so every publish leaves the previous set behind — six per run, accumulating for weeks, and nobody
looked because nothing reported it.

- ✅ **With §2, `remove-menus` finds and offers all of them** — the dry-run lists them for review before anything
  is deleted, which is the whole design.
- 🚫 **Do NOT make `publish` delete the old set.** Destroying menus on a live account as a side effect of
  publishing is exactly the unreviewed action the owner refused. **Removal stays a deliberate, reviewed act.**
- ✅ **But `publish` must SAY it.** After a publish, print how many menus on the channel carry our names and how
  many are the set just created — *"12 of our menus on this channel; 6 are the set just published"*. **Nobody
  looked because nothing told them.**

## §5 The limit of this, stated so nobody over-trusts it
A name is a **convention**, not a cryptographic claim: a customer could in principle create a menu called
`smart-scheduler-known-th`. **That is acceptable here and I want the reason recorded** — the tool never deletes
without printing the list and taking a typed confirmation, so a name-based match makes a *candidate*, and **a
human makes the decision.** ⚠️ **Do not use this predicate anywhere that acts without review.**

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count
- [ ] One exported predicate in `src/lib/line-rich-menu.ts`, derived from the menu definitions (not a retyped
      string list), answering *"is this menu ours?"* by **stored id OR our name**
- [ ] `line-remove-menus` and `line-inspect-menus` both use it — **asserted that neither has its own copy**
- [ ] A test for the case that started this: **stored ids EMPTY + menus present with our names ⇒ recognised as
      ours**, and a foreign name in the same list ⇒ still reported and left
- [ ] `line:adopt-menus` keeps working off the same registry (it may import it; it must not keep a second)
- [ ] `publish` reports how many of our menus the channel holds vs the set it just created
- [ ] 🚫 Nothing run against any OA · no SQL · no migration · say so explicitly

## Question
**Do `unknownEN` / `knownEN` belong in the registry?** They are **defined but never published** (TASK-247 §4, TH
only). If the predicate is derived from `publishRichMenus`, they are correctly absent — **but say which way you
did it**, because a menu we define and never create is exactly the kind of thing that becomes a surprise later.

## Review — Sober, 2026-09-06: ✅ **PASS. TASK-252 is DONE (code).** And a test of yours had the bug written down as an expectation.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1505 pass / 0 fail** (119 files) · `ourMenuMatch` defined
once (`line-rich-menu.ts:351`) and imported by **both** readers — `line-menu-removal-plan.ts:94` and
`scripts/line-inspect-menus.ts:71`, whose comment names it as *"the one predicate both use."* No OA touched.

### 🔴 The finding: your own test asserted the defect
> *"A TASK-250 test of mine had to be corrected: it asserted six of our own menus were foreign."*

**The bug was written down as an expectation** — and it stayed invisible because **every other test stores ids
first**, so the only state that exposes it (ids cleared, menus still on the channel) was the one state nothing
set up. 📌 **This is the second time this week a passing test was guarding the thing it should have caught**
(`not.toContain("unlinkRichMenu")` on 09-05 was the first). **Same shape, different costume: a test that encodes
the behaviour rather than the requirement.**
⚠️ **And it is exactly the state `remove-menus` creates** — the tool clears the ids it uses to know its own. The
test was passing about a situation the tool manufactures.

### ✅ 6 and 8, derived and deliberately different
Two counts that look like they should be one, kept apart with the reason: **collapsing them breaks `adopt` one
way and re-creates this bug the other.** ⇒ **the same discipline as TASK-260's three status lists, on the same
day: consistency is not the goal — agreement about a specific question is.** Both derived, neither retyped.

**Status → DONE (code).** ⇒ **The `uat` batch's code is complete except REQ-084's defect half — see my ruling.**

📎 **Two files carry TASK-252** — this one (@Sober's spec + the review) and `TASK-252-menu-ownership-by-name.md` (@Jason's implementation notes, created before he saw this filename). **Both are the same task; neither is stale.** Left as they are rather than merged: an append-only log with a broken cross-reference is worse than two files that point at each other.
