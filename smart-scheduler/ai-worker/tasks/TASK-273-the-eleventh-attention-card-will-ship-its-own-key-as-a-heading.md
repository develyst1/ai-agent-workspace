**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1628 pass 0 fail / tsc mutation run by both of us / nothing applied. FE double-copy: recorded, NOT cut — same ruling as BookingStatus.

# TASK-273 — the eleventh attention card will ship `att_my_new_card` as its heading

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Source:** your sweep at the end of TASK-271. 📌 **No hurry — nothing is broken today and nothing is blocked.**
🚫 No migration, no database, no FE change.

---

## §1 The finding is yours, and it is worth doing precisely because it is not a defect yet
`attention.ts:377` renders `t(\`att_${c.key}\`, lang)`. **Ten card keys, ten labels — complete today.** But the
keys are **plain strings in an array** and **nothing types them against the label set**, so the eleventh card
ships with **`att_my_new_card` as its heading on the dashboard.**

🔴 **This is the third instance of one class in one day** — `status_*` (broken, found by a tester),
`att_*` (complete, nothing holding it), and `ics.ts`'s raw `STATUS:` (broken, found by reading).
⇒ **Two of the three were found only because somebody happened to look.** **The one that is still correct is the
one worth spending a line on**, because it is the only one where the control costs nothing to add and there is
no defect to argue about first.

## §2 The fix — the same one line, and it needs no derivation
`Record<AttentionKey, …>` over the card keys, so **adding a card without its label fails the build.**
✅ **Unlike TASK-271's, this needs nothing to exist first** — the keys are already in one array in one file.
**Derive `AttentionKey` from that array** (`as const` + `(typeof KEYS)[number]`), so the type and the array
cannot drift either. 🚫 **Do not hand-write the union** — that would be the same defect one level up.
⚠️ **Leave `t()`'s fall-through alone.** It is right for genuinely dynamic keys; the point is that a card key
must stop being one.

## §3 What must not change
- 🚫 The ten labels' text, the card order, any card's logic.
- 🚫 `t()`'s defensive behaviour.
- 🚫 No FE change, no migration, no database.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] `AttentionKey` is **derived from the key array**, not hand-written — asserted
- [ ] **Break it and watch:** add a key with no label ⇒ **`tsc` fails.** Paste it.
- [ ] The ten rendered headings are **byte-identical to before** — asserted, because "no-op" is a claim
- [ ] 🚫 No migration, no database, no FE change

