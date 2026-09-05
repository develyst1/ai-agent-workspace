# TASK-247 — REQ-079: the two new rich menus, artwork **and** the publish path that would never have created them

**Repo:** `smart-scheduler-back` (path in `machine.local.md`) · **Assignee:** @Jason · **From:** @Sober (2026-09-05)
**Status:** ✅ **DONE — code** (Sober 09-05, reviewed) — tsc 0 · bun test **1295/0** · no migration · **nothing published**. 🚫 The publish is the owner's step: `board.md` PENDING DEPLOY **2** (run it, confirm on a phone) and **4** (`NAME_TO_KEY`, only AFTER the publish).
**Requirement:** `REQ-079` §12 **and** its later section *"`ภาษา` and `ช่วยเหลือ` STAY"* — **that table wins.**
**Owner's art direction, in full:** *"อยากได้สีส้ม แค่นั้นแหละ"* — **orange. Nothing else about the artwork is owed by him.**

> 🚫 **Nothing in this task publishes anything.** No `publishRichMenus`, no upload, no link, no SQL, no `db:generate`.
> **Publishing is a DEPLOY step and it is the owner's**, on his OA, confirmed on a phone. You build it and stop.

---

## §0 🔴 Read this first — the reason the menus do not exist is NOT the missing images

I went looking for what the artwork had to line up with and found that **`publishRichMenus` does not know the two
new menus exist.** `src/lib/line-rich-menu.ts:191` — the whole function:

```ts
const parentTH = await createRichMenu(PARENT_RICH_MENU);   // …parentEN, teacherTH, teacherEN
const ids: MenuIds = { parentTH, parentEN, teacherTH, teacherEN };
await storeMenuIds(ids);
await setDefaultRichMenu(parentTH);
```

`UNKNOWN_RICH_MENU` and `KNOWN_RICH_MENU` are **defined** (TASK-234), `MenuIds` **has** `unknownTH/EN` +
`knownTH/EN` slots, and `linkKnownRichMenu` **reads** `ids.knownTH`. **Nothing ever writes them.** Three
consequences, and each is separately enough to keep REQ-079 dark:

1. **Neither new menu is ever created.** `linkKnownRichMenu` finds `ids.knownTH` undefined and — being
   best-effort by design — **does nothing, silently.** The chat stays on the account default.
2. **The account default is set to `parentTH`** — the old REQ-015 6-cell menu. The file's own comment says
   *"ยังไม่รู้จัก is the DEFAULT menu … a brand-new follower then gets the right menu with no code running at
   all"*, and **the only call that makes an account default (`setDefaultRichMenu`, `POST /user/all/richmenu`)
   points at the old parent menu.** The design and the code disagree, and the code is what runs.
3. **`storeMenuIds` writes the whole object**, so a re-publish **erases** any `knownTH`/`unknownTH` that another
   path had put there. Same class as every whole-row overwrite we have removed.

📌 **This is what @Porter's screenshot was.** A **linked** chat showing the old 6-cell menu is not a
link-vs-default puzzle — **the menu it should have been switched to has never been created on the channel.**
Supplying images alone would have changed nothing, and the run would have reported success.

⇒ **§2 is the actual fix. The artwork is the smaller half of this task.**

---

## §1 Artwork — two new PNGs, generated, orange

`assets/line/generate-rich-menus.mjs` (read its `README.md` first). Add **two** jobs; **do not change the four
existing images** (see §4).

**Menu A — `unknown-th.png`, 2500 × 843, two cells.** REQ-079 §12, unchanged.

| Cell | Area (x, y, w, h) | Label | postback |
|---|---|---|---|
| 1 | `0, 0, 1250, 843` | **เข้าใช้ระบบ** | `action=enter` |
| 2 | `1250, 0, 1250, 843` | **คุยกับแอดมิน** | `action=admin` |

**Menu B — `known-th.png`, 2500 × 1686, six cells.** From REQ-079 *"`ภาษา` and `ช่วยเหลือ` STAY"* — **this table,
not §12's 3+2**:

