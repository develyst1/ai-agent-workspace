# TASK-543 — our own mapper drops DTO fields silently, and nothing can tell — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-28) · **Size S.** Your side-finding in TASK-541's addendum.

## §0 What it is
**`dtoToBooking` is an allow-list.** `BookingDTO.course` has carried **`leaveRemaining` and `adminUnlocked` all along**, and **neither was mapped** ⇒ **those facts were invisible to every screen**, and **the compiler cannot say**, because *an allow-list that omits a field looks exactly like one that never had it.*
🔑 **This is the mirror of TASK-542.** That one is *"the server never sent it"*; **this is "the server sent it and we dropped it on our own side of the wire."** 📌 **Three dialogs this week were wrong because a screen could not see a server-side fact — and at least one of those facts was arriving all along.**

## §1 Build — make the dropped set VISIBLE, not smaller
- 🔑 **The deliverable is a list, not a mapping:** **every field the DTO carries that the mapper does NOT**, derived from the contract type and the mapper itself, **asserted against a declared set.** ⇒ **a newly dropped field fails the suite until someone writes it down.**
- ✅ **Dropping is fine and often right** — a screen does not need everything. **What is not fine is dropping by accident**, so 🔑 **each entry carries a one-line reason** ("not used", "server-only", "superseded by X"). ⚠️ **A list with no reasons will be copied forward by the next person without thought, and then it is just a longer silence.**
- 🚫 **Do NOT map the dropped fields "while you are there."** **Map only what a screen needs today** — **adding fields nobody reads is how the mapper became unreadable enough to hide two.**
- 📌 **Say whether any OTHER mapper in the FE has the same shape** (parents, courses, camp). **If they do, name them and stop** — I will cut them separately rather than have one task swallow four.

## §2 What I am NOT asking for
🚫 Not a generated mapper, not a runtime check, not a type gymnastics exercise. 🔑 **A test that names what we chose not to carry is enough** — **and if the honest version of this is bigger than S, stop and tell me** rather than building a framework for a list.

## Definition of Done
- [ ] The dropped set **derived** and asserted against a declared list, **each with a reason** · a newly dropped field failing until declared · 🚫 nothing newly mapped that no screen reads · other mappers of the same shape **named, not fixed** · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that drops a mapped field silently and one that declares a field without a reason · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-28): the dropped set is written down · **678 / 0** (was 671 · +7) · tsc 0 · build ok · **7 mutations bite** · 🔑 **the silence is narrower than we both thought — and it caught a duplicated rule in my own addendum**

## §1 🔑 The shape of the silence — **every top-level `BookingDTO` field IS mapped**
I derived the set rather than eyeballing it: the `BookingDTO` interface's own properties, from the contract source, against every `dto.<field>` the `dtoToBooking` body reads. **All 36 are carried. The dropped set at the top level is empty.**

⇒ 📌 **What hides fields is not the allow-list itself — it is a nested object the mapper REDUCES.** `course` → `courseId` + `courseLeaveLocked`; `student` → two names; `teacher` → an id; `subject` → a name. A nested object **passed through whole** (`other`, `group`, `rental`, `discount`, `rate`, `coStudent`) **cannot hide anything.** 🔑 **That is exactly where the two lost facts lived, and it is a sharper statement of the class than "the mapper drops fields":** the danger is not the length of the list, it is **every place we take a piece of an object.**

So the declarations are **per reduced object**: `course` **16**, `student` **6**, `teacher` **3**, `subject` **2** — **27 entries, each with a one-line reason** — plus `DROPPED_TOP`, deliberately **empty**, which is the pin that makes the NEXT accidental top-level drop fail immediately (the check TASK-170 and TASK-541 both needed and did not have).

## §2 🔨 It found a duplicated rule in my OWN addendum — corrected
Writing the reason for `leaveRemaining` forced the question *"why would a row ever need this?"* — and the answer was: **it should not, because the server already sends the conclusion.**

**`CourseSummary.leaveLocked` is `leaveUsed >= quota && !adminUnlocked` — exactly `!canTakeLeave`.** My addendum carried `{ leaveRemaining, adminUnlocked }` and **recomputed that condition on the FE.** ⇒ the row now carries **`courseLeaveLocked: dto.course ? dto.course.leaveLocked : null`** and the rule reads `b.courseLeaveLocked === true`.

🔑 **This is the same mistake as the one this task is about, in the opposite direction:** the fact was arriving, and instead of reading it we rebuilt it. 🚫 **Two copies of one condition is how a cancelled course kept a green `ปกติ` badge** (TASK-183/188) — a dialog is not a better place for that than a badge was. **Pinned by ABSENCE:** neither the rule nor the `dtoToBooking` body may contain `adminUnlocked`, `leaveRemaining` or a `remaining >` comparison, and **mutation D7 (going back to the pair) bites.**

⚠️ **Behaviour is unchanged** — the two conditions are equal by construction — so nothing about yesterday's outcome moved. What changed is that **there is no longer a second place for the rule to drift.** 📌 **Two of yesterday's nine mutations (A2 the dropped unlock, A3 the `>= 0` boundary) no longer exist as mutations, because the code they broke is gone**; the pin that replaces both is *"the FE does not derive this at all"*. **That is a better state than passing those two.**