## Question
**Are the card keys used anywhere else as strings** — a stored preference, a dismissal record, an FE constant?
**If a key is persisted anywhere, say so before typing it** — a type is free, but discovering that a key is also
a database value after renaming one is not.

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1628 pass / 0 fail, 128 files**
🚫 No migration · no database · no FE change · the ten labels' TEXT, the card order and every card's logic
unchanged · `t()`'s fall-through untouched.
New: `src/lib/attention-labels.test.ts` (7 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1628 / 0**, 128 files
- [x] `AttentionKey` **derived from the key array** — `(typeof CHECKS)[number]["key"]`, asserted, and asserted
      that no hand-written union came back
- [x] **Broke it and watched** — output below
- [x] The ten headings are **byte-identical**, asserted against a copy of the old table, plus the card ORDER
- [x] 🚫 No migration, no database, no FE change

## The control, failing
```
$ (append an 11th card with no label) && bunx tsc --noEmit
src/lib/line-i18n.ts(75,7): error TS2741: Property 'my_new_card' is missing in type
  '{ unconfirmed_bookings: …; teachers_without_line: …; … }'
  but required in type 'Record<"discount_not_applied" | … | "my_new_card" | … , Entry>'.
```
🔑 **`my_new_card` is in the required union because the type is derived from the array I just appended to.**
The card and its heading are now one decision, and the compiler is the one asking.

## ⚠️ One shape decision worth stating, because the obvious version does not work
`as const satisfies readonly AttentionCheck[]` on the exported array **narrows away the OPTIONAL
`namesPeopleInDigest`** — every reader would then have to prove the property exists before asking, and four
sites broke. ⇒ **the `as const` lives on a private `CHECKS`, and `ATTENTION_CHECKS` is re-exported as
`readonly AttentionCheck[]`.** **One array, two views:** the literal keys for the type, the interface for the
readers. 🚫 Not two lists — `ATTENTION_CHECKS = CHECKS`, one line.
📌 And `satisfies` is load-bearing rather than decorative: without it the `run: async (ctx) => …` callbacks lose
contextual typing and every parameter becomes implicitly `any`. **I found that by removing the annotation and
watching seven `TS7006`s**, which is the honest way to learn what an annotation was doing.

## ➕ One thing I added, because nothing had ever checked it
**`titleKey` is asserted to equal `att_` + `key`** for every card. They are two spellings of one fact sitting
next to each other in the same object, and nothing has ever compared them — a card whose `titleKey` had a typo
would render a raw key **even with this task's Record in place**, because the Record is keyed on `key` and the
digest builds its own `att_${c.key}`. ✅ They agree today; now they cannot silently stop.

## Answer — **are the card keys used anywhere else as strings?**
**Not persisted anywhere. But they cross the wire, and that is the part worth knowing.**

| where | what | verdict |
|---|---|---|
| `db/schema.ts:351` · `search.queries.ts:119` | the words `sales_not_posted` | ✅ **comments only** — I checked both; neither is a value |
| any table, column, enum or setting | — | ✅ **nothing.** No card key is stored, no dismissal record, no preference |
| 🔴 `smart-scheduler-front/src/services/attention.service.ts` | its own `key: "unconfirmed_bookings"` **and** `titleKey: "att_unconfirmed_bookings"` | ⚠️ **a full second copy** |
| 🔴 `smart-scheduler-front/src/lib/i18n/dictionaries.ts` | its own TH and EN headings for the same ten keys | ⚠️ **a third copy of the labels** |

⇒ **Typing them here is free and safe** — nothing is renamed, and the FE is untouched. ⚠️ **But a future RENAME
of a card key would break the FE silently**, exactly like `BookingStatus` did. **Same across-the-wire
duplication, same absent mechanism** — and you have already ruled on that class: *"what is missing is a
mechanism, and the only real ones are codegen or a cross-repo contract test — decisions, not bug fixes."*
📌 **So: no task from me.** Recorded because *"a type is free, but discovering that a key is also something
else after renaming one is not"* — and the something else here is another repo.

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-273 is DONE (code).** 🔻 **And my first mutation gave a FALSE confirmation — worth more than the review.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1628 pass / 0 fail**, 128 files ·
`attention.ts:364` = `(typeof CHECKS)[number]["key"]` · `line-i18n.ts:75` = `Record<AttentionKey, Entry>` ·
`smart-scheduler-front` **`git status` clean — 0 files.** Nothing applied.

### 🔻 My mutation failed for the WRONG REASON, and I nearly reported it as agreement
I appended an 11th card with `run: async () => null`. **`tsc` failed** — with **two `TS2322`s about my stub's
return type**, and **no `TS2741` about the missing label at all.** ⇒ **the card was malformed, `satisfies` broke
first, and the check I was testing never ran.**
**Re-ran with a well-formed card** (`run: async () => ({ count: 0, items: [] })`) ⇒ **exactly your `TS2741`**,
with `"my_new_card"` in the required union.
📌 **A red `tsc` would have "confirmed" your claim while proving nothing about it** — the same shape as your
`Bun.resolveSync` printing a ✓ over the exact failure on TASK-267. **A mutation that fails for a different reason
than the one under test is not evidence, and it looks identical to evidence.** **Recording it because I would
have believed it.**

### 🔑 The `as const satisfies` finding is the kind that only comes from doing it
> *"`as const satisfies readonly AttentionCheck[]` on the exported array narrows away the OPTIONAL
> `namesPeopleInDigest` — every reader would then have to prove the property exists before asking, and four sites
> broke."*

✅ **`as const` on a private `CHECKS`, `ATTENTION_CHECKS` re-exported as the interface type. One array, two
views** — literal keys for the type, the interface for the readers, `ATTENTION_CHECKS = CHECKS` on one line.
**Not two lists**, which is the trap the whole week has been about.
🔑 **And you established what `satisfies` was load-bearing FOR by removing it and watching seven `TS7006`s** —
the callbacks lose contextual typing and every parameter goes implicitly `any`. *"The honest way to learn what an
annotation was doing."* **Yes. An annotation nobody has removed is an annotation nobody understands.**

### ➕ `titleKey` — you added a check I did not ask for, and it closes the actual hole
**`titleKey` asserted to equal `att_` + `key`.** 🔑 **That is the gap my task left open:** the `Record` is keyed
on `key`, but the digest builds its own `att_${c.key}` — **so a typo'd `titleKey` would still render a raw key
WITH this task's Record in place.** **Two spellings of one fact, side by side in the same object, never
compared.** ✅ They agree today and now cannot silently stop. **This is the second time this week you have closed
the half of a control I specified rather than only building the half I asked for** (the other was typing
`veventStatus`'s **input**).

### Answer — and you applied my own ruling back to me, correctly
**Not persisted anywhere** (both `sales_not_posted` hits are comments — you checked), **but a full second copy of
the keys AND a third copy of the labels live in `smart-scheduler-front`.**
✅ **Typing them here is free and safe; a future RENAME would break the FE silently.** ⇒ **no task**, on the
ruling I gave for `BookingStatus`: *"what is missing is a mechanism, and the only real ones are codegen or a
cross-repo contract test — decisions, not bug fixes."*
📌 **Same class, third occurrence** — status list, status labels, attention keys. **Recorded in `SYSTEM-FACTS`,
and it strengthens the case for the codegen option whenever @Porter next has room to put it to the owner.**
**Correct call, and correct to make it rather than ask me to repeat myself.**
