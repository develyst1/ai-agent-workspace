
---

# ✅ Jason (BE) — DONE, code. 2026-09-06

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1505 pass / 0 fail, 119 files**
🚫 **Nothing run against any OA** — not `inspect`, not `publish`, not `remove-menus`, dry or `--apply`.
**No SQL · no migration** (34 `drizzle/*.sql` = 34 journal tags, untouched). Every assertion is a pure function
against handed-in data, or a source assertion. New tests: `src/lib/line-menu-ownership.test.ts` (16 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1505 / 0**, 119 files
- [x] One exported predicate — **`ourMenuMatch(menu, stored)`** in `src/lib/line-rich-menu.ts`, answering by
      **stored id OR our name**, returning the label **and which test claimed it**
- [x] Derived from the definitions, not a retyped list: `ALL_MENU_DEFS` → `OUR_MENU_NAMES`, and the test reads
      **the module's own exports** (`import * as rich`) so a ninth menu joins by existing
- [x] `line-remove-menus` (via `planMenuRemoval`) and `line-inspect-menus` both use it — **asserted that neither
      has its own copy**: no `entries.some(([, id]) => id === m.richMenuId)`, no `"smart-scheduler-` literal in
      either, and `ChannelMenu` is now an **alias** of the library's row shape rather than a second interface
- [x] The case that started this: **stored ids EMPTY + our names present ⇒ ours**, all six, `matchedBy: "name"`,
      `foreign: []` — and a foreign name in the same list still **reported and left**
- [x] `line:adopt-menus` re-exports `NAME_TO_KEY` rather than declaring one; `selectMenuIds` unchanged
- [x] `publish` reports the footprint — `formatPublishFootprint`, pure, printed after the publish
- [x] 🚫 Nothing run against any OA · no SQL · no migration

## 🔴 The test that had to be CORRECTED — it was the defect, written down as an expectation
`line-menu-removal-plan.test.ts:70` asserted, for exactly this input:
```ts
const plan = planMenuRemoval({}, CHANNEL, "rm-u-th");   // CHANNEL = our six names
expect(plan.toDelete).toEqual([]);
expect(plan.foreign).toHaveLength(6);
```
**Six menus we made, on a channel, called foreign — and green.** ⚠️ That is worth more than the fix: my own
TASK-250 suite could not see this bug, because every other test stores ids first, and **with ids stored the old
code is right.** The one test that reached the empty state asserted the wrong answer confidently.
⇒ Corrected, not deleted, and the sentence it was really guarding (*"nothing of ours is on this channel"*) now
has a test on the input that actually produces it — an **empty channel**.

## ➕ What I added that §3 did not name, and why it is not decoration
**`matchedBy: "id" | "name"`, printed per row.** §5 permits a name match *because* **"a human makes the
decision"** — the tool prints the list and takes a typed `REMOVE <n>`. 🔴 **If the plan printed both kinds
identically, the reviewer could not apply the judgement the whole safety argument rests on.** So the review now
says `[stored id]` or `[OUR NAME (not in the stored ids)]` on every line, plus a block naming how many rows rest
on a convention. **The predicate got weaker; the review got stronger — that is the trade §5 assumes.**

Sample, ids cleared by a previous run (rendered from the real formatter, not typed by hand):
```
DELETE — ours, matched by stored id or by a name we define (12):
  parentTH   rm-old-0  name="smart-scheduler-parent-th"  [OUR NAME (not in the stored ids)]
  …
  unknownTH  rm-new-4  name="smart-scheduler-unknown-th"  [OUR NAME (not in the stored ids)]   ← the current channel DEFAULT

  ⚠️  12 of the above are ours by NAME only — an earlier publish, or the ids were cleared
      by a previous run of this command. A name is a convention we chose, not proof: read those
      rows before confirming.

LEAVE ALONE — on the channel, not ours (1):
  rm-promo name="promo-2026"   (created outside our publish)
```

## Answer to the Question — **`unknownEN` / `knownEN` are IN the ownership registry and OUT of `NAME_TO_KEY`**
**Both, deliberately, because they are two different questions and I kept them as two derivations:**

| | asks | derived from | count |
|---|---|---|---|
| `NAME_TO_KEY` | *"which names must be **present** for a complete id map?"* | what `publishRichMenus` creates | **6** |
| `OUR_MENU_NAMES` | *"did **we** name this menu?"* | every `RichMenuDef` the module exports | **8** |

🔴 **Neither answer works for the other's question.** Putting the two EN names in `NAME_TO_KEY` breaks
`line:adopt-menus` on every OA — `selectMenuIds` computes `missing` over every key and aborts (*"Nothing was
stored"*), which is TASK-249 §4's own recorded reason. Leaving them out of `OUR_MENU_NAMES` means that if one
ever reaches a channel, **`remove-menus` leaves our own litter behind and `inspect` accuses it** — the exact bug
this task exists to fix, re-created for the two menus nobody was watching.
⇒ Both are derived, the difference is commented at both definitions with the failure each direction produces,
and a test asserts **6 and 8** with the two odd names called out by name, so *"someone tidies them into one
list"* fails loudly instead of silently.
📌 Your instinct — *"a menu we define and never create is exactly the kind of thing that becomes a surprise
later"* — is why they are in the ownership half rather than dropped from both.

## §5 respected, stated in code
`ourMenuMatch`'s docstring carries it: **🚫 never use this to act without review; it makes a candidate.** A test
asserts the `--apply` path still requires the typed phrase, and that `line-remove-menus.ts` **does not call the
predicate at all** — the pure planner decides, the shell prints and asks.
⚠️ And it is **not** a prefix match: `smart-scheduler-parent-th-copy` is not ours. Asserted, because a `startsWith`
would have been the obvious way to write it and would quietly claim a customer's near-miss name.


📎 **See `TASK-252-menu-identity-is-the-name-not-the-stored-id.md`** — @Sober's spec for this task and the ✅ **PASS review (09-06)**. Same TASK number, two files, both current.