| Cell | Area (x, y, w, h) | Label | postback |
|---|---|---|---|
| 1 | `0, 0, 833, 843` | **แจ้งลา** | `action=leave` |
| 2 | `833, 0, 833, 843` | **เช็คอิน** | `action=checkin` |
| 3 | `1666, 0, 834, 843` | **คอร์สของฉัน** | `action=mycourses` |
| 4 | `0, 843, 833, 843` | **เพิ่มนักเรียน** | `action=register` |
| 5 | `833, 843, 833, 843` | **ภาษา / ช่วยเหลือ** | `action=lang` |
| 6 | `1666, 843, 834, 843` | **คุยกับแอดมิน** | `action=admin` |

⚠️ **`KNOWN_RICH_MENU` in code is currently FIVE cells** — the bottom row is `register` plus a **wide** `admin`
(`cell(KW, CH, W - KW, CH, "action=admin")`). It must become six: `admin` narrows to the third-width bottom-right
cell and **`action=lang` takes the middle.** `คุยกับแอดมิน` **stays bottom-right** — REQ-079 calls the corner
non-negotiable and the width incidental.

**Orange.** The generator has one palette block (`BG · ACCENT · TEXT · DIVIDER`). **Change `ACCENT` for the new
menus only** — every icon already draws with it, so the colour is one constant, not an edit per glyph. Keep the
white ground and the dark label: the README's legibility rule, and orange-on-white is the readable direction anyway.

**Icons:** `เช็คอิน` · `แจ้งลา` · `เพิ่มนักเรียน` reuse `checkin` / `leave` / `register` as they are.
`ภาษา/ช่วยเหลือ` **reuses `langhelp`** — that merged cell already ships on the teacher menu, which is the whole
reason this layout works. **Two new glyphs:** `คอร์สของฉัน` (a course/book or ticket mark) and `คุยกับแอดมิน` (a
speech bubble with a person). `เข้าใช้ระบบ` on menu A can reuse `register`, or take a door/key if you prefer — your
call, it is the one cell with no precedent.

---

## §2 The publish path — the part that makes any of it reach a phone

In `src/lib/line-rich-menu.ts`:

1. **`publishRichMenus` creates and uploads all SIX Thai-side menus** — the four it does now **plus**
   `UNKNOWN_RICH_MENU` and `KNOWN_RICH_MENU` — and stores **`unknownTH` and `knownTH`** alongside the rest.
   (EN variants: see §4 — do not invent images for them.)
2. **The account default becomes the UNKNOWN menu:** `setDefaultRichMenu(unknownTH)`. This is the line that makes
   the file's *"unknown is the state you fall back to"* true instead of aspirational.
3. **`storeMenuIds` must MERGE, not replace** — read the current ids and spread over them, so a partial or a
   repeated publish can never drop an id it did not create. ⚠️ Every field of `MenuIds` is optional, so a naive
   spread of an object holding `undefined` still clobbers: **omit absent keys rather than writing `undefined`.**
4. ⚠️ **The bounds live in two files.** Any cell you change in `KNOWN_RICH_MENU` must change identically in the
   generator. The README says *"never one side alone"* — §3 turns that sentence into something that fails.

---

## §3 The guard — because "never one side alone" is a comment, and a comment is not a control

**Add a source-assertion test** (the convention this repo already has) that reads
`assets/line/generate-rich-menus.mjs` **as text** and asserts its cell rectangles for the new menus are **exactly**
the `areas` bounds of `UNKNOWN_RICH_MENU` / `KNOWN_RICH_MENU`. It must fail if someone moves a cell on one side.

⚠️ **The trap this repo keeps setting for itself:** strip comments before matching, and match on **code shape**,
not on a phrase that also appears in prose — the `strikeOrPrompt` **6-vs-11** correction on 09-03 was exactly this,
and it caught the author, the reviewer and the PM in turn. **A count that cannot tell code from a comment is not
evidence.**

✅ Also assert `menuHasAdminButton(KNOWN_RICH_MENU)` **and** `menuHasAdminButton(UNKNOWN_RICH_MENU)`. The function
exists for this and nothing calls it in a test today. *"A lockout or a handover must never be a dead end"* should
be a failing test, not a paragraph.

---

## §4 Decided for you, so you are not blocked

