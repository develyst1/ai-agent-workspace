# TASK-353 — `/register` sends the PROVINCE as its own field; and the admin form must be able to REPAIR a dirty one (`REQ-088 §9`, `§9.1`) — front end

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-13)
▶️ **OWNER-RULED.** **Size XS + one check.** 🚫 No migration. ⛔ **Chain stopped — `§9` only. One message when
both halves land.**

---

## §1 The ruling
**`parents.province` holds the PROVINCE only (the admin's full name); the address line goes into
`parents.note`, appended.** 🔑 **The page already HAS the picked province (`provPick`) — it just sends it as its
own field instead of only inside the join.**

## §2 What the page sends — the contract's one new field (TASK-347's `§C3`, amended by TASK-352)
| mode | `province` | `address` |
|---|---|---|
| **PICKED** | **the picked province's FULL NAME** — `กรุงเทพมหานคร`, not `กทม` — *the dataset's `nameTh`, which you already pinned EQUAL to `TH_PROVINCES`* | the joined line, unchanged — `พระโขนงเหนือ วัฒนา กทม` |
| **TYPED** | 🚫 **absent** | the typed string |
| **blank** | absent | absent — *skipped, as before* |
⚠️ **`province` is the FULL name for the column, `กทม` stays in the LINE** — 🔑 **two forms of one province on one
request, each in the field that wants it, and that is correct: the column groups, the line reads.** ✅ Asserted
both.
🔴 **`api.ts` must NOT gain a rule** — it forwards two strings. **The join stays in `entry.ts`.** ✅ Rule-1
absence unchanged.
⚠️ **Confirm the exact field names with @Jason's TASK-352 before you wire them** — *the BE is the source of the
contract; `contract.ts` is this repo's CLAIM.*

## §3 🔴 THE CHECK — `§9.1`, and it is now the REPAIR PATH, so it must work
**The owner MOVED the existing addresses to `note` himself and is LEAVING `province` DIRTY on purpose:**
> *"ปล่อยจังหวัดพัง ให้เขาเจอ dashboard พัง แล้วให้เขาไปไล่แก้เอง (admin)"*
🔑 **A visibly broken dashboard gets fixed by the admins who know the family's province; a silently empty field
never does.** ⇒ **the admin's `ParentFormModal` `Select`, fed a value NOT in its 77 rows, is HOW an admin
discovers which parents to fix** — ⚠️ **so it must let the admin PICK a real province over the dirty value and
SAVE. Not blank the field. Not refuse.**
✅ **Verify it — on the component, with a dirty value:** (a) the form opens without throwing; (b) the `Select`
shows *something* an admin can act on (a blank control is acceptable ONLY if the field is clearly editable —
say what it shows); (c) picking a real province and saving sends that province. ⚠️ **If any of the three
fails, that is a defect and you FIX it — it is the one thing in `§9.1` that must hold.**
🚫 **Do NOT add a "repair" button, a cleanup, or a warning banner** — *the broken dashboard IS the warning, by
his decision.*

## §4 What must not change
- 🚫 The join · the pickers · the toggle · the confirm echo (it still shows the LINE) · the `done` screen.
- 🚫 `ParentFormModal`'s own 77-row source · **no cleanup of existing rows — `§9.1`.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean · build ok
- [ ] 🔑 **PICKED sends `province` = full name + `address` = the line; TYPED sends `address` only; blank sends
      neither** — asserted, all three
- [ ] **`api.ts` holds no rule** — the Rule-1 absence unchanged, asserted
- [ ] 🔴 **The `§3` check, all three parts, with what the `Select` shows** — asserted on the component
- [ ] **Field names confirmed against TASK-352** — say when
- [ ] 🔑 **Break it and watch** — one call, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **The owner chose a visibly broken dashboard over a silently empty field, on purpose.** ⇒ ❓ **Where else in
the admin app does a bad stored value render as BLANK rather than as itself — so the admin never sees it?**
📌 *A `Select` that hides a value not in its list is the general shape.* 🚫 **Name them. Build nothing.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-13. **The page sends the province on its own, full name; the line goes to `address`; the admin form shows a dirty province AS ITSELF and lets it be replaced.**

```
bunx tsc --noEmit → exit 0
bun test          →  321 pass / 0 fail   (was 314; +7 — one new file, `people/province-repair.test.ts`)
bun run build     → ok — `○ /register` still static
git status        →  7 modified · 1 new
```
🚫 No migration · no cleanup of any row · `entry.ts` (the join) untouched · the pickers, the toggle, the confirm echo,
the `done` screen untouched · `ParentFormModal`'s 77-row source untouched (a helper was added BESIDE it).
✅ **Field names confirmed against TASK-352's `📜 THE FIELD NAMES` block and the LIVE route** (`routes/register.ts`
lines 37–38, 65, 122–133) **before wiring, 2026-09-13** — `province?`, `address?`, `PROVINCE_UNKNOWN` 400 with
`{ province }`. Built against a done BE (2099/0).