## §3 📌 Named, not fixed — the other mappers of the same shape
- **`dtoToTeacher(TeacherDTO)`** — same allow-list reduction, already drops fields (`subjects` becomes two views). A new `TeacherDTO` field reaches no screen and nothing says so.
- **`dtoToCourseView(CourseSummary & { student })`** — the widest of the three; it carries most of the summary, so **an omission there is the least visible of all.**
- 🚫 **Nothing outside `lib/api/mappers.ts` has this shape** — the services hand DTOs to their hooks, so there is no third place to look. Pinned: `mappers.ts` exports exactly these three `dtoTo*` functions, so **a fourth cannot appear unnoticed.**
🔑 **Not covered here on purpose, per your §1:** the same file can be pointed at each of them in a task each. **One task that swallows four mappers is how a list stops being read.**

## §4 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= mappers.ts            fb022614613dc0c08bc080ca45162ddd
          mapper-drops.test.ts  061c4a3197294aa32fe823dd472b8be2
          contract.ts           bbe41956a14138b66fabfc1fd59ea85b
          leave-claim.ts        0072f4cc64d6fddcf0523f92ae6ac497
```
| # | mutation | caught by |
|---|---|---|
| D1 | **a mapped top-level field is dropped silently** (`attendeeNote: null`) — the task's required mutation | the empty-top-level pin |
| D2 | **a field declared with NO reason** — the task's other required mutation | the reasons pin |
| D3 | a field declared with a **placeholder** reason (*"not used"*) | the reasons pin |
| D4 | **a NEW DTO field arrives and nobody maps it** (run separately: its first anchor was not unique, so I re-ran it with `courseLast` and reported that rather than leaving a gap) | the empty-top-level pin |
| D5 | a nested **course** field stops being carried (`leaveLocked` — the leave dialog's fact) | the `course` pin **and** TASK-541's mapper pin |
| D6 | the declared course list silently **loses an entry** (list drifts from code) | the `course` pin **and** the per-set count |
| D7 | the FE goes back to **re-deriving** the lock from the pair | the no-re-derive pin |

All seven bite; none slipped; **CHECKSUM: every file back to baseline** (including the contract, mutated and restored).

## §5 Honest limits
- ⚠️ **This is a SOURCE-derived check, not a type-level one.** It reads the interface block and the mapper body as text. **It cannot see a field inherited through `extends`, nor one added to a type alias rather than an interface** — no `BookingDTO` field arrives that way today, and I would rather say so than imply the net is tighter than it is. 🚫 Per your §2 I did not build a generated mapper or a runtime check to close that: **a list that is read beats a framework that is not.**
- 🚫 **Nothing was newly mapped.** The only mapper change is §2's replacement of two fields with the one the server already computes — **fewer carried fields, not more.**
- 📌 **The list will go stale in exactly one way and it fails loudly when it does:** a field removed from the DTO leaves a declared entry that no longer matches, and the equality assertion says so.

## §6 Verification
**678 pass / 0 fail across 72 files in 3.3 s** (was 671 ⇒ **+7**) · **`tsc --noEmit`: 0** · **`bun run build` ok** · every leave-dialog outcome unchanged (§2 is behaviour-neutral by construction). 🚫 No BE change · 🚫 no deploy request.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **678 pass / 0 fail** · tsc 0 · build ok.

## 🔑 She sharpened the problem, and the sharper version is the useful one
**All 36 top-level `BookingDTO` fields ARE mapped — the top-level dropped set is EMPTY.** ⇒ **my framing, "the mapper drops fields", was wrong about where the danger lives.**
📌 **What hides a fact is a nested object the mapper REDUCES** (`course` → id + lock, `student` → two names, `teacher` → an id, `subject` → a name); **an object passed through whole cannot hide anything.** ⇒ 🔑 **"the danger is every place we take a PIECE of an object"** — and **that is exactly where both lost facts lived.**
✅ **27 declared drops with a reason each, `DROPPED_TOP` deliberately empty as the pin that catches the next accidental top-level drop**, ⚠️ **placeholder reasons rejected** ("not used", "TODO", "-"), and **counts asserted PER SET rather than over a merge** — *because two objects legitimately drop an `id`, and a merge would hide one reason.* **That is the failure shape the file exists to catch, caught in the file's own design.**

## 🔨 The judgement call she flagged: **accepted, and she chose right**
She found `CourseSummary.leaveLocked` **is exactly `!canTakeLeave`** — **the server already sends the conclusion, and yesterday's addendum rebuilt it from two fields** — and **fixed it here rather than filing it.**
✅ **Her stated trade is the correct one: "leaving a knowingly duplicated rule while filing a task about invisible drops would be the wrong trade."** 🔑 **And the fix REMOVES code and pins by absence that neither the rule nor the mapper may hold that condition** — ⇒ **two of yesterday's nine mutations no longer exist because the code they broke is gone**, and *"the FE does not derive this at all"* replaces both. **A smaller surface with a stronger pin is not scope creep.**
📌 **She also offered the revert in one line.** **Offering the undo is what makes taking the judgement acceptable** — I would rather be told "I did this, here is the reason, here is the way back" than asked to approve it in advance and wait a turn.

## ▶️ Named and not fixed, as instructed ⇒ **TASK-544**
**`dtoToTeacher` and `dtoToCourseView`** — 🔑 **and she names why they matter: they are the WIDEST, so their omissions are the LEAST visible.** ✅ **And nothing outside `lib/api/mappers.ts` has this shape** (services hand DTOs straight to hooks), **pinned by the file exporting exactly three `dtoTo*` so a fourth cannot appear unnoticed.**
⚠️ **The stated limit is right and worth keeping in view:** it is a **source-derived** check, so **it cannot see a field inherited via `extends` or added to a type alias** — **none arrives that way today.**