- **TH only.** `UNKNOWN_RICH_MENU_EN` / `KNOWN_RICH_MENU_EN` exist and may be created **only if** you also produce
  their images; if you do not, **do not store their ids** — a stored id with no image is a menu that renders blank
  on a phone, which is worse than falling back. **My call: TH only this round.** REQ-079 is a Thai-first flow and
  the owner has never asked for EN on it.
- **The four REQ-015 images stay blue and untouched.** A repaint is **not free**: it means re-creating those
  menus, which changes their ids, and **teachers already linked keep the OLD menu id until they re-link.** So an
  orange teacher menu is a migration, not a colour change. ⚠️ It does leave the OA two-coloured (orange
  unknown/known, blue teacher) — @Porter, that is a question for the owner, and it does not block this task.
- **`ภาษา/ช่วยเหลือ` is NOT added to menu A.** REQ-079 says a follower who has not linked has exactly two things
  to do. If the owner wants it there, it is a third cell and one more line.

---

## Definition of Done

- [x] `tsc --noEmit` → **0**
- [x] `bun test` → **1295 pass / 0 fail** (17 of them new, in `src/lib/line-rich-menu-artwork.test.ts`)
- [x] `assets/line/unknown-th.png` (2500×843, 17 KB) + `known-th.png` (2500×1686, 49 KB) exist, orange, labels
      exactly as §1 — sizes read back out of the PNG headers, not from the generator's intent
- [x] `KNOWN_RICH_MENU` is **six** cells; `คุยกับแอดมิน` bottom-right (asserted as *right edge = 2500, y = 843*,
      the corner rather than the width); `action=lang` in cell 5
- [x] `publishRichMenus` creates + uploads **six** menus, stores `unknownTH`/`knownTH`, defaults to **unknown**
- [x] `storeMenuIds` merges — the merge is a pure `mergeMenuIds(current, incoming)` so it is provable without a
      DB; the test runs the exact sequence that bites (**publish stores six → adopt writes its four → the two
      REQ-079 ids survive**), plus the `undefined`-clobber case
- [x] The generator↔code bounds test fails when either side moves — **proved by moving one**: I shifted
      `knownCells` cell 5 by `+4px` in the generator, re-ran (`1 fail`, naming that test), and restored it
      (`17 pass`). The assertion is `toEqual` **between the two sources**, so either side moving breaks it.
- [x] `menuHasAdminButton` asserted for both new menus
- [x] `assets/line/README.md` updated: the two new files, the fixed-filename contract, orange, the default, the
      EN decision, and the confirmed `sharp` run
- [x] 🚫 **Nothing was published.** No `publishRichMenus` run, no upload, no link, no `setDefaultRichMenu`, no
      LINE API call of any kind, **no SQL, no migration** (32 `drizzle/*.sql` = 32 journal tags, re-counted),
      no `db:generate`. The only thing that touched a network was `bun`'s own lockfile.

## Implementation Notes — Jason, 2026-09-05

Repo **`smart-scheduler-back`** (path in `machine.local.md`), HEAD **`b47142a`**. Files: `src/lib/line-rich-menu.ts`
· `scripts/line-publish-menus.ts` · `assets/line/generate-rich-menus.mjs` · `assets/line/README.md` ·
**new** `assets/line/unknown-th.png`, `known-th.png`, `src/lib/line-rich-menu-artwork.test.ts`.

**§2 first, because you were right that it is the actual fix.** `publishRichMenus` now creates and uploads six
menus, stores `unknownTH`/`knownTH`, and — the line that changes what a new follower sees —
`setDefaultRichMenu(unknownTH)`. `storeMenuIds` merges through a pure `mergeMenuIds(current, incoming)` that
**omits absent keys instead of writing `undefined`**, which is the half a naive spread gets wrong: every field of
`MenuIds` is optional, so `{ knownTH: undefined }` would have overwritten a stored id with nothing.

**§1 artwork.** Orange = Mantine `orange.7` `#f76707`, on the white ground with the dark label (README legibility
rule). The accent became a **parameter** of the icon set rather than a second copy of every glyph — so the two
new menus are orange and the four shipped ones are untouched, and the proof is stronger than a promise: after
regenerating **all six**, `git status` shows the four REQ-015 PNGs **byte-identical**. New glyphs: `mycourses`
(open course card) and `admin` (speech bubble with a person). For `เข้าใช้ระบบ` I did **not** reuse `register` —
a person-with-a-plus reads as *"add a child"*, a different act — so it is a door with an arrow going in.
📌 One deviation from your table, and it is one character: the cell-5 label is **`ภาษา/ช่วยเหลือ`**, not
`ภาษา / ช่วยเหลือ`. That is `btn_langhelp` verbatim — the same string already on the teacher menu, which is the
reason this six-cell layout works at all. Say the word if you want the spaced form.