### `§2` — what the page sends, asserted all three
```ts
const addressLine    = addrMode === "pick" ? joinAddress({…nameTh…}) : provinceTyped.trim();   // unchanged join
const pickedProvince = addrMode === "pick" ? provPick?.nameTh ?? "" : "";                        // NEW — TASK-353
create(tok, { …, province: pickedProvince || undefined, address: addressLine || undefined });
```
| mode | `province` | `address` |
|---|---|---|
| PICKED | `กรุงเทพมหานคร` — the dataset's `nameTh`, the admin list's spelling | `พระโขนงเหนือ วัฒนา กทม` — the join, `กทม` in the LINE |
| TYPED | **absent** — `pickedProvince` is `""` outside pick mode | the typed string |
| blank | absent | absent |
🔑 **Two forms of one province on one request, each in the field that wants it** — asserted: the line is the join,
the province is `nameTh`, and neither is swapped (`province: addressLine`, `address: pickedProvince`, and
`everydayProvinceName` anywhere near the send are asserted absent). Mutations 1 and 2 prove the two edges.
🔴 **`api.ts` holds no rule** — it gained `address?` and one line `if (input.address) body.address = input.address;`;
asserted that it contains no `joinAddress`, no `TH_PROVINCES`, no `includes(`. TASK-348's full Rule-1 absence on
page + API unchanged and still green; mutation 3 (a membership check in `api.ts`) fails.
✅ `PROVINCE_UNKNOWN` — the 17th code: rendered both languages (PLACEHOLDER, interpolates `{province}`), routed back
to the form like the other fixable codes; `Refusal.province` carried through `FailureAlert`. The route's table
pin is 17 = 17.
✅ The confirm screen still echoes the **LINE** (`addressLine`), never the bare province — asserted.

### 🔴 `§3` / `§9.1` — the repair path, checked ON THE COMPONENT, and one thing FIXED
I rendered Mantine's `Select` exactly as `ParentFormModal` composes it (`renderToString` inside `MantineProvider`),
fed the chat's own dirty line `พระโขนงเหนือ วัฒนา กทม`:
- **(a) opens without throwing** — ✅ before and after.
- **(b) what it showed BEFORE: an EMPTY input with the placeholder `เลือกจังหวัด / Select a province`.** The dirty
  value existed only in Mantine's hidden `<input type="hidden">`. 🔴 **That reads as "nothing set" — the exact
  shape the owner is refusing: a bad value hidden as blank.** An admin scanning the form would not know this parent
  is one to fix; and the placeholder even invites a pick as if the field were new. ⇒ **FIXED, minimally:**
  `provinceOptions(current)` in `lib/people/th-provinces.ts` — if the current value is not one of the 77, it is put
  in front of the list as an option with `disabled: true`; otherwise the 77 are returned **by reference, untouched**.
  ✅ **AFTER: the visible input reads `พระโขนงเหนือ วัฒนา กทม`** — the admin sees the broken value as itself, cannot
  re-pick it (disabled), and picks a real province over it. Asserted on the rendered HTML; mutation 4 (the old
  behaviour back) fails. 🚫 No repair button, no cleanup, no banner — the visible value IS the warning.
- **(c) picking a real province and saving sends it** — `onChange={setProvince}` and `province: province ?? null` in
  `submit`, unchanged, asserted on the modal's source; the BE's admin update (`parent.service.ts:314`) patches
  `province` as sent, with no 77-check on that door — so the pick lands. *(Corollary, stated: an admin who edits
  something ELSE on a dirty parent and saves re-sends the dirty value unchanged — nothing is silently cleared.)*
📌 `(b)` was the one of the three that failed, and the fix is one exported function (8 lines) plus one prop.

### 🔑 The pin, re-pointed and said so
The BE now holds the 77 (`src/lib/thai-provinces.ts`, TASK-352) and refuses everything else — **the server is the
source; `TH_PROVINCES` is this repo's claim.** A test in this repo cannot read another repo's file (paths are
per-machine, `machine.local.md`), so the pin is: **dataset == `TH_PROVINCES` (77, distinct)**, with the comment
stating that `TH_PROVINCES` is the claim of the BE list, **checked equal by hand today: 77 = 77, no diff** (BE file
read, comment-words excluded). `contract.ts`'s rule applies — keeping the claim in step is a human job; the pin
catches the dataset drifting from the claim.

