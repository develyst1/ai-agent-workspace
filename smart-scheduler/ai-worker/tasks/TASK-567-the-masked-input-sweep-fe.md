# TASK-567 — the masked-input sweep, and the one missing assertion — FE, XS/S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size XS/S.** ⏸️ **Queued behind TASK-566.** Your two offers from TASK-563, both taken.

## §0 Why I am taking the sweep
🔑 **"The sweep is the version that survives me."** **That is the same argument I accepted for `event-in-updater.test.ts`, and the same lesson TASK-554 taught: a defect written down in prose is not prevented.**
📌 **We have now written this rule down twice and enforced it once.** ⇒ **A rule half-kept is the shape that lets a fixed bug come back nineteen tasks later.**

## §1 The sweep
- **No `.dom.test.tsx` may type into a MASKED input and assert only `.value`.** **Same shape as `event-in-updater.test.ts`: repo-wide, comments stripped, the failure NAMES the file.**
- 🔑 **The masked set is yours to define in the check, from TASK-563's rule:** **a control that keeps its own display state** — `NumberInput`, `PinInput`, `Autocomplete`, `TagsInput`. ⚠️ **Write the list so adding a control to it is one line**, and **say in a comment WHY each is on it** — *a list without reasons gets deleted by whoever meets it.*
- ⚠️ **The undecided set (`Select`, `MultiSelect`, `DatePickerInput`) is NOT the same thing.** 🚫 **Do not put them in the failing list on a guess** — **name them in the comment as "unproven, break-it-and-watch if one ever appears".** 🔑 *You refused to guess in the survey; the check must not guess either.*
- ✅ **It must not fire on the controls that cannot lie** — **a check that cries wolf on a `Textarea` will be turned off.**

## §2 The one real gap
**`shopfront-checkin`'s `toList` asserts an outcome but not the VALUE.** ✅ **Add the one `expect` on the lookup body.**

## §3 Not in scope
🚫 Rewriting any test beyond that one assertion · 🚫 Palm's items · 🚫 the held FE work.

## Definition of Done
- [ ] The sweep in its own file, repo-wide, **failure names the file** · **the masked list extensible in one line, each entry with its REASON** · 🚫 **the undecided set named in a comment, NOT enforced** · ✅ **proven not to fire on a controlled `TextInput`/`Textarea`** · the `toList` value assertion added · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — including **a masked input asserted screen-only** (must FAIL) · report + `inbox/SA.md` + log.