**§3 the guard, and the trap you warned about.** The test reads the generator **as text**, strips comments, and
compares the parsed rectangles to `UNKNOWN_RICH_MENU` / `KNOWN_RICH_MENU`'s `areas`. Two details worth naming:
- It takes `KW`/`CH` **from the generator's own source** rather than retyping `833`/`843`, so the test is not a
  third copy of the geometry that could drift from both.
- It only evaluates expressions matching an arithmetic-over-`KW`/`CH` shape — a guard against a "clever" test
  that would happily execute whatever the file grew into.
- ✅ **I proved it fails** (see the DoD line): moved one cell 4px, watched that exact test fail, restored.

## Answers to your three questions

**1 — Yes, `line-adopt-menus.ts` has the same whole-object overwrite, and I did NOT fix it silently.**
`selectMenuIds` builds a **fresh** `MenuIds` from `/richmenu/list` and hands it to `storeMenuIds`, and
`NAME_TO_KEY` knows only the four REQ-015 names. Before today that erased `unknownTH`/`knownTH` outright.
- **The destructive half is now closed at the write site** — `storeMenuIds` merges, so adopt keeps what it does
  not know about. That was the right place: both writers go through it, and fixing only adopt would have left
  the next writer to rediscover the same edge.
- 🔴 **What I deliberately did NOT do: add the two new names to `NAME_TO_KEY`.** Adopt aborts when *any* name in
  that map is missing from the OA (*"a half map would leave the switch broken for those roles"*). Adding them
  before the menus exist on the channel would make `line:adopt-menus` **fail outright on every OA that has not
  been re-published yet** — a working operator command broken by a task that was not about it. **After the
  owner publishes, adopting the new pair is a two-line change and its own decision.** Yours.
- `scripts/line-inspect-menus.ts` only **reads** (`getMenuIds`) — no writes, nothing to fix.

**2 — No. Nothing links the unknown menu per user, and the design holds.** Grepping the whole of `src/` and
`scripts/`, `UNKNOWN_RICH_MENU` appears only as a definition and `unknownTH`/`unknownEN` only as type slots —
there is no `linkUnknownRichMenu` and no call site. Unknown is reachable **only** as the account default, which
is exactly the *"you land there with no code running"* shape. It is also why §2's default change is the whole of
what makes it real.

**3 — Confirmed, and I ran it.** `sharp` is still not a dependency here; the README's cross-repo recipe works
unchanged (`sharp` **0.34.5** in `smart-scheduler-front`). I regenerated **all six** PNGs from that repo — the
two new ones appeared and the four old ones came out byte-identical (`git status` clean on them). The README now
records the version and that fact, so the next person knows the reproduction is real rather than assumed.

## Questions I want answered in your submission

1. **Does anything else read `MenuIds` assuming only four keys?** I checked `linkKnownRichMenu` and
   `linkRoleRichMenu`; I did **not** read `scripts/line-adopt-menus.ts` or `scripts/line-inspect-menus.ts`, and
   adopt in particular writes ids. **If adopt has the same whole-object overwrite, say so — do not fix it silently.**
2. **Does anything link the unknown menu per-user?** It should not — the design is that unknown is where you land
   with no code running. If some path links it explicitly, that is a second definition of the same state.
3. `sharp` still is not a dependency of this repo. **Confirm the README's cross-repo run still works**, or say what
   you actually did — the images must be reproducible by the next person, not merely present.


## Review — Sober, 2026-09-05: ✅ **PASS. TASK-247 is DONE (code).**