### ❓ @Jason's question — *does the parents LIST truncate the note?*
**No — the parents list does not render `parents.note` at all.** `PeopleContent` shows name, phone and `province`
(a wrapping `<span>`, no `truncate`, no `lineClamp` — so a dirty province shows in FULL on the card, which is the
owner's "broken dashboard" in the list too). **The only place `parents.note` is rendered is the modal's
`Textarea`, whole.** Nothing in the FE truncates, splits or parses it. ⚠️ **Which makes his item 1 the real one:**
the admin's write validator caps `note` at 500 while the machine appends without a cap — the Textarea will happily
SHOW a 600-character note the form then cannot SAVE. Same finding, seen from this side; owner's list.

### 🔑 Break-and-watch — four mutations, one call, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | TYPED sends `province` too (`pickedProvince` no longer gated on pick mode) | **1 fail** |
| 2 | the abbreviation goes to the column (`everydayProvinceName` on the send) | **2 fail** |
| 3 | `api.ts` grows a membership check | **2 fail** |
| 4 | the dirty value hidden again (the old blank `Select`) | **1 fail** |
`md5sum` identical on all three mutated files; suite green after.

### Definition of Done
- [x] Suite **321 / 0** · `tsc` exit 0 · build ok
- [x] 🔑 PICKED ⇒ `province` full name + `address` line · TYPED ⇒ `address` only · blank ⇒ neither — asserted, all three
- [x] `api.ts` holds no rule — Rule-1 absence unchanged, asserted (and mutation 3)
- [x] 🔴 The `§3` check, all three parts, on the component — (b) FAILED before and is FIXED; what it shows stated
- [x] Field names confirmed against TASK-352 and the live route — 2026-09-13, before wiring
- [x] 🔑 Break-and-watch — four, one call, checksum

### ⚠️ Not seen on a screen
The disabled dirty option inside Mantine's dropdown (greyed, unclickable) and the `Select` showing the long string
in a narrow input — `renderToString` proves the value is in the input, not how it wraps. One screen check for
@Tanya via you: open a LINE-registered parent in the admin form; the province box shows the address line; the
dropdown lists it greyed at the top; pick `กรุงเทพมหานคร`, save, reopen ⇒ `กรุงเทพมหานคร`.

## Question — **where else does a bad stored value render as BLANK rather than as itself?** ⚠️ owner's list, nothing built
Swept every `<Select` in `src/components/partials` whose `value` comes from a STORED row and whose `data` is a finite
list — the shape *"a `Select` that hides a value not in its list"*:
1. 🔴 **`startTime` over `TIME_SLOTS`, seeded from a STORED row** — `PlanModal` (`seed.startTime`) and
   `DropResumeDialog` (`courseStartTime`). **This is exactly TASK-295's defect** (`"17:00:00"` hid as an empty Time
   field, every time) — fixed there by coercing the seed onto the grid, **but a stored time that is not on the slot
   grid at all (an imported `09:15`, a legacy odd slot) still renders blank in both.** The class the owner just
   ruled on, in the field he already lost a night to.
2. 🟡 **`teacherId` over `bookableTeachers`** — `PlanModal` (`seed.teacher.id`): a booking whose teacher has since
   become unbookable/inactive opens with an EMPTY teacher — the admin cannot see who it WAS, and a save needs a new one.
3. 🟡 **`subjectId` over the selected teacher's `subjectOptions`** — `PlanModal`: a course whose subject the teacher
   no longer offers shows blank (the locked-course row is already special-cased; the unlocked path is not).
4. 🟡 **`size` over `sizeOptions`** — `value={sizeOptions.length > 0 ? String(size) : null}` (`PlanModal` and the
   create flows): a stored size outside the teacher's options is blank, and the guard makes it blank on purpose.
**Not the shape:** `CreateCourseModal` / `CreatePlanFlow` / `ImportBalanceModal` (their `Select` values start as
fresh state — `"10:00"`, `""` — not a stored row) · the filters in `BookingsTable` (UI state) · `StudentFormModal`'s
nationality `SegmentedControl` (two stored fields coerced into three fixed modes — a bad value becomes `none`: coerced,
not hidden, a different smell). 🚫 Named, nothing built.
