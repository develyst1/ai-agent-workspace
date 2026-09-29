# TASK-544 — the other two mappers declare their drops — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-28) · **Size S.** The two you named and did not fix in TASK-543.

## §0 Why these two and why now
**`dtoToTeacher` and `dtoToCourseView`** — 🔑 **your own reason is the argument: they are the WIDEST, so their omissions are the LEAST visible.** **`dtoToBooking` hid two facts and it is the one we look at most.**
📌 **And this week's evidence is not theoretical: three dialogs were wrong because a screen could not see a server-side fact, and one of those facts was arriving all along.**

## §1 Build — the same shape, no more
- **The same declared-drop list, reasons required, placeholders rejected, counts per set** — **reuse what you built; do not invent a second mechanism.** 🔑 **If the existing check can cover all three by parameter, that is better than three copies of it** — but ⚠️ **if generalising it makes it harder to read, keep it repetitive and say so.** **A check nobody can read stops being maintained.**
- 🔑 **Apply the sharper rule you found: the risk is where an object is REDUCED**, so **call out the reduced nested objects specifically** rather than treating every field equally.
- 🚫 **Nothing newly mapped.** If a drop turns out to be a real loss, **name it as a finding and stop** — that is a screen change with its own reason, not a tidy-up. ⚠️ **I expect at least one, given the last two.**
- **State the same limit** (source-derived; `extends` and type aliases invisible), or say if it does not apply here.

## §2 What I am NOT asking for
🚫 Not a rewrite of either mapper · not a generated mapper · not a runtime check. 🔑 **The deliverable is that a dropped field is a decision someone wrote down, in all three mappers, for good.**

## Definition of Done
- [ ] Both mappers' drops declared with reasons, the reduced nested objects **called out specifically** · the existing check reused or generalised **only if it stays readable** (said either way) · 🚫 nothing newly mapped — **any real loss named as a finding and STOPPED** · the limit restated or excluded · the three-`dtoTo*` pin still holding · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that silently drops a field in each mapper · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-28): all three mappers declare their drops · **682 / 0** (was 678 · +4) · tsc 0 · build ok · **8 mutations bite** · 🔴 **one finding, named and STOPPED — and it is worse than a drop**

## §1 Both mappers drop **nothing** at their top level — and one of them shows why
- **`dtoToTeacher`: nothing dropped, at either level.** 🔑 **And the reason is the pattern that makes a mapper safe:** `dto.subjects` is reduced to names for the list **and carried whole** as `subjectOptions`. **A nested object that is reduced *and* kept cannot hide a field** — which is exactly what `course` did not do. Both halves are pinned, so **E2 (dropping the whole-ref copy) bites**: it would break the property, not just the payload.
- **`dtoToCourseView`: all 18 `CourseSummary` fields carried.** Its one reduced object is `row.student` → the name (through the shared `studentLabel`, not a second join) ⇒ **7 declared drops with reasons.**

⇒ across all three mappers the picture is consistent with TASK-543's conclusion: **the allow-list is not the danger; taking a PIECE of a nested object is.** Three mappers, four reduced objects, **34 declared entries**, and every one of them now has a written reason.

## §2 🔴 FINDING — `dtoToCourseView` does something worse than dropping: it **INVENTS**
`CoursePackage` requires `startDate`, `weekday` and `startTime`. **`CourseSummary` carries none of them**, so the mapper fills:
```ts
startDate: "",  weekday: 0,  startTime: "09:00",
```
🔑 **A dropped field is `undefined` and every reader is guarded; a fabricated one is a plausible value nobody questions.** `"09:00"` is a real time. `0` is Sunday. **A screen that showed either would be wrong and confident** — the same failure as this week's three dialogs, except the FE is the one making it up.

📌 **I searched for readers and found none today:** the plan flow and the plan modal read a *booking's* or a *plan group's* own times, never a course view's. ⚠️ **That is "no reader found", not "no reader possible"** — I cannot prove absence by search, and the lie is one `.startTime` away.

🚫 **Not fixed, per §1.** The honest fix is one of two decisions that are not mine: **the server sends the three** (a contract question, like TASK-542), or **the view stops requiring them** (a type change with readers to check). ⇒ **declared in the file**, and pinned two ways: the three literals must be exactly these, and 🔑 **a FOURTH invented value fails the test** (any literal-valued key in that body is caught — **E5** proves it).

## §3 Generalise or repeat? — **half, and I will say which half**
@Sober asked. The answer: **the four helpers are already generic**, so all three mappers share **one mechanism** (`block`, `topKeys`, `readsIn`, `dropped`) — no second invention. But **the declarations stay three explicit lists in their own `describe`**, because a table driving three mappers through one loop **would hide which mapper an entry belongs to**, and 🔑 *a check nobody can read stops being maintained.* One file, one mechanism, three readable lists.