**Reproduced, independently:** `tsc --noEmit` → **0** · `bun test` → **1295 pass / 0 fail** across 108 files ·
`git status assets/line/` → only `README.md` + the generator modified, `known-th.png` / `unknown-th.png` new,
**the four REQ-015 PNGs untouched** — so *"byte-identical"* is not a claim, it is checkable, and I checked it ·
`KNOWN_RICH_MENU` is **six** cells with `action=lang` at `833,843,833,843` and `action=admin` at
`1666,843,834,843` — REQ-079's table exactly · **I opened both PNGs.** Orange, labels correct,
`คุยกับแอดมิน` bottom-right on B and right-hand on A.

### ✅ §2 was the fix, and you took the harder half first

`publishRichMenus` now creates and uploads six and — the line that changes what a new follower sees —
`setDefaultRichMenu(unknownTH)`. **That single call is what turns the file's paragraph into behaviour.** Until
today the comment said *"unknown is the DEFAULT"* and the code set the old parent menu; now they agree.

📌 **`mergeMenuIds` being a PURE function is the detail that makes the guarantee provable.** The dangerous case
is a sequence, not a call — **publish stores six → adopt writes its four → do the two REQ-079 ids survive?** —
and a pure merge lets that sequence be a test instead of a DB experiment. The `undefined`-clobber case is the
half a naive spread gets wrong, and you tested it rather than describing it.

### 🔴 The judgement I want to single out — what you did NOT do

> *"I deliberately did NOT add the two new names to `NAME_TO_KEY`."*

**I verified this and you are right.** `selectMenuIds` computes `missing` over **every** key of `NAME_TO_KEY`, and
`line-adopt-menus.ts:56` aborts on any gap — *"Nothing was stored (a half map would leave the switch broken for
those roles)."* ⇒ adding the names **before** the menus exist on the channel would break `line:adopt-menus`
**outright on every OA not yet re-published** — a working operator command broken by a task that was not about it.

✅ And you closed the destructive half **at the write site** instead, so adopt now keeps what it does not know
about. **That is the right place:** both writers go through `storeMenuIds`, and fixing adopt alone would have left
the next writer to rediscover the same edge.

⚠️ **The part that is mine, and I am not leaving it as a sentence.** *"After the owner publishes, adopting the new
pair is a two-line change"* is a **follow-up with a trigger**, and a follow-up without a trigger is a note — which
is exactly how the additional-teacher clash got past me. ⇒ It is now **step 4 of the PENDING DEPLOY block** in
`board.md`, attached to the publish it depends on, not filed behind it.

### ✅ §3 — you built a better guard than I asked for

I asked you to prove the test can fail. **You made it prove itself on every run:** the negative control at
`line-rich-menu-artwork.test.ts:86` asserts that a moved cell does **not** match — so the guard's own liveness is
re-checked forever, not once by hand in a session nobody can replay. **That is the difference between evidence and
a receipt.**

Two more things I would have missed:
- **`KW`/`CH` are read out of the generator's source rather than retyped**, so the test is not a *third* copy of
  the geometry quietly drifting from both. I would have accepted the retyped constants.
- **The eval is shape-guarded** (`^[\d\s+\-*/()]*(?:(?:KW|CH)…)*$`) — a source-assertion test that executes what it
  finds is a hazard, and you fenced it before anyone asked.

✅ Comments stripped before matching. That convention has now paid twice in three days.

### 📌 Two small calls, both yours, both right

- **`เข้าใช้ระบบ` is a door, not `register`.** *"A person-with-a-plus reads as 'add a child', a different act."*
  Correct — and it is the same distinction discipline that has been the theme all week: **two acts that share a
  glyph become one act in the reader's head.**
- **`ภาษา/ช่วยเหลือ` unspaced, not my `ภาษา / ช่วยเหลือ`.** **Take yours.** It is `btn_langhelp` verbatim — the
  string already on the teacher menu and in the bot's replies. My table had a cosmetic space that would have made
  **two** spellings of one label. One string, one place.

### 👁️ One observation, no action
Menu A's content sits high — `cellSvg` places the icon at 40% and the label at 74% of the cell, which centres well
in a **two-row** menu and leaves a visible empty band under a **single-row** one. ⚠️ **It is not a defect and I do
not want it changed:** the shipped teacher menu is the same height through the same function, so menu A matches
what is already on the OA. **Naming it so that whoever sees it on a phone knows it was noticed and kept.**

**Status → DONE (code).** 🚫 Nothing published — that is the owner's step, and it is the only thing left.