## §4 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= mappers.ts            fb022614613dc0c08bc080ca45162ddd
          mapper-drops.test.ts  c6069f1cdd4c9854813ddde4325cff3c
          contract.ts           bbe41956a14138b66fabfc1fd59ea85b
```
| # | mutation | caught by |
|---|---|---|
| E1 | **`dtoToTeacher` silently drops `lineLinked`** (the task's per-mapper mutation) | the teacher pin |
| E2 | `dtoToTeacher` stops keeping the subject refs whole — **the safe pattern breaks** | the teacher pin |
| E3 | **`dtoToCourseView` silently drops `leaveLocked`** (the task's other per-mapper mutation) | the courseView pin **and** the invention pin |
| E4 | `dtoToCourseView` drops the student's name — its one reduced object loses its one read | both pins **and** TASK-421's DUO naming test |
| E5 | **a FOURTH invented value appears** | the invention pin |
| E6 | a declared drop loses its reason (`"n/a"`) | the reasons pin |
| E7 | **a new `TeacherDTO` field arrives and nobody maps it** | the teacher pin |
| E8 | **a fourth mapper appears in the file**, covered by nothing | the exhaustive-mappers pin |

All eight bite; none slipped; **CHECKSUM: every file back to baseline** (including the contract).

## §5 The limit, restated — it applies here too
⚠️ **Source-derived, not type-level:** the check reads the interface block and each mapper body as text, so **a field inherited through `extends` or added to a type alias is invisible to it.** 📌 **And here it is not hypothetical, so I will name it precisely:** `CoursePackageView extends CoursePackage`, and **the inherited half is where the three invented fields live** — the drop lists cover `CourseSummary` and `StudentRef` (the INPUTS, which are interfaces), while the invention pin covers the output by literal instead. 🔑 **That is why §2 is pinned by literals rather than by field names:** it is the one honest way to catch it with this mechanism. 🚫 No generated mapper, no runtime check, per §2 of the task.

## §6 Verification
**682 pass / 0 fail across 72 files in 3.2 s** (was 678 ⇒ **+4**) · **`tsc --noEmit`: 0** · **`bun run build` ok** · 🚫 **nothing newly mapped** — not one field added to any mapper — and no screen changed. 🚫 No BE change · no deploy request.
📌 **The three-`dtoTo*` pin still holds**, now as *"all three are covered here: a fourth would have nowhere to hide"* (**E8**).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **682 pass / 0 fail** · tsc 0 · build ok.

## ✅ The mechanism question, answered the right way
🔑 **"Half, and I am saying which half"** is the answer I wanted and did not specify. **Shared helpers ⇒ one mechanism; three explicit declaration lists ⇒ because a table through one loop would hide which mapper an entry belongs to.** ✅ *A check nobody can read stops being maintained* — you applied it to the part that is read and not to the part that is machinery.
🔑 **And `dtoToTeacher` explains the whole class:** `subjects` → names **AND** `subjectOptions` intact ⇒ **a reduced-and-kept object cannot hide a field.** *That is precisely what `course` did not do.* **Both halves pinned.**

## 🔴 The finding — and my ruling: **the view stops requiring them. Do NOT ask the server.**
**`dtoToCourseView` fabricates `startDate: ""`, `weekday: 0`, `startTime: "09:00"` because `CoursePackage` requires them and `CourseSummary` sends none.**
✅ **You are right that this is worse than a drop, and the reason is the ruling:** 🔑 **a dropped field is `undefined` and readers are guarded; a fabricated one is a plausible value nobody questions** — **`"09:00"` is a real time and `0` is Sunday.** *A screen showing "Sunday 09:00" for a course that has neither would be believed.*
⚖️ **Ruling: option (b), the type.** **Not** the TASK-542 route. ⇒ **We do not add three fields to a server contract for a shape with no reader; that invents a second obligation to keep true.** 🔑 **The defect is that the view DEMANDS what its source does not have — so the view is what is wrong, not the server.** ⇒ **TASK-545.**
📌 **Your own caveat is why this stays small and now: "no reader found", not "no reader possible."** The three values are correct-looking, so the day a reader appears nothing fails — **it just shows Sunday.**

## ⚠️ The limit, sharpened by you and worth keeping
🔑 **`CoursePackageView extends CoursePackage` is exactly where the invented fields live** — the blind spot and the defect are the same place. ✅ **Which is why pinning by LITERALS rather than field names was the correct choice**, and why a fourth invention fails (E5).
